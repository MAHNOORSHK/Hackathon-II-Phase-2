'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { THEME_STORAGE_KEY, DEFAULT_THEME, THEMES } from '@/lib/constants';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME as Theme);
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    // Apply theme immediately from localStorage/system preference
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

    const initialTheme = storedTheme || systemTheme;
    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);
  }, []);

  // Fallback: ensure theme is applied to html element
  useEffect(() => {
    const html = document.documentElement;
    const hasTheme = html.classList.contains('dark');

    // If theme doesn't match state, apply it
    if ((theme === 'dark' && !hasTheme) || (theme === 'light' && hasTheme)) {
      applyTheme(theme);
    }
  }, [theme]);

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement;
    if (newTheme === 'dark') {
      html.classList.add('dark');
      html.style.colorScheme = 'dark';
    } else {
      html.classList.remove('dark');
      html.style.colorScheme = 'light';
    }
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    if (!THEMES.includes(newTheme)) {
      console.warn(`Invalid theme: ${newTheme}`);
      return;
    }
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
