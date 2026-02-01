import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { useStore } from '@/contexts/StoreContext';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const { config } = useStore();

  const canCheckout = total >= config.minOrderValue;
  const grandTotal = total + (canCheckout ? config.deliveryFee : 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h1>
            <p className="text-muted-foreground mb-6">
              Adicione produtos para continuar comprando
            </p>
            <Button asChild>
              <Link to="/produtos">
                Ver Produtos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
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
            <span>Carrinho</span>
          </nav>

          <h1 className="text-3xl font-bold mb-8">Meu Carrinho</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div
                  key={item.product.id}
                  className="flex gap-4 p-4 border rounded-lg bg-card"
                >
                  <Link to={`/produto/${item.product.id}`} className="flex-shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/produto/${item.product.id}`}
                      className="font-medium hover:text-primary transition-colors line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    
                    <div className="mt-1 text-lg font-bold text-primary">
                      {formatCurrency(item.product.price)}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.product.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="hidden sm:block text-right">
                    <span className="font-bold">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 border rounded-lg p-6 bg-card">
                <h2 className="text-lg font-bold mb-4">Resumo do Pedido</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatCurrency(total)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxa de entrega</span>
                    <span className="font-medium">
                      {canCheckout ? formatCurrency(config.deliveryFee) : '-'}
                    </span>
                  </div>

                  <div className="border-t pt-3 flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                {!canCheckout && (
                  <p className="mt-4 text-sm text-destructive">
                    Pedido mínimo: {formatCurrency(config.minOrderValue)}
                  </p>
                )}

                <Button
                  className="w-full mt-6"
                  size="lg"
                  disabled={!canCheckout}
                  asChild
                >
                  <Link to="/checkout">
                    Finalizar Pedido
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full mt-3"
                  asChild
                >
                  <Link to="/produtos">Continuar Comprando</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
