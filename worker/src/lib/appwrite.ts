/**
 * Appwrite REST API helper for Cloudflare Workers
 * Uses direct fetch() calls — NO node-appwrite SDK
 */

import type { Env } from '../env';

// ─── Appwrite Query helpers (replaces node-appwrite Query class) ───

export const Query = {
  equal: (attribute: string, value: unknown): string =>
    `equal("${attribute}", ${JSON.stringify(Array.isArray(value) ? value : [value])})`,
  notEqual: (attribute: string, value: unknown): string =>
    `notEqual("${attribute}", ${JSON.stringify(Array.isArray(value) ? value : [value])})`,
  lessThan: (attribute: string, value: unknown): string =>
    `lessThan("${attribute}", [${JSON.stringify(value)}])`,
  lessThanEqual: (attribute: string, value: unknown): string =>
    `lessThanEqual("${attribute}", [${JSON.stringify(value)}])`,
  greaterThan: (attribute: string, value: unknown): string =>
    `greaterThan("${attribute}", [${JSON.stringify(value)}])`,
  greaterThanEqual: (attribute: string, value: unknown): string =>
    `greaterThanEqual("${attribute}", [${JSON.stringify(value)}])`,
  search: (attribute: string, value: string): string =>
    `search("${attribute}", "${value}")`,
  limit: (value: number): string => `limit(${value})`,
  offset: (value: number): string => `offset(${value})`,
  orderAsc: (attribute: string): string => `orderAsc("${attribute}")`,
  orderDesc: (attribute: string): string => `orderDesc("${attribute}")`,
  cursorAfter: (documentId: string): string => `cursorAfter("${documentId}")`,
  cursorBefore: (documentId: string): string => `cursorBefore("${documentId}")`,
};

// ─── Core REST API function ───

interface AppwriteRequestOptions {
  method?: string;
  path: string;
  body?: unknown;
  sessionCookie?: string;
  useProjectHeader?: boolean;
}

async function appwriteRequest(
  env: Env,
  options: AppwriteRequestOptions
): Promise<Response> {
  const { method = 'GET', path, body, sessionCookie, useProjectHeader = false } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // For user-scoped requests (e.g. account), use project header + session cookie
  // IMPORTANT: Do NOT send X-Appwrite-Key with user-scoped requests!
  // When both X-Appwrite-Key and Cookie are sent, Appwrite authenticates as
  // the server application (role: applications) which lacks "account" scope.
  if (useProjectHeader && sessionCookie) {
    headers['X-Appwrite-Project'] = env.APPWRITE_PROJECT_ID;
    headers['Cookie'] = `a_session_${env.APPWRITE_PROJECT_ID}=${sessionCookie}`;
  } else {
    // Server-scoped requests use API key for admin access
    headers['X-Appwrite-Project'] = env.APPWRITE_PROJECT_ID;
    headers['X-Appwrite-Key'] = env.APPWRITE_API_KEY;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET' && method !== 'HEAD') {
    fetchOptions.body = JSON.stringify(body);
  }

  return fetch(`${env.APPWRITE_ENDPOINT}${path}`, fetchOptions);
}

// ─── Document CRUD ───

