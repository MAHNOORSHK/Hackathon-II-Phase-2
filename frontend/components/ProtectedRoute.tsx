'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth-client';
import { LoadingSpinner } from './LoadingSpinner';
import { APP_ROUTES } from '@/lib/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const authed = await isAuthenticated();
        if (!authed) {
          router.push(APP_ROUTES.signin);
          return;
        }
        setIsAuthed(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push(APP_ROUTES.signin);
      }
    }

    checkAuth();
  }, [router]);

  if (isAuthed === null) {
    return fallback || <LoadingSpinner text="Loading..." />;
  }

  if (!isAuthed) {
    return null;
  }

  return <>{children}</>;
}
