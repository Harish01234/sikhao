import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
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

export async function objectExists(key: string) {
  try {
    await storage.send(
      new HeadObjectCommand({
        Bucket: bucket(),
        Key: key,
      }),
    );
    return true;
  } catch (error) {
    if (isMissingObject(error)) {
      return false;
    }

    throw error;
  }
}

export async function readObject(key: string) {
  try {
    const response = await storage.send(
      new GetObjectCommand({
        Bucket: bucket(),
        Key: key,
      }),
    );

    if (!response.Body) {
      throw new Error("That file was not found.");
    }

    return Buffer.from(await response.Body.transformToByteArray());
  } catch (error) {
    if (error instanceof Error && error.message === "That file was not found.") {
      throw error;
    }

    if (isMissingObject(error)) {
      throw new Error("That file was not found.");
    }

    throw error;
  }
}

export async function writeObject(key: string, body: Buffer, contentType: string) {
  await storage.send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function listKeys(prefix: string) {
  const keys: string[] = [];
  let token: string | undefined;

  do {
    const response = await storage.send(
      new ListObjectsV2Command({
        Bucket: bucket(),
        Prefix: prefix,
        ContinuationToken: token,
      }),
    );

    for (const item of response.Contents ?? []) {
      if (item.Key) {
        keys.push(item.Key);
      }
    }

    token = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (token);

  return keys;
}

function isMissingObject(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const status = "$metadata" in error ? (error.$metadata as { httpStatusCode?: number } | undefined)?.httpStatusCode : undefined;
  return error.name === "NoSuchKey" || error.name === "NotFound" || status === 404;
}

export async function deleteKeys(keys: string[]) {
  for (let index = 0; index < keys.length; index += 20) {
    await Promise.all(keys.slice(index, index + 20).map((key) => deleteObject(key)));
  }
}