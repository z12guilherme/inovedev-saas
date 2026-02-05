import { Link } from 'react-router-dom';
import { ArrowRight, Truck, CreditCard, MessageCircle, ShieldCheck, Store, LayoutDashboard, ShoppingBag, Zap, CheckCircle2, Rocket, Settings, HelpCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { CategoryCard } from '@/components/category/CategoryCard';
import { useStore } from '@/contexts/StoreContext';
import heroBanner from '@/assets/banner.jpg';
import logoImg from '@/assets/logo.jpg';
import { LoadingScreen } from '@/components/ui/loading-screen';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const { config, categories, getFeaturedProducts, loading } = useStore();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-background flex flex-col" style={{ '--primary': '#3b82f6', '--ring': '#3b82f6' } as React.CSSProperties}>
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
            opacity: 0;
          }
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-300 { animation-delay: 0.3s; }
        `}</style>
        {/* Navbar SaaS */}
        <header className="border-b border-blue-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xl text-primary">
              <img src={logoImg} alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
              Inove Dev SaaS
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <a href="#features" className="hover:text-primary transition-colors">Recursos</a>
              <a href="#how-it-works" className="hover:text-primary transition-colors">Como Funciona</a>
              <a href="#pricing" className="hover:text-primary transition-colors">Planos</a>
              <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
              <a href="#demo" className="hover:text-primary transition-colors">Demonstração</a>
              <Link to="/admin/login" className="hover:text-primary transition-colors">Login</Link>
            </nav>
            <div className="flex items-center gap-4">
              <Button asChild>
                <Link to="/admin/login">Área do Cliente</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex-1 flex flex-col justify-center py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={heroBanner} 
              alt="Banner" 
              className="w-full h-full object-cover opacity-100 contrast-125 blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />
          </div>
          <div className="container text-center max-w-4xl relative z-10 animate-fade-in-up">
            <div className="inline-flex items-center rounded-full border border-blue-200 px-3 py-1 text-sm font-semibold transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100 mb-8">
              <Zap className="mr-1 h-3 w-3" />
              Plataforma Multi-tenant Pronta
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-slate-900 drop-shadow-sm">
              Sua Loja Virtual Profissional <span className="text-primary">Pronta para Vender</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              A plataforma completa para você vender online. Gerencie produtos, pedidos e pagamentos em um único lugar. Sem complicações.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-200">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:-translate-y-1 text-black" asChild>
                <Link to="/loja/demo">
                  Ver Loja Demo <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-slate-50">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group p-8 rounded-3xl border border-blue-100 bg-white hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2 animate-fade-in-up delay-100">
                <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Painel Administrativo</h3>
                <p className="text-slate-600 leading-relaxed">Gerencie sua loja com um dashboard intuitivo e completo para controle total.</p>
              </div>
              <div className="group p-8 rounded-3xl border border-blue-100 bg-white hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2 animate-fade-in-up delay-200">
                <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Loja Personalizável</h3>
                <p className="text-slate-600 leading-relaxed">Sua marca, suas cores. Personalize a aparência da sua loja para seus clientes.</p>
              </div>
              <div className="group p-8 rounded-3xl border border-blue-100 bg-white hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2 animate-fade-in-up delay-300">
                <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Checkout Transparente</h3>
                <p className="text-slate-600 leading-relaxed">Integração nativa com Mercado Pago e Pix para vendas seguras e rápidas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-24 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-slate-900">Como funciona</h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                Crie sua loja em poucos minutos e comece a vender sem complicações.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 rounded-3xl hover:bg-slate-50 transition-colors duration-300">
                <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600 shadow-inner">
                  <Rocket className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">1. Contrate o plano</h3>
                <p className="text-muted-foreground">Entre em contato para ativar sua loja com nossos especialistas.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-3xl hover:bg-slate-50 transition-colors duration-300">
                <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600 shadow-inner">
                  <Settings className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">2. Personalize</h3>
                <p className="text-muted-foreground">Adicione seus produtos, escolha as cores e configure o pagamento.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-3xl hover:bg-slate-50 transition-colors duration-300">
                <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600 shadow-inner">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">3. Comece a vender</h3>
                <p className="text-muted-foreground">Divulgue seu link e receba pedidos diretamente no painel.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-slate-900">Planos simples e transparentes</h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                Escolha o plano ideal para o seu negócio. Sem taxas escondidas.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <Card className="border-2 border-blue-500 relative overflow-hidden shadow-2xl shadow-blue-500/10 scale-105 z-10">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">Popular</div>
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                  <CardDescription>Para lojas em crescimento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-6">R$ 49,90<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Produtos ilimitados</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Domínio personalizado</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Checkout transparente</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Suporte prioritário</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25">Fale Conosco</Button>
                </CardFooter>
              </Card>
              <Card className="border border-slate-200 shadow-lg hover:border-blue-300 transition-colors">
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <CardDescription>Para grandes operações</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-6">Sob Consulta</div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Tudo do plano Pro</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> API dedicada</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Gerente de conta</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline">Fale Conosco</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 bg-white">
          <div className="container max-w-3xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-slate-900">Perguntas Frequentes</h2>
            </div>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Como faço para contratar?</AccordionTrigger>
                <AccordionContent>
                  Entre em contato com nossa equipe comercial. Nós configuramos sua loja e você já começa a vender.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Posso usar meu próprio domínio?</AccordionTrigger>
                <AccordionContent>
                  Sim, no plano Pro você pode conectar seu domínio personalizado (ex: sualoja.com.br).
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Como recebo pelos meus pedidos?</AccordionTrigger>
                <AccordionContent>
                  Você pode configurar sua chave Pix para receber diretamente na sua conta bancária ou integrar com o Mercado Pago para aceitar cartões e boletos.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-blue-600 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-20"></div>
          <div className="container">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10">Pronto para começar sua jornada?</h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto relative z-10">Junte-se a milhares de empreendedores que já estão vendendo online com a Inove Dev SaaS.</p>
            <Button size="lg" variant="secondary" className="h-14 px-10 text-lg rounded-full shadow-2xl hover:scale-105 transition-transform relative z-10 text-blue-700 font-bold" asChild>
              <Link to="/loja/demo">Ver Demonstração <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </section>
        
        <footer className="py-8 border-t text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} Inove Dev SaaS. Todos os direitos reservados.
        </footer>
      </div>
    );
  }

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
