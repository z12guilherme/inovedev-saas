import { Link } from 'react-router-dom';
import { ArrowRight, Truck, CreditCard, MessageCircle, ShieldCheck, Store, LayoutDashboard, ShoppingBag, Zap, CheckCircle2, Rocket, Settings, HelpCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { CategoryCard } from '@/components/category/CategoryCard';
import { useStore } from '@/contexts/StoreContext';
import heroBanner from '@/assets/hero-banner.jpg';
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
        {/* Navbar SaaS */}
        <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
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
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link to="/admin/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link to="/admin/criar-loja">Criar Minha Loja</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex-1 flex flex-col justify-center py-20 md:py-32 bg-gradient-to-b from-blue-50 to-white">
          <div className="container text-center max-w-4xl">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20 mb-6">
              <Zap className="mr-1 h-3 w-3" />
              Plataforma Multi-tenant Pronta
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Crie sua Loja Virtual em <span className="text-primary">Segundos</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              A plataforma completa para você vender online. Gerencie produtos, pedidos e pagamentos em um único lugar. Sem complicações.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-lg" asChild>
                <Link to="/admin/criar-loja">
                  Começar Agora <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg" asChild>
                <Link to="/loja/demo">
                  Ver Loja Demo
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 bg-muted/20">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Painel Administrativo</h3>
                <p className="text-muted-foreground">Gerencie sua loja com um dashboard intuitivo e completo para controle total.</p>
              </div>
              <div className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Loja Personalizável</h3>
                <p className="text-muted-foreground">Sua marca, suas cores. Personalize a aparência da sua loja para seus clientes.</p>
              </div>
              <div className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Checkout Transparente</h3>
                <p className="text-muted-foreground">Integração nativa com Mercado Pago e Pix para vendas seguras e rápidas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 bg-background">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Como funciona</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Crie sua loja em poucos minutos e comece a vender sem complicações.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                  <Rocket className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">1. Crie sua conta</h3>
                <p className="text-muted-foreground">Cadastre-se gratuitamente e configure os dados básicos da sua loja.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                  <Settings className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">2. Personalize</h3>
                <p className="text-muted-foreground">Adicione seus produtos, escolha as cores e configure o pagamento.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">3. Comece a vender</h3>
                <p className="text-muted-foreground">Divulgue seu link e receba pedidos diretamente no painel.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 bg-muted/20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Planos simples e transparentes</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Escolha o plano ideal para o seu negócio. Sem taxas escondidas.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Iniciante</CardTitle>
                  <CardDescription>Para quem está começando</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-6">Grátis</div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Até 10 produtos</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Painel básico</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Suporte por email</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" asChild><Link to="/admin/criar-loja">Começar Grátis</Link></Button>
                </CardFooter>
              </Card>
              <Card className="border-primary relative overflow-hidden">
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
                  <Button className="w-full" asChild><Link to="/admin/criar-loja">Assinar Pro</Link></Button>
                </CardFooter>
              </Card>
              <Card>
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
        <section id="faq" className="py-20 bg-background">
          <div className="container max-w-3xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Perguntas Frequentes</h2>
            </div>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Preciso de cartão de crédito para começar?</AccordionTrigger>
                <AccordionContent>
                  Não! Você pode criar sua loja gratuitamente e começar a vender imediatamente sem cadastrar cartão de crédito.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Posso usar meu próprio domínio?</AccordionTrigger>
                <AccordionContent>
                  Sim, no plano Pro você pode conectar seu domínio personalizado (ex: sualoja.com.br). No plano gratuito, você ganha um subdomínio (ex: sualoja.inovedev.com.br).
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
        <section className="py-20 bg-primary text-primary-foreground text-center">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para começar sua jornada?</h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">Junte-se a milhares de empreendedores que já estão vendendo online com a Inove Dev SaaS.</p>
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg" asChild>
              <Link to="/admin/criar-loja">Criar Minha Loja Grátis <ArrowRight className="ml-2 h-5 w-5" /></Link>
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
