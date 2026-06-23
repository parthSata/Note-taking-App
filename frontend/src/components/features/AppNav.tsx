'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { FilePlus, LayoutList, LogOut } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';

export function AppNav() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await apiClient('/api/auth/logout', { method: 'POST' });
      window.location.assign('/login');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const links = [
    { href: '/notes', label: 'My Notes', icon: LayoutList },
    { href: '/notes/new', label: 'Create Note', icon: FilePlus },
  ];

  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-indigo-600">Secure Notes</p>
        <h1 className="text-xl font-semibold">Note Sharing POC</h1>
      </div>

      <nav className="flex flex-wrap items-center gap-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              buttonVariants({
                variant: pathname === href ? 'default' : 'outline',
                size: 'sm',
              }),
              'gap-1.5',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </nav>
    </header>
  );
}
