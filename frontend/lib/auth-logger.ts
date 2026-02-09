import { apiPost } from './api';

export interface AuthLogEvent {
  user_id: string;
  email: string;
  action: 'signup' | 'signin' | 'signout';
}

/**
 * Log authentication events to the backend
 */
export async function logAuthEvent(event: AuthLogEvent): Promise<void> {
  try {
    const response = await apiPost('/api/auth/log', {
      user_id: event.user_id,
      email: event.email,
      action: event.action,
    }, { includeToken: false }); // Don't require token for auth logging

    console.log(`Auth event logged: ${event.action} for ${event.email}`);
  } catch (error) {
    console.warn('Failed to log auth event:', error);
    // Don't throw - auth logging failure shouldn't break the flow
  }
}

/**
 * Log signup event
 */
export async function logSignup(user_id: string, email: string): Promise<void> {
  await logAuthEvent({ user_id, email, action: 'signup' });
}

/**
 * Log signin event
 */
export async function logSignin(user_id: string, email: string): Promise<void> {
  await logAuthEvent({ user_id, email, action: 'signin' });
}

/**
 * Log signout event
 */
export async function logSignout(user_id: string, email: string): Promise<void> {
  await logAuthEvent({ user_id, email, action: 'signout' });
}

/**
 * Get auth logs for a user
 */
export async function getUserAuthLogs(user_id: string): Promise<any[]> {
  try {
    const logs = await apiPost(`/api/auth/logs/${user_id}`, {}, { includeToken: false });
    return Array.isArray(logs) ? logs : [];
  } catch (error) {
    console.warn('Failed to retrieve auth logs:', error);
    return [];
  }
}

/**
 * Get all auth logs (admin)
 */
export async function getAllAuthLogs(): Promise<any[]> {
  try {
    const logs = await apiPost('/api/auth/logs/all', {}, { includeToken: false });
    return Array.isArray(logs) ? logs : [];
  } catch (error) {
    console.warn('Failed to retrieve all auth logs:', error);
    return [];
  }
}
