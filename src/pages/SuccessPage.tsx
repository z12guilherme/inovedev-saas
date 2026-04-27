import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  
  // Parâmetros retornados pelo Mercado Pago
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
  const mpStatus = searchParams.get('collection_status') || searchParams.get('status');

  const isApproved = mpStatus === 'approved' || mpStatus === 'successful';
  const isPending = mpStatus === 'pending' || mpStatus === 'in_process';
  const isRejected = mpStatus === 'rejected' || mpStatus === 'cancelled' || mpStatus === 'null';
  const isManual = !mpStatus; // Pagamento manual (Pix na entrega, Dinheiro, etc)

  useEffect(() => {
    // Limpa o carrinho se aprovado, pendente (gerou boleto/pix) ou manual
    if (isApproved || isPending || isManual) {
      clearCart();
    }
  }, [isApproved, isPending, isManual, clearCart]);

  return (
    <div className="container flex items-center justify-center min-h-[80vh] py-10">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {isRejected ? (
              <XCircle className="h-16 w-16 text-red-500" />
            ) : isPending ? (
              <Clock className="h-16 w-16 text-yellow-500" />
            ) : (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isRejected ? 'Pagamento Recusado' : 
             isPending ? 'Pagamento Pendente' : 
             'Pedido Realizado!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {isRejected ? (
              'Não foi possível aprovar o seu pagamento. Por favor, verifique o saldo ou tente usar outro método de pagamento.'
            ) : isPending ? (
              `Seu pedido foi registrado. Estamos aguardando a confirmação do pagamento. ${paymentId ? `(Ref: #${paymentId})` : ''}`
            ) : (
              `Obrigado pela sua compra! ${paymentId ? `Seu pagamento foi aprovado (Ref: #${paymentId}).` : ''} Você receberá atualizações em breve.`
            )}
          </p>

          {isRejected ? (
            <div className="flex flex-col gap-3 mt-6">
              <Link to="/checkout">
                <Button className="w-full">Tentar Novamente</Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full">Voltar para a Loja</Button>
              </Link>
            </div>
          ) : (
            <Link to="/" className="block mt-6">
              <Button className="w-full">Voltar para a Loja</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}