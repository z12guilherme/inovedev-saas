-- Remover policies permissivas e adicionar validação por store_id
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

-- Nova policy para orders: requer store_id válido
CREATE POLICY "Anyone can create orders for valid stores" ON public.orders
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.stores WHERE id = store_id)
  );

-- Nova policy para order_items: requer order_id válido
CREATE POLICY "Anyone can create order items for valid orders" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id)
  );

-- Adicionar policy para leitura pública das configurações da loja (necessário para frontend)
CREATE POLICY "Anyone can view store settings for public stores" ON public.store_settings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.stores WHERE id = store_id)
  );

-- Adicionar policy para leitura pública da loja pelo slug
CREATE POLICY "Anyone can view stores by slug" ON public.stores
  FOR SELECT USING (true);