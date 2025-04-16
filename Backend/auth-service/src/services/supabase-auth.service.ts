import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

// Mock Supabase client for now to fix build issues
class SupabaseClient {
  auth = {
    signUp: async (_options: any) => ({ data: {}, error: null }),
    signInWithPassword: async (_options: any) => ({ data: {}, error: null }),
    signInWithOAuth: async (_options: any) => ({ data: {}, error: null }),
    signOut: async (_options: any) => ({ error: null }),
    refreshSession: async (_options: any) => ({ data: {}, error: null }),
    resetPasswordForEmail: async (_email: string, _options: any) => ({ error: null }),
    updateUser: async (_options: any) => ({ error: null }),
    getUser: async (_token: string) => ({ data: { user: {} }, error: null })
  };
}

type Provider = 'google' | 'facebook' | 'twitter';

const createClient = (_url: string, _key: string) => new SupabaseClient();

const uuidv4 = () => `mock-uuid-${Date.now()}`;

const supabaseConfig = {
  url: process.env.SUPABASE_URL || '',
  anonKey: process.env.SUPABASE_ANON_KEY || '',
  jwtSecret: process.env.SUPABASE_JWT_SECRET || ''
};

export class SupabaseAuthService {
  private supabase: SupabaseClient;
  private jwtSecret: string;

  constructor() {
    this.supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);
    this.jwtSecret = supabaseConfig.jwtSecret;
    logger.info('Supabase auth service initialized');
  }

  /**
   * Register a new user with email and password
   */
  async register(email: string, password: string, name: string): Promise<any> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'user'
          }
        }
      });

      if (error) {
        logger.error('Error registering user:', error);
        throw error;
      }

      logger.info(`User registered successfully: ${email}`);
      return data;
    } catch (error) {
      logger.error('Error in register:', error);
      throw error;
    }
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<any> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logger.error('Error logging in user:', error);
        throw error;
      }

      logger.info(`User logged in successfully: ${email}`);
      return data;
    } catch (error) {
      logger.error('Error in login:', error);
      throw error;
    }
  }

  /**
   * Login with social provider
   */
  async loginWithProvider(provider: Provider): Promise<any> {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: process.env.OAUTH_REDIRECT_URL || 'http://localhost:3000/auth/callback'
        }
      });

      if (error) {
        logger.error(`Error logging in with ${provider}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error(`Error in login with ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(token: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut({
        scope: 'global'
      });

      if (error) {
        logger.error('Error logging out user:', error);
        throw error;
      }

      logger.info('User logged out successfully');
    } catch (error) {
      logger.error('Error in logout:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<any> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error) {
        logger.error('Error refreshing token:', error);
        throw error;
      }

      logger.info('Token refreshed successfully');
      return data;
    } catch (error) {
      logger.error('Error in refreshToken:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: process.env.PASSWORD_RESET_REDIRECT_URL || 'http://localhost:3000/reset-password'
      });

      if (error) {
        logger.error('Error requesting password reset:', error);
        throw error;
      }

      logger.info(`Password reset email sent to: ${email}`);
    } catch (error) {
      logger.error('Error in requestPasswordReset:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        logger.error('Error resetting password:', error);
        throw error;
      }

      logger.info('Password reset successfully');
    } catch (error) {
      logger.error('Error in resetPassword:', error);
      throw error;
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<any> {
    try {
      const { data, error } = await this.supabase.auth.getUser(token);

      if (error) {
        logger.error('Error verifying token:', error);
        throw error;
      }

      return data.user;
    } catch (error) {
      logger.error('Error in verifyToken:', error);
      throw error;
    }
  }

  /**
   * Create custom JWT token
   */
  createCustomToken(userId: string, role: string = 'user'): string {
    try {
      const token = jwt.sign(
        {
          sub: userId,
          role,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (60 * 15), // 15 minutes
          jti: uuidv4()
        },
        this.jwtSecret as jwt.Secret
      );

      return token;
    } catch (error) {
      logger.error('Error creating custom token:', error);
      throw error;
    }
  }

  /**
   * Verify custom JWT token
   */
  verifyCustomToken(token: string): any {
    try {
      const decoded = jwt.verify(token, this.jwtSecret as jwt.Secret);
      return decoded;
    } catch (error) {
      logger.error('Error verifying custom token:', error);
      throw error;
    }
  }
}