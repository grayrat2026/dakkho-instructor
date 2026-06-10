/**
 * Utility functions for DAKKHO Admin API
 */
/**
 * Generate a unique ID (UUID v4-like)
 */
export function generateId() {
    return crypto.randomUUID();
}
/**
 * Standard JSON response helper
 */
export function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
/**
 * Standard error response helper
 */
export function errorResponse(message, status = 500) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
/**
 * Parse JSON body safely
 */
export async function parseBody(c) {
    try {
        return await c.req.json();
    }
    catch {
        throw new Error('Invalid JSON body');
    }
}
/**
 * Get error message from unknown error
 */
export function getErrorMessage(error) {
    if (error instanceof Error)
        return error.message;
    if (typeof error === 'string')
        return error;
    return 'Unknown error';
}
/**
 * Format date for D1 storage (ISO 8601)
 */
export function formatDate(date = new Date()) {
    return date.toISOString();
}
/**
 * Calculate session expiry date (7 days from now)
 */
export function getSessionExpiry(days = 7) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    return expiresAt.toISOString();
}
/**
 * Convert a camelCase string to snake_case.
 * e.g. "thumbnailUrl" → "thumbnail_url", "isPublished" → "is_published"
 */
export function camelToSnake(str) {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}
/**
 * Normalize an object's keys from camelCase to snake_case.
 * This allows the admin panel (which sends camelCase) to work with
 * D1 column names (which are snake_case).
 * Only transforms keys that exist in the provided `allowedFields` set.
 */
export function normalizeKeys(data, allowedFields) {
    const allowedSet = new Set(allowedFields);
    const result = {};
    for (const [key, value] of Object.entries(data)) {
        const snakeKey = camelToSnake(key);
        // Use the snake_case key if it's in allowedFields; otherwise try original key
        if (allowedSet.has(snakeKey)) {
            result[snakeKey] = value;
        }
        else if (allowedSet.has(key)) {
            result[key] = value;
        }
        // Skip keys that don't match any allowed field (camelCase or snake_case)
    }
    return result;
}
