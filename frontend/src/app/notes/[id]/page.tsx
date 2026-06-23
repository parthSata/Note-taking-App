import { AppNav } from '@/components/features/AppNav';
import { NoteDetailClient } from '@/components/features/NoteDetailClient';

interface NoteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const { id } = await params;

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
