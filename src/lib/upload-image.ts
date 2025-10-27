
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: Boolean(process.env.S3_ENDPOINT),
  credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID!, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY! }
});

export async function saveBase64PNG(b64: string, key: string) {
  const Body = Buffer.from(b64, "base64");
  await s3.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key, Body, ContentType: "image/png" }));
  return `https://${process.env.PUBLIC_CDN_DOMAIN}/${key}`;
}
