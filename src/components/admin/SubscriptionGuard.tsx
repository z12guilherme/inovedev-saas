import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/ui/loading-screen';

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const location = useLocation();
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkSubscription() {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('stores')
                    .select('subscription_status')
                    .eq('user_id', user.id)
                    .single();

                if (!error && data) {
                    setStatus(data.subscription_status);
                }
            } catch (error) {
                console.error('Erro ao verificar assinatura:', error);
            } finally {
                setLoading(false);
            }
        }

        checkSubscription();
    }, [user]);

    if (loading) return <LoadingScreen />;

    // Se a assinatura estiver inativa, atrasada ou cancelada, barramos o acesso
    // (Redirecionando para a tela de cobrança)
    if (status === 'inactive' || status === 'overdue' || status === 'unpaid') {
        return <Navigate to="/admin/assinatura" replace state={{ from: location }} />;
    }

    // Se estiver tudo certo ('active', 'free', 'trial'), libera o acesso à página
    return <>{children}</>;
}