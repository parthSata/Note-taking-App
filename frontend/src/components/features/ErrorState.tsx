import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { LinkStatus } from '@note-taking/backend/types';

const messages: Record<Exclude<LinkStatus, 'ACTIVE'>, { title: string; description: string }> = {
  INVALID: {
    title: 'Invalid link',
    description: 'This share link does not exist or is malformed.',
  },
  EXPIRED: {
    title: 'Link expired',
    description: 'This share link has passed its expiry date and is no longer accessible.',
  },
  REVOKED: {
    title: 'Link revoked',
    description: 'The note owner has revoked access to this share link.',
  },
  USED: {
    title: 'Link already used',
    description: 'This one-time share link has already been opened and cannot be used again.',
  },
};

interface ErrorStateProps {
  status: Exclude<LinkStatus, 'ACTIVE'>;
}

export function ErrorState({ status }: ErrorStateProps) {
  const message = messages[status];

  return (
    <Alert variant="destructive" className="max-w-lg mx-auto">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{message.title}</AlertTitle>
      <AlertDescription>{message.description}</AlertDescription>
    </Alert>
  );
}
