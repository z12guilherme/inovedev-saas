import { Button } from '@/components/ui/button';
import { Store } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="bg-muted p-6 rounded-full mb-6">
        <Store className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-4xl font-bold mb-2">Página não encontrada</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        A loja ou página que você está procurando não existe ou foi movida.
      </p>
      <div className="flex gap-4">
        <Link to="/">
          <Button variant="default">Voltar ao Início</Button>
        </Link>
      </div>
    </div>
  );
}