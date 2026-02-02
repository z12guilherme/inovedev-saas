-- Adiciona permissão para administradores da loja excluírem pedidos
-- Isso resolve o problema de "Não ta dando pra excluir pedidos"

-- 1. Primeiro, criamos a função de segurança que estava faltando
CREATE OR REPLACE FUNCTION public.is_store_admin(_store_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.stores
    WHERE id = _store_id
    AND user_id = auth.uid()
  );
END;
$$;

-- 2. Agora aplicamos a política usando a função criada
CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE USING (public.is_store_admin(store_id));