import { Link } from 'react-router-dom';
import { ArrowRight, Truck, CreditCard, MessageCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { CategoryCard } from '@/components/category/CategoryCard';
import { useStore } from '@/contexts/StoreContext';
import heroBanner from '@/assets/hero-banner.jpg';

const Index = () => {
  const { config, categories, getFeaturedProducts } = useStore();
  const featuredProducts = getFeaturedProducts();

  const features = [
    {
      icon: Truck,
      title: 'Entrega Rápida',
      description: 'Entregamos na sua região com agilidade'
    },
    {
      icon: CreditCard,
      title: 'Pagamento Fácil',
      description: 'Pix, cartão de crédito e dinheiro'
    },
    {
      icon: MessageCircle,
      title: 'Atendimento WhatsApp',
      description: 'Tire suas dúvidas em tempo real'
    },
    {
      icon: ShieldCheck,
      title: 'Compra Segura',
      description: 'Seus dados sempre protegidos'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={heroBanner} 
              alt="Produtos variados" 
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80" />
          </div>
          <div className="container relative py-16 md:py-24">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Bem-vindo à{' '}
                <span className="text-primary">{config.name}</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Encontre os melhores produtos com os melhores preços. 
                Compre online e receba no conforto da sua casa.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link to="/produtos">
                    Ver Produtos
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a
                    href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Fale Conosco
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 border-b bg-muted/30">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center p-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">Categorias</h2>
              <Button variant="ghost" asChild>
                <Link to="/produtos">
                  Ver todas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map(category => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">Produtos em Destaque</h2>
              <Button variant="ghost" asChild>
                <Link to="/produtos">
                  Ver todos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container">
            <div className="bg-primary rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Precisa de ajuda com seu pedido?
              </h2>
              <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
                Nossa equipe está pronta para atender você pelo WhatsApp. 
                Tire suas dúvidas e faça seu pedido!
              </p>
              <Button
                size="lg"
                variant="secondary"
                asChild
              >
                <a
                  href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Chamar no WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
