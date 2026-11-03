import { Hammer } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { EmptyState } from '@/components/common/EmptyState';
import { getRouteForPath } from '@/constants/navigation';

export function ModulePendingPage() {
  const { pathname } = useLocation();
  const route = getRouteForPath(pathname);

  return (
    <EmptyState
      icon={Hammer}
      title={`${route?.label ?? 'This area'} is coming soon`}
      description="This part of PeopleOS is part of the next build phase. Your navigation and access settings already apply here."
    />
  );
}
