import { Layers } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';

import { AuthBrandPanel } from '@/components/auth/AuthBrandPanel';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';

interface LocationState {
  from?: string;
}

export function LoginPage() {
  const { user } = useAuth();
  const location = useLocation();
  const redirectTo = (location.state as LocationState | null)?.from ?? '/dashboard';

  if (user) return <Navigate to={redirectTo} replace />;

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <AuthBrandPanel />
      <main className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Layers className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-base font-semibold tracking-tight text-foreground">PeopleOS</span>
          </div>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
