import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Truck, CreditCard, MessageCircle, ShieldCheck, ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, generateWhatsAppMessage } from '@/lib/utils';
import { toast } from 'sonner';
import { DynamicStorefront } from '@/components/storefront/DynamicStorefront';

interface StoreData {
  id: string;
  name: string;
  slug: string;
}

interface StoreSettings {
  whatsapp_number: string | null;
  accept_pix: boolean;
  accept_card: boolean;
  accept_cash: boolean;
  delivery_fee: number;
  min_order_value: number;
  banner_title: string;
  banner_subtitle: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  stock: number;
  is_featured: boolean;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function StorefrontPage() {
  const { slug, productId, categorySlug } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreData | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(`cart_${slug}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Determine current view
  const isProductView = !!productId;
  const isCategoryView = !!categorySlug;
  const isCartView = window.location.pathname.includes('/carrinho');
  const isCheckoutView = window.location.pathname.includes('/checkout');

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!slug) return;

      try {
        // Fetch store
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('slug', slug)
          .single();

        if (storeError || !storeData) {
          setLoading(false);
          return;
        }

        setStore(storeData);

        // Fetch settings
        const { data: settingsData } = await supabase
          .from('store_settings')
          .select('*')
          .eq('store_id', storeData.id)
          .single();

        setSettings(settingsData);

        // Fetch products
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', storeData.id)
          .eq('is_active', true)
          .order('is_featured', { ascending: false });

        setProducts(productsData || []);

        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .eq('store_id', storeData.id)
          .order('sort_order');

        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error fetching store:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [slug]);

  // Save cart to localStorage
  useEffect(() => {
    if (slug) {
      localStorage.setItem(`cart_${slug}`, JSON.stringify(cart));
    }
  }, [cart, slug]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    toast.success('Produto adicionado ao carrinho!');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loja não encontrada</h1>
          <Button asChild>
            <Link to="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Checkout view
  if (isCheckoutView) {
    return (
      <CheckoutView
        store={store}
        settings={settings}
        cart={cart}
        cartTotal={cartTotal}
        onClearCart={() => setCart([])}
      />
    );
  }

  // Cart view
  if (isCartView) {
    return (
      <CartView
        store={store}
        settings={settings}
        cart={cart}
        cartTotal={cartTotal}
        onUpdateQuantity={updateCartQuantity}
      />
    );
  }

  // Product view
  if (isProductView) {
    const product = products.find(p => p.id === productId);
    if (!product) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
            <Button asChild>
              <Link to={`/loja/${slug}`}>Voltar à loja</Link>
            </Button>
          </div>
        </div>
      );
    }
    return (
      <ProductView
        store={store}
        settings={settings}
        product={product}
        products={products}
        cartItemCount={cartItemCount}
        onAddToCart={addToCart}
      />
    );
  }

  // Use dynamic layout for home view (no product, category, cart or checkout)
  if (!isProductView && !isCategoryView && !isCartView && !isCheckoutView) {
    return (
      <DynamicStorefront
        store={store}
        settings={settings}
        products={products}
        categories={categories}
        cartItemCount={cartItemCount}
        onAddToCart={(product) => addToCart(product)}
      />
    );
  }

  // Category or home view
  const displayProducts = isCategoryView
    ? products.filter(p => {
        const cat = categories.find(c => c.slug === categorySlug);
        return cat && p.category_id === cat.id;
      })
    : products;

  const featuredProducts = products.filter(p => p.is_featured);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to={`/loja/${slug}`} className="font-bold text-xl text-primary">
            {store.name}
          </Link>
          <Link to={`/loja/${slug}/carrinho`}>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        {!isCategoryView && (
          <section className="bg-gradient-to-br from-primary/10 via-background to-accent py-12 md:py-16">
            <div className="container text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{settings?.banner_title || 'Bem-vindo!'}</h1>
              <p className="text-muted-foreground">{settings?.banner_subtitle || 'Confira nossos produtos'}</p>
            </div>
          </section>
        )}

        {/* Categories */}
        {categories.length > 0 && !isCategoryView && (
          <section className="py-8 border-b">
            <div className="container">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map(cat => (
                  <Link key={cat.id} to={`/loja/${slug}/categoria/${cat.slug}`}>
                    <Button variant="outline" size="sm">
                      {cat.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Products */}
        <section className="py-8">
          <div className="container">
            {isCategoryView && (
              <div className="mb-6">
                <Link to={`/loja/${slug}`} className="text-sm text-muted-foreground hover:text-primary">
                  ← Voltar
                </Link>
                <h2 className="text-2xl font-bold mt-2">
                  {categories.find(c => c.slug === categorySlug)?.name || 'Categoria'}
                </h2>
              </div>
            )}

            {!isCategoryView && featuredProducts.length > 0 && (
              <h2 className="text-2xl font-bold mb-6">Destaques</h2>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(isCategoryView ? displayProducts : featuredProducts.length > 0 ? featuredProducts : displayProducts).map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  storeSlug={slug!}
                  onAddToCart={() => addToCart(product)}
                />
              ))}
            </div>

            {!isCategoryView && featuredProducts.length > 0 && displayProducts.length > featuredProducts.length && (
              <>
                <h2 className="text-2xl font-bold mt-12 mb-6">Todos os Produtos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {displayProducts.filter(p => !p.is_featured).map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      storeSlug={slug!}
                      onAddToCart={() => addToCart(product)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* CTA */}
        {settings?.whatsapp_number && (
          <section className="py-12">
            <div className="container">
              <div className="bg-primary rounded-2xl p-8 text-center text-primary-foreground">
                <h2 className="text-xl font-bold mb-2">Dúvidas?</h2>
                <p className="text-primary-foreground/80 mb-4">Fale conosco pelo WhatsApp</p>
                <Button variant="secondary" asChild>
                  <a
                    href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {store.name}</p>
          <p className="mt-1">Powered by Inove Commerce</p>
        </div>
      </footer>
    </div>
  );
}

// Product Card Component
function ProductCard({ product, storeSlug, onAddToCart }: {
  product: Product;
  storeSlug: string;
  onAddToCart: () => void;
}) {
  const hasDiscount = product.original_price && Number(product.original_price) > Number(product.price);

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all">
      <Link to={`/loja/${storeSlug}/produto/${product.id}`}>
        <div className="aspect-square bg-muted relative overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
          )}
          {hasDiscount && (
            <Badge className="absolute top-2 left-2 bg-destructive">
              -{Math.round((1 - Number(product.price) / Number(product.original_price!)) * 100)}%
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link to={`/loja/${storeSlug}/produto/${product.id}`}>
          <h3 className="font-medium line-clamp-2 hover:text-primary min-h-[2.5rem]">{product.name}</h3>
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">{formatCurrency(Number(product.price))}</span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(Number(product.original_price!))}
            </span>
          )}
        </div>
        <Button className="w-full mt-3" size="sm" onClick={(e) => { e.preventDefault(); onAddToCart(); }}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </CardContent>
    </Card>
  );
}

// Product View Component
function ProductView({ store, settings, product, products, cartItemCount, onAddToCart }: {
  store: StoreData;
  settings: StoreSettings | null;
  product: Product;
  products: Product[];
  cartItemCount: number;
  onAddToCart: (product: Product, qty: number) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const hasDiscount = product.original_price && Number(product.original_price) > Number(product.price);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to={`/loja/${store.slug}`} className="font-bold text-xl text-primary">{store.name}</Link>
          <Link to={`/loja/${store.slug}/carrinho`}>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <Link to={`/loja/${store.slug}`} className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block">
          ← Voltar
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              {product.stock <= 5 && product.stock > 0 && (
                <Badge variant="secondary" className="mt-2">Últimas {product.stock} unidades</Badge>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">{formatCurrency(Number(product.price))}</span>
              {hasDiscount && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatCurrency(Number(product.original_price!))}
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-muted-foreground">{product.description}</p>
            )}

            <div className="flex items-center gap-4">
              <span className="font-medium">Quantidade:</span>
              <div className="flex items-center border rounded-md">
                <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={() => onAddToCart(product, quantity)}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Adicionar ao Carrinho
            </Button>

            {settings && (
              <div className="border rounded-lg p-4 bg-muted/30 text-sm">
                <p><strong>Taxa de entrega:</strong> {formatCurrency(Number(settings.delivery_fee))}</p>
                <p className="text-muted-foreground">Pedido mínimo: {formatCurrency(Number(settings.min_order_value))}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Cart View Component
function CartView({ store, settings, cart, cartTotal, onUpdateQuantity }: {
  store: StoreData;
  settings: StoreSettings | null;
  cart: CartItem[];
  cartTotal: number;
  onUpdateQuantity: (id: string, qty: number) => void;
}) {
  const canCheckout = settings ? cartTotal >= Number(settings.min_order_value) : true;
  const grandTotal = cartTotal + (settings ? Number(settings.delivery_fee) : 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b">
          <div className="container h-16 flex items-center">
            <Link to={`/loja/${store.slug}`} className="font-bold text-xl text-primary">{store.name}</Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Carrinho vazio</h1>
            <Button asChild>
              <Link to={`/loja/${store.slug}`}>Ver Produtos</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container h-16 flex items-center">
          <Link to={`/loja/${store.slug}`} className="font-bold text-xl text-primary">{store.name}</Link>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <Link to={`/loja/${store.slug}`} className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block">
          ← Continuar comprando
        </Link>
        <h1 className="text-2xl font-bold mb-6">Meu Carrinho</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <Card key={item.product.id}>
                <CardContent className="flex gap-4 p-4">
                  <div className="w-20 h-20 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                    {item.product.image_url ? (
                      <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-primary font-bold">{formatCurrency(Number(item.product.price))}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto text-destructive" onClick={() => onUpdateQuantity(item.product.id, 0)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="font-bold mb-4">Resumo</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entrega</span>
                    <span>{formatCurrency(Number(settings?.delivery_fee || 0))}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
                {!canCheckout && settings && (
                  <p className="text-sm text-destructive mt-4">
                    Pedido mínimo: {formatCurrency(Number(settings.min_order_value))}
                  </p>
                )}
                <Button className="w-full mt-4" disabled={!canCheckout} asChild>
                  <Link to={`/loja/${store.slug}/checkout`}>Finalizar Pedido</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

// Checkout View Component
function CheckoutView({ store, settings, cart, cartTotal, onClearCart }: {
  store: StoreData;
  settings: any;
  cart: CartItem[];
  cartTotal: number;
  onClearCart: () => void;
}) {
  const navigate = useNavigate();
  const [orderSent, setOrderSent] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', address: '', neighborhood: '', city: '', complement: '', reference: ''
  });

  const grandTotal = cartTotal + (settings ? Number(settings.delivery_fee) : 0);
  const isValid = formData.name && formData.phone && formData.address && formData.neighborhood && formData.city;
  const isMercadoPagoEnabled = settings?.mercadopago_enabled && settings?.mercadopago_public_key;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      // Create order in database first
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          store_id: store.id,
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_address: formData.address,
          customer_neighborhood: formData.neighborhood,
          customer_city: formData.city,
          customer_complement: formData.complement || null,
          customer_reference: formData.reference || null,
          payment_method: paymentMethod,
          subtotal: cartTotal,
          delivery_fee: Number(settings?.delivery_fee || 0),
          total: grandTotal,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Add order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: Number(item.product.price),
        total_price: Number(item.product.price) * item.quantity
      }));

      await supabase.from('order_items').insert(orderItems);

      // If Mercado Pago is enabled and selected
      if (paymentMethod === 'mercadopago' && isMercadoPagoEnabled) {
        const paymentResponse = await supabase.functions.invoke('create-payment', {
          body: {
            store_id: store.id,
            order_id: order.id,
            items: cart.map(item => ({
              title: item.product.name,
              quantity: item.quantity,
              unit_price: Number(item.product.price)
            })),
            payer: {
              name: formData.name,
              email: formData.email || undefined,
              phone: formData.phone
            },
            delivery_fee: Number(settings?.delivery_fee || 0),
            redirect_url: `${window.location.origin}/loja/${store.slug}`
          }
        });

        if (paymentResponse.data?.init_point) {
          window.location.href = paymentResponse.data.init_point;
          return;
        }
      }

      // WhatsApp checkout for other methods
      if (settings?.whatsapp_number) {
        const paymentLabel = paymentMethod === 'pix' ? 'Pix' : paymentMethod === 'card' ? 'Cartão' : 'Dinheiro';
        const message = generateWhatsAppMessage(
          cart.map(i => ({ product: { name: i.product.name, price: Number(i.product.price) }, quantity: i.quantity })),
          cartTotal,
          Number(settings.delivery_fee),
          formData,
          paymentLabel
        );
        window.open(`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}?text=${message}`, '_blank');
      }

      setOrderSent(true);
      toast.success('Pedido criado com sucesso!');
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Erro ao criar pedido');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Pedido Enviado!</h1>
          <p className="text-muted-foreground mb-6">Seu pedido foi registrado e enviado para a loja.</p>
          <Button onClick={() => { onClearCart(); navigate(`/loja/${store.slug}`); }}>
            Voltar à Loja
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container h-16 flex items-center">
          <Link to={`/loja/${store.slug}`} className="font-bold text-xl text-primary">{store.name}</Link>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <Link to={`/loja/${store.slug}/carrinho`} className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block">
          ← Voltar ao carrinho
        </Link>
        <h1 className="text-2xl font-bold mb-6">Finalizar Pedido</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Customer */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="font-bold">Seus Dados</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Nome *</Label>
                      <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div>
                      <Label>WhatsApp *</Label>
                      <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="font-bold">Endereço de Entrega</h2>
                  <div className="space-y-4">
                    <div>
                      <Label>Endereço *</Label>
                      <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Bairro *</Label>
                        <Input value={formData.neighborhood} onChange={e => setFormData({ ...formData, neighborhood: e.target.value })} required />
                      </div>
                      <div>
                        <Label>Cidade *</Label>
                        <Input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} required />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Complemento</Label>
                        <Input value={formData.complement} onChange={e => setFormData({ ...formData, complement: e.target.value })} />
                      </div>
                      <div>
                        <Label>Referência</Label>
                        <Input value={formData.reference} onChange={e => setFormData({ ...formData, reference: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="font-bold">Pagamento</h2>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    {isMercadoPagoEnabled && (
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="mercadopago" />
                        <div className="flex items-center gap-2">
                          <span className="font-medium">💳 Pagar Online</span>
                          <span className="text-xs text-muted-foreground">(Pix, Cartão, Boleto)</span>
                        </div>
                      </label>
                    )}
                    {settings?.accept_pix && (
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="pix" />
                        <span>Pix na entrega</span>
                      </label>
                    )}
                    {settings?.accept_card && (
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="card" />
                        <span>Cartão na entrega</span>
                      </label>
                    )}
                    {settings?.accept_cash && (
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="cash" />
                        <span>Dinheiro</span>
                      </label>
                    )}
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Summary */}
            <div>
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h2 className="font-bold mb-4">Resumo</h2>
                  <div className="space-y-2 text-sm mb-4">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex justify-between">
                        <span>{item.quantity}x {item.product.name}</span>
                        <span>{formatCurrency(Number(item.product.price) * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Entrega</span>
                      <span>{formatCurrency(Number(settings?.delivery_fee || 0))}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>
                  <Button type="submit" className="w-full mt-4" disabled={!isValid || submitting}>
                    {submitting ? (
                      <span className="animate-spin mr-2">⏳</span>
                    ) : paymentMethod === 'mercadopago' ? (
                      <>💳 Pagar Agora</>
                    ) : (
                      <>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Enviar via WhatsApp
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
