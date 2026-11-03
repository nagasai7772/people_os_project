import type { AuthUser, UserRole } from '@/types/auth';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const SESSION_KEY = 'peopleos.session';

export interface StoredSession {
  userId: string;
  accessToken: string;
  refreshToken: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeId?: string | null;
  employee_id?: string | null;
  designation_name?: string | null;
}

interface AuthPayload {
  user: BackendUser;
  accessToken: string;
  refreshToken: string;
}

export class AuthError extends Error {}

function normalizeUser(user: BackendUser): AuthUser {
  const role = user.role.toLowerCase() as UserRole;
  if (!['admin', 'manager', 'employee'].includes(role)) {
    throw new AuthError(`Unsupported account role: ${user.role}`);
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role,
    jobTitle: user.designation_name ?? '',
  };
}

export function getStoredSession(): StoredSession | null {
  const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredSession>;
    if (
      typeof parsed.userId === 'string' &&
      typeof parsed.accessToken === 'string' &&
      typeof parsed.refreshToken === 'string'
    ) return parsed as StoredSession;
    return null;
  } catch {
    return null;
  }
}

export function persistSession(session: StoredSession, rememberMe: boolean) {
  clearSession();
  (rememberMe ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

async function readJson<T>(response: Response): Promise<ApiEnvelope<T>> {
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success) {
    throw new AuthError(body?.message || `Request failed (${response.status})`);
  }
  return body as ApiEnvelope<T>;
}

export async function signIn(email: string, password: string, rememberMe: boolean): Promise<AuthUser> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });
  } catch {
    throw new AuthError('Cannot connect to the PeopleOS API. Check that the backend is running.');
  }

  const result = await readJson<AuthPayload>(response);
  const { user, accessToken, refreshToken } = result.data;
  if (!user?.id || !accessToken || !refreshToken) {
    throw new AuthError('The API returned an incomplete login response.');
  }
  persistSession({ userId: user.id, accessToken, refreshToken }, rememberMe);
  return normalizeUser(user);
}

export async function getCurrentUser(): Promise<AuthUser> {
  const session = getStoredSession();
  if (!session) throw new AuthError('Your session has expired. Please sign in again.');

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  if (response.status === 401) {
    const refreshed = await refreshStoredSession(session);
    const retry = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${refreshed.accessToken}` },
    });
    const result = await readJson<BackendUser>(retry);
    return normalizeUser(result.data);
  }

  const result = await readJson<BackendUser>(response);
  return normalizeUser(result.data);
}

async function refreshStoredSession(session: StoredSession): Promise<StoredSession> {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  });
  const result = await readJson<AuthPayload>(response);
  const next = {
    userId: result.data.user.id,
    accessToken: result.data.accessToken,
    refreshToken: result.data.refreshToken,
  };
  // Preserve the storage choice made at login.
  const rememberMe = localStorage.getItem(SESSION_KEY) !== null;
  persistSession(next, rememberMe);
  return next;
}

export async function sendPasswordReset(email: string): Promise<void> {
  if (!email.trim()) throw new AuthError('Enter the email address for your account.');
  throw new AuthError('Password reset is not configured yet. Please contact your administrator.');
}
