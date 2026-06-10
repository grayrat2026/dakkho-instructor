/**
 * Upload routes — POST (multipart), DELETE
 * Uses native R2Bucket bindings
 */
import { Hono } from 'hono';
import { adminAuthMiddleware } from '../lib/auth';
import { uploadFile, deleteFile, getBucketForType, getPublicUrl } from '../lib/r2';
import { logAudit } from '../lib/audit';
import { getErrorMessage } from '../lib/utils';
const uploadRoutes = new Hono();
// Apply auth middleware to all upload routes
uploadRoutes.use('*', adminAuthMiddleware);
// POST / — Upload file to R2
uploadRoutes.post('/', async (c) => {
    try {
        const formData = await c.req.formData();
        const file = formData.get('file');
        const bucket = formData.get('bucket');
        const prefix = formData.get('prefix') || '';
        if (!file || !bucket) {
            return c.json({ error: 'File and bucket are required' }, 400);
        }
        const arrayBuffer = await file.arrayBuffer();
        const key = prefix ? `${prefix}/${Date.now()}-${file.name}` : `${Date.now()}-${file.name}`;
        // Get the right R2 bucket binding
        const r2Bucket = getBucketForType(bucket, c.env);
        await uploadFile(r2Bucket, key, arrayBuffer, file.type);
        // Construct public URL using the shared helper
        const url = getPublicUrl(c.env, bucket, key);
        const user = c.get('user');
        await logAudit(c.env, user.id, 'UPLOAD_FILE', 'r2', key, {
            bucket,
            fileName: file.name,
            size: file.size,
        });
        return c.json({ url, key, bucket });
    }
    catch (error) {
        const message = getErrorMessage(error);
        return c.json({ error: message }, 500);
    }
});
// DELETE / — Delete file from R2
uploadRoutes.delete('/', async (c) => {
    try {
        const bucket = c.req.query('bucket');
        const key = c.req.query('key');
        if (!bucket || !key) {
            return c.json({ error: 'Bucket and key are required' }, 400);
        }
        const r2Bucket = getBucketForType(bucket, c.env);
        await deleteFile(r2Bucket, key);
        const user = c.get('user');
        await logAudit(c.env, user.id, 'DELETE_FILE', 'r2', key, { bucket });
        return c.json({ success: true });
    }
    catch (error) {
        const message = getErrorMessage(error);
        return c.json({ error: message }, 500);
    }
});
export default uploadRoutes;
