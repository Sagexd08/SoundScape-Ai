import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyJwt } from '../utils/auth';
import { logger } from '../utils/logger';
import { redisAdapter } from './redis-adapter';
import { instrumentSocketIO } from '@socket.io/admin-ui';
import { metricsService } from './metrics.service';

interface AuthenticatedSocket extends SocketIO.Socket {
  userId?: string;
  userRole?: string;
  roomIds?: string[];
}

export class WebsocketService {
  private io: Server;
  private userSockets: Map<string, Set<string>> = new Map();
  private isInitialized = false;

  // Create singleton instance
  private static instance: WebsocketService;
  public static getInstance(): WebsocketService {
    if (!WebsocketService.instance) {
      WebsocketService.instance = new WebsocketService();
    }
    return WebsocketService.instance;
  }

  /**
   * Initialize WebSocket server with HTTP server
   */
  initialize(server: HttpServer): void {
    if (this.isInitialized) {
      return;
    }

    this.io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      },
      adapter: redisAdapter
    });

    // Setup admin UI if enabled in non-production
    if (process.env.NODE_ENV !== 'production' && process.env.SOCKET_ADMIN_UI === 'true') {
      instrumentSocketIO(this.io, {
        auth: {
          type: 'basic',
          username: process.env.SOCKET_ADMIN_USERNAME || 'admin',
          password: process.env.SOCKET_ADMIN_PASSWORD || 'admin'
        }
      });
    }

    // Setup authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
        
        if (!token) {
          // Allow anonymous connections but they can only join public rooms
          socket.userId = undefined;
          socket.userRole = 'anonymous';
          return next();
        }
        
        // Verify token
        const decoded = await verifyJwt(token);
        
        if (!decoded.userId) {
          return next(new Error('Authentication failed'));
        }
        
        // Set authenticated user data on socket
        socket.userId = decoded.userId;
        socket.userRole = decoded.role || 'user';
        
        // Track metrics
        metricsService.incrementCounter('websocket_connections_total', { user_role: socket.userRole });
        
        next();
      } catch (error) {
        logger.error('WebSocket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });

    // Handle connections
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
    });

    this.isInitialized = true;
    logger.info('WebSocket server initialized');
  }

  /**
   * Handle new socket connections
   */
  private handleConnection(socket: AuthenticatedSocket): void {
    const userId = socket.userId;
    const socketId = socket.id;
    
    logger.info(`New WebSocket connection: ${socketId}, User: ${userId || 'anonymous'}`);
    
    // Track connected user
    if (userId) {
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)?.add(socketId);
      
      // Join user's personal room
      socket.join(`user:${userId}`);
    }
    
    // Set up socket rooms
    socket.roomIds = [];
    
    // Handle room joins
    socket.on('join-room', async (roomId) => {
      if (!this.canJoinRoom(socket, roomId)) {
        socket.emit('error', { message: 'Cannot join room: unauthorized' });
        return;
      }
      
      await socket.join(roomId);
      socket.roomIds?.push(roomId);
      logger.debug(`Socket ${socketId} joined room: ${roomId}`);
      
      // Notify room about new joiner if it's a collaborative room
      if (roomId.startsWith('collab:')) {
        this.io.to(roomId).emit('user-joined', {
          userId: socket.userId || 'anonymous',
          roomId
        });
      }
    });
    
    // Handle room leaves
    socket.on('leave-room', async (roomId) => {
      await socket.leave(roomId);
      socket.roomIds = socket.roomIds?.filter(id => id !== roomId);
      logger.debug(`Socket ${socketId} left room: ${roomId}`);
      
      // Notify room about user leaving if it's a collaborative room
      if (roomId.startsWith('collab:')) {
        this.io.to(roomId).emit('user-left', {
          userId: socket.userId || 'anonymous',
          roomId
        });
      }
    });
    
    // Handle playlist collaboration events
    socket.on('playlist-track-added', ({ playlistId, trackId, position }) => {
      if (!socket.userId) {
        socket.emit('error', { message: 'Authentication required' });
        return;
      }
      
      const roomId = `collab:playlist:${playlistId}`;
      
      // Forward event to all sockets in the room except sender
      socket.to(roomId).emit('playlist-track-added', {
        userId: socket.userId,
        playlistId,
        trackId,
        position
      });
    });
    
    socket.on('playlist-track-removed', ({ playlistId, trackId }) => {
      if (!socket.userId) {
        socket.emit('error', { message: 'Authentication required' });
        return;
      }
      
      const roomId = `collab:playlist:${playlistId}`;
      
      // Forward event to all sockets in the room except sender
      socket.to(roomId).emit('playlist-track-removed', {
        userId: socket.userId,
        playlistId,
        trackId
      });
    });
    
    socket.on('playlist-track-reordered', ({ playlistId, tracks }) => {
      if (!socket.userId) {
        socket.emit('error', { message: 'Authentication required' });
        return;
      }
      
      const roomId = `collab:playlist:${playlistId}`;
      
      // Forward event to all sockets in the room except sender
      socket.to(roomId).emit('playlist-track-reordered', {
        userId: socket.userId,
        playlistId,
        tracks
      });
    });
    
    // Handle track listen events
    socket.on('track-play', async ({ trackId, position = 0 }) => {
      if (!trackId) return;
      
      // Forward to track room for real-time updates
      this.io.to(`track:${trackId}`).emit('track-played', {
        trackId,
        timestamp: new Date().toISOString(),
        position
      });
      
      // Track metric
      metricsService.incrementCounter('track_plays_total', { track_id: trackId });
    });
    
    socket.on('track-progress', ({ trackId, position, duration }) => {
      if (!trackId) return;
      
      // Only forward to track owner's room for analytics
      // We could determine the track owner here and emit to their room
    });
    
    socket.on('track-complete', ({ trackId, duration }) => {
      if (!trackId) return;
      
      // Emit completion event
      this.io.to(`track:${trackId}`).emit('track-completed', {
        trackId,
        timestamp: new Date().toISOString(),
        duration
      });
      
      // Track metric
      metricsService.incrementCounter('track_completions_total', { track_id: trackId });
    });
    
    // Handle audio processing progress updates
    socket.on('audio-processing-update', ({ taskId, progress, stage }) => {
      if (!socket.userId) return;
      
      // Only allow sending updates to own task room
      socket.to(`task:${taskId}`).emit('audio-processing-update', {
        taskId,
        progress,
        stage,
        timestamp: new Date().toISOString()
      });
    });
    
    // Handle real-time chat messages
    socket.on('chat-message', ({ roomId, message }) => {
      if (!socket.userId) {
        socket.emit('error', { message: 'Authentication required for chat' });
        return;
      }
      
      if (!roomId || !message || typeof message !== 'string' || message.trim() === '') {
        return;
      }
      
      // Validate that user is in the room
      if (!socket.roomIds?.includes(roomId)) {
        socket.emit('error', { message: 'You must join the room before sending messages' });
        return;
      }
      
      // Forward message to room
      this.io.to(roomId).emit('chat-message', {
        roomId,
        userId: socket.userId,
        message: message.trim(),
        timestamp: new Date().toISOString()
      });
    });
    
    // Handle typing indicators
    socket.on('typing-start', ({ roomId }) => {
      if (!socket.userId || !roomId || !socket.roomIds?.includes(roomId)) return;
      
      socket.to(roomId).emit('typing-indicator', {
        roomId,
        userId: socket.userId,
        isTyping: true
      });
    });
    
    socket.on('typing-stop', ({ roomId }) => {
      if (!socket.userId || !roomId || !socket.roomIds?.includes(roomId)) return;
      
      socket.to(roomId).emit('typing-indicator', {
        roomId,
        userId: socket.userId,
        isTyping: false
      });
    });
    
    // Handle disconnections
    socket.on('disconnect', () => {
      logger.info(`WebSocket disconnected: ${socketId}, User: ${userId || 'anonymous'}`);
      
      // Clean up user socket tracking
      if (userId) {
        const userSocketSet = this.userSockets.get(userId);
        if (userSocketSet) {
          userSocketSet.delete(socketId);
          if (userSocketSet.size === 0) {
            this.userSockets.delete(userId);
          }
        }
      }
      
      // Notify rooms about disconnect
      if (socket.roomIds) {
        socket.roomIds.forEach(roomId => {
          if (roomId.startsWith('collab:')) {
            // Notify collaborative rooms about user leaving
            this.io.to(roomId).emit('user-disconnected', {
              userId: socket.userId || 'anonymous',
              roomId
            });
          }
        });
      }
      
      // Track metrics
      if (socket.userRole) {
        metricsService.incrementCounter('websocket_disconnections_total', { user_role: socket.userRole });
      }
    });
  }
  
  /**
   * Check if a socket can join a room
   */
  private canJoinRoom(socket: AuthenticatedSocket, roomId: string): boolean {
    // Public rooms can be joined by anyone
    if (roomId.startsWith('public:')) {
      return true;
    }
    
    // User rooms can only be joined by that user
    if (roomId.startsWith('user:')) {
      const targetUserId = roomId.split(':')[1];
      return socket.userId === targetUserId;
    }
    
    // Track rooms are public
    if (roomId.startsWith('track:')) {
      return true;
    }
    
    // Collaborative playlist rooms need additional checks
    // In a real implementation, we would check if the user has access to the playlist
    if (roomId.startsWith('collab:playlist:')) {
      // For now, allow any authenticated user
      return !!socket.userId;
    }
    
    // Task rooms are for specific users
    if (roomId.startsWith('task:')) {
      const taskId = roomId.split(':')[1];
      // In a real implementation, check if this task belongs to the user
      return !!socket.userId;
    }
    
    // By default, don't allow joining unknown room types
    return false;
  }
  
  /**
   * Send a message to a specific user
   */
  async sendToUser(userId: string, data: any): Promise<void> {
    const roomId = `user:${userId}`;
    this.io.to(roomId).emit('notification', data);
  }
  
  /**
   * Send a message to a room
   */
  async sendToRoom(roomId: string, event: string, data: any): Promise<void> {
    this.io.to(roomId).emit(event, data);
  }
  
  /**
   * Send a message to all connected clients
   */
  async broadcast(event: string, data: any): Promise<void> {
    this.io.emit(event, data);
  }
  
  /**
   * Get count of connected clients
   */
  getConnectedClientsCount(): number {
    return this.io.engine.clientsCount;
  }
  
  /**
   * Get count of unique connected users
   */
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }
  
  /**
   * Check if a user is online
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }
}

// Export singleton instance
export const websocketService = WebsocketService.getInstance();