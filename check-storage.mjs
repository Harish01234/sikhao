import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";

const storage = new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT,
  region: process.env.STORAGE_REGION,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

await storage.send(new HeadBucketCommand({ Bucket: process.env.STORAGE_BUCKET }));
console.log("ok", process.env.STORAGE_BUCKET);
