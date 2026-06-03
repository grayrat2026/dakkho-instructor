export interface Env {
  // R2 Buckets
  R2_VIDEOS: R2Bucket;
  R2_THUMBNAILS: R2Bucket;
  R2_AVATARS: R2Bucket;
  R2_RESOURCES: R2Bucket;

  // Workers KV
  KV_CONFIG: KVNamespace;

  // D1 Database
  DB: D1Database;

  // Environment Variables
  APPWRITE_ENDPOINT: string;
  APPWRITE_PROJECT_ID: string;
  APPWRITE_DATABASE_ID: string;
  APPWRITE_API_KEY: string;
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
  RESEND_SUPPORT_EMAIL: string;
  ADMIN_SECRET_KEY: string;
  ENVIRONMENT: string;
}
