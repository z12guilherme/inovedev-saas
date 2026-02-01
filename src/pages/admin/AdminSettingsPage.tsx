import { useState, useEffect } from 'react';
import { Save, ExternalLink, Copy, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { useAdmin } from '@/contexts/AdminContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PRESET_COLORS = [
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f97316', // Orange
  '#ef4444', // Red
  '#14b8a6', // Teal
  '#eab308', // Yellow
];

export default function AdminSettingsPage() {
  const { store, settings, refreshStore } = useAdmin();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    logo_url: settings?.logo_url || '',
    whatsapp_number: settings?.whatsapp_number || '',
    primary_color: settings?.primary_color || '#22c55e',
    delivery_fee: settings?.delivery_fee?.toString() || '5.99',
    min_order_value: settings?.min_order_value?.toString() || '30.00',
    banner_title: settings?.banner_title || '',
    banner_subtitle: settings?.banner_subtitle || ''
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        logo_url: settings.logo_url || '',
        whatsapp_number: settings.whatsapp_number || '',
        primary_color: settings.primary_color || '#22c55e',
        delivery_fee: settings.delivery_fee?.toString() || '5.99',
        min_order_value: settings.min_order_value?.toString() || '30.00',
        banner_title: settings.banner_title || '',
        banner_subtitle: settings.banner_subtitle || ''
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('store_settings')
        .update({
          logo_url: formData.logo_url || null,
          whatsapp_number: formData.whatsapp_number || null,
          primary_color: formData.primary_color,
          delivery_fee: parseFloat(formData.delivery_fee),
          min_order_value: parseFloat(formData.min_order_value),
          banner_title: formData.banner_title,
          banner_subtitle: formData.banner_subtitle
        })
        .eq('store_id', store.id);

      if (error) throw error;

      await refreshStore();
      toast.success('Configurações salvas!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const storeUrl = store ? `${window.location.origin}/loja/${store.slug}` : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    toast.success('Link copiado!');
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Personalize sua loja online</p>
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
              <Button variant="outline" onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
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
          {/* Logo and Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Identidade Visual
              </CardTitle>
              <CardDescription>Logo e cores da sua loja</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Logo da loja</Label>
                <div className="w-32 h-32">
                  <ImageUpload
                    storeId={store?.id || ''}
                    value={formData.logo_url}
                    onChange={(url) => setFormData({ ...formData, logo_url: url })}
                    onRemove={() => setFormData({ ...formData, logo_url: '' })}
                    folder="logos"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Recomendado: imagem quadrada, mínimo 200x200px
                </p>
              </div>

              <div className="space-y-2">
                <Label>Cor principal</Label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-10 h-10 rounded-lg transition-all ${
                        formData.primary_color === color 
                          ? 'ring-2 ring-offset-2 ring-foreground scale-110' 
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, primary_color: color })}
                    />
                  ))}
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="w-10 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="w-24 font-mono text-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
