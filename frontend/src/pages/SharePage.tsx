import { useParams } from 'react-router-dom';
import { SharePageClient } from '@/components/features/SharePageClient';

export default function SharePage() {
  const { token } = useParams<{ token: string }>();

  if (!token) {
    return <p className="p-6 text-center text-muted-foreground">Invalid share link.</p>;
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center p-6">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl" />
      <div className="relative w-full">
        <SharePageClient token={token} />
      </div>
    </main>
  );
}
