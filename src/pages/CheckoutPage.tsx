import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, QrCode, Banknote, MessageCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { useStore } from '@/contexts/StoreContext';
import { formatCurrency, generateWhatsAppMessage } from '@/lib/utils';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { config } = useStore();
  const [paymentMethod, setPaymentMethod] = useState<string>('pix');
  const [orderSent, setOrderSent] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    neighborhood: '',
    city: '',
    complement: '',
    reference: ''
  });

  const grandTotal = total + config.deliveryFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const isFormValid = formData.name && formData.phone && formData.address && 
                      formData.neighborhood && formData.city;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const paymentLabel = paymentMethod === 'pix' ? 'Pix' : 
                        paymentMethod === 'card' ? 'Cartão de Crédito' : 'Dinheiro';

    const message = generateWhatsAppMessage(
      items,
      total,
      config.deliveryFee,
      formData,
      paymentLabel
    );

    const whatsappUrl = `https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    setOrderSent(true);
  };

  const handleFinish = () => {
    clearCart();
    navigate('/');
  };

  if (items.length === 0 && !orderSent) {
    navigate('/carrinho');
    return null;
  }

  if (orderSent) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-16 max-w-md mx-auto px-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Pedido Enviado!</h1>
            <p className="text-muted-foreground mb-6">
              Seu pedido foi enviado para o WhatsApp da loja. 
              Aguarde a confirmação do vendedor.
            </p>
            <Button onClick={handleFinish} size="lg">
              Voltar para a Loja
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Início</Link>
            <span className="mx-2">/</span>
            <Link to="/carrinho" className="hover:text-primary">Carrinho</Link>
            <span className="mx-2">/</span>
            <span>Checkout</span>
          </nav>

          <h1 className="text-3xl font-bold mb-8">Finalizar Pedido</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Customer Info */}
                <div className="border rounded-lg p-6 bg-card">
                  <h2 className="text-lg font-bold mb-4">Dados do Cliente</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Seu nome"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">WhatsApp *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(00) 00000-0000"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="border rounded-lg p-6 bg-card">
                  <h2 className="text-lg font-bold mb-4">Endereço de Entrega</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="address">Endereço *</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Rua, número"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Bairro *</Label>
                      <Input
                        id="neighborhood"
                        name="neighborhood"
                        value={formData.neighborhood}
                        onChange={handleInputChange}
                        placeholder="Seu bairro"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Sua cidade"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        name="complement"
                        value={formData.complement}
                        onChange={handleInputChange}
                        placeholder="Apto, bloco..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reference">Ponto de referência</Label>
                      <Input
                        id="reference"
                        name="reference"
                        value={formData.reference}
                        onChange={handleInputChange}
                        placeholder="Próximo a..."
                      />
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="border rounded-lg p-6 bg-card">
                  <h2 className="text-lg font-bold mb-4">Forma de Pagamento</h2>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-3">
                      {config.acceptPix && (
                        <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                          <RadioGroupItem value="pix" id="pix" />
                          <QrCode className="h-5 w-5 text-primary" />
                          <div className="flex-1">
                            <p className="font-medium">Pix</p>
                            <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                          </div>
                        </label>
                      )}
                      {config.acceptCard && (
                        <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                          <RadioGroupItem value="card" id="card" />
                          <CreditCard className="h-5 w-5 text-primary" />
                          <div className="flex-1">
                            <p className="font-medium">Cartão de Crédito</p>
                            <p className="text-sm text-muted-foreground">Pagamento na entrega</p>
                          </div>
                        </label>
                      )}
                      <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="cash" id="cash" />
                        <Banknote className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">Dinheiro</p>
                          <p className="text-sm text-muted-foreground">Pagamento na entrega</p>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 border rounded-lg p-6 bg-card">
                  <h2 className="text-lg font-bold mb-4">Resumo do Pedido</h2>

                  <div className="space-y-3 mb-4">
                    {items.map(item => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.quantity}x {item.product.name}
                        </span>
                        <span>{formatCurrency(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxa de entrega</span>
                      <span>{formatCurrency(config.deliveryFee)}</span>
                    </div>
                  </div>

                  <div className="border-t mt-3 pt-3 flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary">{formatCurrency(grandTotal)}</span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-6"
                    size="lg"
                    disabled={!isFormValid}
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Enviar Pedido via WhatsApp
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Ao clicar, você será redirecionado para o WhatsApp para confirmar o pedido.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
