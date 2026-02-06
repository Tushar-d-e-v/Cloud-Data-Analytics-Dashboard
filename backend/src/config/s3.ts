import { 
  S3Client, 
  PutObjectCommand, 
  DeleteObjectCommand 
} from '@aws-sdk/client-s3';

import fs from 'fs';
import path from 'path';

// For local development without S3
const useLocalStorage =
  !process.env.AWS_ACCESS_KEY_ID || process.env.NODE_ENV === 'development';

let s3: S3Client | null = null;

if (!useLocalStorage) {
  s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  });
}

export const uploadToS3 = async (
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> => {

  if (useLocalStorage) {
    // Store locally for development
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadsDir, fileName);
    const fileDir = path.dirname(filePath);

    // Create all parent directories if they don't exist
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    fs.writeFileSync(filePath, file);

    return `local://${fileName}`;
  }

  if (!s3) {
    throw new Error('S3 not configured');
  }

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: fileName,
    Body: file,
    ContentType: contentType
  });

  await s3.send(command);

  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};

export const deleteFromS3 = async (fileName: string): Promise<void> => {

  if (useLocalStorage) {
    const filePath = path.join(process.cwd(), 'uploads', fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      
      // Try to remove empty parent directories
      try {
        const fileDir = path.dirname(filePath);
        const uploadsDir = path.join(process.cwd(), 'uploads');
        
        // Remove directory if empty (won't remove if it has other files)
        if (fileDir !== uploadsDir && fs.readdirSync(fileDir).length === 0) {
          fs.rmdirSync(fileDir);
          
          // Try to remove user directory if empty
          const userDir = path.dirname(fileDir);
          if (userDir !== uploadsDir && fs.readdirSync(userDir).length === 0) {
            fs.rmdirSync(userDir);
          }
        }
      } catch (cleanupError) {
        // Ignore errors when cleaning up directories
      }
    }
    return;
  }

  if (!s3) {
    throw new Error('S3 not configured');
  }

  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: fileName
  });

  await s3.send(command);
};

export default s3;
