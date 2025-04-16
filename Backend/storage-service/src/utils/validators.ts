/**
 * Validates file type based on MIME type and/or file extension
 * @param fileName The name of the file
 * @param mimeType The MIME type of the file
 * @returns Validation result with valid flag and message
 */
export function validateFileType(fileName: string, mimeType: string): { valid: boolean; message: string } {
  // Allowed MIME types
  const allowedMimeTypes = [
    // Audio
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac',
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Documents
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Archives
    'application/zip', 'application/x-rar-compressed',
    // Other
    'application/json', 'text/plain', 'text/csv'
  ];

  // Check MIME type
  if (!allowedMimeTypes.includes(mimeType)) {
    return {
      valid: false,
      message: `File type ${mimeType} is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`
    };
  }

  // Additional validation for file extension
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (!extension) {
    return {
      valid: false,
      message: 'File must have an extension'
    };
  }

  // Map of allowed extensions by MIME type category
  const allowedExtensions: Record<string, string[]> = {
    'audio': ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'],
    'image': ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    'application/pdf': ['pdf'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    'application/zip': ['zip'],
    'application/x-rar-compressed': ['rar'],
    'application/json': ['json'],
    'text/plain': ['txt'],
    'text/csv': ['csv']
  };

  // Check if extension matches MIME type
  let isValidExtension = false;
  
  if (mimeType.startsWith('audio/')) {
    isValidExtension = allowedExtensions['audio'].includes(extension);
  } else if (mimeType.startsWith('image/')) {
    isValidExtension = allowedExtensions['image'].includes(extension);
  } else {
    // For other MIME types, check specific extensions
    const specificExtensions = allowedExtensions[mimeType];
    if (specificExtensions) {
      isValidExtension = specificExtensions.includes(extension);
    }
  }

  if (!isValidExtension) {
    return {
      valid: false,
      message: `File extension ${extension} does not match the MIME type ${mimeType}`
    };
  }

  return {
    valid: true,
    message: 'File type is valid'
  };
}
