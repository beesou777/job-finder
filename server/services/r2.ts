import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Cloudflare R2 credentials are missing in environment variables.");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * Uploads a user CV/Resume file to Cloudflare R2 bucket.
 */
export async function uploadCvToR2(
  userId: number,
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
): Promise<{ key: string; url: string }> {
  const s3 = getR2Client();
  const bucket = process.env.R2_BUCKET || "media-platform";
  const publicBaseUrl = (
    process.env.R2_PUBLIC_BASE_URL || "https://pub-95409da784f64e6e87f4875ee70158bf.r2.dev"
  ).replace(/\/+$/, "");

  // Clean filename of unsafe characters
  const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `cvs/${userId}/${Date.now()}-${cleanName}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType || "application/octet-stream",
    }),
  );

  const url = `${publicBaseUrl}/${key}`;
  return { key, url };
}

/**
 * Deletes a file from Cloudflare R2 bucket by key.
 */
export async function deleteCvFromR2(key: string): Promise<boolean> {
  if (!key) return false;
  try {
    const s3 = getR2Client();
    const bucket = process.env.R2_BUCKET || "media-platform";
    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
    return true;
  } catch (error) {
    console.error("[R2] Failed to delete file with key:", key, error);
    return false;
  }
}
