import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';

export function useSignOut() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return useCallback(() => {
    logout();
    toast.success('You have been signed out.');
    navigate('/login', { replace: true });
  }, [logout, navigate]);
}
