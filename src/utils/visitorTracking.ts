import { supabase } from '../supabaseClient';
import { isOwnerEmail } from './adminAccess';

const VISITOR_ID_KEY = 'pippal_visitor_id';
const SESSION_ID_KEY = 'pippal_session_id';

/** Stable anonymous ID — persists across browser sessions on this device. */
export function getOrCreateVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

export function getOrCreateSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2);
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

/** Record a visit for logged-in and anonymous users (owners excluded when identified). */
export function trackPageView(
  path: string,
  options?: { userId?: string; userEmail?: string | null },
): void {
  if (options?.userEmail && isOwnerEmail(options.userEmail)) return;

  supabase
    .from('page_views')
    .insert({
      path,
      visitor_id: getOrCreateVisitorId(),
      session_id: getOrCreateSessionId(),
      ...(options?.userId ? { user_id: options.userId } : {}),
    })
    .then(({ error }) => {
      if (error && import.meta.env.DEV) {
        console.warn('page_views insert failed:', error.message);
      }
    });
}
