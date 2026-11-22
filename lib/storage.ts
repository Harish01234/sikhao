import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

export const storage = new S3Client({
  endpoint: required("STORAGE_ENDPOINT"),
  region: required("STORAGE_REGION"),
  credentials: {
    accessKeyId: required("STORAGE_ACCESS_KEY_ID"),
    secretAccessKey: required("STORAGE_SECRET_ACCESS_KEY"),
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

function bucket() {
  return required("STORAGE_BUCKET");
}

export async function createUploadUrl(key: string, contentType: string) {
  const url = await getSignedUrl(
    storage,
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 60 * 10 },
  );

  return { url, key };
}

export async function createPlaybackUrl(key: string) {
  return getSignedUrl(
    storage,
    new GetObjectCommand({
      Bucket: bucket(),
      Key: key,
    }),
    { expiresIn: 60 * 60 },
  );
}

export async function deleteObject(key: string) {
  await storage.send(
    new DeleteObjectCommand({
      Bucket: bucket(),
      Key: key,
    }),
  );
}