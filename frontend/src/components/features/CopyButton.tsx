'use client';

import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  variant?: ComponentProps<typeof Button>['variant'];
}

export function CopyButton({ value, label = 'Copied!', className, variant = 'outline' }: CopyButtonProps) {
  const { copy, copied } = useCopyToClipboard();

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      className={cn('gap-2', className)}
      onClick={() => copy(value, label)}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Copied' : 'Copy'}
    </Button>
  );
}
