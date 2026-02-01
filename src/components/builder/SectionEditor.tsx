import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Section, SectionType } from '@/types/builder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUpload } from '@/components/admin/ImageUpload';

interface SectionEditorProps {
  section: Section | null;
  storeId: string;
  categories: { id: string; name: string }[];
  onSave: (section: Section) => void;
  onClose: () => void;
}

export function SectionEditor({ section, storeId, categories, onSave, onClose }: SectionEditorProps) {
  const [editedSection, setEditedSection] = useState<Section | null>(null);

  useEffect(() => {
    setEditedSection(section);
  }, [section]);

  if (!editedSection) return null;

  const updateContent = (key: string, value: any) => {
    setEditedSection({
      ...editedSection,
      content: { ...editedSection.content, [key]: value }
    });
  };

  const updateSettings = (key: string, value: any) => {
    setEditedSection({
      ...editedSection,
      settings: { ...editedSection.settings, [key]: value }
    });
  };

  const handleSave = () => {
    if (editedSection) {
      onSave(editedSection);
    }
  };

  const renderContentFields = () => {
    switch (editedSection.section_type) {
      case 'banner':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Imagem do Banner</Label>
              <div className="h-40">
                <ImageUpload
                  storeId={storeId}
                  value={editedSection.content.image_url || ''}
                  onChange={(url) => updateContent('image_url', url)}
                  onRemove={() => updateContent('image_url', '')}
                  folder="banners"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner_title">Título</Label>
              <Input
                id="banner_title"
                value={editedSection.content.title || ''}
                onChange={(e) => updateContent('title', e.target.value)}
                placeholder="Bem-vindo à nossa loja!"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner_subtitle">Subtítulo</Label>
              <Input
                id="banner_subtitle"
                value={editedSection.content.subtitle || ''}
                onChange={(e) => updateContent('subtitle', e.target.value)}
                placeholder="Confira nossos produtos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="button_text">Texto do Botão</Label>
              <Input
                id="button_text"
                value={editedSection.content.button_text || ''}
                onChange={(e) => updateContent('button_text', e.target.value)}
                placeholder="Ver produtos"
              />
            </div>
          </div>
        );

      case 'featured_products':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="limit">Quantidade de produtos</Label>
              <Select
                value={String(editedSection.content.limit || 4)}
                onValueChange={(v) => updateContent('limit', parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 produtos</SelectItem>
                  <SelectItem value="4">4 produtos</SelectItem>
                  <SelectItem value="6">6 produtos</SelectItem>
                  <SelectItem value="8">8 produtos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'product_grid':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={editedSection.content.category_id || 'all'}
                onValueChange={(v) => updateContent('category_id', v === 'all' ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os produtos</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="limit">Quantidade de produtos</Label>
              <Select
                value={String(editedSection.content.limit || 8)}
                onValueChange={(v) => updateContent('limit', parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 produtos</SelectItem>
                  <SelectItem value="8">8 produtos</SelectItem>
                  <SelectItem value="12">12 produtos</SelectItem>
                  <SelectItem value="16">16 produtos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'text_block':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text_title">Título</Label>
              <Input
                id="text_title"
                value={editedSection.content.title || ''}
                onChange={(e) => updateContent('title', e.target.value)}
                placeholder="Título"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="text_subtitle">Subtítulo</Label>
              <Input
                id="text_subtitle"
                value={editedSection.content.subtitle || ''}
                onChange={(e) => updateContent('subtitle', e.target.value)}
                placeholder="Subtítulo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="text_content">Texto</Label>
              <Textarea
                id="text_content"
                value={editedSection.content.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                placeholder="Seu texto aqui..."
                rows={4}
              />
            </div>
          </div>
        );

      case 'cta_button':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cta_text">Texto do Botão</Label>
              <Input
                id="cta_text"
                value={editedSection.content.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                placeholder="Fale conosco"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link_type">Tipo de Link</Label>
              <Select
                value={editedSection.content.link_type || 'whatsapp'}
                onValueChange={(v) => updateContent('link_type', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp da loja</SelectItem>
                  <SelectItem value="external">Link externo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editedSection.content.link_type === 'external' && (
              <div className="space-y-2">
                <Label htmlFor="cta_link">URL</Label>
                <Input
                  id="cta_link"
                  value={editedSection.content.link || ''}
                  onChange={(e) => updateContent('link', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            )}
          </div>
        );

      case 'divider':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="divider_style">Estilo</Label>
              <Select
                value={editedSection.settings.style || 'line'}
                onValueChange={(v) => updateSettings('style', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Linha</SelectItem>
                  <SelectItem value="space">Espaço</SelectItem>
                  <SelectItem value="dots">Pontos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return <p className="text-muted-foreground">Configurações não disponíveis</p>;
    }
  };

  const renderSettingsFields = () => {
    switch (editedSection.section_type) {
      case 'banner':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="height">Altura</Label>
              <Select
                value={editedSection.settings.height || 'medium'}
                onValueChange={(v) => updateSettings('height', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequena</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="overlay">Overlay escuro</Label>
              <Switch
                id="overlay"
                checked={editedSection.settings.overlay ?? true}
                onCheckedChange={(v) => updateSettings('overlay', v)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="text_align">Alinhamento do texto</Label>
              <Select
                value={editedSection.settings.text_align || 'center'}
                onValueChange={(v) => updateSettings('text_align', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'featured_products':
      case 'product_grid':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="columns">Colunas</Label>
              <Select
                value={String(editedSection.settings.columns || 4)}
                onValueChange={(v) => updateSettings('columns', parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 colunas</SelectItem>
                  <SelectItem value="3">3 colunas</SelectItem>
                  <SelectItem value="4">4 colunas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show_price">Mostrar preço</Label>
              <Switch
                id="show_price"
                checked={editedSection.settings.show_price ?? true}
                onCheckedChange={(v) => updateSettings('show_price', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show_button">Mostrar botão</Label>
              <Switch
                id="show_button"
                checked={editedSection.settings.show_button ?? true}
                onCheckedChange={(v) => updateSettings('show_button', v)}
              />
            </div>
          </div>
        );

      case 'text_block':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text_align">Alinhamento</Label>
              <Select
                value={editedSection.settings.text_align || 'center'}
                onValueChange={(v) => updateSettings('text_align', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="background">Fundo</Label>
              <Select
                value={editedSection.settings.background || 'transparent'}
                onValueChange={(v) => updateSettings('background', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transparent">Transparente</SelectItem>
                  <SelectItem value="muted">Cinza</SelectItem>
                  <SelectItem value="primary">Cor primária</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'cta_button':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="size">Tamanho</Label>
              <Select
                value={editedSection.settings.size || 'large'}
                onValueChange={(v) => updateSettings('size', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequeno</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="variant">Estilo</Label>
              <Select
                value={editedSection.settings.variant || 'primary'}
                onValueChange={(v) => updateSettings('variant', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primário</SelectItem>
                  <SelectItem value="secondary">Secundário</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Sheet open={!!section} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Seção</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <Tabs defaultValue="content">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="mt-4">
              {renderContentFields()}
            </TabsContent>
            <TabsContent value="settings" className="mt-4">
              {renderSettingsFields() || (
                <p className="text-muted-foreground text-sm">
                  Nenhuma configuração adicional disponível
                </p>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 mt-8">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}