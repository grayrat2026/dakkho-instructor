/**
 * Utility functions for DAKKHO Admin API
 */

import { Context } from 'hono';

/**
 * Generate a unique ID (UUID v4-like)
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Standard JSON response helper
 */
export function jsonResponse(data: unknown, status: number = 200): Response {
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
export function errorResponse(message: string, status: number = 500): Response {
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
export async function parseBody<T = Record<string, unknown>>(c: Context): Promise<T> {
  try {
    return await c.req.json<T>();
  } catch {
    throw new Error('Invalid JSON body');
  }
}

/**
 * Get error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error';
}

/**
 * Format date for D1 storage (ISO 8601)
 */
export function formatDate(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Calculate session expiry date (7 days from now)
 */
export function getSessionExpiry(days: number = 7): string {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt.toISOString();
}
