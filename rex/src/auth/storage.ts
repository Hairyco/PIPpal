import type { AuthSession, AuthUser } from './types';

const SESSION_KEY = 'ctogo-auth-session';
const USERS_KEY = 'ctogo-auth-users';

type StoredUser = AuthUser & { passwordHash: string };

function hashPassword(password: string): string {
  // Preview-only client hash — not a substitute for a real auth backend.
  let h = 2166136261;
  const raw = `ctogo:${password}`;
  for (let i = 0; i < raw.length; i += 1) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toPublicUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    provider: user.provider,
    createdAt: user.createdAt,
  };
}

export function readSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.user?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeSession(session: AuthSession | null) {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function registerWithEmail(input: {
  email: string;
  password: string;
  name?: string;
}): AuthSession {
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  if (!email.includes('@') || password.length < 6) {
    throw new Error('Use a valid email and a password of at least 6 characters.');
  }
  const users = readUsers();
  if (users.some((u) => u.email === email && u.provider === 'email')) {
    throw new Error('An account with this email already exists. Sign in instead.');
  }
  const user: StoredUser = {
    id: `email_${crypto.randomUUID?.() ?? Date.now().toString(36)}`,
    email,
    name: input.name?.trim() || email.split('@')[0] || 'CTOgo user',
    provider: 'email',
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword(password),
  };
  writeUsers([...users, user]);
  return {
    user: toPublicUser(user),
    signedInAt: new Date().toISOString(),
  };
}

export function signInWithEmail(input: { email: string; password: string }): AuthSession {
  const email = input.email.trim().toLowerCase();
  const users = readUsers();
  const match = users.find((u) => u.email === email && u.provider === 'email');
  if (!match || match.passwordHash !== hashPassword(input.password)) {
    throw new Error('Incorrect email or password.');
  }
  return {
    user: toPublicUser(match),
    signedInAt: new Date().toISOString(),
  };
}

/** Google OAuth (GIS) needs a free Google Cloud OAuth client ID. Without it we use a preview session. */
export function signInWithGooglePreview(emailHint?: string): AuthSession {
  const email =
    emailHint?.trim().toLowerCase() ||
    `founder.${Date.now().toString(36)}@gmail.com`;
  const users = readUsers();
  let user = users.find((u) => u.email === email && u.provider === 'google');
  if (!user) {
    user = {
      id: `google_${crypto.randomUUID?.() ?? Date.now().toString(36)}`,
      email,
      name: email.split('@')[0] || 'Google user',
      provider: 'google',
      createdAt: new Date().toISOString(),
      passwordHash: '',
    };
    writeUsers([...users, user]);
  }
  return {
    user: toPublicUser(user),
    signedInAt: new Date().toISOString(),
  };
}
