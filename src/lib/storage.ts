
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const region = process.env.AWS_REGION || 'auto';
const endpoint = process.env.S3_ENDPOINT;

export const s3 = new S3Client({
  region,
  endpoint,
  forcePathStyle: Boolean(endpoint),
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!
  }
});

export async function getUploadUrl(key: string, mime: string) {
  const cmd = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    ContentType: mime
  });
  const url = await getSignedUrl(s3, cmd, { expiresIn: 900 });
  return url;
}
