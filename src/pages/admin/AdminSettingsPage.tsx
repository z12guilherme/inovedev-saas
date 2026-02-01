import { useState } from 'react';
import { Save, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const { store, settings, updateSettings, refreshStore } = useAdmin();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    whatsapp_number: settings?.whatsapp_number || '',
    primary_color: settings?.primary_color || '#22c55e',
    accept_pix: settings?.accept_pix ?? true,
    accept_card: settings?.accept_card ?? true,
    accept_cash: settings?.accept_cash ?? true,
    pix_key: settings?.pix_key || '',
    delivery_fee: settings?.delivery_fee?.toString() || '5.99',
    min_order_value: settings?.min_order_value?.toString() || '30.00',
    banner_title: settings?.banner_title || '',
    banner_subtitle: settings?.banner_subtitle || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await updateSettings({
      whatsapp_number: formData.whatsapp_number || null,
      primary_color: formData.primary_color,
      accept_pix: formData.accept_pix,
      accept_card: formData.accept_card,
      accept_cash: formData.accept_cash,
      pix_key: formData.pix_key || null,
      delivery_fee: parseFloat(formData.delivery_fee),
      min_order_value: parseFloat(formData.min_order_value),
      banner_title: formData.banner_title,
      banner_subtitle: formData.banner_subtitle
    });

    if (error) {
      toast.error('Erro ao salvar configurações');
    } else {
      toast.success('Configurações salvas!');
    }

    setLoading(false);
  };

  const storeUrl = store ? `${window.location.origin}/loja/${store.slug}` : '';

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Configure sua loja online</p>
        </div>

        {/* Store URL */}
        <Card>
          <CardHeader>
            <CardTitle>Link da sua loja</CardTitle>
            <CardDescription>Compartilhe este link com seus clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={storeUrl} readOnly className="font-mono text-sm" />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(storeUrl);
                  toast.success('Link copiado!');
                }}
              >
                Copiar
              </Button>
              <Button variant="outline" asChild>
                <a href={storeUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* WhatsApp */}
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp</CardTitle>
              <CardDescription>Número para receber pedidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">Número do WhatsApp</Label>
                <Input
                  id="whatsapp"
                  placeholder="5511999999999"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Formato: código do país + DDD + número (sem espaços ou traços)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Formas de Pagamento</CardTitle>
              <CardDescription>Defina as formas de pagamento aceitas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="accept_pix">Pix</Label>
                  <p className="text-sm text-muted-foreground">Aceitar pagamento via Pix</p>
                </div>
                <Switch
                  id="accept_pix"
                  checked={formData.accept_pix}
                  onCheckedChange={(checked) => setFormData({ ...formData, accept_pix: checked })}
                />
              </div>

              {formData.accept_pix && (
                <div className="space-y-2 ml-0 p-4 bg-muted rounded-lg">
                  <Label htmlFor="pix_key">Chave Pix</Label>
                  <Input
                    id="pix_key"
                    placeholder="email@exemplo.com"
                    value={formData.pix_key}
                    onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
                  />
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="accept_card">Cartão de Crédito</Label>
                  <p className="text-sm text-muted-foreground">Aceitar cartão na entrega</p>
                </div>
                <Switch
                  id="accept_card"
                  checked={formData.accept_card}
                  onCheckedChange={(checked) => setFormData({ ...formData, accept_card: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="accept_cash">Dinheiro</Label>
                  <p className="text-sm text-muted-foreground">Aceitar dinheiro na entrega</p>
                </div>
                <Switch
                  id="accept_cash"
                  checked={formData.accept_cash}
                  onCheckedChange={(checked) => setFormData({ ...formData, accept_cash: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery */}
          <Card>
            <CardHeader>
              <CardTitle>Entrega</CardTitle>
              <CardDescription>Configure taxas e valores mínimos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery_fee">Taxa de Entrega (R$)</Label>
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
                  <Label htmlFor="min_order">Pedido Mínimo (R$)</Label>
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
            </CardContent>
          </Card>

          {/* Banner */}
          <Card>
            <CardHeader>
              <CardTitle>Banner da Loja</CardTitle>
              <CardDescription>Textos exibidos no topo da página</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="banner_title">Título do Banner</Label>
                <Input
                  id="banner_title"
                  placeholder="Ofertas Especiais"
                  value={formData.banner_title}
                  onChange={(e) => setFormData({ ...formData, banner_title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner_subtitle">Subtítulo do Banner</Label>
                <Input
                  id="banner_subtitle"
                  placeholder="Confira nossos produtos em destaque"
                  value={formData.banner_subtitle}
                  onChange={(e) => setFormData({ ...formData, banner_subtitle: e.target.value })}
                />
              </div>
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
