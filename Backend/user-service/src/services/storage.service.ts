import axios from 'axios';
import FormData from 'form-data';
import { logger } from '../utils/logger';

export class StorageService {
  private storageServiceUrl: string;

  constructor() {
    this.storageServiceUrl = process.env.STORAGE_SERVICE_URL || 'http://storage-service:5001';
  }

  /**
   * Upload a file to the storage service
   * @param fileBuffer The file buffer to upload
   * @param fileName The name of the file
   * @param fileType The MIME type of the file
   * @returns The URL of the uploaded file
   */
  async uploadFile(fileBuffer: Buffer, fileName: string, fileType: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: fileName,
        contentType: fileType
      });

      const response = await axios.post(`${this.storageServiceUrl}/api/storage/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status !== 201) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
      }

      return response.data.url;
    } catch (error) {
      logger.error('Error uploading file to storage service:', error);
      throw new Error('Failed to upload file to storage service');
    }
  }

  /**
   * Delete a file from the storage service
   * @param fileUrl The URL of the file to delete
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract the file ID from the URL
      const fileId = this.extractFileIdFromUrl(fileUrl);

      if (!fileId) {
        throw new Error('Invalid file URL');
      }

      const response = await axios.delete(`${this.storageServiceUrl}/api/storage/${fileId}`);

      if (response.status !== 200) {
        throw new Error(`Failed to delete file: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error deleting file from storage service:', error);
      throw new Error('Failed to delete file from storage service');
    }
  }

  /**
   * Extract the file ID from a file URL
   * @param fileUrl The URL of the file
   * @returns The file ID
   */
  private extractFileIdFromUrl(fileUrl: string): string | null {
    try {
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/');

      // The file ID is typically the last part of the path
      return pathParts[pathParts.length - 1];
    } catch (error) {
      logger.error('Error extracting file ID from URL:', error);
      return null;
    }
  }
}
