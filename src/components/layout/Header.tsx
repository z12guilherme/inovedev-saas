import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ShoppingCart, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useStore } from '@/contexts/StoreContext';

export function Header() {
  const { itemCount } = useCart();
  const { config, categories } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);

  if (!config) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <nav className="flex flex-col gap-4 mt-8">
              <Link to="/" className="text-lg font-semibold hover:text-primary transition-colors">
                Início
              </Link>
              <Link to="/produtos" className="text-lg font-semibold hover:text-primary transition-colors">
                Produtos
              </Link>
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">Categorias</p>
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    to={`/categoria/${cat.slug}`}
                    className="block py-2 hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">{config.name}</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Início
          </Link>
          <Link to="/produtos" className="text-sm font-medium hover:text-primary transition-colors">
            Produtos
          </Link>
          {categories.slice(0, 4).map(cat => (
            <Link
              key={cat.id}
              to={`/categoria/${cat.slug}`}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {searchOpen ? (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Buscar produtos..."
                className="w-40 md:w-64"
                autoFocus
              />
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
          )}
          
          <Link to="/carrinho">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
