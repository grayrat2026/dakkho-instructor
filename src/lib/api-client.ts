/**
 * DAKKHO Admin — Unified API Client
 *
 * Automatically routes requests to either:
 *   • Supabase Edge Functions  (when NEXT_PUBLIC_API_BASE_URL is set)
 *   • Local Next.js API routes (default, /api/admin/...)
 *
 * Usage:
 *   import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from '@/lib/api-client';
 *
 *   // Replace inline fetch calls:
 *   - fetch('/api/admin/users?limit=20')           → apiGet('/users?limit=20')
 *   - fetch('/api/admin/users', { method:'PUT'… }) → apiPut('/users', body)
 *   - fetch(`/api/admin/users?id=x`, { method:'DELETE' }) → apiDelete('/users?id=x')
 *
 * All paths are relative to /api/admin — just pass the suffix.
 */

// ---------------------------------------------------------------------------
// Environment detection
// ---------------------------------------------------------------------------

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const IS_SUPABASE_EDGE = API_BASE_URL.length > 0;

/**
 * Build the full URL for a given path.
 *
 * Local mode:      /api/admin/users?limit=20
 * Supabase mode:   https://<project>.supabase.co/functions/v1/users?limit=20
 */
function buildUrl(path: string): string {
  // Normalise: strip leading slash so we can safely join
  const clean = path.replace(/^\/+/, '');

  if (IS_SUPABASE_EDGE) {
    // Supabase Edge Functions URL pattern:
    //   <BASE_URL>/functions/v1/<function-name>
    // The function name maps to the first path segment (e.g. "users", "courses")
    const base = API_BASE_URL.replace(/\/+$/, '');
    return `${base}/functions/v1/${clean}`;
  }

  // Local Next.js API routes
  return `/api/admin/${clean}`;
}

// ---------------------------------------------------------------------------
// Auth token helpers
// ---------------------------------------------------------------------------

const AUTH_TOKEN_KEY = 'dakkho_admin_token';

/** Retrieve a stored auth token (set after login). */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/** Persist auth token after a successful login. */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/** Clear the stored auth token (logout). */
export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  public status: number;
  public code: string;
  public details: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// ---------------------------------------------------------------------------
// Internal request helper
// ---------------------------------------------------------------------------

interface RequestOptions {
  method: string;
  headers?: Record<string, string>;
  body?: BodyInit | null;
  /** Override the default "fail on non-2xx" behaviour. */
  raw?: boolean;
}

async function request<T = unknown>(path: string, options: RequestOptions): Promise<T> {
  const url = buildUrl(path);

  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };

  // Attach JSON content-type when a non-FormData body is provided
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // For Supabase Edge Functions, attach Bearer token
  if (IS_SUPABASE_EDGE) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Also send the Supabase anon key if available (required for RLS-protected functions)
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (anonKey) {
      headers['apikey'] = anonKey;
    }
  }

  const res = await fetch(url, {
    method: options.method,
    headers,
    body: options.body ?? undefined,
  });

  // Return raw Response when caller explicitly wants it
  if (options.raw) {
    return res as unknown as T;
  }

  // Parse JSON — safely handle empty bodies
  let data: unknown;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  // Throw on non-2xx
  if (!res.ok) {
    const errObj = data as Record<string, unknown>;
    throw new ApiError(
      res.status,
      String(errObj.code || res.status),
      String(errObj.error || errObj.message || res.statusText),
      errObj,
    );
  }

  return data as T;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Perform a GET request.
 *
 * @example
 *   const data = await apiGet('/users?limit=20');
 *   const config = await apiGet<ServerConfig>('/config');
 */
export async function apiGet<T = unknown>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' });
}

/**
 * Perform a POST request.
 *
 * @example
 *   await apiPost('/auth', { email, password });
 *   await apiPost('/notifications', { title, message, targetAll: true });
 */
export async function apiPost<T = unknown>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Perform a PUT request.
 *
 * @example
 *   await apiPut('/users', { userId: 'abc', isActive: true });
 *   await apiPut('/config', configObject);
 */
export async function apiPut<T = unknown>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * Perform a DELETE request.
 *
 * @example
 *   await apiDelete('/users?id=abc123');
 *   await apiDelete('/categories?id=xyz');
 */
