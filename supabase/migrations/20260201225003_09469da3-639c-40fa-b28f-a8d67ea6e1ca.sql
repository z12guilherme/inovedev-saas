-- Enum para status de pedidos
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled');

-- Enum para roles de membros da loja
CREATE TYPE public.store_role AS ENUM ('owner', 'admin');

-- Tabela de lojas
CREATE TABLE public.stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Configurações da loja
CREATE TABLE public.store_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#22c55e',
  secondary_color TEXT DEFAULT '#f4f4f5',
  whatsapp_number TEXT,
  accept_pix BOOLEAN DEFAULT true,
  accept_card BOOLEAN DEFAULT true,
  accept_cash BOOLEAN DEFAULT true,
  pix_key TEXT,
  delivery_fee DECIMAL(10,2) DEFAULT 5.99,
  min_order_value DECIMAL(10,2) DEFAULT 30.00,
  banner_title TEXT DEFAULT 'Ofertas Especiais',
  banner_subtitle TEXT DEFAULT 'Confira nossos produtos em destaque',
  banner_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Membros da loja (para roles)
CREATE TABLE public.store_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role store_role NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id, user_id)
);

-- Categorias de produtos
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id, slug)
);

-- Produtos
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image_url TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pedidos
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  order_number SERIAL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_neighborhood TEXT NOT NULL,
  customer_city TEXT NOT NULL,
  customer_complement TEXT,
  customer_reference TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Itens do pedido
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_stores_user_id ON public.stores(user_id);
CREATE INDEX idx_stores_slug ON public.stores(slug);
CREATE INDEX idx_products_store_id ON public.products(store_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_categories_store_id ON public.categories(store_id);
CREATE INDEX idx_orders_store_id ON public.orders(store_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_store_members_user_id ON public.store_members(user_id);
CREATE INDEX idx_store_members_store_id ON public.store_members(store_id);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para updated_at
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_store_settings_updated_at BEFORE UPDATE ON public.store_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função security definer para verificar se usuário é admin da loja
CREATE OR REPLACE FUNCTION public.is_store_admin(p_store_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.stores WHERE id = p_store_id AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.store_members WHERE store_id = p_store_id AND user_id = auth.uid()
  );
$$;

-- Função para criar loja e configurações automaticamente após registro
CREATE OR REPLACE FUNCTION public.handle_new_store()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar configurações padrão para a loja
  INSERT INTO public.store_settings (store_id)
  VALUES (NEW.id);
  
  -- Adicionar owner como membro
  INSERT INTO public.store_members (store_id, user_id, role)
  VALUES (NEW.id, NEW.user_id, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_store_created
  AFTER INSERT ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_store();

-- Habilitar RLS
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies para stores
CREATE POLICY "Users can view their own stores" ON public.stores
  FOR SELECT USING (public.is_store_admin(id));

CREATE POLICY "Users can create their own stores" ON public.stores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stores" ON public.stores
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies para store_settings
CREATE POLICY "Admins can view store settings" ON public.store_settings
  FOR SELECT USING (public.is_store_admin(store_id));

CREATE POLICY "Admins can update store settings" ON public.store_settings
  FOR UPDATE USING (public.is_store_admin(store_id));

-- RLS Policies para store_members
CREATE POLICY "Admins can view store members" ON public.store_members
  FOR SELECT USING (public.is_store_admin(store_id));

-- RLS Policies para categories
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can create categories" ON public.categories
  FOR INSERT WITH CHECK (public.is_store_admin(store_id));

CREATE POLICY "Admins can update categories" ON public.categories
  FOR UPDATE USING (public.is_store_admin(store_id));

CREATE POLICY "Admins can delete categories" ON public.categories
  FOR DELETE USING (public.is_store_admin(store_id));

-- RLS Policies para products
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all products" ON public.products
  FOR SELECT USING (public.is_store_admin(store_id));

CREATE POLICY "Admins can create products" ON public.products
  FOR INSERT WITH CHECK (public.is_store_admin(store_id));

CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE USING (public.is_store_admin(store_id));

CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE USING (public.is_store_admin(store_id));

-- RLS Policies para orders (público pode criar pedidos, admin gerencia)
CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view orders" ON public.orders
  FOR SELECT USING (public.is_store_admin(store_id));

CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (public.is_store_admin(store_id));

-- RLS Policies para order_items
CREATE POLICY "Anyone can create order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = order_id AND public.is_store_admin(o.store_id)
    )
  );

-- Bucket para imagens de produtos e logos
INSERT INTO storage.buckets (id, name, public) VALUES ('store-assets', 'store-assets', true);

-- Storage policies
CREATE POLICY "Anyone can view store assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'store-assets');

CREATE POLICY "Authenticated users can upload store assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'store-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update store assets" ON storage.objects
  FOR UPDATE USING (bucket_id = 'store-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete store assets" ON storage.objects
  FOR DELETE USING (bucket_id = 'store-assets' AND auth.role() = 'authenticated');