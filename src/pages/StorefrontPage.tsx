import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Truck, CreditCard, MessageCircle, ShieldCheck, ShoppingCart, Minus, Plus, Trash2, CheckCircle, Clock, XCircle, Search, Menu, Heart, Facebook, Instagram, Twitter, Mail, X, Store, Zap, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, generateWhatsAppMessage } from '@/lib/utils';
import { toast } from 'sonner';

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
  banner_image_url: string | null;
  primary_color: string | null;
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(`cart_${slug}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Determine current view
  const isProductView = !!productId;
  const isCategoryView = !!categorySlug;
  const isCartView = window.location.pathname.includes('/carrinho');
  const isCheckoutView = window.location.pathname.includes('/checkout');
  const isSuccessView = window.location.pathname.includes('/sucesso');

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!slug) return;

      try {
        // Fetch store
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('slug', slug)
          .limit(1)
          .maybeSingle();

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
          .maybeSingle();

        setSettings(settingsData);

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', storeData.id)
          .eq('is_active', true)
          .order('is_featured', { ascending: false });

        if (productsError) {
          console.error('Erro ao buscar produtos:', productsError);
        }

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

  // Success view
  if (isSuccessView) {
    return (
      <SuccessView
        store={store}
        settings={settings}
      />
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

  // Category or home view
  const displayProducts = isCategoryView
    ? products.filter(p => {
        const cat = categories.find(c => c.slug === categorySlug);
        return cat && p.category_id === cat.id;
      })
    : products;

  const featuredProducts = products.filter(p => p.is_featured);

  // Estilo dinâmico para a cor primária
  const primaryStyle = settings?.primary_color ? {
    '--primary': settings.primary_color,
    '--ring': settings.primary_color,
    '--primary-foreground': '#ffffff'
  } as React.CSSProperties : {};

  return (
    <div className="min-h-screen flex flex-col bg-[#ebebeb]" style={primaryStyle}>
      {/* Top Bar */}
      {settings?.whatsapp_number && (
        <div className="bg-gray-900 text-white py-1.5 text-[11px] font-medium hidden sm:block">
          <div className="container flex justify-between items-center">
            <span className="flex items-center gap-2 opacity-90">
              <ShieldCheck className="h-3.5 w-3.5 text-green-400" /> 
              Compra 100% Segura
            </span>
            <div className="flex items-center gap-6 opacity-90">
               <span className="flex items-center gap-1"><Truck className="h-3 w-3"/> Entregamos em toda região</span>
               <span className="w-px h-3 bg-white/20"></span>
               <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3"/> Atendimento: {settings.whatsapp_number}</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-[#fff159] shadow-sm transition-all" style={{ backgroundColor: settings?.primary_color || '#fff159' }}>
        <div className="container py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to={`/loja/${slug}`} className="font-extrabold text-2xl tracking-tight flex-shrink-0 text-gray-900 drop-shadow-sm flex items-center gap-2">
                <Store className="w-6 h-6"/> {store.name}
              </Link>
              <div className="flex items-center gap-3 md:hidden">
                <Link to={`/loja/${slug}/carrinho`} className="relative p-2 text-gray-900">
                  <ShoppingCart className="h-6 w-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-[#fff159]">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-900 hover:bg-black/5">
                  {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-auto w-full relative">
              <div className="relative flex items-center w-full h-11 rounded-sm bg-white shadow-sm overflow-hidden">
                <Input 
                  placeholder="Buscar produtos, marcas e muito mais..." 
                  className="w-full h-full pl-4 pr-12 border-none shadow-none focus-visible:ring-0 text-base"
                />
                <Button variant="ghost" className="absolute right-0 top-0 h-full px-4 hover:bg-gray-50 text-gray-400 rounded-none border-l border-gray-100">
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-900">
              <div className="flex flex-col items-end leading-tight cursor-pointer hover:opacity-80">
                <span className="text-gray-700/80 text-xs">Bem-vindo</span>
                <span className="font-bold flex items-center gap-1">Entrar na sua conta</span>
              </div>
              <Link to={`/loja/${slug}/carrinho`} className="flex items-center gap-2 hover:bg-black/5 p-2 rounded-md transition-colors">
                <div className="relative">
                  <ShoppingCart className="h-6 w-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-[#fff159] shadow-sm">
                      {cartItemCount}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-bold">{formatCurrency(cartTotal)}</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b shadow-xl p-4 flex flex-col gap-2 md:hidden z-50">
            <nav className="flex flex-col">
              <Link to={`/loja/${slug}`} onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 font-medium hover:bg-gray-50 rounded-lg text-gray-700 flex items-center gap-3">
                <Store className="h-5 w-5 text-gray-400"/> Início
              </Link>
              <Link to={`/loja/${slug}`} onClick={() => { setIsMobileMenuOpen(false); document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' }); }} className="py-3 px-4 font-medium hover:bg-gray-50 rounded-lg text-gray-700 flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-gray-400"/> Produtos
              </Link>
              {categories.length > 0 && (
                <div className="py-2 border-t mt-2 pt-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-4">Categorias</p>
                  {categories.map(cat => (
                     <Link key={cat.id} to={`/loja/${slug}/categoria/${cat.slug}`} onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                       {cat.name}
                     </Link>
                  ))}
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 pb-20">
        {/* Hero Slider Area */}
        {!isCategoryView && (
          <section className="relative w-full max-w-[1200px] mx-auto md:mt-6 md:rounded-lg overflow-hidden shadow-sm bg-white" style={{ minHeight: '340px' }}>
             {settings?.banner_image_url ? (
               <div className="absolute inset-0 z-0">
                 <img 
                   src={settings.banner_image_url} 
                   alt="Banner" 
                   className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-transparent" />
               </div>
             ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-[#0d1b2a] to-[#00C7B7] z-0" />
             )}
             <div className="absolute inset-0 flex items-center z-10 p-8 md:p-16">
               <div className="max-w-xl animate-fade-in-up">
                 <Badge className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 mb-4 text-xs font-bold px-3 py-1 uppercase tracking-wide border-none">
                    Ofertas Especiais
                 </Badge>
                 <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight text-white drop-shadow-md">
                    {settings?.banner_title || `Bem-vindo à ${store.name}`}
                 </h1>
                 <p className="text-base md:text-lg text-gray-100 mb-8 max-w-md drop-shadow-sm font-light">
                    {settings?.banner_subtitle || 'Descubra nossos melhores produtos com preços imperdíveis e entrega rápida.'}
                 </p>
                 <Button 
                   size="lg" 
                   className="rounded-full px-8 py-6 text-base font-bold shadow-[0_8px_20px_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-1 bg-white text-gray-900 hover:bg-gray-100" 
                   onClick={() => document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' })}
                 >
                   Ver Produtos
                 </Button>
               </div>
             </div>
          </section>
        )}

        {/* E-commerce Features */}
        {!isCategoryView && (
          <div className="max-w-[1200px] mx-auto mt-6 px-4 md:px-0">
            <div className="bg-white rounded-lg shadow-sm p-6 grid grid-cols-1 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x border border-gray-100">
                <div className="flex items-center gap-4 px-4 pt-4 md:pt-0 group">
                    <CreditCard className="h-8 w-8 text-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm">Pagamento rápido e seguro</h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">Com Mercado Pago e Pix</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 px-4 pt-4 md:pt-0 group">
                    <Truck className="h-8 w-8 text-green-500 shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm">Frete para sua região</h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">Receba no conforto de casa</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 px-4 pt-4 md:pt-0 group">
                    <ShieldCheck className="h-8 w-8 text-gray-700 shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm">Segurança, do início ao fim</h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">Não gostou? Devolva.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 px-4 pt-4 md:pt-0 group">
                    <Zap className="h-8 w-8 text-yellow-500 shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm">Ofertas todos os dias</h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">Preços exclusivos para você</p>
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* Categories Carousel */}
        {categories.length > 0 && !isCategoryView && (
          <section className="mt-10 max-w-[1200px] mx-auto px-4 md:px-0">
            <div className="flex overflow-x-auto pb-4 gap-6 snap-x scrollbar-hide py-2">
              {categories.map(cat => (
                <Link key={cat.id} to={`/loja/${slug}/categoria/${cat.slug}`} className="flex flex-col items-center gap-2 min-w-[90px] snap-center group">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:shadow-md transition-all group-hover:-translate-y-1 overflow-hidden relative">
                    <span className="text-2xl font-bold text-gray-300 group-hover:text-blue-500 transition-colors z-10">
                        {cat.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="text-[13px] font-medium text-gray-700 text-center line-clamp-2">{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Products Grid */}
        <section className="mt-8 max-w-[1200px] mx-auto px-4 md:px-0" id="products-grid">
          {isCategoryView && (
            <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
              <Link to={`/loja/${slug}`} className="hover:text-gray-900">Início</Link>
              <span>/</span>
              <span className="font-semibold text-gray-900">
                {categories.find(c => c.slug === categorySlug)?.name || 'Categoria'}
              </span>
            </div>
          )}

          {displayProducts.length === 0 && featuredProducts.length === 0 && (
            <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-gray-100">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-500">Ainda não há produtos disponíveis nesta seção.</p>
            </div>
          )}

          {isCategoryView ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {displayProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  storeSlug={slug!}
                  onAddToCart={() => addToCart(product)}
                  primaryColor={settings?.primary_color}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-12">
              {featuredProducts.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-2xl font-normal text-gray-600">Ofertas do Dia</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                    {featuredProducts.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        storeSlug={slug!}
                        onAddToCart={() => addToCart(product)}
                        primaryColor={settings?.primary_color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {categories.map(category => {
                const categoryProducts = products.filter(p => p.category_id === category.id);
                if (categoryProducts.length === 0) return null;

                return (
                  <div key={category.id}>
                    <div className="flex items-end justify-between mb-4">
                      <h2 className="text-2xl font-normal text-gray-600 flex items-center gap-3">
                        {category.name}
                        <Link 
                          to={`/loja/${slug}/categoria/${category.slug}`}
                          className="text-sm font-medium text-blue-500 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-full hidden sm:block"
                        >
                          Ver todos
                        </Link>
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                      {categoryProducts.slice(0, 5).map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          storeSlug={slug!}
                          onAddToCart={() => addToCart(product)}
                          primaryColor={settings?.primary_color}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer Premium */}
      <footer className="bg-white border-t border-gray-200 text-gray-600 pt-16 pb-8 text-sm">
        <div className="container max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 px-4 md:px-0">
                <div>
                    <h3 className="text-gray-900 text-lg font-bold mb-4 flex items-center gap-2"><Store className="w-5 h-5"/> {store.name}</h3>
                    <p className="text-gray-500 leading-relaxed mb-6 text-xs">A loja oficial para você encontrar as melhores ofertas, produtos de qualidade e entrega garantida. Compre com segurança.</p>
                    <div className="flex gap-3">
                      <a href="#" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-blue-600 hover:text-white transition-colors"><Facebook className="h-4 w-4" /></a>
                      <a href="#" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-pink-600 hover:text-white transition-colors"><Instagram className="h-4 w-4" /></a>
                    </div>
                </div>
                <div>
                    <h4 className="text-gray-900 font-bold mb-4 uppercase tracking-wider text-[11px]">Atendimento</h4>
                    <ul className="space-y-3 text-xs">
                        <li><a href="#" className="hover:text-gray-900">Meus pedidos</a></li>
                        <li><a href="#" className="hover:text-gray-900">Como comprar</a></li>
                        <li><a href="#" className="hover:text-gray-900">Trocas e devoluções</a></li>
                        <li><a href="#" className="hover:text-gray-900">Fale conosco</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-gray-900 font-bold mb-4 uppercase tracking-wider text-[11px]">Categorias</h4>
                    <ul className="space-y-3 text-xs">
                        {categories.slice(0, 4).map(cat => (
                          <li key={cat.id}><Link to={`/loja/${slug}/categoria/${cat.slug}`} className="hover:text-gray-900">{cat.name}</Link></li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="text-gray-900 font-bold mb-4 uppercase tracking-wider text-[11px]">Contato Direto</h4>
                    {settings?.whatsapp_number && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <p className="flex items-center gap-2 font-bold text-gray-900 mb-1"><MessageCircle className="h-4 w-4 text-green-500" /> WhatsApp</p>
                          <p className="text-gray-600 font-medium text-sm">{settings.whatsapp_number}</p>
                          <a href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-blue-600 font-medium text-xs mt-2 inline-block hover:underline">Enviar mensagem</a>
                        </div>
                    )}
                </div>
            </div>
            <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400 px-4 md:px-0">
                <p>© {new Date().getFullYear()} {store.name}. Todos os direitos reservados.</p>
                <p className="flex items-center gap-1">
                  Tecnologia <a href="https://saas.inovedev.com.br" target="_blank" rel="noreferrer" className="font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1"><Rocket className="w-3 h-3"/> Inove Commerce</a>
                </p>
            </div>
        </div>
      </footer>
    </div>
  );
}

function ProductCard({ product, storeSlug, onAddToCart, primaryColor }: {
  product: Product;
  storeSlug: string;
  onAddToCart: () => void;
  primaryColor?: string | null;
}) {
  const hasDiscount = product.original_price && Number(product.original_price) > Number(product.price);
  const discountPercent = hasDiscount ? Math.round((1 - Number(product.price) / Number(product.original_price!)) * 100) : 0;
  const isFreeShipping = Number(product.price) > 99; // Mock for free shipping

  return (
    <div className="bg-white rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:shadow-lg transition-shadow duration-300 h-full flex flex-col relative group overflow-hidden border border-gray-100">
      <Link to={`/loja/${storeSlug}/produto/${product.id}`} className="block relative aspect-square bg-white p-4">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-200 bg-gray-50 rounded">📦</div>
        )}
        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-sm shadow-sm w-fit">
              {discountPercent}% OFF
            </span>
          )}
        </div>
      </Link>
      
      <div className="p-3 pt-0 flex flex-col flex-1 border-t border-gray-50">
        <div className="mt-2 text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1 hidden sm:block">Patrocinado</div>
        <Link to={`/loja/${storeSlug}/produto/${product.id}`}>
          <h3 className="font-normal text-sm text-gray-700 leading-tight line-clamp-2 hover:text-blue-600 mb-2 h-8">{product.name}</h3>
        </Link>
        <div className="mt-auto flex flex-col">
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {formatCurrency(Number(product.original_price!))}
            </span>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xl font-medium text-gray-900 tracking-tight">{formatCurrency(Number(product.price))}</span>
            {hasDiscount && <span className="text-xs font-medium text-green-500 hidden sm:inline">{discountPercent}% OFF</span>}
          </div>
          <span className="text-[11px] text-green-500 font-medium mt-0.5 flex items-center gap-1">
            {isFreeShipping ? 'Frete grátis' : 'Chega amanhã'} <Zap className="w-3 h-3 fill-green-500"/>
          </span>
        </div>
      </div>
      <div className="px-3 pb-3 mt-1">
         <Button 
            className="w-full h-8 text-xs font-semibold rounded shadow-sm opacity-100 sm:opacity-0 sm:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all text-white bg-blue-600 hover:bg-blue-700"
            style={{ backgroundColor: primaryColor || '#2563eb' }}
            onClick={(e) => { e.preventDefault(); onAddToCart(); }}
          >
            Adicionar ao Carrinho
          </Button>
      </div>
    </div>
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
          <Link to={`/loja/${store.slug}`} className="font-bold text-xl" style={{ color: settings?.primary_color || 'inherit' }}>{store.name}</Link>
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
              <span className="text-4xl font-bold" style={{ color: settings?.primary_color || 'inherit' }}>{formatCurrency(Number(product.price))}</span>
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

            <Button 
              size="lg" 
              className="w-full" 
              style={{ backgroundColor: settings?.primary_color || undefined }}
              onClick={() => onAddToCart(product, quantity)}>
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
            <Link to={`/loja/${store.slug}`} className="font-bold text-xl" style={{ color: settings?.primary_color || 'inherit' }}>{store.name}</Link>
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
          <Link to={`/loja/${store.slug}`} className="font-bold text-xl" style={{ color: settings?.primary_color || 'inherit' }}>{store.name}</Link>
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
                    <p className="font-bold" style={{ color: settings?.primary_color || 'inherit' }}>{formatCurrency(Number(item.product.price))}</p>
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
                    <span style={{ color: settings?.primary_color || 'inherit' }}>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
                {!canCheckout && settings && (
                  <p className="text-sm text-destructive mt-4">
                    Pedido mínimo: {formatCurrency(Number(settings.min_order_value))}
                  </p>
                )}
                <Button 
                  className="w-full mt-4" 
                  disabled={!canCheckout} 
                  asChild
                  style={{ backgroundColor: settings?.primary_color || undefined }}
                >
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
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
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
      const orderPayload = {
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
        total: grandTotal
      };

      const itemsPayload = cart.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: Number(item.product.price),
        total_price: Number(item.product.price) * item.quantity
      }));

      const { data: orderData, error: orderError } = await supabase.rpc('create_complete_order', {
        order_payload: orderPayload,
        items_payload: itemsPayload
      });

      if (orderError) throw orderError;

      const order = { id: orderData.id, order_number: orderData.order_number };

      // If Mercado Pago is enabled and selected
      if (paymentMethod === 'mercadopago' && isMercadoPagoEnabled) {
        // Sanitizar telefone (remover caracteres não numéricos) para evitar erro 400 na Edge Function
        const cleanPhone = formData.phone.replace(/\D/g, '');

        const paymentResponse = await supabase.functions.invoke('create-payment', {
          body: {
            storeId: store.id,
            orderId: order.id,
            items: cart.map(item => ({
              id: item.product.id,
              name: item.product.name,
              price: Number(item.product.price),
              image: item.product.image_url || undefined, // Evita enviar null para o MP
              quantity: item.quantity,
            })),
            payer: {
              name: formData.name,
              email: formData.email || undefined,
              phone: cleanPhone
            },
            deliveryFee: Number(settings?.delivery_fee || 0),
            backUrls: {
              success: `${window.location.origin}/loja/${store.slug}/sucesso`,
              failure: `${window.location.origin}/loja/${store.slug}/sucesso`, // Redireciona para sucesso para tratar status lá
              pending: `${window.location.origin}/loja/${store.slug}/sucesso`
            }
          }
        });

        if (paymentResponse.error) {
          console.error('Payment error:', paymentResponse.error);
          toast.error('Erro ao iniciar pagamento');
          setSubmitting(false);
          return;
        }

        if (paymentResponse.data?.initPoint) {
          window.location.href = paymentResponse.data.initPoint;
          return;
        }
      }


      setOrderNumber(order.order_number);
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
          <h1 className="text-2xl font-bold mb-2">Pedido #{orderNumber} Enviado!</h1>
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
          <Link to={`/loja/${store.slug}`} className="font-bold text-xl" style={{ color: settings?.primary_color || 'inherit' }}>{store.name}</Link>
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
                    <div className="sm:col-span-2">
                      <Label>Email (Opcional)</Label>
                      <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="Para receber o comprovante" />
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
                      <span style={{ color: settings?.primary_color || 'inherit' }}>{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full mt-4" 
                    disabled={!isValid || submitting}
                    style={{ backgroundColor: settings?.primary_color || undefined }}
                  >
                    {submitting ? (
                      <span className="animate-spin mr-2">⏳</span>
                    ) : paymentMethod === 'mercadopago' ? (
                      <>💳 Pagar Agora</>
                    ) : (
                      <>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Finalizar Pedido
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

// Success View Component
function SuccessView({ store, settings }: { store: StoreData; settings: StoreSettings | null }) {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Parâmetros retornados pelo Mercado Pago
  const status = searchParams.get('collection_status') || searchParams.get('status');
  const externalReference = searchParams.get('external_reference'); // Nosso ID do pedido
  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!externalReference) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('id', externalReference)
        .single();

      setOrder(data);
      setLoading(false);
    };

    fetchOrder();
  }, [externalReference]);

  const getStatusInfo = () => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-100',
          title: 'Pagamento Aprovado!',
          desc: 'Seu pedido foi confirmado e já estamos preparando tudo.'
        };
      case 'in_process':
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          title: 'Pagamento em Análise',
          desc: 'Estamos aguardando a confirmação do pagamento.'
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-100',
          title: 'Pagamento Recusado',
          desc: 'Houve um problema com seu pagamento. Tente novamente.'
        };
      default:
        return {
          icon: CheckCircle,
          color: 'text-primary',
          bg: 'bg-primary/10',
          title: 'Pedido Realizado!',
          desc: 'Seu pedido foi enviado para a loja.'
        };
    }
  };

  const info = getStatusInfo();
  const Icon = info.icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-12 pb-8 px-6">
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${info.bg}`}>
            <Icon className={`w-10 h-10 ${info.color}`} />
          </div>
          
          <h1 className={`text-2xl font-bold mb-2 ${info.color}`}>{info.title}</h1>
          <p className="text-muted-foreground mb-8">{info.desc}</p>

          {order && (
            <div className="bg-muted/50 rounded-lg p-4 mb-8 text-sm">
              <p className="font-medium">Pedido #{order.order_number}</p>
              <p className="text-muted-foreground mt-1">Total: {formatCurrency(order.total)}</p>
              {paymentId && <p className="text-xs text-muted-foreground mt-2">Ref. Pagamento: {paymentId}</p>}
            </div>
          )}

          <div className="space-y-3">
            {settings?.whatsapp_number && (
              <Button className="w-full" variant="outline" asChild>
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}?text=Olá, acabei de fazer o pedido #${order?.order_number || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Acompanhar no WhatsApp
                </a>
              </Button>
            )}
            
            <Button 
              className="w-full" 
              style={{ backgroundColor: settings?.primary_color || undefined }}
              asChild
            >
              <Link to={`/loja/${store.slug}`}>Voltar para a Loja</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
