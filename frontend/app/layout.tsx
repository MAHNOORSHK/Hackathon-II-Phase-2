import type { Metadata } from 'next';
import { RootLayoutClient } from '@/components/RootLayoutClient';
import './globals.css';

export const metadata: Metadata = {
  title: 'Todo Pro - Manage Your Tasks',
  description: 'A premium todo application for managing your daily tasks and projects.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="indigo" style={{
      '--color-primary': '#6366f1',
      '--color-secondary': '#4f46e5',
      '--color-accent': '#818cf8',
    } as React.CSSProperties}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{__html: `
          (function() {
            try {
              const theme = localStorage.getItem('color_theme') || 'indigo';
              const themes = {
                indigo: { primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8' },
                teal: { primary: '#14b8a6', secondary: '#0d9488', accent: '#2dd4bf' },
                purple: { primary: '#a855f7', secondary: '#9333ea', accent: '#d8b4fe' },
                emerald: { primary: '#10b981', secondary: '#059669', accent: '#6ee7b7' },
                rose: { primary: '#f43f5e', secondary: '#e11d48', accent: '#fb7185' },
              };
              const colors = themes[theme] || themes.indigo;
              document.documentElement.style.setProperty('--color-primary', colors.primary);
              document.documentElement.style.setProperty('--color-secondary', colors.secondary);
              document.documentElement.style.setProperty('--color-accent', colors.accent);
              document.documentElement.setAttribute('data-theme', theme);
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
