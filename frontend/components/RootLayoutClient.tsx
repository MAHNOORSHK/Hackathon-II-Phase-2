'use client';

import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { Header } from './Header';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </ThemeProvider>
  );
}
