import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Section } from '@/types/builder';
import { SectionPreview } from '@/components/builder/SectionPreview';

interface DynamicStorefrontProps {
  store: {
    id: string;
    name: string;
    slug: string;
  };
  settings: any;
  products: any[];
  categories: any[];
  cartItemCount: number;
  onAddToCart: (product: any) => void;
}

export function DynamicStorefront({
  store,
  settings,
  products,
  categories,
  cartItemCount,
  onAddToCart
}: DynamicStorefrontProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasCustomLayout, setHasCustomLayout] = useState(false);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const { data } = await supabase
          .from('store_sections')
          .select('*')
          .eq('store_id', store.id)
          .eq('is_visible', true)
          .order('sort_order');

        if (data && data.length > 0) {
          const transformedSections: Section[] = data.map(s => ({
            id: s.id,
            store_id: s.store_id,
            section_type: s.section_type,
            title: s.title,
            subtitle: s.subtitle,
            content: (s.content as Record<string, any>) || {},
            settings: (s.settings as Record<string, any>) || {},
            sort_order: s.sort_order,
            is_visible: s.is_visible
          }));
          setSections(transformedSections);
          setHasCustomLayout(true);
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, [store.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no custom layout, return null to use default layout
  if (!hasCustomLayout) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to={`/loja/${store.slug}`} className="flex items-center gap-2">
            {settings?.logo_url && (
              <img 
                src={settings.logo_url} 
                alt={store.name} 
                className="h-8 w-8 rounded-full object-cover"
              />
            )}
            <span 
              className="font-bold text-xl"
              style={{ color: settings?.primary_color || undefined }}
            >
              {store.name}
            </span>
          </Link>
          <Link to={`/loja/${store.slug}/carrinho`}>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </header>

      {/* Dynamic Sections */}
      <main className="flex-1">
        {sections.map((section) => (
          <SectionPreview
            key={section.id}
            section={section}
            products={products}
            categories={categories}
            storeSlug={store.slug}
            settings={settings}
            onAddToCart={onAddToCart}
          />
        ))}
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {store.name}</p>
          <p className="mt-1">Powered by Inove Commerce</p>
        </div>
      </footer>
    </div>
  );
}