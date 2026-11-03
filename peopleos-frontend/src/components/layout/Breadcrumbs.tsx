import { ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { getRouteForPath } from '@/constants/navigation';
import { cn } from '@/lib/utils';

export function Breadcrumbs({ className }: { className?: string }) {
  const { pathname } = useLocation();
  const route = getRouteForPath(pathname);
  const current = route?.label ?? 'Page not found';
  const isDashboard = route?.path === '/dashboard';

  return (
    <nav aria-label="Breadcrumb" className={cn('flex min-w-0 items-center gap-2 text-sm', className)}>
      {isDashboard ? (
        <span className="truncate font-medium text-foreground">Dashboard</span>
      ) : (
        <>
          <Link
            to="/dashboard"
            className="truncate text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="truncate font-medium text-foreground" aria-current="page">
            {current}
          </span>
        </>
      )}
    </nav>
  );
}
