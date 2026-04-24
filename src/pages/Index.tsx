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
      <div className="min-h-screen bg-background flex flex-col saas-landing font-sans">
        {/* Navbar SaaS */}
        <header className="border-b border-white/10 bg-[#0d1b2a]/90 backdrop-blur-md sticky top-0 z-50">
          <div className="container flex h-20 items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-2xl text-white">
              <img src={logoImg} alt="Logo" className="h-10 w-10 object-contain rounded" />
              <span className="tracking-wide">Inove SaaS</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-[15px] font-medium text-white/90">
              <a href="#features" className="hover:text-[#00C7B7] transition-colors">Recursos</a>
              <a href="#how-it-works" className="hover:text-[#00C7B7] transition-colors">Como Funciona</a>
              <a href="#pricing" className="hover:text-[#00C7B7] transition-colors">Planos</a>
              <a href="#faq" className="hover:text-[#00C7B7] transition-colors">FAQ</a>
              <Link to="/admin/login" className="hover:text-[#00C7B7] transition-colors">Login</Link>
            </nav>
            <div className="flex items-center gap-4">
              <Button asChild className="bg-[#00C7B7] hover:bg-[#00a699] text-[#050a12] font-semibold rounded-full px-6">
                <Link to="/admin/login">Área do Cliente</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex-1 flex flex-col justify-center py-24 md:py-32 relative overflow-hidden bg-gradient-to-br from-[#0d1b2a] to-[#050a12]">
          {/* Glowing orbs */}
          <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-[#00C7B7] rounded-full blur-[120px] opacity-20 animate-pulse"></div>
          <div className="absolute bottom-[-15%] right-[-5%] w-[350px] h-[350px] bg-[#007BFF] rounded-full blur-[120px] opacity-20 animate-pulse delay-700"></div>
          
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

          <div className="container text-center max-w-4xl relative z-10">
            <div className="inline-flex items-center rounded-full border border-[#00C7B7]/30 px-4 py-1.5 text-sm font-semibold text-[#b3c2d1] bg-[#0d1b2a]/60 backdrop-blur-sm mb-8 tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-[#00C7B7] mr-2 shadow-[0_0_10px_#00C7B7] animate-pulse"></span>
              Plataforma Multi-tenant
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-white drop-shadow-sm font-['Montserrat']">
              Acelerando a sua <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C7B7] to-[#48ebd9]">
                Evolução Digital
              </span>
            </h1>
            <p className="text-xl text-[#aeb9c6] mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              A plataforma SaaS completa para você criar, gerenciar e escalar sua loja virtual. Assine e já saia vendendo com sua própria marca.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-[#00C7B7] hover:bg-[#00a699] text-[#050a12] font-bold shadow-[0_8px_25px_rgba(0,199,183,0.3)] transition-all hover:-translate-y-1" asChild>
                <Link to="/loja/demo">
                  Ver Demonstração <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 border-white/20 text-white hover:bg-white/5 hover:border-white transition-all hover:-translate-y-1 bg-transparent" asChild>
                <a href="#pricing">Ver Planos</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-[#f8f9fa]">
          <div className="container">
             <div className="text-center mb-16">
              <span className="bg-[#00C7B7] text-[#050a12] px-3 py-1 rounded-full text-sm font-bold tracking-wide uppercase mb-4 inline-block shadow-md"><LayoutDashboard className="inline w-4 h-4 mr-1"/> Recursos Premium</span>
              <h2 className="text-4xl font-bold mb-4 text-[#2c4964] font-['Montserrat'] uppercase relative pb-4 after:content-[''] after:absolute after:w-12 after:h-[3px] after:bg-[#00C7B7] after:bottom-0 after:left-1/2 after:-translate-x-1/2">Tudo que você precisa</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group p-10 rounded-2xl bg-white border border-gray-100 shadow-[0_0_29px_rgba(68,88,144,0.05)] hover:shadow-[0_15px_40px_rgba(0,199,183,0.15)] transition-all duration-300 hover:-translate-y-2 text-center">
                <div className="h-16 w-16 bg-blue-50/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#00C7B7] group-hover:scale-110 transition-transform duration-300">
                  <LayoutDashboard className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#2c4964] font-['Montserrat']">Painel Administrativo</h3>
                <p className="text-gray-500 leading-relaxed text-[15px]">Gerencie sua loja com um dashboard intuitivo, multi-tenant e completo para controle total dos seus dados.</p>
              </div>
              <div className="group p-10 rounded-2xl bg-white border border-gray-100 shadow-[0_0_29px_rgba(68,88,144,0.05)] hover:shadow-[0_15px_40px_rgba(0,199,183,0.15)] transition-all duration-300 hover:-translate-y-2 text-center">
                <div className="h-16 w-16 bg-blue-50/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#00C7B7] group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#2c4964] font-['Montserrat']">Subdomínios Dinâmicos</h3>
                <p className="text-gray-500 leading-relaxed text-[15px]">Sua marca em destaque com subdomínio próprio (minhamarca.inovedev) gerado automaticamente e seguro.</p>
              </div>
              <div className="group p-10 rounded-2xl bg-white border border-gray-100 shadow-[0_0_29px_rgba(68,88,144,0.05)] hover:shadow-[0_15px_40px_rgba(0,199,183,0.15)] transition-all duration-300 hover:-translate-y-2 text-center">
                <div className="h-16 w-16 bg-blue-50/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#00C7B7] group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#2c4964] font-['Montserrat']">Alta Conversão</h3>
                <p className="text-gray-500 leading-relaxed text-[15px]">Integração nativa de pagamentos e checkout rápido. Experiência focada em SEO e performance extrema.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-24 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <span className="bg-[#00C7B7] text-[#050a12] px-3 py-1 rounded-full text-sm font-bold tracking-wide uppercase mb-4 inline-block shadow-md"><Settings className="inline w-4 h-4 mr-1"/> Processo Simples</span>
              <h2 className="text-4xl font-bold mb-4 text-[#2c4964] font-['Montserrat'] uppercase relative pb-4 after:content-[''] after:absolute after:w-12 after:h-[3px] after:bg-[#00C7B7] after:bottom-0 after:left-1/2 after:-translate-x-1/2">Como funciona</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto mt-6">
                Crie sua loja exclusiva em poucos minutos e comece a vender sem complicações.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 group">
                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mb-6 text-[#00C7B7] shadow-[0_0_20px_rgba(0,0,0,0.1)] group-hover:bg-[#00C7B7] group-hover:text-white transition-all duration-300 transform group-hover:scale-110">
                  <Rocket className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#2c4964]">1. Assine o plano</h3>
                <p className="text-gray-500">Escolha a assinatura ideal e ative sua loja instantaneamente.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 group">
                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mb-6 text-[#00C7B7] shadow-[0_0_20px_rgba(0,0,0,0.1)] group-hover:bg-[#00C7B7] group-hover:text-white transition-all duration-300 transform group-hover:scale-110">
                  <Settings className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#2c4964]">2. Personalize</h3>
                <p className="text-gray-500">Adicione seus produtos, escolha as cores e configure o pagamento.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 group">
                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mb-6 text-[#00C7B7] shadow-[0_0_20px_rgba(0,0,0,0.1)] group-hover:bg-[#00C7B7] group-hover:text-white transition-all duration-300 transform group-hover:scale-110">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#2c4964]">3. Comece a vender</h3>
                <p className="text-gray-500">Divulgue seu link e receba pedidos diretamente no seu painel.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 bg-[#f8f9fa]">
          <div className="container">
            <div className="text-center mb-16">
              <span className="bg-[#00C7B7] text-[#050a12] px-3 py-1 rounded-full text-sm font-bold tracking-wide uppercase mb-4 inline-block shadow-md"><Store className="inline w-4 h-4 mr-1"/> Assinaturas</span>
              <h2 className="text-4xl font-bold mb-4 text-[#2c4964] font-['Montserrat'] uppercase relative pb-4 after:content-[''] after:absolute after:w-12 after:h-[3px] after:bg-[#00C7B7] after:bottom-0 after:left-1/2 after:-translate-x-1/2">Planos Transparentes</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="border-2 border-[#00C7B7] relative overflow-hidden shadow-[0_15px_40px_rgba(0,199,183,0.15)] md:scale-105 z-10 rounded-2xl bg-white">
                <div className="absolute top-0 right-0 bg-[#00C7B7] text-[#050a12] text-xs px-4 py-1.5 rounded-bl-lg font-bold uppercase tracking-wider">Popular</div>
                <CardHeader className="pt-8">
                  <CardTitle className="text-3xl font-['Montserrat'] font-bold text-[#2c4964]">SaaS Pro</CardTitle>
                  <CardDescription className="text-base">Para lojistas que querem escalar rápido</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-8 text-[#0d1b2a]">R$ 49,90<span className="text-base font-normal text-gray-500">/mês</span></div>
                  <ul className="space-y-4 text-[15px] text-gray-600">
                    <li className="flex items-center gap-3"><Check className="h-5 w-5 text-[#00C7B7]" /> Produtos ilimitados</li>
                    <li className="flex items-center gap-3"><Check className="h-5 w-5 text-[#00C7B7]" /> Subdomínio dinâmico grátis</li>
                    <li className="flex items-center gap-3"><Check className="h-5 w-5 text-[#00C7B7]" /> Checkout Mercado Pago & Pix</li>
                    <li className="flex items-center gap-3"><Check className="h-5 w-5 text-[#00C7B7]" /> Dashboard Multi-tenant exclusivo</li>
                  </ul>
                </CardContent>
                <CardFooter className="pb-8">
                  <Button className="w-full bg-[#00C7B7] hover:bg-[#00a699] text-[#050a12] font-bold rounded-full h-12 shadow-[0_8px_20px_rgba(0,199,183,0.25)] hover:-translate-y-1 transition-all">Assinar Agora</Button>
                </CardFooter>
              </Card>
              <Card className="border border-gray-200 shadow-lg hover:border-[#00C7B7]/50 transition-colors rounded-2xl bg-white mt-8 md:mt-0">
                <CardHeader className="pt-8">
                  <CardTitle className="text-3xl font-['Montserrat'] font-bold text-[#2c4964]">Enterprise</CardTitle>
                  <CardDescription className="text-base">Desenvolvimento sob medida</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-8 text-[#0d1b2a]">Sob Consulta</div>
                  <ul className="space-y-4 text-[15px] text-gray-600">
                    <li className="flex items-center gap-3"><Check className="h-5 w-5 text-[#00C7B7]" /> Tudo do plano Pro</li>
                    <li className="flex items-center gap-3"><Check className="h-5 w-5 text-[#00C7B7]" /> Software 100% Personalizado</li>
                    <li className="flex items-center gap-3"><Check className="h-5 w-5 text-[#00C7B7]" /> Integração com sistemas legados</li>
                    <li className="flex items-center gap-3"><Check className="h-5 w-5 text-[#00C7B7]" /> Infraestrutura Dedicada</li>
                  </ul>
                </CardContent>
                <CardFooter className="pb-8">
                  <Button className="w-full rounded-full h-12 font-bold border-2 border-[#0d1b2a] text-[#0d1b2a] hover:bg-[#0d1b2a] hover:text-white transition-all" variant="outline">Falar com Especialista</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 bg-white">
          <div className="container max-w-3xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-[#2c4964] font-['Montserrat'] uppercase relative pb-4 after:content-[''] after:absolute after:w-12 after:h-[3px] after:bg-[#00C7B7] after:bottom-0 after:left-1/2 after:-translate-x-1/2">Perguntas Frequentes</h2>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border border-gray-100 rounded-lg px-6 data-[state=open]:bg-[#00C7B7]/5 data-[state=open]:border-[#00C7B7]/20 transition-all">
                <AccordionTrigger className="hover:no-underline font-semibold text-[#2c4964] text-left">Como faço para assinar?</AccordionTrigger>
                <AccordionContent className="text-gray-600 text-base pb-4">
                  Basta escolher o plano Pro, preencher seus dados e sua loja estará pronta em minutos com um subdomínio exclusivo para você configurar e começar a vender.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border border-gray-100 rounded-lg px-6 data-[state=open]:bg-[#00C7B7]/5 data-[state=open]:border-[#00C7B7]/20 transition-all">
                <AccordionTrigger className="hover:no-underline font-semibold text-[#2c4964] text-left">Preciso saber programar?</AccordionTrigger>
                <AccordionContent className="text-gray-600 text-base pb-4">
                  Não! A plataforma é totalmente intuitiva. Você gerencia seus produtos, cupons e pedidos através de um painel administrativo visual e simplificado.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border border-gray-100 rounded-lg px-6 data-[state=open]:bg-[#00C7B7]/5 data-[state=open]:border-[#00C7B7]/20 transition-all">
                <AccordionTrigger className="hover:no-underline font-semibold text-[#2c4964] text-left">Como recebo meus pagamentos?</AccordionTrigger>
                <AccordionContent className="text-gray-600 text-base pb-4">
                  O sistema possui integração nativa. Você pode receber via Pix com baixa automática ou cartões de crédito configurando sua conta do Mercado Pago no painel.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-gradient-to-br from-[#0d1b2a] to-[#050a12] text-white text-center relative overflow-hidden">
          {/* Decorativos */}
          <div className="absolute top-0 right-0 opacity-25 w-[350px] h-[350px] bg-[radial-gradient(circle,#00C7B7_0%,transparent_70%)] blur-[60px] translate-x-[30%] -translate-y-[30%]"></div>
          <div className="absolute bottom-0 left-0 opacity-25 w-[300px] h-[300px] bg-[radial-gradient(circle,#007BFF_0%,transparent_70%)] blur-[50px] -translate-x-[30%] translate-y-[30%]"></div>

          <div className="container relative z-10">
             <span className="badge mb-6 px-4 py-2 rounded-full font-bold border border-white/20 text-white bg-white/5 backdrop-blur-sm inline-block"><Rocket className="inline w-4 h-4 mr-1"/> PLATAFORMA SAAS</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-['Montserrat']">Sua loja virtual <span className="text-[#00C7B7]">exclusiva</span>.</h2>
            <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto font-light">Assine a Inove SaaS agora e tenha acesso imediato a um ambiente seguro, escalável e pronto para impulsionar suas vendas.</p>
            <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-[#00C7B7] hover:bg-[#00a699] text-[#050a12] font-bold shadow-[0_8px_25px_rgba(0,199,183,0.3)] transition-all hover:-translate-y-1" asChild>
              <Link to="/loja/demo">Crie sua Loja Agora <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </section>
        
        <footer className="py-8 bg-[#0D1B2A] border-t border-white/10 text-center text-white/60 text-sm">
          <div className="container">
            <div className="font-['Montserrat'] mb-2">
              &copy; {new Date().getFullYear()} <strong><span className="text-[#00C7B7]">InoveDev</span> SaaS</strong>. Todos os direitos reservados.
            </div>
          </div>
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
