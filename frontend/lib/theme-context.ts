/**
 * Color theme management utilities
 * Handles theme persistence and CSS variable application
 */

export type ColorTheme = 'indigo' | 'teal' | 'purple' | 'emerald' | 'rose';

const THEME_STORAGE_KEY = 'color_theme';
const DEFAULT_THEME: ColorTheme = 'indigo';

const THEME_COLORS: Record<ColorTheme, { primary: string; secondary: string; accent: string }> = {
  indigo: {
    primary: '#6366f1',
    secondary: '#4f46e5',
    accent: '#818cf8',
  },
  teal: {
    primary: '#14b8a6',
    secondary: '#0d9488',
    accent: '#2dd4bf',
  },
  purple: {
    primary: '#a855f7',
    secondary: '#9333ea',
    accent: '#d8b4fe',
  },
  emerald: {
    primary: '#10b981',
    secondary: '#059669',
    accent: '#6ee7b7',
  },
  rose: {
    primary: '#f43f5e',
    secondary: '#e11d48',
    accent: '#fb7185',
  },
};

export function getTheme(): ColorTheme {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return (stored as ColorTheme) || DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function setTheme(theme: ColorTheme): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);
  } catch (err) {
    console.error('Failed to set theme:', err);
  }
}

export function applyTheme(theme: ColorTheme): void {
  if (typeof document === 'undefined') return;
  const colors = THEME_COLORS[theme];
  const root = document.documentElement;

  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-accent', colors.accent);
  root.setAttribute('data-theme', theme);
}

export function initializeTheme(): void {
  const theme = getTheme();
  applyTheme(theme);
}
