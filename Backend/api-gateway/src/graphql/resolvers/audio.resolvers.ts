import { IResolvers } from '@graphql-tools/utils';
import { AuthenticationError, UserInputError, ForbiddenError } from 'apollo-server-express';
import { db } from '../../services/database.service';
import { storageService } from '../../services/storage.service';
import { audioProcessorService } from '../../services/audio-processor.service';
import { pubsub } from './index';
import { getUserFromContext, checkAuthenticated } from '../utils/auth-helpers';
import { analyticsService } from '../../services/analytics.service';
import { createReadStream } from 'fs';
import { v4 as uuidv4 } from 'uuid';

export const audioResolvers: IResolvers = {
  Query: {
    track: async (_, { id }, context) => {
      const currentUser = await getUserFromContext(context);
      
      // Fetch the track
      const track = await db.getTrackById(id);
      
      if (!track) {
        throw new UserInputError('Track not found');
      }
      
      // Check if user has access to this track
      if (track.visibility === 'PRIVATE' && (!currentUser || currentUser.id !== track.userId)) {
        throw new ForbiddenError('You do not have permission to access this track');
      }
      
      // Track view in analytics
      try {
        await analyticsService.trackEvent({
          userId: currentUser?.id,
          eventType: 'track_view',
          entityId: id,
          properties: {
            trackTitle: track.title,
            trackOwner: track.userId
          }
        });
      } catch (error) {
        console.error('Error tracking track view:', error);
      }
      
      return track;
    },
    
    tracks: async (_, { filter, sort, pagination }, context) => {
      const currentUser = await getUserFromContext(context);
      
      // If filter includes isLiked, ensure we have a current user
      if (filter?.isLiked && !currentUser) {
        throw new AuthenticationError('Authentication required to get liked tracks');
      }
      
      // Adjust visibility filter based on authentication
      let visibilityFilter = filter?.visibility;
      if (!visibilityFilter) {
        if (currentUser) {
          // Authenticated users can see public, unlisted, and their own private tracks
          visibilityFilter = { 
            $in: ['PUBLIC', 'UNLISTED'],
            $or: [
              { visibility: { $in: ['PUBLIC', 'UNLISTED'] } },
              { visibility: 'PRIVATE', userId: currentUser.id }
            ]
          };
        } else {
          // Unauthenticated users can only see public tracks
          visibilityFilter = 'PUBLIC';
        }
      }
      
      const modifiedFilter = {
        ...filter,
        visibility: visibilityFilter
      };
      
      // Get tracks from database
      const { data, totalCount } = await db.getTracks(modifiedFilter, sort, pagination);
      
      // Format for connection type
      const edges = data.map(track => ({
        cursor: Buffer.from(`track-${track.id}`).toString('base64'),
        node: track
      }));
      
      const hasNextPage = pagination.page * pagination.limit < totalCount;
      const hasPreviousPage = pagination.page > 1;
      
      return {
        edges,
        pageInfo: {
          hasNextPage,
          hasPreviousPage,
          startCursor: edges.length > 0 ? edges[0].cursor : null,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
        },
        totalCount
      };
    },
    
    trendingTracks: async (_, { timeRange, genres, limit }, context) => {
      // Convert time range to timestamp
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Default to week
      }
      
      // Get trending tracks from analytics service
      const trendingTracks = await analyticsService.getTrendingTracks({
        startDate,
        endDate: now,
        genres,
        limit
      });
      
      return trendingTracks;
    },
    
    searchTracks: async (_, { query, limit }, context) => {
      const currentUser = await getUserFromContext(context);
      
      // Determine visibility filter based on authentication
      let visibilityFilter;
      if (currentUser) {
        // Authenticated users can see public, unlisted, and their own private tracks
        visibilityFilter = {
          $or: [
            { visibility: { $in: ['PUBLIC', 'UNLISTED'] } },
            { visibility: 'PRIVATE', userId: currentUser.id }
          ]
        };
      } else {
        // Unauthenticated users can only see public tracks
        visibilityFilter = { visibility: 'PUBLIC' };
      }
      
      // Search tracks
      const results = await db.searchTracks(query, limit, visibilityFilter);
      
      // Track search in analytics
      try {
        await analyticsService.trackEvent({
          userId: currentUser?.id,
          eventType: 'track_search',
          properties: {
            query,
            resultCount: results.length
          }
        });
      } catch (error) {
        console.error('Error tracking track search:', error);
      }
      
      return results;
    }
  },
  
  Mutation: {
    uploadTrack: async (_, { title, description, file, coverArt, visibility, allowDownloads, genres, tags }, context) => {
      const user = await checkAuthenticated(context);
      
      // Process audio file upload
      const { createReadStream: createAudioStream, filename: audioFilename, mimetype: audioMimetype } = await file;
      const audioStream = createAudioStream();
      
      // Validate audio file type
      const allowedAudioTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg'];
      if (!allowedAudioTypes.includes(audioMimetype)) {
        throw new UserInputError('Invalid audio file type. Supported formats: MP3, WAV, FLAC, AAC, OGG');
      }
      
      // Read audio file into buffer
      const audioChunks = [];
      for await (const chunk of audioStream) {
        audioChunks.push(chunk);
      }
      const audioBuffer = Buffer.concat(audioChunks);
      
      // Generate unique track ID
      const trackId = uuidv4();
      
      // Generate filenames
      const audioExtension = audioFilename.split('.').pop();
      const audioPath = `tracks/${user.id}/${trackId}/audio.${audioExtension}`;
      
      // Upload audio file to storage
      const audioUrl = await storageService.uploadFile({
        buffer: audioBuffer,
        filename: audioPath,
        contentType: audioMimetype
      });
      
      // Process audio with audio processor service
      const audioAnalysis = await audioProcessorService.analyzeAudio(audioBuffer);
      
      // Generate waveform image
      const waveformResult = await audioProcessorService.generateWaveform(audioBuffer, {
        width: 1800,
        height: 280,
        color: '#1E88E5',
        background: 'transparent'
      });
      
      // Process cover art if provided
      let coverArtUrl = null;
      if (coverArt) {
        const { createReadStream: createImageStream, filename: imageFilename, mimetype: imageMimetype } = await coverArt;
        const imageStream = createImageStream();
        
        // Validate image file type
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedImageTypes.includes(imageMimetype)) {
          throw new UserInputError('Invalid cover art file type. Supported formats: JPEG, PNG, GIF');
        }
        
        // Read image file into buffer
        const imageChunks = [];
        for await (const chunk of imageStream) {
          imageChunks.push(chunk);
        }
        const imageBuffer = Buffer.concat(imageChunks);
        
        // Generate image filename
        const imageExtension = imageFilename.split('.').pop();
        const imagePath = `tracks/${user.id}/${trackId}/cover.${imageExtension}`;
        
        // Upload image to storage
        coverArtUrl = await storageService.uploadFile({
          buffer: imageBuffer,
          filename: imagePath,
          contentType: imageMimetype
        });
      }
      
      // Create track record in database
      const track = await db.createTrack({
        id: trackId,
        userId: user.id,
        title,
        description,
        duration: audioAnalysis.duration || 0,
        fileUrl: audioUrl,
        waveformUrl: waveformResult.waveformImageUrl,
        waveformData: waveformResult.waveformData,
        coverArtUrl,
        fileFormat: audioExtension.toUpperCase(),
        fileSize: audioBuffer.length,
        sampleRate: audioAnalysis.sampleRate || 44100,
        channels: audioAnalysis.channels || 2,
        visibility,
        allowDownloads,
        genres: genres || [],
        tags: tags || [],
        audioFeatures: {
          ...audioAnalysis
        }
      });
      
      // Increment user track count
      await db.incrementUserTracksCount(user.id, 1);
      
      // Track upload in analytics
      try {
        await analyticsService.trackEvent({
          userId: user.id,
          eventType: 'track_upload',
          entityId: trackId,
          properties: {
            trackTitle: title,
            duration: audioAnalysis.duration,
            fileSize: audioBuffer.length,
            fileFormat: audioExtension.toUpperCase()
          }
        });
      } catch (error) {
        console.error('Error tracking track upload:', error);
      }
      
      return track;
    },
    
    updateTrack: async (_, { id, title, description, coverArt, visibility, allowDownloads, genres, tags }, context) => {
      const user = await checkAuthenticated(context);
      
      // Check if track exists and user owns it
      const track = await db.getTrackById(id);
      
      if (!track) {
        throw new UserInputError('Track not found');
      }
      
      if (track.userId !== user.id && user.role !== 'ADMIN') {
        throw new ForbiddenError('You do not have permission to update this track');
      }
      
      // Process new cover art if provided
      let coverArtUrl = track.coverArtUrl;
      if (coverArt) {
        const { createReadStream, filename, mimetype } = await coverArt;
        const stream = createReadStream();
        
        // Validate image file type
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedImageTypes.includes(mimetype)) {
          throw new UserInputError('Invalid cover art file type. Supported formats: JPEG, PNG, GIF');
        }
        
        // Read image file into buffer
        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        
        // Generate image filename
        const extension = filename.split('.').pop();
        const imagePath = `tracks/${user.id}/${track.id}/cover-${Date.now()}.${extension}`;
        
        // Upload image to storage
        coverArtUrl = await storageService.uploadFile({
          buffer,
          filename: imagePath,
          contentType: mimetype
        });
      }
      
      // Build update object
      const updates: any = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (coverArtUrl !== track.coverArtUrl) updates.coverArtUrl = coverArtUrl;
      if (visibility !== undefined) updates.visibility = visibility;
      if (allowDownloads !== undefined) updates.allowDownloads = allowDownloads;
      if (genres !== undefined) updates.genres = genres;
      if (tags !== undefined) updates.tags = tags;
      
      // Update track in database
      const updatedTrack = await db.updateTrack(id, updates);
      
      // Track update in analytics
      try {
        await analyticsService.trackEvent({
          userId: user.id,
          eventType: 'track_update',
          entityId: id,
          properties: { ...updates }
        });
      } catch (error) {
        console.error('Error tracking track update:', error);
      }
      
      return updatedTrack;
    },
    
    deleteTrack: async (_, { id }, context) => {
      const user = await checkAuthenticated(context);
      
      // Check if track exists and user owns it
      const track = await db.getTrackById(id);
      
      if (!track) {
        throw new UserInputError('Track not found');
      }
      
      if (track.userId !== user.id && user.role !== 'ADMIN') {
        throw new ForbiddenError('You do not have permission to delete this track');
      }
      
      // Delete track files from storage
      await storageService.deleteFile(track.fileUrl);
      
      if (track.waveformUrl) {
        await storageService.deleteFile(track.waveformUrl);
      }
      
      if (track.coverArtUrl) {
        await storageService.deleteFile(track.coverArtUrl);
      }
      
      // Delete track from database
      await db.deleteTrack(id);
      
      // Decrement user track count
      await db.incrementUserTracksCount(user.id, -1);
      
      // Track deletion in analytics
      try {
        await analyticsService.trackEvent({
          userId: user.id,
          eventType: 'track_delete',
          entityId: id,
          properties: {
            trackTitle: track.title
          }
        });
      } catch (error) {
        console.error('Error tracking track deletion:', error);
      }
      
      return true;
    },
    
    likeTrack: async (_, { id }, context) => {
      const user = await checkAuthenticated(context);
      
      // Check if track exists
      const track = await db.getTrackById(id);
      
      if (!track) {
        throw new UserInputError('Track not found');
      }
      
      // Check if user already liked this track
      const alreadyLiked = await db.checkTrackLiked(user.id, id);
      
      if (alreadyLiked) {
        throw new UserInputError('You have already liked this track');
      }
      
      // Add like
      await db.likeTrack(user.id, id);
      
      // Increment track like count
      await db.incrementTrackLikeCount(id, 1);
      
      // Get updated track
      const updatedTrack = await db.getTrackById(id);
      
      // Publish subscription event
      pubsub.publish('TRACK_LIKED', { 
        trackLiked: updatedTrack,
        userId: track.userId,
        likerId: user.id
      });
      
      // Create notification for track owner if it's not the current user
      if (track.userId !== user.id) {
        await db.createNotification({
          userId: track.userId,
          type: 'TRACK_LIKE',
          title: 'New Like',
          message: `${user.name || user.username || 'Someone'} liked your track "${track.title}"`,
          data: {
            trackId: id,
            likerId: user.id,
            likerName: user.name || user.username
          }
        });
      }
      
      // Track like in analytics
      try {
        await analyticsService.trackEvent({
          userId: user.id,
          eventType: 'track_like',
          entityId: id,
          properties: {
            trackTitle: track.title,
            trackOwner: track.userId
          }
        });
      } catch (error) {
        console.error('Error tracking track like:', error);
      }
      
      return updatedTrack;
    },
    
    unlikeTrack: async (_, { id }, context) => {
      const user = await checkAuthenticated(context);
      
      // Check if track exists
      const track = await db.getTrackById(id);
      
      if (!track) {
        throw new UserInputError('Track not found');
      }
      
      // Check if user has liked this track
      const liked = await db.checkTrackLiked(user.id, id);
      
      if (!liked) {
        throw new UserInputError('You have not liked this track');
      }
      
      // Remove like
      await db.unlikeTrack(user.id, id);
      
      // Decrement track like count
      await db.incrementTrackLikeCount(id, -1);
      
      // Get updated track
      const updatedTrack = await db.getTrackById(id);
      
      // Track unlike in analytics
      try {
        await analyticsService.trackEvent({
          userId: user.id,
          eventType: 'track_unlike',
          entityId: id,
          properties: {
            trackTitle: track.title,
            trackOwner: track.userId
          }
        });
      } catch (error) {
        console.error('Error tracking track unlike:', error);
      }
      
      return updatedTrack;
    },
    
    analyzeAudio: async (_, { file, options }, context) => {
      const user = await checkAuthenticated(context);
      
      // Process audio file upload
      const { createReadStream, filename, mimetype } = await file;
      const stream = createReadStream();
      
      // Validate audio file type
      const allowedAudioTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg'];
      if (!allowedAudioTypes.includes(mimetype)) {
        throw new UserInputError('Invalid audio file type. Supported formats: MP3, WAV, FLAC, AAC, OGG');
      }
      
      // Read audio file into buffer
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      
      // Analyze audio
      const analysisOptions = {
        extractGenre: options?.extractGenre !== false,
        extractEmotion: options?.extractEmotion !== false,
        generateFingerprint: options?.generateFingerprint !== false,
        generateEmbedding: options?.generateEmbedding !== false
      };
      
      const startTime = Date.now();
      const analysisResult = await audioProcessorService.analyzeAudio(buffer, analysisOptions);
      const processingTime = (Date.now() - startTime) / 1000; // in seconds
      
      // Track audio analysis in analytics
      try {
        await analyticsService.trackEvent({
          userId: user.id,
          eventType: 'audio_analysis',
          properties: {
            filename,
            fileSize: buffer.length,
            processingTime,
            options: analysisOptions
          }
        });
      } catch (error) {
        console.error('Error tracking audio analysis:', error);
      }
      
      return {
        audioId: analysisResult.audio_id || 'unknown',
        features: {
          duration: analysisResult.duration || 0,
          sampleRate: analysisResult.sample_rate || 44100,
          channels: analysisResult.channels || 2,
          rmsEnergy: analysisResult.rms_energy || 0,
          zeroCrossingRate: analysisResult.zero_crossing_rate || 0,
          spectralCentroid: analysisResult.spectral_centroid || 0,
          spectralBandwidth: analysisResult.spectral_bandwidth || 0,
          spectralRolloff: analysisResult.spectral_rolloff || 0,
          tempo: analysisResult.tempo || 0,
          mfccs: analysisResult.mfccs || [],
          chromaFeatures: analysisResult.chroma_features || [],
          emotionPrediction: analysisResult.emotion_prediction || null,
          genrePrediction: analysisResult.genre_prediction || null,
          audioFingerprint: analysisResult.audio_fingerprint || null
        },
        processingTime
      };
    },
    
    compareAudio: async (_, { file1, file2 }, context) => {
      const user = await checkAuthenticated(context);
      
      // Process first audio file
      const { createReadStream: createStream1, filename: filename1, mimetype: mimetype1 } = await file1;
      const stream1 = createStream1();
      
      // Process second audio file
      const { createReadStream: createStream2, filename: filename2, mimetype: mimetype2 } = await file2;
      const stream2 = createStream2();
      
      // Validate audio file types
      const allowedAudioTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg'];
      if (!allowedAudioTypes.includes(mimetype1) || !allowedAudioTypes.includes(mimetype2)) {
        throw new UserInputError('Invalid audio file type. Supported formats: MP3, WAV, FLAC, AAC, OGG');
      }
      
      // Read files into buffers
      const chunks1 = [];
      for await (const chunk of stream1) {
        chunks1.push(chunk);
      }
      const buffer1 = Buffer.concat(chunks1);
      
      const chunks2 = [];
      for await (const chunk of stream2) {
        chunks2.push(chunk);
      }
      const buffer2 = Buffer.concat(chunks2);
      
      // Compare audio files
      const comparisonResult = await audioProcessorService.compareAudio(buffer1, buffer2);
      
      // Track comparison in analytics
      try {
        await analyticsService.trackEvent({
          userId: user.id,
          eventType: 'audio_comparison',
          properties: {
            file1Size: buffer1.length,
            file2Size: buffer2.length,
            file1Name: filename1,
            file2Name: filename2,
            similarityScore: comparisonResult.comparison_result?.similarities?.overall_similarity || 0
          }
        });
      } catch (error) {
        console.error('Error tracking audio comparison:', error);
      }
      
      return {
        similarities: comparisonResult.comparison_result?.similarities || {},
        matchType: comparisonResult.comparison_result?.match_type || 'unknown'
      };
    }
  },
  
  AudioTrack: {
    user: async (parent, _, context) => {
      return await db.getUserById(parent.userId);
    },
    
    isLiked: async (parent, _, context) => {
      try {
        const currentUser = await getUserFromContext(context);
        if (!currentUser) {
          return false;
        }
        
        return db.checkTrackLiked(currentUser.id, parent.id);
      } catch (error) {
        console.error('Error checking if track is liked:', error);
        return false;
      }
    },
    
    comments: async (parent, { pagination }, context) => {
      const { data, totalCount } = await db.getTrackComments(parent.id, pagination);
      
      // Format for connection type
      const edges = data.map(comment => ({
        cursor: Buffer.from(`comment-${comment.id}`).toString('base64'),
        node: comment
      }));
      
      const hasNextPage = pagination.page * pagination.limit < totalCount;
      const hasPreviousPage = pagination.page > 1;
      
      return {
        edges,
        pageInfo: {
          hasNextPage,
          hasPreviousPage,
          startCursor: edges.length > 0 ? edges[0].cursor : null,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
        },
        totalCount
      };
    },
    
    similarTracks: async (parent, { limit }, context) => {
      // Get similar tracks based on audio features
      return await db.getSimilarTracks(parent.id, limit);
    },
    
    audioFeatures: async (parent, _, context) => {
      // If features are already included in the parent, return them
      if (parent.audioFeatures) {
        return parent.audioFeatures;
      }
      
      // Otherwise fetch them
      return await db.getTrackAudioFeatures(parent.id);
    }
  },
  
  Subscription: {
    trackLiked: {
      subscribe: (_, { userId }) => pubsub.asyncIterator([`TRACK_LIKED:${userId}`]),
      resolve: (payload) => payload.trackLiked
    },
    
    trackPlayed: {
      subscribe: (_, { trackId }) => pubsub.asyncIterator([`TRACK_PLAYED:${trackId}`]),
      resolve: (payload) => payload.count
    }
  }
};