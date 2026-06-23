'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Eye, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppNav } from '@/components/features/AppNav';
import { StatusBadge } from '@/components/features/StatusBadge';
import { apiClient } from '@/lib/api-client';
import type { LinkStatus } from '@note-taking/backend/types';

interface NoteListItem {
  id: string;
  title: string;
  contentPreview: string;
  createdAt: string;
  shareLink: {
    url: string;
    accessType: string;
    shareType: string;
    expiresAt: string;
    viewCount: number;
    status: LinkStatus;
  } | null;
}

interface NotesListResponse {
  notes: NoteListItem[];
}

export function NotesListClient() {
  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiClient<NotesListResponse>('/api/notes');
        setNotes(data.notes);
      } catch {
        toast.error('Failed to load notes');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="relative mx-auto max-w-3xl pt-8">
      <AppNav />

      <div className="mb-6">
        <h2 className="text-2xl font-semibold">My Notes</h2>
        <p className="text-sm text-muted-foreground">All notes you have created and shared.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <Card className="border-dashed border-white/30 bg-white/70 backdrop-blur">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">No notes yet</p>
              <p className="text-sm text-muted-foreground">Create your first secure share link.</p>
            </div>
            <Link href="/notes/new" className="text-sm font-medium text-indigo-600 hover:underline">
              Create a note →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`}>
              <Card className="border-white/20 bg-white/80 shadow-md backdrop-blur transition hover:border-indigo-200 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    {note.shareLink && <StatusBadge status={note.shareLink.status} />}
                  </div>
                  <CardDescription>{new Date(note.createdAt).toLocaleString()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="line-clamp-2 text-sm text-muted-foreground">{note.contentPreview}</p>
                  {note.shareLink && (
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {note.shareLink.viewCount} views
                      </span>
                      <span>{note.shareLink.shareType.replace('_', ' ')}</span>
                      <span>{note.shareLink.accessType}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
