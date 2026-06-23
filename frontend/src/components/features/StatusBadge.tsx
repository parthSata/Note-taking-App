import { Badge } from '@/components/ui/badge';
import type { LinkStatus } from '@note-taking/backend/types';
import { cn } from '@/lib/utils';

const statusConfig: Record<LinkStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' },
  EXPIRED: { label: 'Expired', className: 'bg-amber-500/15 text-amber-700 border-amber-500/30' },
  REVOKED: { label: 'Revoked', className: 'bg-rose-500/15 text-rose-700 border-rose-500/30' },
  USED: { label: 'Used', className: 'bg-slate-500/15 text-slate-700 border-slate-500/30' },
  INVALID: { label: 'Invalid', className: 'bg-rose-500/15 text-rose-700 border-rose-500/30' },
};

interface StatusBadgeProps {
  status: LinkStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
