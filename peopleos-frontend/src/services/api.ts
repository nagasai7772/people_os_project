import { clearSession, getStoredSession } from '@/services/authService';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success) {
    throw new ApiError(body?.message || `API request failed (${response.status})`, response.status);
  }
  return body.data as T;
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let session = getStoredSession();
  const makeRequest = (token?: string) => fetch(`${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  let response = await makeRequest(session?.accessToken);
  if (response.status === 401 && session?.refreshToken) {
    try {
      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });
      const refreshed = await parseResponse<{
        accessToken: string; refreshToken: string; user: { id: string };
      }>(refreshResponse);
      session = {
        userId: refreshed.user.id,
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
      };
      const rememberMe = localStorage.getItem('peopleos.session') !== null;
      (rememberMe ? localStorage : sessionStorage).setItem('peopleos.session', JSON.stringify(session));
      response = await makeRequest(session.accessToken);
    } catch {
      clearSession();
      throw new ApiError('Your session has expired. Please sign in again.', 401);
    }
  }
  if (response.status === 401) clearSession();
  return parseResponse<T>(response);
}
