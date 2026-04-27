import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, CreditCard, LogOut, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminBillingPage() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [store, setStore] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchStoreDetails() {
            if (!user) return;
            const { data } = await supabase
                .from('stores')
                .select('id, name, subscription_plan, subscription_price, subscription_status')
                .eq('user_id', user.id)
                .single();

            setStore(data);

            // Se a assinatura já estiver ativa, joga de volta pro painel
            if (data?.subscription_status === 'active') {
                navigate('/admin');
            }
        }
        fetchStoreDetails();
    }, [user, navigate]);

    const handleSignOut = async () => {
        await signOut();
        navigate('/admin/login');
    };

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('create-subscription', {
                body: {
                    storeId: store.id,
                    price: store.subscription_price || 49.90,
                    planName: store.subscription_plan || 'Pro',
                    email: user?.email
                }
            });
            if (error) throw error;
            if (data?.initPoint) {
                window.location.href = data.initPoint;
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro ao gerar link de pagamento.');
            setLoading(false);
        }
    };

    if (!store) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-4">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <ShieldAlert className="h-8 w-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Acesso Bloqueado</h1>
                    <p className="text-gray-500 mt-2">A assinatura da loja <strong>{store.name}</strong> encontra-se pendente ou inativa.</p>
                </div>

                <Card className="border-2 border-blue-100 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl text-blue-900">Regularizar Assinatura</CardTitle>
                        <CardDescription>Plano selecionado: <strong className="uppercase">{store.subscription_plan}</strong></CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center py-4 border-y border-gray-100">
                            <span className="text-gray-600">Valor da Mensalidade</span>
                            <span className="text-2xl font-bold text-gray-900">{formatCurrency(store.subscription_price || 49.90)}</span>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Acesso total ao painel liberado na hora</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Loja reativada para seus clientes</li>
                        </ul>
                    </CardContent>
                    <CardFooter className="flex-col gap-3">
                        <Button className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700" onClick={handleSubscribe} disabled={loading}>
                            {loading ? 'Gerando link...' : <><CreditCard className="mr-2 h-5 w-5" /> Pagar Mensalidade</>}
                        </Button>
                        <Button variant="ghost" className="w-full text-gray-500" onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" /> Sair da conta
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}