import { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { toast } from 'sonner';
import { Palette, Layout, Save, Image as ImageIcon, ExternalLink } from 'lucide-react';

export default function StoreBuilderPage() {
  const { store, settings, updateSettings, loading } = useAdmin();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    banner_title: '',
    banner_subtitle: '',
    banner_image_url: '',
    primary_color: '#000000',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        banner_title: settings.banner_title || '',
        banner_subtitle: settings.banner_subtitle || '',
        banner_image_url: settings.banner_image_url || '',
        primary_color: settings.primary_color || '#000000',
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateSettings(formData);
    setSaving(false);
    if (error) {
      toast.error('Erro ao salvar alterações');
    } else {
      toast.success('Loja atualizada com sucesso!');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Construtor da Loja</h1>
          <p className="text-muted-foreground">Personalize a aparência da sua loja virtual</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => window.open(`/loja/${store?.slug}`, '_blank')}>
            Ver Loja <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1 sm:flex-none">
            {saving ? 'Salvando...' : 'Salvar Alterações'}
            <Save className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar de Configurações */}
        <div className="lg:col-span-1 space-y-6">
          <Tabs defaultValue="banner" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="banner" className="flex-1">Banner</TabsTrigger>
              <TabsTrigger value="appearance" className="flex-1">Aparência</TabsTrigger>
            </TabsList>

            <TabsContent value="banner" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ImageIcon className="h-5 w-5" />
                    Banner Principal
                  </CardTitle>
                  <CardDescription>
                    Configure a imagem e textos de destaque da sua loja.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Imagem de Fundo</Label>
                    <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25 flex items-center justify-center relative group">
                       <div className="absolute inset-0 z-10 p-2">
                         <ImageUpload
                            storeId={store?.id || ''}
                            value={formData.banner_image_url}
                            onChange={(url) => setFormData({ ...formData, banner_image_url: url })}
                            onRemove={() => setFormData({ ...formData, banner_image_url: '' })}
                            folder="banners"
                          />
                       </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Recomendado: 1920x600px</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Título Principal</Label>
                    <Input 
                      value={formData.banner_title} 
                      onChange={(e) => setFormData({...formData, banner_title: e.target.value})}
                      placeholder="Ex: Ofertas de Verão"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Subtítulo</Label>
                    <Textarea 
                      value={formData.banner_subtitle} 
                      onChange={(e) => setFormData({...formData, banner_subtitle: e.target.value})}
                      placeholder="Ex: Descontos de até 50% em toda a loja"
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Palette className="h-5 w-5" />
                    Cores da Marca
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Cor Primária</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        value={formData.primary_color}
                        onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input 
                        value={formData.primary_color}
                        onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Usada em botões, links e destaques.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col overflow-hidden border-2">
            <CardHeader className="border-b bg-muted/30 py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  Pré-visualização ao vivo
                </CardTitle>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
              </div>
            </CardHeader>
            <div className="flex-1 bg-background relative overflow-y-auto">
              {/* Simulated Storefront Header */}
              <div className="border-b bg-background/95 backdrop-blur p-4 flex items-center justify-between sticky top-0 z-20">
                <span className="font-bold text-xl" style={{ color: formData.primary_color }}>{store?.name}</span>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="hidden sm:inline">Início</span>
                  <span className="hidden sm:inline">Produtos</span>
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs">🛒</span>
                  </div>
                </div>
              </div>

              {/* Simulated Hero Section */}
              <div className="relative bg-primary/5 py-20 md:py-32 overflow-hidden">
                {formData.banner_image_url && (
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={formData.banner_image_url} 
                      alt="Banner Preview" 
                      className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                  </div>
                )}
                <div className="container relative z-10 text-center px-4">
                  <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight text-foreground">
                    {formData.banner_title || `Bem-vindo à ${store?.name}`}
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                    {formData.banner_subtitle || 'Confira nossos produtos em destaque e aproveite as ofertas.'}
                  </p>
                  <Button 
                    size="lg" 
                    className="rounded-full px-8 text-lg h-12 shadow-lg"
                    style={{ backgroundColor: formData.primary_color }}
                  >
                    Ver Produtos
                  </Button>
                </div>
              </div>

              {/* Placeholder for products */}
              <div className="container py-12 px-4">
                <h3 className="text-xl font-bold mb-6">Destaques</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="border rounded-lg overflow-hidden bg-card shadow-sm">
                        <div className="aspect-square bg-muted animate-pulse" />
                        <div className="p-4 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}