import { useParams } from 'react-router-dom';
import { AppNav } from '@/components/features/AppNav';
import { NoteDetailClient } from '@/components/features/NoteDetailClient';

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <p className="p-6 text-center text-muted-foreground">Invalid note ID.</p>;
  }

  return (
    <main className="relative min-h-screen p-6">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="relative mx-auto max-w-2xl pt-8">
        <AppNav />
        <NoteDetailClient noteId={id} />
      </div>
    </main>
  );
}
