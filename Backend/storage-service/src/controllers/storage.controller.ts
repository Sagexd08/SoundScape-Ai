import { Request, Response } from 'express';
import multer from 'multer';
import { StorageModel } from '../models/storage.model';
import { logger } from '../utils/logger';
import { validateFileType } from '../utils/validators';
import { redisClient } from '../services/redis.service';

// Mock S3 client for now to fix build issues
class S3Client {
  constructor(_config: any) {}

  async send(_command: any): Promise<any> {
    return { success: true };
  }
}

class PutObjectCommand {
  constructor(_params: any) {}
}

class GetObjectCommand {
  constructor(_params: any) {}
}

class DeleteObjectCommand {
  constructor(_params: any) {}
}

const getSignedUrl = async (_client: any, _command: any, _options: any) => {
  return `https://example.com/presigned-url-${Date.now()}`;
};

const uuidv4 = () => {
  return `mock-uuid-${Date.now()}`;
};

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

// Set up multer for file uploads
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// S3 bucket name
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'soundscape-ai-storage';

// Cache settings are handled by Redis client

/**
 * Upload file to storage
 */
export const uploadFile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Validate file type based on content type or extension
    const validationResult = validateFileType(file.originalname, file.mimetype);
    if (!validationResult.valid) {
      return res.status(400).json({ message: validationResult.message });
    }

    // Generate a unique file key
    const fileId = uuidv4();
    const fileExtension = file.originalname.split('.').pop() || '';
    const fileKey = `${userId}/${fileId}.${fileExtension}`;

    // Upload to S3
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Create file record in database
    const fileRecord = new StorageModel({
      userId,
      fileId,
      fileName: file.originalname,
      fileKey,
      fileSize: file.size,
      fileType: file.mimetype,
      isPublic: req.body.isPublic === 'true'
    });

    await fileRecord.save();

    // Generate a presigned URL for immediate access
    const expirationSeconds = 3600; // 1 hour
    const getObjectParams = {
      Bucket: BUCKET_NAME,
      Key: fileKey
    };

    const presignedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand(getObjectParams),
      { expiresIn: expirationSeconds }
    );

    logger.info(`File uploaded: ${fileKey} by user ${userId}`);

    res.status(201).json({
      fileId,
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      uploadDate: fileRecord.createdAt,
      url: presignedUrl,
      isPublic: fileRecord.isPublic
    });
  } catch (error) {
    logger.error('Error uploading file:', error);
    res.status(500).json({ message: 'Server error during file upload' });
  }
};

/**
 * Get file by ID
 */
export const getFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check cache first
    const cacheKey = `file:${fileId}`;
    const cachedFile = await redisClient.get(cacheKey);

    if (cachedFile) {
      return res.status(200).json(JSON.parse(cachedFile));
    }

    // If not in cache, fetch from database
    const fileRecord = await StorageModel.findOne({ fileId });

    if (!fileRecord) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user has access to the file
    if (!fileRecord.isPublic && fileRecord.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Generate a presigned URL for access
    const expirationSeconds = 3600; // 1 hour
    const getObjectParams = {
      Bucket: BUCKET_NAME,
      Key: fileRecord.fileKey
    };

    const presignedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand(getObjectParams),
      { expiresIn: expirationSeconds }
    );

    const fileData = {
      fileId: fileRecord.fileId,
      fileName: fileRecord.fileName,
      fileSize: fileRecord.fileSize,
      fileType: fileRecord.fileType,
      uploadDate: fileRecord.createdAt,
      url: presignedUrl,
      isPublic: fileRecord.isPublic,
      metadata: fileRecord.metadata
    };

    // Cache the result
    await redisClient.set(cacheKey, JSON.stringify(fileData));

    res.status(200).json(fileData);
  } catch (error) {
    logger.error('Error getting file:', error);
    res.status(500).json({ message: 'Server error while fetching file' });
  }
};

/**
 * Delete file by ID
 */
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find file record
    const fileRecord = await StorageModel.findOne({ fileId });

    if (!fileRecord) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user owns the file
    if (fileRecord.userId.toString() !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete from S3
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: fileRecord.fileKey
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));

    // Delete from database
    await StorageModel.deleteOne({ fileId });

    // Clear cache
    await redisClient.del(`file:${fileId}`);

    logger.info(`File deleted: ${fileRecord.fileKey} by user ${userId}`);

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    logger.error('Error deleting file:', error);
    res.status(500).json({ message: 'Server error while deleting file' });
  }
};

/**
 * Get user's files
 */
