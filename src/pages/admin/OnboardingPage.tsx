import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  Palette, 
  CreditCard, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { useAdmin } from '@/contexts/AdminContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: 'Sua Loja', icon: Store },
  { id: 2, title: 'Visual', icon: Palette },
  { id: 3, title: 'Pagamentos', icon: CreditCard },
  { id: 4, title: 'Pronto!', icon: Sparkles }
];

const PRESET_COLORS = [
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f97316', // Orange
  '#ef4444', // Red
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { store, settings, refreshStore } = useAdmin();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1 - Store basics
    whatsapp_number: settings?.whatsapp_number || '',
    
    // Step 2 - Visual
    logo_url: settings?.logo_url || '',
    primary_color: settings?.primary_color || '#22c55e',
    banner_title: settings?.banner_title || 'Bem-vindo à nossa loja!',
    banner_subtitle: settings?.banner_subtitle || 'Confira nossos produtos',
    
    // Step 3 - Payments
    accept_pix: settings?.accept_pix ?? true,
    accept_card: settings?.accept_card ?? true,
    accept_cash: settings?.accept_cash ?? true,
    pix_key: settings?.pix_key || '',
    delivery_fee: settings?.delivery_fee?.toString() || '5.99',
    min_order_value: settings?.min_order_value?.toString() || '30.00'
  });

  const handleNext = async () => {
    if (currentStep < 4) {
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
      toast.success('Configuração concluída!');
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
              <h2 className="text-2xl font-bold mb-2">Informações básicas</h2>
              <p className="text-muted-foreground">
                Configure como seus clientes vão entrar em contato
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium mb-1">Nome da loja</p>
                <p className="text-2xl font-bold text-primary">{store?.name}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">Número do WhatsApp</Label>
                <Input
                  id="whatsapp"
                  placeholder="5511999999999"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Este número receberá os pedidos dos clientes
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
                <div className="w-32 h-32 mx-auto">
                  <ImageUpload
                    storeId={store?.id || ''}
                    value={formData.logo_url}
                    onChange={(url) => setFormData({ ...formData, logo_url: url })}
                    onRemove={() => setFormData({ ...formData, logo_url: '' })}
                    folder="logos"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cor principal</Label>
                <div className="flex gap-2 justify-center flex-wrap">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-10 h-10 rounded-full transition-transform ${
                        formData.primary_color === color ? 'ring-2 ring-offset-2 ring-foreground scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, primary_color: color })}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner_title">Texto do banner</Label>
                <Input
                  id="banner_title"
                  placeholder="Bem-vindo à nossa loja!"
                  value={formData.banner_title}
                  onChange={(e) => setFormData({ ...formData, banner_title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner_subtitle">Subtítulo do banner</Label>
                <Input
                  id="banner_subtitle"
                  placeholder="Confira nossos produtos"
                  value={formData.banner_subtitle}
                  onChange={(e) => setFormData({ ...formData, banner_subtitle: e.target.value })}
                />
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

            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Pix</p>
                      <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                    </div>
                    <Switch
                      checked={formData.accept_pix}
                      onCheckedChange={(checked) => setFormData({ ...formData, accept_pix: checked })}
                    />
                  </div>
                  
                  {formData.accept_pix && (
                    <div className="mt-4 pt-4 border-t">
                      <Label htmlFor="pix_key">Chave Pix</Label>
                      <Input
                        id="pix_key"
                        className="mt-2"
                        placeholder="email@exemplo.com"
                        value={formData.pix_key}
                        onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Cartão na entrega</p>
                    <p className="text-sm text-muted-foreground">Maquininha no momento da entrega</p>
                  </div>
                  <Switch
                    checked={formData.accept_card}
                    onCheckedChange={(checked) => setFormData({ ...formData, accept_card: checked })}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dinheiro</p>
                    <p className="text-sm text-muted-foreground">Pagamento em espécie</p>
                  </div>
                  <Switch
                    checked={formData.accept_cash}
                    onCheckedChange={(checked) => setFormData({ ...formData, accept_cash: checked })}
                  />
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery_fee">Taxa de entrega (R$)</Label>
                  <Input
                    id="delivery_fee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.delivery_fee}
                    onChange={(e) => setFormData({ ...formData, delivery_fee: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_order">Pedido mínimo (R$)</Label>
                  <Input
                    id="min_order"
                    type="number"
                    step="0.01"
                    min="0"
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
          <div className="text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-2">Tudo pronto!</h2>
              <p className="text-muted-foreground">
                Sua loja está configurada e pronta para vender
              </p>
            </div>

            <div className="bg-muted rounded-lg p-4 text-left space-y-3">
              <p className="font-medium">Próximos passos:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Cadastre seus produtos
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Organize as categorias
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Compartilhe o link da sua loja
                </li>
              </ul>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Progress */}
      <div className="bg-background border-b py-4">
        <div className="container max-w-lg">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full
                  transition-colors
                  ${currentStep >= step.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`
                    w-12 h-0.5 mx-1
                    ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container max-w-lg py-8">
        <Card>
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
              >
                {currentStep === 4 ? (
                  loading ? 'Salvando...' : 'Começar a vender'
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}