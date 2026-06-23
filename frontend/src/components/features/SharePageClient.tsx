'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/features/ErrorState';
import { ShareUnlockForm } from '@/components/features/ShareUnlockForm';
import { apiClient } from '@/lib/api-client';
import type { LinkStatus } from '@note-taking/backend/types';
import { Eye } from 'lucide-react';

interface ShareStatusResponse {
  status: LinkStatus;
  accessType: 'PUBLIC' | 'PASSWORD';
  requiresPassword: boolean;
}

interface NoteContent {
  title: string;
  content: string;
  viewCount: number;
}

interface SharePageClientProps {
  token: string;
}

function NoteView({ note }: { note: NoteContent }) {
  return (
    <Card className="mx-auto w-full max-w-2xl border-white/20 bg-white/80 shadow-xl backdrop-blur">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-2xl">{note.title}</CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            {note.viewCount} {note.viewCount === 1 ? 'view' : 'views'}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap leading-relaxed">{note.content}</p>
      </CardContent>
    </Card>
  );
}

export function SharePageClient({ token }: SharePageClientProps) {
  const [status, setStatus] = useState<ShareStatusResponse | null>(null);
  const [note, setNote] = useState<NoteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const statusData = await apiClient<ShareStatusResponse>(`/api/share/${token}`);
        setStatus(statusData);

        if (statusData.status === 'ACTIVE' && !statusData.requiresPassword) {
          const noteData = await apiClient<NoteContent>(`/api/share/${token}/unlock`, {
            method: 'POST',
            body: JSON.stringify({}),
          });
          setNote(noteData);
        }
      } catch {
        setError('Failed to load share link');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-2xl animate-pulse space-y-4">
        <div className="h-8 w-1/2 rounded bg-muted" />
        <div className="h-40 rounded bg-muted" />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-muted-foreground">{error}</p>;
  }

  if (!status) {
    return <ErrorState status="INVALID" />;
  }

  if (status.status !== 'ACTIVE') {
    return <ErrorState status={status.status} />;
  }

  if (note) {
    return <NoteView note={note} />;
  }

  if (status.requiresPassword) {
    return <ShareUnlockForm token={token} onSuccess={setNote} />;
  }

  return null;
}
