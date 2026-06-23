import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyButton } from '@/components/features/CopyButton';
import { StatusBadge } from '@/components/features/StatusBadge';
import { LoadingButton } from '@/components/features/LoadingButton';
import { apiClient } from '@/lib/api-client';
import type { LinkStatus } from '@note-taking/backend/types';
import { Eye, Ban } from 'lucide-react';

interface NoteDetailData {
  note: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
  };
  shareLink: {
    url: string;
    accessType: string;
    shareType: string;
    expiresAt: string;
    viewCount: number;
    status: LinkStatus;
    lastViewedAt: string | null;
    usedAt: string | null;
    revokedAt: string | null;
  };
}

interface NoteDetailClientProps {
  noteId: string;
}

export function NoteDetailClient({ noteId }: NoteDetailClientProps) {
  const [data, setData] = useState<NoteDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);

  const fetchNote = useCallback(async () => {
    try {
      const result = await apiClient<NoteDetailData>(`/api/notes/${noteId}`);
      setData(result);
    } catch {
      toast.error('Failed to load note');
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const result = await apiClient<NoteDetailData>(`/api/notes/${noteId}`);
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) toast.error('Failed to load note');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [noteId]);

  const handleRevoke = async () => {
    if (!confirm('Are you sure you want to revoke this share link?')) return;

    setRevoking(true);
    try {
      await apiClient(`/api/notes/${noteId}/revoke`, { method: 'PATCH' });
      toast.success('Share link revoked');
      await fetchNote();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to revoke';
      toast.error(message);
    } finally {
      setRevoking(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-2xl animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded bg-muted" />
        <div className="h-48 rounded bg-muted" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-center text-muted-foreground">Note not found.</p>;
  }

  const { note, shareLink } = data;
  const canRevoke = shareLink.status === 'ACTIVE';

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{note.title}</h1>
          <p className="text-sm text-muted-foreground">
            Created {new Date(note.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={shareLink.status} />
        </div>
      </div>

      <Card className="border-white/20 bg-white/80 shadow-lg backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg">Note content</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{note.content}</p>
        </CardContent>
      </Card>

      <Card className="border-white/20 bg-white/80 shadow-lg backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg">Share link</CardTitle>
          <CardDescription>Manage access and monitor views for this note.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border bg-white p-3">
            <code className="flex-1 truncate text-sm">{shareLink.url}</code>
            <CopyButton value={shareLink.url} label="Link copied!" />
          </div>

          {shareLink.accessType === 'PASSWORD' && (
            <p className="text-sm text-amber-700">
              Access key was shown once at creation. It cannot be retrieved again.
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">View count</p>
                <p className="font-semibold">{shareLink.viewCount}</p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Share type</p>
              <p className="font-medium">{shareLink.shareType.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Access</p>
              <p className="font-medium">{shareLink.accessType}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Expires</p>
              <p className="font-medium">{new Date(shareLink.expiresAt).toLocaleString()}</p>
            </div>
            {shareLink.lastViewedAt && (
              <div className="col-span-2">
                <p className="text-muted-foreground">Last viewed</p>
                <p className="font-medium">{new Date(shareLink.lastViewedAt).toLocaleString()}</p>
              </div>
            )}
          </div>

          {canRevoke && (
            <LoadingButton
              variant="destructive"
              className="gap-2"
              loading={revoking}
              loadingText="Revoking..."
              onClick={handleRevoke}
            >
              <Ban className="h-4 w-4" />
              Revoke share link
            </LoadingButton>
          )}
        </CardContent>
      </Card>

      <Link to="/notes" className="inline-flex text-sm font-medium text-indigo-600 hover:underline">
        ← Back to my notes
      </Link>
    </div>
  );
}