export async function apiDelete<T = unknown>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

/**
 * Upload files via multipart/form-data.
 *
 * @example
 *   const fd = new FormData();
 *   fd.append('file', fileInput.files[0]);
 *   fd.append('courseId', 'abc');
 *   const result = await apiUpload('/videos/upload', fd);
 */
export async function apiUpload<T = unknown>(path: string, formData: FormData): Promise<T> {
  // Do NOT set Content-Type — the browser sets it with the correct boundary
  return request<T>(path, {
    method: 'POST',
    headers: {},          // intentionally no Content-Type
    body: formData,
  });
}

// ---------------------------------------------------------------------------
// Convenience: raw Response access (for streaming, progress, etc.)
// ---------------------------------------------------------------------------

/**
 * Get the raw fetch Response object for advanced use cases
 * (e.g. streaming, reading headers, manual error handling).
 *
 * @example
 *   const res = await apiRaw('/analytics');
 *   if (res.ok) { const data = await res.json(); }
 */
export async function apiRaw(path: string, init?: RequestInit): Promise<Response> {
  const url = buildUrl(path);

  const headers: Record<string, string> = {};

  if (IS_SUPABASE_EDGE) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (anonKey) {
      headers['apikey'] = anonKey;
    }
  }

  const initHeaders: Record<string, string> = {};
  if (init?.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((value, key) => { initHeaders[key] = value; });
    } else if (Array.isArray(init.headers)) {
      for (const [key, value] of init.headers) { initHeaders[key] = value; }
    } else {
      Object.assign(initHeaders, init.headers);
    }
  }

  return fetch(url, {
    ...init,
    headers: {
      ...headers,
      ...initHeaders,
    },
  });
}

// ---------------------------------------------------------------------------
// Path mapping reference (for Supabase Edge Function naming)
// ---------------------------------------------------------------------------

/**
 * When IS_SUPABASE_EDGE is true, the path suffix maps to an Edge Function name.
 *
 * Component call              →  apiClient path  →  Edge Function name
 * ────────────────────────────────────────────────────────────────────
 * GET  /api/admin/analytics   →  /analytics      →  analytics
 * GET  /api/admin/users       →  /users          →  users
 * PUT  /api/admin/users       →  /users          →  users
 * DEL  /api/admin/users?id=   →  /users?id=      →  users
 * GET  /api/admin/courses     →  /courses        →  courses
 * POST /api/admin/courses     →  /courses        →  courses
 * PUT  /api/admin/courses     →  /courses        →  courses
 * DEL  /api/admin/courses?id= →  /courses?id=    →  courses
 * GET  /api/admin/videos      →  /videos         →  videos
 * POST /api/admin/videos      →  /videos         →  videos
 * PUT  /api/admin/videos      →  /videos         →  videos
 * DEL  /api/admin/videos?id=  →  /videos?id=     →  videos
 * GET  /api/admin/instructors →  /instructors    →  instructors
 * POST /api/admin/instructors →  /instructors    →  instructors
 * PUT  /api/admin/instructors →  /instructors    →  instructors
 * DEL  /api/admin/instructors?id= → /instructors?id= → instructors
 * GET  /api/admin/categories  →  /categories     →  categories
 * POST /api/admin/categories  →  /categories     →  categories
 * PUT  /api/admin/categories  →  /categories     →  categories
 * DEL  /api/admin/categories?id= → /categories?id= → categories
 * GET  /api/admin/institutes  →  /institutes     →  institutes
 * POST /api/admin/institutes  →  /institutes     →  institutes
 * PUT  /api/admin/institutes  →  /institutes     →  institutes
 * DEL  /api/admin/institutes?id= → /institutes?id= → institutes
 * GET  /api/admin/notifications → /notifications →  notifications
 * POST /api/admin/notifications → /notifications →  notifications
 * GET  /api/admin/config      →  /config         →  config
 * PUT  /api/admin/config      →  /config         →  config
 * GET  /api/admin/system/status → /system/status →  system-status
 * POST /api/admin/system/api-key → /system/api-key → system-api-key
 * POST /api/admin/email/test  →  /email/test     →  email-test
 * POST /api/admin/auth        →  /auth           →  auth
 */
