/**
 * Audit logging for DAKKHO Admin API using D1
 */
import { generateId } from './utils';
/**
 * Log an audit action to D1
 */
export async function logAudit(env, adminId, action, resourceType, resourceId, details) {
    try {
        await env.DB.prepare(`INSERT INTO audit_logs (id, action, resource_type, resource_id, user_id, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`)
            .bind(generateId(), action, resourceType, resourceId || null, adminId, details ? JSON.stringify(details) : '{}')
            .run();
    }
    catch (error) {
        // Audit logging should never fail the request
        console.error('Audit log failed:', error);
    }
}
