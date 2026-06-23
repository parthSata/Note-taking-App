import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'authed' | 'guest'>('loading');

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await apiClient('/api/notes');
        if (!cancelled) setStatus('authed');
      } catch {
        if (!cancelled) setStatus('guest');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (status === 'guest') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
