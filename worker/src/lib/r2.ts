/**
 * R2 native binding helper for Cloudflare Workers
 * Uses native R2Bucket bindings — NO AWS S3 SDK!
 */

import type { Env } from '../env';

// ─── Upload file to R2 ───

export async function uploadFile(
  bucket: R2Bucket,
  key: string,
  body: ReadableStream | ArrayBuffer | ArrayBufferView,
  contentType: string
): Promise<R2Object> {
  const result = await bucket.put(key, body, {
    httpMetadata: {
      contentType,
    },
  });
  return result;
}

// ─── Delete file from R2 ───

export async function deleteFile(
  bucket: R2Bucket,
  key: string
): Promise<void> {
  await bucket.delete(key);
}

// ─── Get file from R2 ───

export async function getFile(
  bucket: R2Bucket,
  key: string
): Promise<R2ObjectBody | null> {
  return bucket.get(key);
}

// ─── Get file metadata (HEAD) ───

export async function getFileInfo(
  bucket: R2Bucket,
  key: string
): Promise<R2Object | null> {
  return bucket.head(key);
}

// ─── List files in R2 bucket ───

export async function listFiles(
  bucket: R2Bucket,
  prefix?: string,
  limit?: number
): Promise<R2Objects> {
  return bucket.list({
    prefix,
    limit: limit || 100,
  });
}

// ─── Check if bucket is accessible ───

export async function checkBucket(
  bucket: R2Bucket
): Promise<boolean> {
  try {
    // Try listing with limit 1 — if bucket binding works, it's accessible
    const result = await bucket.list({ limit: 1 });
    return true;
  } catch {
    return false;
  }
}

// ─── Get the right R2Bucket binding for a file type ───

export function getBucketForType(type: string, env: Env): R2Bucket {
  switch (type) {
    case 'videos':
    case 'video':
      return env.R2_VIDEOS;
    case 'thumbnails':
    case 'thumbnail':
    case 'images':
    case 'image':
      return env.R2_THUMBNAILS;
    case 'avatars':
    case 'avatar':
      return env.R2_AVATARS;
    case 'resources':
    case 'resource':
    case 'documents':
    case 'document':
      return env.R2_RESOURCES;
    default:
      return env.R2_RESOURCES;
  }
}

// ─── Generate public URL for an R2 object ───
// Note: Workers R2 doesn't support presigned URLs natively.
// Use R2 public bucket or custom domain for public access.

export function getPublicUrl(env: Env, bucketType: string, key: string): string {
  // If R2_PUBLIC_URL is set in env, use it; otherwise fall back
  const envAny = env as unknown as Record<string, unknown>;
  const publicUrl = envAny.R2_PUBLIC_URL as string | undefined;
  if (publicUrl) {
    return `${publicUrl}/${key}`;
  }
  // Default pattern — works with R2 public bucket or custom domain
  const bucketName = getBucketName(bucketType);
  const accountId = envAny.R2_ACCOUNT_ID || 'pub';
  return `https://${bucketName}.${accountId}.r2.dev/${key}`;
}

function getBucketName(type: string): string {
  switch (type) {
    case 'videos':
    case 'video':
      return 'dakkho-videos';
    case 'thumbnails':
    case 'thumbnail':
      return 'dakkho-thumbnails';
    case 'avatars':
    case 'avatar':
      return 'dakkho-avatars';
    case 'resources':
    case 'resource':
      return 'dakkho-resources';
    default:
      return 'dakkho-resources';
  }
}
