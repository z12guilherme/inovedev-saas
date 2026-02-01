import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { 
  Save, 
  Eye, 
  Undo2, 
  Smartphone, 
  Monitor, 
  ArrowLeft,
  Loader2,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdmin } from '@/contexts/AdminContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Section, SectionType, SECTION_TEMPLATES } from '@/types/builder';
import { SectionPalette } from '@/components/builder/SectionPalette';
import { SortableSection } from '@/components/builder/SortableSection';
import { SectionEditor } from '@/components/builder/SectionEditor';
import { SectionPreview } from '@/components/builder/SectionPreview';

export default function StoreBuilderPage() {
  const navigate = useNavigate();
  const { store, settings } = useAdmin();
  const [sections, setSections] = useState<Section[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch data
  useEffect(() => {
    if (!store) return;

    const fetchData = async () => {
      try {
        // Fetch sections
        const { data: sectionsData } = await supabase
          .from('store_sections')
          .select('*')
          .eq('store_id', store.id)
          .order('sort_order');

        // Transform to Section type
        const transformedSections: Section[] = (sectionsData || []).map(s => ({
          id: s.id,
          store_id: s.store_id,
          section_type: s.section_type as SectionType,
          title: s.title,
          subtitle: s.subtitle,
          content: (s.content as Record<string, any>) || {},
          settings: (s.settings as Record<string, any>) || {},
          sort_order: s.sort_order,
          is_visible: s.is_visible
        }));

        setSections(transformedSections);

        // Fetch products
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', store.id)
          .eq('is_active', true);

        setProducts(productsData || []);

        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .eq('store_id', store.id)
          .order('sort_order');

        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [store]);

  // Handle drag events
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Check if dragging from palette
    if (active.id.toString().startsWith('template-')) {
      const template = active.data.current?.template;
      if (template && store) {
        const newSection: Section = {
          id: crypto.randomUUID(),
          store_id: store.id,
          section_type: template.type,
          title: null,
          subtitle: null,
          content: { ...template.defaultContent },
          settings: { ...template.defaultSettings },
          sort_order: sections.length,
          is_visible: true
        };
        setSections([...sections, newSection]);
        setHasChanges(true);
        toast.success('Seção adicionada!');
      }
      return;
    }

    // Reordering existing sections
    if (active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newSections = arrayMove(sections, oldIndex, newIndex).map((s, i) => ({
          ...s,
          sort_order: i
        }));
        setSections(newSections);
        setHasChanges(true);
      }
    }
  };

  // Section actions
  const handleToggleVisibility = (id: string) => {
    setSections(sections.map(s => 
      s.id === id ? { ...s, is_visible: !s.is_visible } : s
    ));
    setHasChanges(true);
  };

  const handleDeleteSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
    setHasChanges(true);
    toast.success('Seção removida');
  };

  const handleDuplicateSection = (section: Section) => {
    const newSection: Section = {
      ...section,
      id: crypto.randomUUID(),
      sort_order: sections.length
    };
    setSections([...sections, newSection]);
    setHasChanges(true);
    toast.success('Seção duplicada');
  };

  const handleEditSection = (section: Section) => {
    setEditingSection(section);
  };

  const handleSaveSection = (updatedSection: Section) => {
    setSections(sections.map(s => 
      s.id === updatedSection.id ? updatedSection : s
    ));
    setEditingSection(null);
    setHasChanges(true);
  };

  // Save all changes
  const handleSaveAll = async () => {
    if (!store) return;

    setSaving(true);
    try {
      // Delete all existing sections
      await supabase
        .from('store_sections')
        .delete()
        .eq('store_id', store.id);

      // Insert all sections
      if (sections.length > 0) {
        const { error } = await supabase
          .from('store_sections')
          .insert(sections.map((s, i) => ({
            ...s,
            sort_order: i,
            store_id: store.id
          })));

        if (error) throw error;
      }

      // Update layout_published flag
      await supabase
        .from('store_settings')
        .update({ layout_published: true })
        .eq('store_id', store.id);

      setHasChanges(false);
      toast.success('Layout salvo com sucesso!');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Erro ao salvar layout');
    } finally {
      setSaving(false);
    }
  };

  // Create default layout
  const handleCreateDefaultLayout = () => {
    if (!store) return;

    const defaultSections: Section[] = [
      {
        id: crypto.randomUUID(),
        store_id: store.id,
        section_type: 'banner',
        title: null,
        subtitle: null,
        content: {
          image_url: '',
          title: settings?.banner_title || 'Bem-vindo à nossa loja!',
          subtitle: settings?.banner_subtitle || 'Confira nossos produtos',
          button_text: 'Ver produtos'
        },
        settings: { height: 'medium', overlay: true, text_align: 'center' },
        sort_order: 0,
        is_visible: true
      },
      {
        id: crypto.randomUUID(),
        store_id: store.id,
        section_type: 'category_list',
        title: 'Categorias',
        subtitle: null,
        content: {},
        settings: { layout: 'horizontal' },
        sort_order: 1,
        is_visible: true
      },
      {
        id: crypto.randomUUID(),
        store_id: store.id,
        section_type: 'featured_products',
        title: 'Destaques',
        subtitle: null,
        content: { limit: 4 },
        settings: { columns: 4, show_price: true, show_button: true },
        sort_order: 2,
        is_visible: true
      },
      {
        id: crypto.randomUUID(),
        store_id: store.id,
        section_type: 'product_grid',
        title: 'Todos os Produtos',
        subtitle: null,
        content: { category_id: null, limit: 8 },
        settings: { columns: 4, show_price: true, show_button: true },
        sort_order: 3,
        is_visible: true
      },
      {
        id: crypto.randomUUID(),
        store_id: store.id,
        section_type: 'cta_button',
        title: null,
        subtitle: null,
        content: { text: 'Fale conosco pelo WhatsApp', link_type: 'whatsapp' },
        settings: { size: 'large', variant: 'primary' },
        sort_order: 4,
        is_visible: true
      }
    ];

    setSections(defaultSections);
    setHasChanges(true);
    toast.success('Layout padrão criado!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-muted/30">
        {/* Header */}
        <header className="h-14 border-b bg-background flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-bold text-sm">Construtor de Loja</h1>
              <p className="text-xs text-muted-foreground">{store?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as typeof previewMode)}>
              <TabsList className="h-9">
                <TabsTrigger value="desktop" className="px-3">
                  <Monitor className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="mobile" className="px-3">
                  <Smartphone className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button variant="outline" size="sm" asChild>
              <a href={`/loja/${store?.slug}`} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4 mr-2" />
                Ver loja
              </a>
            </Button>

            <Button 
              size="sm" 
              onClick={handleSaveAll}
              disabled={saving || !hasChanges}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Component Palette */}
          <SectionPalette />

          {/* Center - Section List */}
          <div className="w-80 border-r bg-background flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="font-bold text-sm">Seções</h2>
                <p className="text-xs text-muted-foreground">{sections.length} seções</p>
              </div>
              {sections.length === 0 && (
                <Button size="sm" variant="outline" onClick={handleCreateDefaultLayout}>
                  <Plus className="h-4 w-4 mr-1" />
                  Layout padrão
                </Button>
              )}
            </div>
            <ScrollArea className="flex-1 p-4">
              {sections.length > 0 ? (
                <SortableContext
                  items={sections.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {sections.map((section) => (
                      <SortableSection
                        key={section.id}
                        section={section}
                        onToggleVisibility={handleToggleVisibility}
                        onDelete={handleDeleteSection}
                        onEdit={handleEditSection}
                        onDuplicate={handleDuplicateSection}
                      />
                    ))}
                  </div>
                </SortableContext>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-sm mb-2">Arraste componentes aqui</p>
                  <p className="text-xs">ou crie um layout padrão</p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Right - Preview */}
          <div className="flex-1 bg-muted/50 overflow-auto p-4">
            <div 
              className={`mx-auto bg-background shadow-xl rounded-lg overflow-hidden transition-all ${
                previewMode === 'mobile' ? 'max-w-[390px]' : 'max-w-4xl'
              }`}
            >
              {/* Store Header Preview */}
              <header className="border-b p-4 flex items-center justify-between">
                <span className="font-bold text-primary">{store?.name}</span>
                <div className="h-8 w-8 rounded-full bg-muted" />
              </header>

              {/* Sections Preview */}
              <main className="min-h-[60vh]">
                {sections.length > 0 ? (
                  sections.map((section) => (
                    <SectionPreview
                      key={section.id}
                      section={section}
                      products={products}
                      categories={categories}
                      storeSlug={store?.slug || ''}
                      settings={settings}
                    />
                  ))
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p>Adicione seções para visualizar</p>
                  </div>
                )}
              </main>

              {/* Store Footer Preview */}
              <footer className="border-t p-4 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} {store?.name}
              </footer>
            </div>
          </div>
        </div>
      </div>

      {/* Section Editor */}
      <SectionEditor
        section={editingSection}
        storeId={store?.id || ''}
        categories={categories}
        onSave={handleSaveSection}
        onClose={() => setEditingSection(null)}
      />
    </DndContext>
  );
}