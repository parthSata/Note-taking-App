import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';

interface GuestRouteProps {
  children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
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
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (status === 'authed') {
    return <Navigate to="/notes" replace />;
  }

  return children;
}
