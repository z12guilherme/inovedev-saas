import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { useStore } from '@/contexts/StoreContext';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { categories, getProductsByCategory } = useStore();

  const category = categories.find(c => c.slug === slug);
  const products = getProductsByCategory(slug || '');

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Categoria não encontrada</h1>
            <Button asChild>
              <Link to="/produtos">Ver todos os produtos</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Início</Link>
            <span className="mx-2">/</span>
            <Link to="/produtos" className="hover:text-primary">Produtos</Link>
            <span className="mx-2">/</span>
            <span>{category.name}</span>
          </nav>

          <h1 className="text-3xl font-bold mb-8">{category.name}</h1>

          {products.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                {products.length} produto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">
                Nenhum produto encontrado nesta categoria.
              </p>
              <Button asChild>
                <Link to="/produtos">Ver todos os produtos</Link>
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
