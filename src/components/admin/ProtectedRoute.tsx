import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { store, loading: storeLoading } = useAdmin();
  const location = useLocation();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!store) {
        setCheckingOnboarding(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('store_settings')
          .select('onboarding_completed')
          .eq('store_id', store.id)
          .single();

        setOnboardingCompleted(data?.onboarding_completed ?? false);
      } catch (error) {
        console.error('Error checking onboarding:', error);
        setOnboardingCompleted(true); // Assume completed on error
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, [store]);

  if (authLoading || storeLoading || checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!store) {
    return <Navigate to="/admin/criar-loja" replace />;
  }

  // Redirect to onboarding if not completed (except if already on onboarding page)
  if (onboardingCompleted === false && !location.pathname.includes('/onboarding')) {
    return <Navigate to="/admin/onboarding" replace />;
  }

  return <>{children}</>;
}
