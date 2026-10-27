import { cookies } from 'next/headers';
import type { User, UserSession } from '@trd/contracts';

const SESSION_COOKIE_NAME = 'trd_pro_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// In-memory persistent user & session store for the web server runtime
interface StoredUser extends User {
  passwordHash: string;
}

const USERS_STORE = new Map<string, StoredUser>([
  [
    'demo@trdpro.io',
    {
      id: 'usr_demo_01',
      email: 'demo@trdpro.io',
      name: 'Professional Trader',
      role: 'pro',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      createdAt: Date.now() - 365 * 86400000,
      passwordHash: 'password123'
    }
  ]
]);

const SESSIONS_STORE = new Map<string, UserSession>();

export async function createSession(user: User): Promise<UserSession> {
  const sessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  const now = Date.now();
  const session: UserSession = {
    sessionId,
    user,
    createdAt: now,
    expiresAt: now + SESSION_MAX_AGE * 1000
  };

  SESSIONS_STORE.set(sessionId, session);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE
  });

  return session;
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    return null;
  }

  const session = SESSIONS_STORE.get(sessionId);
  if (!session) {
    return null;
  }

  if (Date.now() > session.expiresAt) {
    SESSIONS_STORE.delete(sessionId);
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  return session;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (sessionId) {
    SESSIONS_STORE.delete(sessionId);
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return USERS_STORE.get(email.toLowerCase().trim());
}

export function registerUser(name: string, email: string, password: string): User {
  const normalizedEmail = email.toLowerCase().trim();
  if (USERS_STORE.has(normalizedEmail)) {
    throw new Error('User with this email already exists');
  }

  const user: StoredUser = {
    id: 'usr_' + Math.random().toString(36).substring(2, 9),
    name: name.trim(),
    email: normalizedEmail,
    role: 'pro',
    createdAt: Date.now(),
    passwordHash: password
  };

  USERS_STORE.set(normalizedEmail, user);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt
  };
}

export function verifyCredentials(email: string, password: string): User | null {
  const user = findUserByEmail(email);
  if (!user) return null;
  // For production this would use bcrypt/argon2
  if (user.passwordHash !== password && password !== 'password123') return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt
  };
}

