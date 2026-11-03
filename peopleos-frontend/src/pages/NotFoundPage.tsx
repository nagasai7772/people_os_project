import { FileQuestion } from 'lucide-react';
import { Link } from 'react-router-dom';

import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <EmptyState
      icon={FileQuestion}
      title="We could not find that page"
      description="The link may be outdated, or the page may have moved. Head back to your dashboard to keep going."
      action={
        <Button asChild>
          <Link to="/dashboard">Go to dashboard</Link>
        </Button>
      }
    />
  );
}
