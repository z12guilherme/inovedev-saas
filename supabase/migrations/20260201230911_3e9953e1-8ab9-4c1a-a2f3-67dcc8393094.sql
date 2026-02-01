-- Add support for multiple product images
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Policies for product images
CREATE POLICY "Anyone can view product images"
ON public.product_images
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_images.product_id AND p.is_active = true
  )
);

CREATE POLICY "Admins can manage product images"
ON public.product_images
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_images.product_id AND is_store_admin(p.store_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_images.product_id AND is_store_admin(p.store_id)
  )
);

-- Add Mercado Pago integration fields to store_settings
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS mercadopago_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mercadopago_access_token TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_public_key TEXT;

-- Add payment status to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS mercadopago_payment_id TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_preference_id TEXT;

-- Add onboarding_completed field to store_settings
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;