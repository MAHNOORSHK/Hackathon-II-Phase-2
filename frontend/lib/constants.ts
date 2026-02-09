export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Todo Pro';
export const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET || 'dev-secret-change-in-production';

export const COLORS = {
  primary: {
    50: '#f0f4ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#0c2c2a',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
};

export const API_ENDPOINTS = {
  auth: {
    signup: '/auth/signup',
    signin: '/auth/signin',
    signout: '/auth/signout',
    session: '/auth/session',
  },
  todos: {
    list: '/todos',
    create: '/todos',
    update: (id: string) => `/todos/${id}`,
    delete: (id: string) => `/todos/${id}`,
  },
};

export const APP_ROUTES = {
  home: '/',
  signin: '/signin',
  signup: '/signup',
  todos: '/todos',
  dashboard: '/dashboard',
};

export const SESSION_STORAGE_KEY = 'auth_session';
export const TOKEN_STORAGE_KEY = 'auth_token';
export const THEME_STORAGE_KEY = 'theme';

export const DEFAULT_THEME = 'indigo';
export const THEMES = ['indigo', 'teal', 'purple', 'emerald', 'rose'] as const;
export const COLOR_THEME_STORAGE_KEY = 'color_theme';

export const COLOR_THEMES = {
  indigo: {
    name: 'Indigo',
    primary: '6366f1',
    primaryLight: 'e0e7ff',
    primaryDark: '4f46e5',
    accent: '818cf8',
  },
  teal: {
    name: 'Teal',
    primary: '14b8a6',
    primaryLight: 'ccfbf1',
    primaryDark: '0d9488',
    accent: '2dd4bf',
  },
  purple: {
    name: 'Purple',
    primary: 'a855f7',
    primaryLight: 'f3e8ff',
    primaryDark: '9333ea',
    accent: 'd8b4fe',
  },
  emerald: {
    name: 'Emerald',
    primary: '10b981',
    primaryLight: 'd1fae5',
    primaryDark: '059669',
    accent: '6ee7b7',
  },
  rose: {
    name: 'Rose',
    primary: 'f43f5e',
    primaryLight: 'ffe4e6',
    primaryDark: 'e11d48',
    accent: 'fb7185',
  },
} as const;

export const ERROR_MESSAGES = {
  unauthorized: 'You are not authorized to perform this action.',
  unauthenticated: 'Please sign in to continue.',
  notFound: 'The requested resource was not found.',
  serverError: 'An error occurred. Please try again later.',
  networkError: 'Network error. Please check your connection.',
  validationError: 'Please check your input and try again.',
};

export const SUCCESS_MESSAGES = {
  signedIn: 'You have been signed in successfully.',
  signedOut: 'You have been signed out successfully.',
  signedUp: 'Your account has been created successfully.',
  created: 'Item created successfully.',
  updated: 'Item updated successfully.',
  deleted: 'Item deleted successfully.',
};
