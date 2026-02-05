import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';

// For local development without S3
const useLocalStorage = !process.env.AWS_ACCESS_KEY_ID || process.env.NODE_ENV === 'development';

let s3: AWS.S3 | null = null;

if (!useLocalStorage) {
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
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
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, file);
    return `local://${fileName}`;
  }

  if (!s3) {
    throw new Error('S3 not configured');
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME as string,
    Key: fileName,
    Body: file,
    ContentType: contentType
  };

  const result = await s3.upload(params).promise();
  return result.Location;
};

export const deleteFromS3 = async (fileName: string): Promise<void> => {
  if (useLocalStorage) {
    // Delete local file
    const filePath = path.join(process.cwd(), 'uploads', fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return;
  }

  if (!s3) {
    throw new Error('S3 not configured');
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME as string,
    Key: fileName
  };

  await s3.deleteObject(params).promise();
};

export default s3;