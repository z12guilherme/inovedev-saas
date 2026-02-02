import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useStore } from '@/contexts/StoreContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2, ShoppingBag, MapPin, User, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CustomerInfo } from '@/types';
import { Textarea } from '@/components/ui/textarea';

export default function CheckoutPage() {
  const { items, total, checkout, isCheckingOut } = useCart();
  const { config } = useStore();
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'pix' | 'cash'>('mercadopago');
  
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    neighborhood: '',
    city: '',
    complement: '',
    reference: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async () => {
    if (!customer.name || !customer.phone || !customer.address || !customer.city || !customer.neighborhood) {
      toast.error('Por favor, preencha todos os campos obrigatórios de entrega.');
      return;
    }

    const url = await checkout(paymentMethod, customer);
    if (url && typeof url === 'string') {
        window.location.href = url;
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h2>
        <p className="text-muted-foreground mb-8">Adicione produtos para continuar.</p>
        <Link to="/">
          <Button>Voltar para a loja</Button>
        </Link>
      </div>
    );
  }

  const deliveryFee = config?.deliveryFee || 0;
  const finalTotal = total + deliveryFee;

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-6">
        <Link to="/carrinho" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Voltar para o carrinho
        </Link>
        <h1 className="text-3xl font-bold mt-2">Finalizar Pedido</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input id="name" name="name" value={customer.name} onChange={handleInputChange} placeholder="Seu nome" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                  <Input id="phone" name="phone" value={customer.phone} onChange={handleInputChange} placeholder="(00) 00000-0000" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-primary" />
                Endereço de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Rua e Número *</Label>
                <Input id="address" name="address" value={customer.address} onChange={handleInputChange} placeholder="Av. Principal, 100" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Input id="neighborhood" name="neighborhood" value={customer.neighborhood} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input id="city" name="city" value={customer.city} onChange={handleInputChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input id="complement" name="complement" value={customer.complement} onChange={handleInputChange} placeholder="Apto 101, Bloco B" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Ponto de Referência</Label>
                <Textarea id="reference" name="reference" value={customer.reference} onChange={handleInputChange} placeholder="Próximo ao mercado..." className="resize-none h-20" />
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-primary" />
                Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)} className="space-y-3">
                {config?.acceptCard && (
                  <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-accent transition-colors">
                    <RadioGroupItem value="mercadopago" id="mercadopago" />
                    <Label htmlFor="mercadopago" className="flex-1 cursor-pointer font-medium">
                      Pagar Online (Mercado Pago)
                      <span className="block text-xs text-muted-foreground font-normal mt-1">Cartão de crédito, Pix ou Boleto</span>
                    </Label>
                  </div>
                )}
                
                {config?.acceptPix && (
                  <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-accent transition-colors">
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix" className="flex-1 cursor-pointer font-medium">
                      Pix (Chave da Loja)
                      <span className="block text-xs text-muted-foreground font-normal mt-1">Envie o comprovante no WhatsApp</span>
                    </Label>
                  </div>
                )}

                {config?.acceptCash && (
                  <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-accent transition-colors">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer font-medium">
                      Dinheiro / Cartão na Entrega
                      <span className="block text-xs text-muted-foreground font-normal mt-1">Pague ao receber o produto</span>
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.quantity}x {item.product.name}
                    </span>
                    <span>R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entrega</span>
                  <span>R$ {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">R$ {finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full h-12 text-lg" 
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Confirmar Pedido'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}