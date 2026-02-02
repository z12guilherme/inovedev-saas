import { Link } from 'react-router-dom';
import { MessageCircle, Mail, MapPin } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';

export function Footer() {
  const { config, categories } = useStore();

  if (!config) return null;

  const whatsappUrl = `https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}`;

  return (
    <footer className="bg-secondary mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">{config.name}</h3>
            <p className="text-muted-foreground text-sm">
              Sua loja online com os melhores produtos e preços da região.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categorias</h4>
            <ul className="space-y-2">
              {categories.slice(0, 5).map(cat => (
                <li key={cat.id}>
                  <Link
                    to={`/categoria/${cat.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Links Úteis</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/produtos"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Todos os Produtos
                </Link>
              </li>
              <li>
                <Link
                  to="/carrinho"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Meu Carrinho
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                contato@loja.com
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Sua Cidade, Brasil
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {config.name}. Todos os direitos reservados.</p>
          <p className="mt-1">Powered by Inove Commerce</p>
        </div>
      </div>
    </footer>
  );
}
