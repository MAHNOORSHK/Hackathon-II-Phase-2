import { apiCall, apiPost } from './api';
import { logSignup, logSignin, logSignout } from './auth-logger';

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  createdAt: Date;
}

export interface Session {
  user: User;
  token?: string;
  expiresAt: Date;
}

const SESSION_STORAGE_KEY = 'auth_session';
const USERS_STORAGE_KEY = 'registered_users'; // For mock auth

// Mock user generation
function generateMockUser(email: string, name?: string): User {
  return {
    id: Math.random().toString(36).substr(2, 9),
    email,
    name: name || email.split('@')[0],
    createdAt: new Date(),
  };
}

// Get registered users from localStorage
function getRegisteredUsers(): Record<string, any> {
  if (typeof window === 'undefined') return {};
  const users = localStorage.getItem(USERS_STORAGE_KEY);
  return users ? JSON.parse(users) : {};
}

// Save registered users to localStorage
function saveRegisteredUsers(users: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export async function getSession(): Promise<Session | null> {
  try {
    if (typeof window === 'undefined') {
      return null;
    }

    // Get from sessionStorage (populated by signin/signup)
    const cachedSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
    console.log('[getSession] Looking for session in sessionStorage...', {
      found: !!cachedSession,
      key: SESSION_STORAGE_KEY
    });

    if (cachedSession) {
      try {
        const session = JSON.parse(cachedSession);
        // Check if session is still valid
        if (session.expiresAt && new Date(session.expiresAt) > new Date()) {
          console.log('[getSession] Valid session found:', { userId: session.user?.id, email: session.user?.email });
          return session;
        } else {
          console.log('[getSession] Session expired:', { expiresAt: session.expiresAt });
        }
      } catch (error) {
        console.error('Failed to parse cached session:', error);
      }
    }

    // No valid session found
    console.log('[getSession] No valid session found');
    return null;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user;
}

export async function logout(): Promise<void> {
  try {
    if (typeof window === 'undefined') {
      return;
    }

    // Get current session before clearing
    const session = await getSession();
    if (session?.user) {
      // Log signout event
      await logSignout(session.user.id, session.user.email).catch(() => {});
    }
  } catch (error) {
    console.error('Error during logout:', error);
  } finally {
    // Clear session storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      window.location.href = '/signin';
    }
  }
}

export async function signin(
  email: string,
  password: string
): Promise<{ success: boolean; data?: Session; error?: string }> {
  try {
    // Try backend first
    try {
      const response = await apiPost<Session>('/auth/signin', {
        email,
        password,
      }, { includeToken: false });

      if (response && response.user) {
        const session: Session = {
          user: response.user,
          token: response.token || 'token-' + Math.random().toString(36).substr(2, 9),
          expiresAt: response.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        console.log('[signin] Backend auth successful:', { userId: response.user.id, email });
        // Log signin event to backend
        await logSignin(response.user.id, email).catch(() => {});
        return { success: true, data: session };
      }
    } catch (err) {
      // Backend unavailable, use mock auth
      console.log('[signin] Backend unavailable, using mock auth:', err);
    }

    // Mock authentication
    const users = getRegisteredUsers();
    const user = users[email];

    if (user && user.password === password) {
      const mockUser = generateMockUser(email, user.name);
      const session: Session = {
        user: mockUser,
        token: 'mock-token-' + Math.random().toString(36).substr(2, 9),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      };
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      console.log('[signin] Mock auth successful, session stored:', { userId: mockUser.id, email });
      // Log signin event
      await logSignin(mockUser.id, email).catch(() => {});
      return { success: true, data: session };
    }

    console.log('[signin] Invalid credentials or user not found');
    return { success: false, error: 'Invalid email or password' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sign in failed';
    return { success: false, error: message };
  }
}

export async function signup(
  email: string,
  password: string,
  name?: string
): Promise<{ success: boolean; data?: Session; error?: string }> {
  try {
    // Validate input
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    // Try backend first
    try {
      const response = await apiPost<Session>('/auth/signup', {
        email,
        password,
        name,
      }, { includeToken: false });

      if (response && response.user) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(response));
        // Log signup event to backend
        await logSignup(response.user.id, email).catch(() => {});
        return { success: true, data: response };
      }
    } catch (err) {
      // Backend unavailable, use mock auth
      console.log('Backend unavailable, using mock auth for signup');
    }

    // Mock registration
    const users = getRegisteredUsers();

    if (users[email]) {
      return { success: false, error: 'Email already registered' };
    }

    // Register new user
    users[email] = { password, name: name || email.split('@')[0] };
    saveRegisteredUsers(users);

    // Create session
    const mockUser = generateMockUser(email, name);
    const session: Session = {
      user: mockUser,
      token: 'mock-token-' + Math.random().toString(36).substr(2, 9),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    console.log('[signup] Mock auth successful, session stored:', { userId: mockUser.id, email });
    // Log signup event
    await logSignup(mockUser.id, email).catch(() => {});
    return { success: true, data: session };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sign up failed';
    return { success: false, error: message };
  }
}

export async function updateUserProfile(
  updates: Partial<User>
): Promise<{ success: boolean; data?: User; error?: string }> {
  try {
    const response = await apiCall<User>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
      includeToken: true,
    });

    // Update cached session
    const session = await getSession();
    if (session) {
      session.user = { ...session.user, ...response };
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }

    return { success: true, data: response };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update failed';
    return { success: false, error: message };
  }
}