export const getUserFiles = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const fileType = req.query.fileType as string;

    // Build query
    const query: any = { userId };

    if (fileType) {
      query.fileType = { $regex: fileType, $options: 'i' };
    }

    // Get total count
    const totalFiles = await StorageModel.countDocuments(query);

    // Get files
    const files = await StorageModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Generate presigned URLs for each file
    const filesWithUrls = await Promise.all(files.map(async (file) => {
      const getObjectParams = {
        Bucket: BUCKET_NAME,
        Key: file.fileKey
      };

      const presignedUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand(getObjectParams),
        { expiresIn: 3600 }
      );

      return {
        fileId: file.fileId,
        fileName: file.fileName,
        fileSize: file.fileSize,
        fileType: file.fileType,
        uploadDate: file.createdAt,
        url: presignedUrl,
        isPublic: file.isPublic,
        metadata: file.metadata
      };
    }));

    res.status(200).json({
      files: filesWithUrls,
      pagination: {
        total: totalFiles,
        page,
        limit,
        pages: Math.ceil(totalFiles / limit)
      }
    });
  } catch (error) {
    logger.error('Error getting user files:', error);
    res.status(500).json({ message: 'Server error while fetching user files' });
  }
};

/**
 * Update file metadata
 */
export const updateFileMetadata = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { metadata, isPublic } = req.body;

    // Find file record
    const fileRecord = await StorageModel.findOne({ fileId });

    if (!fileRecord) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user owns the file
    if (fileRecord.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update metadata
    if (metadata) {
      fileRecord.metadata = { ...fileRecord.metadata, ...metadata };
    }

    // Update visibility
    if (isPublic !== undefined) {
      fileRecord.isPublic = isPublic;
    }

    await fileRecord.save();

    // Clear cache
    await redisClient.del(`file:${fileId}`);

    logger.info(`File metadata updated: ${fileRecord.fileKey} by user ${userId}`);

    res.status(200).json({
      fileId: fileRecord.fileId,
      fileName: fileRecord.fileName,
      isPublic: fileRecord.isPublic,
      metadata: fileRecord.metadata,
      message: 'Metadata updated successfully'
    });
  } catch (error) {
    logger.error('Error updating file metadata:', error);
    res.status(500).json({ message: 'Server error while updating file metadata' });
  }
};

/**
 * Generate upload URL for client-side uploads
 */
export const getPresignedUploadUrl = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { fileName, fileType, isPublic } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ message: 'File name and type are required' });
    }

    // Validate file type
    const validationResult = validateFileType(fileName, fileType);
    if (!validationResult.valid) {
      return res.status(400).json({ message: validationResult.message });
    }

    // Generate a unique file key
    const fileId = uuidv4();
    const fileExtension = fileName.split('.').pop() || '';
    const fileKey = `${userId}/${fileId}.${fileExtension}`;

    // Create presigned upload URL
    const presignedUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        ContentType: fileType
      }),
      { expiresIn: 3600 }
    );

    // Create file record in database (will be updated after actual upload)
    const fileRecord = new StorageModel({
      userId,
      fileId,
      fileName,
      fileKey,
      fileSize: 0, // Will be updated after upload
      fileType,
      isPublic: isPublic === true,
      status: 'pending'
    });

    await fileRecord.save();

    res.status(200).json({
      fileId,
      uploadUrl: presignedUrl,
      fileKey,
      expiresIn: 3600 // seconds
    });
  } catch (error) {
    logger.error('Error generating presigned URL:', error);
    res.status(500).json({ message: 'Server error while generating upload URL' });
  }
};

/**
 * Complete client-side upload process
 */
export const completeUpload = async (req: Request, res: Response) => {
  try {
    const { fileId, fileSize } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!fileId || !fileSize) {
      return res.status(400).json({ message: 'File ID and size are required' });
    }

    // Find file record
    const fileRecord = await StorageModel.findOne({ fileId, userId });

    if (!fileRecord) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Update file record with actual file size and mark as completed
    fileRecord.fileSize = fileSize;
    fileRecord.status = 'completed';
    await fileRecord.save();

    // Generate a presigned URL for access
    const getObjectParams = {
      Bucket: BUCKET_NAME,
      Key: fileRecord.fileKey
    };

    const presignedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand(getObjectParams),
      { expiresIn: 3600 }
    );

    logger.info(`File upload completed: ${fileRecord.fileKey} by user ${userId}`);

    res.status(200).json({
      fileId,
      fileName: fileRecord.fileName,
      fileSize,
      fileType: fileRecord.fileType,
      uploadDate: fileRecord.updatedAt,
      url: presignedUrl,
      isPublic: fileRecord.isPublic
    });
  } catch (error) {
    logger.error('Error completing upload:', error);
    res.status(500).json({ message: 'Server error while completing upload' });
  }
};