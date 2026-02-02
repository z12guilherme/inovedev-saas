import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  
  // Parâmetros retornados pelo Mercado Pago
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  useEffect(() => {
    // Limpa o carrinho ao chegar nesta página com sucesso
    if (status === 'approved' || !status) { // !status para casos de Pix/Dinheiro manuais
      clearCart();
    }
  }, [status, clearCart]);

  return (
    <div className="container flex items-center justify-center min-h-[80vh] py-10">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Pedido Realizado!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Obrigado pela sua compra. {paymentId && `O número do seu pagamento é #${paymentId}.`}
            Você receberá atualizações sobre o status do seu pedido.
          </p>
          <Link to="/">
            <Button className="w-full mt-4">Voltar para a Loja</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}