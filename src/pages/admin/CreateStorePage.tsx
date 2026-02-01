import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from 'sonner';

export default function CreateStorePage() {
  const navigate = useNavigate();
  const { createStore } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await createStore(formData.name, formData.slug);

    if (error) {
      if (error.message.includes('duplicate')) {
        toast.error('Este endereço já está em uso. Escolha outro.');
      } else {
        toast.error('Erro ao criar loja: ' + error.message);
      }
    } else {
      toast.success('Loja criada com sucesso!');
      navigate('/admin/onboarding');
    }

    setLoading(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-lg bg-primary flex items-center justify-center mb-4">
            <Store className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Criar sua loja</CardTitle>
          <CardDescription>
            Configure as informações básicas da sua loja para começar a vender
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da loja</Label>
              <Input
                id="name"
                placeholder="Ex: Minha Loja"
                value={formData.name}
                onChange={(e) => {
                  setFormData({
                    name: e.target.value,
                    slug: generateSlug(e.target.value)
                  });
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Endereço da loja</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">loja/</span>
                <Input
                  id="slug"
                  placeholder="minha-loja"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Este será o endereço da sua loja online
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando...' : 'Criar loja'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
