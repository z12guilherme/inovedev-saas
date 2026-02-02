-- Função segura para criar pedido e itens atomicamente
-- Bypassa RLS para retornar o ID do pedido criado para o usuário anônimo
CREATE OR REPLACE FUNCTION public.create_complete_order(
  order_payload JSONB,
  items_payload JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Roda com permissões de admin, permitindo o retorno dos dados
SET search_path = public
AS $$
DECLARE
  new_order_id UUID;
  new_order_num INTEGER;
  item JSONB;
BEGIN
  -- 1. Inserir o Pedido
  INSERT INTO public.orders (
    store_id,
    customer_name,
    customer_phone,
    customer_address,
    customer_neighborhood,
    customer_city,
    customer_complement,
    customer_reference,
    payment_method,
    subtotal,
    delivery_fee,
    total,
    status,
    payment_status
  ) VALUES (
    (order_payload->>'store_id')::UUID,
    order_payload->>'customer_name',
    order_payload->>'customer_phone',
    order_payload->>'customer_address',
    order_payload->>'customer_neighborhood',
    order_payload->>'customer_city',
    order_payload->>'customer_complement',
    order_payload->>'customer_reference',
    order_payload->>'payment_method',
    (order_payload->>'subtotal')::DECIMAL,
    (order_payload->>'delivery_fee')::DECIMAL,
    (order_payload->>'total')::DECIMAL,
    'pending',
    'pending'
  )
  RETURNING id, order_number INTO new_order_id, new_order_num;

  -- 2. Inserir os Itens
  FOR item IN SELECT * FROM jsonb_array_elements(items_payload)
  LOOP
    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name,
      quantity,
      unit_price,
      total_price
    ) VALUES (
      new_order_id,
      (item->>'product_id')::UUID,
      item->>'product_name',
      (item->>'quantity')::INTEGER,
      (item->>'unit_price')::DECIMAL,
      (item->>'total_price')::DECIMAL
    );
  END LOOP;

  -- 3. Retornar dados essenciais
  RETURN jsonb_build_object(
    'id', new_order_id,
    'order_number', new_order_num
  );
END;
$$;