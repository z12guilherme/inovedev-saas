import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  Palette, 
  CreditCard, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Package,
  Layers,
  MousePointerClick,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { useAdmin } from '@/contexts/AdminContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: 'Sua Loja', icon: Store, description: 'Dados básicos' },
  { id: 2, title: 'Visual', icon: Palette, description: 'Cores e logo' },
  { id: 3, title: 'Pagamentos', icon: CreditCard, description: 'Formas de pagamento' },
  { id: 4, title: 'Tutorial', icon: Layers, description: 'Como usar' },
  { id: 5, title: 'Pronto!', icon: Sparkles, description: 'Comece a vender' }
];

const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f97316', // Orange
  '#ef4444', // Red
  '#0ea5e9', // Sky
  '#14b8a6', // Teal
];

const TUTORIAL_STEPS = [
  {
    icon: Package,
    title: 'Cadastre seus produtos',
    description: 'Adicione fotos, descrições, preços e estoque. Marque os destaques para aparecerem na home.'
  },
  {
    icon: Layers,
    title: 'Use o Construtor Visual',
    description: 'Arraste banners, produtos e categorias para personalizar o layout da sua loja.'
  },
  {
    icon: MousePointerClick,
    title: 'Arraste e Solte',
    description: 'Reordene as seções, edite textos e imagens. Visualize em tempo real no preview.'
  },
  {
    icon: CreditCard,
    title: 'Configure Pagamentos',
    description: 'Ative Mercado Pago para receber online ou use WhatsApp para pagamento na entrega.'
  }
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { store, settings, refreshStore } = useAdmin();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showingTutorialAnimation, setShowingTutorialAnimation] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1 - Store basics
    whatsapp_number: settings?.whatsapp_number || '',
    
    // Step 2 - Visual
    logo_url: settings?.logo_url || '',
    primary_color: settings?.primary_color || '#3b82f6',
    banner_title: settings?.banner_title || 'Bem-vindo à nossa loja!',
    banner_subtitle: settings?.banner_subtitle || 'Confira nossos produtos em destaque',
    
    // Step 3 - Payments
    accept_pix: settings?.accept_pix ?? true,
    accept_card: settings?.accept_card ?? true,
    accept_cash: settings?.accept_cash ?? true,
    pix_key: settings?.pix_key || '',
    delivery_fee: settings?.delivery_fee?.toString() || '5.99',
    min_order_value: settings?.min_order_value?.toString() || '30.00'
  });

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      setFormData({
        whatsapp_number: settings.whatsapp_number || '',
        logo_url: settings.logo_url || '',
        primary_color: settings.primary_color || '#3b82f6',
        banner_title: settings.banner_title || 'Bem-vindo à nossa loja!',
        banner_subtitle: settings.banner_subtitle || 'Confira nossos produtos em destaque',
        accept_pix: settings.accept_pix ?? true,
        accept_card: settings.accept_card ?? true,
        accept_cash: settings.accept_cash ?? true,
        pix_key: settings.pix_key || '',
        delivery_fee: settings.delivery_fee?.toString() || '5.99',
        min_order_value: settings.min_order_value?.toString() || '30.00'
      });
    }
  }, [settings]);

  const handleNext = async () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipToFinish = async () => {
    await handleFinish();
  };

  const handleFinish = async () => {
    if (!store) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('store_settings')
        .update({
          whatsapp_number: formData.whatsapp_number || null,
          logo_url: formData.logo_url || null,
          primary_color: formData.primary_color,
          banner_title: formData.banner_title,
          banner_subtitle: formData.banner_subtitle,
          accept_pix: formData.accept_pix,
          accept_card: formData.accept_card,
          accept_cash: formData.accept_cash,
          pix_key: formData.pix_key || null,
          delivery_fee: parseFloat(formData.delivery_fee),
          min_order_value: parseFloat(formData.min_order_value),
          onboarding_completed: true
        })
        .eq('store_id', store.id);

      if (error) throw error;

      await refreshStore();
      toast.success('🎉 Sua loja está pronta!');
      navigate('/admin');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Vamos configurar sua loja!</h2>
              <p className="text-muted-foreground">
                Comece informando como seus clientes vão entrar em contato
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Nome da loja</p>
                <p className="text-2xl font-bold" style={{ color: formData.primary_color }}>
                  {store?.name}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Sua URL: <span className="font-mono text-foreground">/loja/{store?.slug}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">Número do WhatsApp *</Label>
                <Input
                  id="whatsapp"
                  placeholder="5511999999999"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  📱 Os pedidos serão enviados para este número
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Personalize sua loja</h2>
              <p className="text-muted-foreground">
                Deixe sua loja com a sua cara
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Logo da loja</Label>
                <div className="w-28 h-28 mx-auto">
                  <ImageUpload
                    storeId={store?.id || ''}
                    value={formData.logo_url}
                    onChange={(url) => setFormData({ ...formData, logo_url: url })}
                    onRemove={() => setFormData({ ...formData, logo_url: '' })}
                    folder="logos"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Clique para fazer upload
                </p>
              </div>

              <div className="space-y-2">
                <Label>Cor principal</Label>
                <div className="flex gap-2 justify-center flex-wrap p-3 bg-muted rounded-lg">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-9 h-9 rounded-full transition-all ${
                        formData.primary_color === color 
                          ? 'ring-2 ring-offset-2 ring-foreground scale-110 shadow-lg' 
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, primary_color: color })}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner_title">Título do banner</Label>
                <Input
                  id="banner_title"
                  placeholder="Bem-vindo à nossa loja!"
                  value={formData.banner_title}
                  onChange={(e) => setFormData({ ...formData, banner_title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner_subtitle">Subtítulo</Label>
                <Input
                  id="banner_subtitle"
                  placeholder="Confira nossos produtos"
                  value={formData.banner_subtitle}
                  onChange={(e) => setFormData({ ...formData, banner_subtitle: e.target.value })}
                />
              </div>

              {/* Preview */}
              <div 
                className="p-4 rounded-xl text-center"
                style={{ 
                  backgroundColor: `${formData.primary_color}15`,
                  borderColor: `${formData.primary_color}30`,
                  borderWidth: 1
                }}
              >
                <p className="text-xs text-muted-foreground mb-2">Preview do Banner</p>
                <h3 
                  className="text-lg font-bold"
                  style={{ color: formData.primary_color }}
                >
                  {formData.banner_title || 'Bem-vindo!'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formData.banner_subtitle || 'Confira nossos produtos'}
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Formas de pagamento</h2>
              <p className="text-muted-foreground">
                Defina como seus clientes podem pagar
              </p>
            </div>

            <div className="space-y-3">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💸</span>
                      <div>
                        <p className="font-medium">Pix</p>
                        <p className="text-sm text-muted-foreground">Recebimento instantâneo</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.accept_pix}
                      onCheckedChange={(checked) => setFormData({ ...formData, accept_pix: checked })}
                    />
                  </div>
                  
                  {formData.accept_pix && (
                    <div className="mt-4 pt-4 border-t">
                      <Label htmlFor="pix_key" className="text-sm">Sua chave Pix</Label>
                      <Input
                        id="pix_key"
                        className="mt-2"
                        placeholder="email@exemplo.com ou CPF"
                        value={formData.pix_key}
                        onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💳</span>
                    <div>
                      <p className="font-medium">Cartão na entrega</p>
                      <p className="text-sm text-muted-foreground">Maquininha do entregador</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.accept_card}
                    onCheckedChange={(checked) => setFormData({ ...formData, accept_card: checked })}
                  />
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💵</span>
                    <div>
                      <p className="font-medium">Dinheiro</p>
                      <p className="text-sm text-muted-foreground">Pagamento em espécie</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.accept_cash}
                    onCheckedChange={(checked) => setFormData({ ...formData, accept_cash: checked })}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="delivery_fee">Taxa de entrega</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                  <Input
                    id="delivery_fee"
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-9"
                    value={formData.delivery_fee}
                    onChange={(e) => setFormData({ ...formData, delivery_fee: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_order">Pedido mínimo</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                  <Input
                    id="min_order"
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-9"
                    value={formData.min_order_value}
                    onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4">
                <Play className="h-4 w-4" />
                Tutorial Rápido
              </div>
              <h2 className="text-2xl font-bold mb-2">Como usar sua loja</h2>
              <p className="text-muted-foreground">
                Aprenda em poucos minutos
              </p>
            </div>

            <div className="space-y-4">
              {TUTORIAL_STEPS.map((step, index) => (
                <div 
                  key={index}
                  className="flex gap-4 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                >
                  <div 
                    className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${formData.primary_color}20` }}
                  >
                    <step.icon className="h-6 w-6" style={{ color: formData.primary_color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
              <p className="text-sm text-center">
                💡 <strong>Dica:</strong> Você pode acessar o construtor visual a qualquer momento pelo menu lateral
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6">
            <div 
              className="h-20 w-20 rounded-full flex items-center justify-center mx-auto animate-pulse"
              style={{ backgroundColor: `${formData.primary_color}20` }}
            >
              <Sparkles className="h-10 w-10" style={{ color: formData.primary_color }} />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-2">Tudo pronto! 🎉</h2>
              <p className="text-muted-foreground">
                Sua loja está configurada e pronta para receber pedidos
              </p>
            </div>

            <div className="bg-muted rounded-xl p-5 text-left space-y-4">
              <p className="font-semibold text-center">O que fazer agora:</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold" style={{ color: formData.primary_color }}>1</span>
                  </div>
                  <div>
                    <p className="font-medium">Cadastre seus produtos</p>
                    <p className="text-sm text-muted-foreground">Adicione fotos, preços e descrições</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold" style={{ color: formData.primary_color }}>2</span>
                  </div>
                  <div>
                    <p className="font-medium">Personalize o layout</p>
                    <p className="text-sm text-muted-foreground">Use o construtor visual drag-and-drop</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold" style={{ color: formData.primary_color }}>3</span>
                  </div>
                  <div>
                    <p className="font-medium">Compartilhe sua loja</p>
                    <p className="text-sm text-muted-foreground">Envie o link para seus clientes</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Badge variant="outline" className="text-sm">
                🔗 /loja/{store?.slug}
              </Badge>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col">
      {/* Progress */}
      <div className="bg-background/80 backdrop-blur-sm border-b py-4 sticky top-0 z-10">
        <div className="container max-w-lg">
          <div className="flex items-center justify-between px-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={`
                    flex items-center justify-center w-9 h-9 rounded-full
                    transition-all duration-300
                    ${currentStep >= step.id 
                      ? 'text-primary-foreground shadow-lg' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}
                  style={currentStep >= step.id ? { backgroundColor: formData.primary_color } : undefined}
                >
                  {currentStep > step.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div 
                    className={`
                      w-6 sm:w-10 h-0.5 mx-0.5
                      transition-colors duration-300
                    `}
                    style={currentStep > step.id ? { backgroundColor: formData.primary_color } : { backgroundColor: 'hsl(var(--muted))' }}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Passo {currentStep} de {STEPS.length}: <span className="font-medium text-foreground">{STEPS[currentStep - 1].title}</span>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container max-w-lg py-6 px-4">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            {renderStep()}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                disabled={loading}
                className="flex-1"
                style={{ backgroundColor: formData.primary_color }}
              >
                {currentStep === 5 ? (
                  loading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Começar a vender!
                    </>
                  )
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Skip option */}
            {currentStep < 5 && (
              <button
                type="button"
                onClick={handleSkipToFinish}
                className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Pular e configurar depois
              </button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
