import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    void (async () => {
      try {
        await apiClient('/api/notes');
        navigate('/notes', { replace: true });
      } catch {
        navigate('/login', { replace: true });
      }
    })();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
    </div>
  );
}
