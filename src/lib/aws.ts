import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID ? new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
}) : null;

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'nexus-uploads-mock-bucket';

export async function generateUploadUrl(key: string, contentType: string, contentLength?: number): Promise<string> {
  if (!s3Client) {
    console.warn('AWS S3 credentials missing. Using mock upload URL.');
    return `https://mock-s3-url.com/upload?key=${key}`;
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ContentLength: contentLength,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function generateDownloadUrl(key: string): Promise<string> {
  if (!s3Client) {
    return `https://mock-s3-url.com/download?key=${key}`;
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
