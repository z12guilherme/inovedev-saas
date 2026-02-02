import { useState, useEffect } from 'react';
import { Save, CreditCard, QrCode, Banknote, AlertCircle, Check, ExternalLink, HelpCircle, PlayCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function PaymentsPage() {
  const { store, settings, refreshStore } = useAdmin();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    accept_pix: settings?.accept_pix ?? true,
    accept_card: settings?.accept_card ?? true,
    accept_cash: settings?.accept_cash ?? true,
    pix_key: settings?.pix_key || '',
    mercadopago_enabled: false,
    mercadopago_public_key: '',
    mercadopago_access_token: ''
  });

  useEffect(() => {
    if (settings) {
      // Fetch MP settings from DB
      fetchMercadoPagoSettings();
    }
  }, [settings]);

  const fetchMercadoPagoSettings = async () => {
    if (!store) return;
    
    const { data } = await supabase
      .from('store_settings')
      .select('mercadopago_enabled, mercadopago_public_key')
      .eq('store_id', store.id)
      .single();

    if (data) {
      setFormData(prev => ({
        ...prev,
        accept_pix: settings?.accept_pix ?? true,
        accept_card: settings?.accept_card ?? true,
        accept_cash: settings?.accept_cash ?? true,
        pix_key: settings?.pix_key || '',
        mercadopago_enabled: data.mercadopago_enabled || false,
        mercadopago_public_key: data.mercadopago_public_key || ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;

    setLoading(true);

    try {
      const updateData: Record<string, any> = {
        accept_pix: formData.accept_pix,
        accept_card: formData.accept_card,
        accept_cash: formData.accept_cash,
        pix_key: formData.pix_key || null,
        mercadopago_enabled: formData.mercadopago_enabled,
        mercadopago_public_key: formData.mercadopago_public_key || null
      };

      // Only update access token if provided (security measure)
      if (formData.mercadopago_access_token) {
        updateData.mercadopago_access_token = formData.mercadopago_access_token;
      }

      const { error } = await supabase
        .from('store_settings')
        .update(updateData)
        .eq('store_id', store.id);

      if (error) throw error;

      await refreshStore();
      toast.success('Configurações salvas!');
      
      // Clear sensitive field
      setFormData(prev => ({ ...prev, mercadopago_access_token: '' }));
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Pagamentos</h1>
          <p className="text-muted-foreground">Configure como receber pagamentos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Traditional Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Pagamentos na Entrega
              </CardTitle>
              <CardDescription>
                Formas de pagamento aceitas no momento da entrega
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <QrCode className="h-5 w-5 text-primary" />
                  <div>
                    <Label htmlFor="accept_pix" className="font-medium">Pix</Label>
                    <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                  </div>
                </div>
                <Switch
                  id="accept_pix"
                  checked={formData.accept_pix}
                  onCheckedChange={(checked) => setFormData({ ...formData, accept_pix: checked })}
                />
              </div>

              {formData.accept_pix && (
                <div className="ml-12 p-4 bg-muted rounded-lg">
                  <Label htmlFor="pix_key">Chave Pix</Label>
                  <Input
                    id="pix_key"
                    className="mt-2"
                    placeholder="email@exemplo.com, CPF, telefone ou chave aleatória"
                    value={formData.pix_key}
                    onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Esta chave será mostrada ao cliente para pagamento
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <Label htmlFor="accept_card" className="font-medium">Cartão na entrega</Label>
                    <p className="text-sm text-muted-foreground">Maquininha no momento da entrega</p>
                  </div>
                </div>
                <Switch
                  id="accept_card"
                  checked={formData.accept_card}
                  onCheckedChange={(checked) => setFormData({ ...formData, accept_card: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Banknote className="h-5 w-5 text-primary" />
                  <div>
                    <Label htmlFor="accept_cash" className="font-medium">Dinheiro</Label>
                    <p className="text-sm text-muted-foreground">Pagamento em espécie</p>
                  </div>
                </div>
                <Switch
                  id="accept_cash"
                  checked={formData.accept_cash}
                  onCheckedChange={(checked) => setFormData({ ...formData, accept_cash: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Mercado Pago */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <img 
                      src="https://http2.mlstatic.com/frontend-assets/mp-web-navigation/ui-navigation/5.21.22/mercadopago/logo__large@2x.png" 
                      alt="Mercado Pago" 
                      className="h-5"
                    />
                    Mercado Pago
                  </CardTitle>
                  <CardDescription>
                    Aceite pagamentos online com Pix e cartão
                  </CardDescription>
                </div>
                <Badge variant={formData.mercadopago_enabled ? "default" : "secondary"}>
                  {formData.mercadopago_enabled ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Ativo
                    </>
                  ) : (
                    'Desativado'
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="mercadopago_enabled" className="font-medium">
                    Ativar Mercado Pago
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receba pagamentos online diretamente na sua conta
                  </p>
                </div>
                <Switch
                  id="mercadopago_enabled"
                  checked={formData.mercadopago_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, mercadopago_enabled: checked })}
                />
              </div>

              {formData.mercadopago_enabled && (
                <div className="space-y-4 pt-4">
                  {/* Manual de Integração Integrado */}
                  <Accordion type="single" collapsible className="w-full border rounded-lg bg-blue-50/50 border-blue-100">
                    <AccordionItem value="guide" className="border-b-0">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline group">
                        <div className="flex items-center gap-2 text-sm font-medium text-blue-700 group-hover:text-blue-800">
                          <HelpCircle className="h-4 w-4" />
                          Como obter minhas credenciais do Mercado Pago?
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground space-y-4">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-foreground flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">1</span>
                                Criar Aplicação
                              </h4>
                              <p className="pl-8 text-xs leading-relaxed">
                                Acesse o <a href="https://www.mercadopago.com.br/developers/panel/app" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 font-medium">Painel de Desenvolvedores</a>.
                                Clique em <strong>"Criar aplicação"</strong> e selecione a opção <strong>"Checkout Pro"</strong>.
                              </p>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-semibold text-foreground flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">2</span>
                                Ativar Credenciais
                              </h4>
                              <p className="pl-8 text-xs leading-relaxed">
                                No menu lateral da sua aplicação, vá em <strong>"Credenciais de Produção"</strong>.
                                Você precisará ativar as credenciais preenchendo o formulário de "Indústria" e "Site".
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-foreground flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">3</span>
                                Copiar Chaves
                              </h4>
                              <p className="pl-8 text-xs leading-relaxed">
                                Copie a <strong>Public Key</strong> e o <strong>Access Token</strong>.
                                Cole nos campos abaixo e clique em Salvar.
                              </p>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-xs text-yellow-800">
                              <div className="flex items-center gap-2 font-bold mb-1">
                                <AlertTriangle className="h-3 w-3" />
                                Importante:
                              </div>
                              Não use as "Credenciais de Teste" se quiser vender de verdade. Use as de <strong>Produção</strong>.
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white p-3 rounded-md text-xs border border-blue-100 flex items-center gap-3 shadow-sm">
                          <PlayCircle className="h-8 w-8 text-blue-600 flex-shrink-0" />
                          <div>
                            <strong className="text-blue-900">Precisa de ajuda visual?</strong><br/>
                            <a href="https://www.youtube.com/results?search_query=como+pegar+credenciais+mercado+pago" target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800">
                              Assista a um tutorial no YouTube
                            </a>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="space-y-2">
                    <Label htmlFor="mp_public_key">Public Key</Label>
                    <Input
                      id="mp_public_key"
                      placeholder="APP_USR-xxxxxxxx"
                      value={formData.mercadopago_public_key}
                      onChange={(e) => setFormData({ ...formData, mercadopago_public_key: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mp_access_token">Access Token</Label>
                    <Input
                      id="mp_access_token"
                      type="password"
                      placeholder="APP_USR-xxxxxxxx"
                      value={formData.mercadopago_access_token}
                      onChange={(e) => setFormData({ ...formData, mercadopago_access_token: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Sua chave secreta. Deixe em branco para manter a atual.
                    </p>
                  </div>

                  <Separator />

                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Taxas do Mercado Pago</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Pix: Taxa zero para recebimentos</li>
                      <li>• Cartão de crédito: 4,99% por transação</li>
                      <li>• Parcelado: Taxa adicional conforme parcelas</li>
                    </ul>
                    <Button variant="link" className="p-0 h-auto mt-2" asChild>
                      <a 
                        href="https://www.mercadopago.com.br/ajuda/custos-de-receber-pagamentos_220" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Ver tabela de taxas completa
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button type="submit" disabled={loading} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar configurações'}
          </Button>
        </form>
      </div>
    </AdminLayout>
  );
}