-- Adiciona permissão para excluir itens do pedido
-- Necessário para evitar erro 409 (Conflict) ao excluir pedidos

CREATE POLICY "Admins can delete order items" ON public.order_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = order_items.order_id 
      AND public.is_store_admin(o.store_id)
    )
  );