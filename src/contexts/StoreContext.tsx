import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { StoreConfig, Category, Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Tipo auxiliar para a resposta do Supabase com relacionamentos (Joins)
type ProductWithRelations = Database['public']['Tables']['products']['Row'] & {
  categories: Pick<Database['public']['Tables']['categories']['Row'], 'slug'> | null;
  product_images: Pick<Database['public']['Tables']['product_images']['Row'], 'image_url' | 'sort_order'>[];
};

interface StoreContextType {
  store: { id: string; name: string; slug: string } | null;
  config: StoreConfig | null;
  categories: Category[];
  products: Product[];
  loading: boolean;
  error: string | null;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (categorySlug: string) => Product[];
  getFeaturedProducts: () => Product[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Detectar Slug da URL
        const hostname = window.location.hostname;
        let slug = '';

        // Lógica de Subdomínio
        const parts = hostname.split('.');
        if (hostname.includes('localhost')) {
          // tenant.localhost
          if (parts.length > 1 && parts[0] !== 'www') slug = parts[0];
        } else {
          // tenant.domain.com (ignora www e app)
          if (parts.length > 2 && !['www', 'app', 'saas', 'admin'].includes(parts[0])) {
            slug = parts[0];
          }
        }

        // Fallback: Lógica de Caminho (ex: /loja/minha-loja)
        if (!slug) {
          const pathParts = window.location.pathname.split('/');
          const lojaIndex = pathParts.indexOf('loja');
          if (lojaIndex !== -1 && pathParts[lojaIndex + 1]) {
            slug = pathParts[lojaIndex + 1];
          }
        }

        if (!slug) {
          setLoading(false);
          return;
        }

        // 2. Buscar Loja
        const { data: store, error: storeError } = await supabase
          .from('stores')
          .select('id, name, slug')
          .eq('slug', slug)
          .limit(1)
          .maybeSingle();

        if (storeError || !store) {
          throw new Error('Loja não encontrada');
        }

        // 3. Buscar Configurações
        const { data: settings, error: settingsError } = await supabase
          .from('store_settings')
          .select('*')
          .eq('store_id', store.id)
          .maybeSingle();

        if (settingsError) throw settingsError;

        // 4. Buscar Categorias
        const { data: catsData, error: catsError } = await supabase
          .from('categories')
          .select('*')
          .eq('store_id', store.id)
          .order('sort_order', { ascending: true });

        if (catsError) throw catsError;

        // 5. Buscar Produtos
        const { data: prodsData, error: prodsError } = await supabase 
          .from('products')
          .select<string, ProductWithRelations>(`
            *,
            categories (slug),
            product_images (image_url, sort_order)
          `)
          .eq('store_id', store.id)
          .eq('is_active', true);

        if (prodsError) throw prodsError;

        // Mapear Configurações
        const mappedConfig: StoreConfig = {
          name: store.name,
          logo: settings?.logo_url || undefined,
          whatsappNumber: settings?.whatsapp_number || '',
          primaryColor: settings?.primary_color || '#000000',
          banners: settings?.banner_image_url ? [{
            id: 'main',
            image: settings.banner_image_url,
            title: settings.banner_title || '',
            subtitle: settings.banner_subtitle || ''
          }] : [],
          deliveryFee: settings?.delivery_fee || 0,
          minOrderValue: settings?.min_order_value || 0,
          pixKey: settings?.pix_key || undefined,
          acceptCard: settings?.accept_card || false,
          acceptPix: settings?.accept_pix || false
        };

        // Mapear Categorias
        const mappedCategories: Category[] = catsData.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          image: c.image_url || undefined
        }));

        // Mapear Produtos
        const mappedProducts: Product[] = prodsData.map((p) => {
          const sortedImages = p.product_images?.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)) || [];
          const images = sortedImages.map((img) => img.image_url);
          if (images.length === 0 && p.image_url) images.push(p.image_url);

          return {
            id: p.id,
            name: p.name,
            description: p.description || '',
            price: p.price,
            originalPrice: p.original_price || undefined,
            images: images,
            category: p.categories?.slug || 'geral',
            stock: p.stock,
            featured: p.is_featured || false,
            createdAt: new Date(p.created_at)
          };
        });

        setStore(store);
        setConfig(mappedConfig);
        setCategories(mappedCategories);
        setProducts(mappedProducts);

      } catch (err) {
        console.error('Erro ao carregar loja:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, []);

  const getProductById = (id: string) => products.find(p => p.id === id);
  
  const getProductsByCategory = (categorySlug: string) =>
    products.filter(p => p.category === categorySlug);
  
  const getFeaturedProducts = () => products.filter(p => p.featured);

  return (
    <StoreContext.Provider
      value={{
        store,
        config,
        categories,
        products,
        loading,
        error,
        getProductById,
        getProductsByCategory,
        getFeaturedProducts
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
