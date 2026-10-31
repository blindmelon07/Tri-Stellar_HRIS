/**
 * Thin client for the TriStellar HRIS API (`/api/v1`).
 *
 * Set EXPO_PUBLIC_API_URL in mobile/.env to the Laravel server address, e.g.
 * http://192.168.1.20:8000 for a phone on the office Wi-Fi.
 */

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors: Record<string, string[]> = {},
  ) {
    super(message);
  }

  /** First validation message for a field, if any. */
  field(name: string): string | undefined {
    return this.errors[name]?.[0];
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string | null;
  query?: Record<string, string | number | undefined>;
};

let unauthorizedHandler: (() => void) | null = null;

/** Called when the server rejects the stored token, so the app can sign out. */
export function onUnauthorized(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export async function api<T>(path: string, { method = 'GET', body, token, query }: RequestOptions = {}): Promise<T> {
  const search = query
    ? '?' +
      Object.entries(query)
        .filter(([, value]) => value !== undefined && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&')
    : '';

  let response: Response;

  try {
    response = await fetch(`${API_URL}/api/v1/${path}${search}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the HRIS server. Check your internet connection.', 0);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && token) {
      unauthorizedHandler?.();
    }

    throw new ApiError(
      payload.message ?? `Request failed (${response.status}).`,
      response.status,
      payload.errors ?? {},
    );
  }

  return payload as T;
}