export async function listDocuments(
  env: Env,
  collectionId: string,
  queries: string[] = []
): Promise<{ documents: unknown[]; total: number }> {
  const params = new URLSearchParams();
  queries.forEach((q) => params.append('queries[]', q));

  const res = await appwriteRequest(env, {
    path: `/databases/${env.APPWRITE_DATABASE_ID}/collections/${collectionId}/documents?${params.toString()}`,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error((err as { message?: string }).message || `Failed to list documents from ${collectionId}`);
  }

  return res.json() as Promise<{ documents: unknown[]; total: number }>;
}

export async function getDocument(
  env: Env,
  collectionId: string,
  documentId: string
): Promise<Record<string, unknown>> {
  const res = await appwriteRequest(env, {
    path: `/databases/${env.APPWRITE_DATABASE_ID}/collections/${collectionId}/documents/${documentId}`,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error((err as { message?: string }).message || 'Failed to get document');
  }

  return res.json() as Promise<Record<string, unknown>>;
}

export async function createDocument(
  env: Env,
  collectionId: string,
  data: Record<string, unknown>,
  documentId?: string
): Promise<Record<string, unknown> & { $id: string }> {
  const res = await appwriteRequest(env, {
    method: 'POST',
    path: `/databases/${env.APPWRITE_DATABASE_ID}/collections/${collectionId}/documents`,
    body: {
      documentId: documentId || 'unique()',
      data,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error((err as { message?: string }).message || 'Failed to create document');
  }

  return res.json() as Promise<Record<string, unknown> & { $id: string }>;
}

export async function updateDocument(
  env: Env,
  collectionId: string,
  documentId: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const res = await appwriteRequest(env, {
    method: 'PATCH',
    path: `/databases/${env.APPWRITE_DATABASE_ID}/collections/${collectionId}/documents/${documentId}`,
    body: { data },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error((err as { message?: string }).message || 'Failed to update document');
  }

  return res.json() as Promise<Record<string, unknown>>;
}

export async function deleteDocument(
  env: Env,
  collectionId: string,
  documentId: string
): Promise<boolean> {
  const res = await appwriteRequest(env, {
    method: 'DELETE',
    path: `/databases/${env.APPWRITE_DATABASE_ID}/collections/${collectionId}/documents/${documentId}`,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error((err as { message?: string }).message || 'Failed to delete document');
  }

  return true;
}

// ─── Auth helpers ───

export async function createSession(
  env: Env,
  email: string,
  password: string
): Promise<{ response: Response; sessionCookie: string }> {
  const res = await fetch(`${env.APPWRITE_ENDPOINT}/account/sessions/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': env.APPWRITE_PROJECT_ID,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ message: 'Invalid email or password' }));
    throw new Error((errData as { message?: string }).message || 'Invalid email or password');
  }

  // Extract session cookie from Set-Cookie headers
  // getSetCookie() may not be in the @cloudflare/workers-types Headers definition
  const headersAny = res.headers as unknown as { getSetCookie?: () => string[] };
  const setCookieHeaders: string[] =
    typeof headersAny.getSetCookie === 'function'
      ? headersAny.getSetCookie()
      : (() => {
          const all: string[] = [];
          const header = res.headers.get('set-cookie');
          if (header) all.push(header);
          return all;
        })();
  let sessionCookie = '';

  for (const cookie of setCookieHeaders) {
    if (cookie.includes(`a_session_${env.APPWRITE_PROJECT_ID}=`) && !cookie.includes('legacy')) {
      const match = cookie.match(new RegExp(`a_session_${env.APPWRITE_PROJECT_ID}=([^;]+)`));
      if (match) {
        sessionCookie = match[1];
      }
    }
  }

  // Also check x-fallback-cookies header
  if (!sessionCookie) {
    const fallbackCookies = res.headers.get('x-fallback-cookies');
    if (fallbackCookies) {
      try {
        const parsed = JSON.parse(fallbackCookies);
        sessionCookie = parsed[`a_session_${env.APPWRITE_PROJECT_ID}`] || '';
      } catch {
        // Ignore parse errors
      }
    }
  }

  if (!sessionCookie) {
    throw new Error('Failed to establish session');
  }

  return { response: res, sessionCookie };
}

export async function deleteSession(
  env: Env,
  sessionCookie: string
): Promise<void> {
  try {
    // Delete session using user-scoped auth (no API key)
    await fetch(`${env.APPWRITE_ENDPOINT}/account/sessions/current`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': env.APPWRITE_PROJECT_ID,
        'Cookie': `a_session_${env.APPWRITE_PROJECT_ID}=${sessionCookie}`,
      },
    });
  } catch {
    // Best-effort session deletion
  }
}

export async function getAccount(
  env: Env,
  sessionCookie: string
): Promise<Record<string, unknown>> {
  const res = await appwriteRequest(env, {
    path: '/account',
    sessionCookie,
    useProjectHeader: true,
  });

  if (!res.ok) {
    throw new Error('Failed to get account info');
  }

  return res.json() as Promise<Record<string, unknown>>;
}

export async function listUsers(
  env: Env,
  queries: string[] = []
): Promise<{ users: unknown[]; total: number }> {
  const params = new URLSearchParams();
  queries.forEach((q) => params.append('queries[]', q));

  const res = await appwriteRequest(env, {
    path: `/users?${params.toString()}`,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error((err as { message?: string }).message || 'Failed to list users');
  }

  return res.json() as Promise<{ users: unknown[]; total: number }>;
}

// ─── Health check ───

export async function healthCheck(env: Env): Promise<boolean> {
  try {
    const res = await appwriteRequest(env, {
      path: '/health',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function checkDatabaseAccess(env: Env): Promise<{ ok: boolean; collectionCount?: number }> {
  try {
    const res = await appwriteRequest(env, {
      path: `/databases/${env.APPWRITE_DATABASE_ID}/collections`,
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({})) as { total?: number };
      return { ok: true, collectionCount: data.total || 0 };
    }

    return { ok: false };
  } catch {
    return { ok: false };
  }
}
