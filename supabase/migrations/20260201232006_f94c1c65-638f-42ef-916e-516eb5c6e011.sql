-- Create store_sections table to store layout blocks
CREATE TABLE public.store_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL, -- banner, featured_products, category_list, product_grid, text_block, cta_button
  title TEXT,
  subtitle TEXT,
  content JSONB DEFAULT '{}', -- Flexible content storage for each section type
  settings JSONB DEFAULT '{}', -- Section-specific settings (colors, layout options, etc.)
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_sections ENABLE ROW LEVEL SECURITY;

-- Policies for store_sections
CREATE POLICY "Anyone can view visible store sections"
ON public.store_sections
FOR SELECT
USING (
  is_visible = true OR is_store_admin(store_id)
);

CREATE POLICY "Admins can manage store sections"
ON public.store_sections
FOR ALL
USING (is_store_admin(store_id))
WITH CHECK (is_store_admin(store_id));

-- Add trigger for updated_at
CREATE TRIGGER update_store_sections_updated_at
BEFORE UPDATE ON public.store_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add layout_published field to store_settings
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS layout_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS social_instagram TEXT,
ADD COLUMN IF NOT EXISTS social_facebook TEXT,
ADD COLUMN IF NOT EXISTS social_tiktok TEXT;