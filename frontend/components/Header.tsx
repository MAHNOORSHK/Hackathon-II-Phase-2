'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, Palette } from 'lucide-react';
import { logout, getSession, type Session } from '@/lib/auth-client';
import { APP_NAME, APP_ROUTES, COLOR_THEMES } from '@/lib/constants';
import { setTheme, getTheme, type ColorTheme } from '@/lib/theme-context';

export function Header() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>('indigo');
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  useEffect(() => {
    async function loadSession() {
      try {
        const userSession = await getSession();
        setSession(userSession);
      } catch (error) {
        console.error('Failed to load session:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, []);

  useEffect(() => {
    const theme = getTheme();
    setCurrentTheme(theme);
  }, []);

  const handleThemeChange = (theme: ColorTheme) => {
    setTheme(theme);
    setCurrentTheme(theme);
    setShowThemeMenu(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href={session?.user ? '/dashboard' : '/home'}
            className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity"
            style={{ color: `var(--color-primary, #6366f1)` }}
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
            </svg>
            {APP_NAME}
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Theme Selector */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                aria-label="Choose color theme"
                title="Choose color theme"
              >
                <Palette className="w-5 h-5" />
              </button>

              {/* Theme Dropdown */}
              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  {(Object.keys(COLOR_THEMES) as ColorTheme[]).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => handleThemeChange(theme)}
                      className={`w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        currentTheme === theme ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full border-2 border-gray-300"
                        style={{
                          backgroundColor: 'var(--color-primary, #6366f1)',
                          borderColor: currentTheme === theme ? 'var(--color-primary, #6366f1)' : '#d1d5db',
                        }}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {COLOR_THEMES[theme].name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Info and Logout */}
            {!loading && session?.user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {session.user.name || session.user.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {session.user.email}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-gray-800">
                <Link
                  href={APP_ROUTES.signin}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
