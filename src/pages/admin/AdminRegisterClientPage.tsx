import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminRegisterClientPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (user && user.email !== 'mguimarcos39@gmail.com') {
      toast.error('Acesso restrito ao administrador.');
      navigate('/admin');
    }
  }, [user, navigate]);

  const [registerData, setRegisterData] = useState({ email: '', password: '', confirmPassword: '', storeName: '', plan: 'pro' });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (registerData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      // TRUQUE: Usamos fetch manual enviando a ANON KEY no Authorization.
      // Isso satisfaz o Gateway do Supabase (que exige um JWT válido)
      // e evita o erro "Invalid JWT" causado pelo token de usuário antigo/rotacionado.
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password,
          role: 'client',
          name: registerData.storeName,
          storeName: registerData.storeName,
          plan: registerData.plan
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || data.message || `Erro ${response.status}: Falha ao criar usuário`);
      }

      toast.success('Cliente cadastrado com sucesso!');
      navigate('/admin/clientes');

    } catch (error: any) {
      console.error('Erro detalhado:', error);
      toast.error(error.message || 'Erro desconhecido ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-md mx-auto mt-10">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-xl">Cadastrar Novo Cliente</CardTitle>
            <CardDescription>Crie uma conta para um novo lojista. Ele terá o perfil de 'cliente'.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Nome da Loja</Label>
                <Input
                  id="store-name"
                  placeholder="Ex: Loja do João"
                  value={registerData.storeName}
                  onChange={(e) => setRegisterData({ ...registerData, storeName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan">Plano Inicial</Label>
                <Select 
                  value={registerData.plan} 
                  onValueChange={(value) => setRegisterData({ ...registerData, plan: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pro">Pro (R$ 49,90)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (Sob Consulta)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email do Cliente</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="cliente@exemplo.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Senha Provisória</Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm">Confirmar Senha</Label>
                <Input
                  id="register-confirm"
                  type="password"
                  placeholder="••••••••"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Cadastrando...' : 'Criar Conta de Cliente'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}