import { NotesListClient } from '@/components/features/NotesListClient';

export default function NotesListPage() {
  return (
    <main className="relative min-h-screen p-6">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl" />
      <NotesListClient />
    </main>
  );
}
