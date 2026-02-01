import { createContext, useContext, ReactNode } from 'react';
import { StoreConfig, Category, Product } from '@/types';
import camisetaImg from '@/assets/products/camiseta.jpg';
import tenisImg from '@/assets/products/tenis.jpg';
import perfumeImg from '@/assets/products/perfume.jpg';
import relogioImg from '@/assets/products/relogio.jpg';
import vitaminaImg from '@/assets/products/vitamina.jpg';
import cafeImg from '@/assets/products/cafe.jpg';

// Mock store configuration - would come from backend in production
const mockStoreConfig: StoreConfig = {
  name: 'Inove Commerce',
  whatsappNumber: '5511999999999',
  primaryColor: '#22c55e',
  banners: [
    {
      id: '1',
      image: '/placeholder.svg',
      title: 'Ofertas Especiais',
      subtitle: 'Até 50% de desconto em produtos selecionados'
    }
  ],
  deliveryFee: 5.99,
  minOrderValue: 30,
  acceptCard: true,
  acceptPix: true,
  pixKey: 'loja@email.com'
};

const mockCategories: Category[] = [
  { id: '1', name: 'Roupas', slug: 'roupas' },
  { id: '2', name: 'Calçados', slug: 'calcados' },
  { id: '3', name: 'Acessórios', slug: 'acessorios' },
  { id: '4', name: 'Perfumaria', slug: 'perfumaria' },
  { id: '5', name: 'Farmácia', slug: 'farmacia' },
  { id: '6', name: 'Mercado', slug: 'mercado' }
];

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Camiseta Premium',
    description: 'Camiseta de algodão premium com caimento perfeito. Ideal para o dia a dia. Tecido macio e durável que mantém a cor mesmo após várias lavagens.',
    price: 89.90,
    originalPrice: 119.90,
    images: [camisetaImg],
    category: 'roupas',
    stock: 50,
    featured: true,
    createdAt: new Date()
  },
  {
    id: '2',
    name: 'Tênis Esportivo',
    description: 'Tênis confortável para corrida e academia. Tecnologia de amortecimento avançada para maior conforto durante exercícios.',
    price: 299.90,
    images: [tenisImg],
    category: 'calcados',
    stock: 30,
    featured: true,
    createdAt: new Date()
  },
  {
    id: '3',
    name: 'Perfume Exclusivo',
    description: 'Fragrância marcante e duradoura para ocasiões especiais. Notas de âmbar, baunilha e sândalo.',
    price: 189.90,
    originalPrice: 249.90,
    images: [perfumeImg],
    category: 'perfumaria',
    stock: 20,
    featured: true,
    createdAt: new Date()
  },
  {
    id: '4',
    name: 'Relógio Elegante',
    description: 'Relógio analógico com design sofisticado e resistente à água. Perfeito para uso diário e ocasiões especiais.',
    price: 459.90,
    images: [relogioImg],
    category: 'acessorios',
    stock: 15,
    featured: true,
    createdAt: new Date()
  },
  {
    id: '5',
    name: 'Vitamina C 1000mg',
    description: 'Suplemento de vitamina C para fortalecer a imunidade. 60 cápsulas para uso diário.',
    price: 29.90,
    images: [vitaminaImg],
    category: 'farmacia',
    stock: 100,
    createdAt: new Date()
  },
  {
    id: '6',
    name: 'Café Premium 500g',
    description: 'Café torrado e moído, blend especial com notas de chocolate. Origem controlada, 100% arábica.',
    price: 34.90,
    images: [cafeImg],
    category: 'mercado',
    stock: 80,
    createdAt: new Date()
  }
];

interface StoreContextType {
  config: StoreConfig;
  categories: Category[];
  products: Product[];
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (categorySlug: string) => Product[];
  getFeaturedProducts: () => Product[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const getProductById = (id: string) => mockProducts.find(p => p.id === id);
  
  const getProductsByCategory = (categorySlug: string) =>
    mockProducts.filter(p => p.category === categorySlug);
  
  const getFeaturedProducts = () => mockProducts.filter(p => p.featured);

  return (
    <StoreContext.Provider
      value={{
        config: mockStoreConfig,
        categories: mockCategories,
        products: mockProducts,
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
