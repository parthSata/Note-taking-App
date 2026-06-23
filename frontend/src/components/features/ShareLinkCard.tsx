import { Link } from 'react-router-dom';
import { CopyButton } from '@/components/features/CopyButton';
import { StatusBadge } from '@/components/features/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { KeyRound } from 'lucide-react';
import type { ShareLinkMeta } from '@note-taking/backend/types';

interface ShareLinkCardProps {
  shareLink: ShareLinkMeta;
  noteId: string;
}

export function ShareLinkCard({ shareLink, noteId }: ShareLinkCardProps) {
  return (
    <Card className="border-emerald-500/20 bg-emerald-50/50 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg text-emerald-800">Share link created</CardTitle>
          <StatusBadge status={shareLink.status} />
        </div>
        <CardDescription>Save these details — the access key is shown only once.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Share URL</p>
          <div className="flex items-center gap-2 rounded-lg border bg-white p-3">
            <code className="flex-1 truncate text-sm">{shareLink.url}</code>
            <CopyButton value={shareLink.url} label="Link copied!" />
          </div>
        </div>

        {shareLink.accessKey && (
          <Alert className="border-amber-500/30 bg-amber-50">
            <KeyRound className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Access key (shown once)</AlertTitle>
            <AlertDescription className="mt-2">
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-white px-2 py-1 font-mono text-sm">
                  {shareLink.accessKey}
                </code>
                <CopyButton value={shareLink.accessKey} label="Key copied!" />
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
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
          <div>
            <p className="text-muted-foreground">Views</p>
            <p className="font-medium">{shareLink.viewCount}</p>
          </div>
        </div>

        <Link
          to={`/notes/${noteId}`}
          className="inline-flex text-sm font-medium text-indigo-600 hover:underline"
        >
          View note details →
        </Link>
      </CardContent>
    </Card>
  );
}
