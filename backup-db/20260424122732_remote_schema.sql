drop extension if exists "pg_net";

drop trigger if exists "update_categories_updated_at" on "public"."categories";

drop trigger if exists "update_orders_updated_at" on "public"."orders";

drop trigger if exists "update_products_updated_at" on "public"."products";

drop trigger if exists "update_store_sections_updated_at" on "public"."store_sections";

drop trigger if exists "update_store_settings_updated_at" on "public"."store_settings";

drop trigger if exists "on_store_created" on "public"."stores";

drop trigger if exists "update_stores_updated_at" on "public"."stores";

drop policy "Admins can create categories" on "public"."categories";

drop policy "Admins can delete categories" on "public"."categories";

drop policy "Admins can update categories" on "public"."categories";

drop policy "Anyone can view categories" on "public"."categories";

drop policy "Admins can view order items" on "public"."order_items";

drop policy "Anyone can create order items for valid orders" on "public"."order_items";

drop policy "Admins can update orders" on "public"."orders";

drop policy "Admins can view orders" on "public"."orders";

drop policy "Anyone can create orders for valid stores" on "public"."orders";

drop policy "Admins can manage product images" on "public"."product_images";

drop policy "Anyone can view product images" on "public"."product_images";

drop policy "Admins can create products" on "public"."products";

drop policy "Admins can delete products" on "public"."products";

drop policy "Admins can update products" on "public"."products";

drop policy "Admins can view all products" on "public"."products";

drop policy "Anyone can view active products" on "public"."products";

drop policy "Admins can view store members" on "public"."store_members";

drop policy "Admins can manage store sections" on "public"."store_sections";

drop policy "Anyone can view visible store sections" on "public"."store_sections";

drop policy "Admins can update store settings" on "public"."store_settings";

drop policy "Admins can view store settings" on "public"."store_settings";

drop policy "Anyone can view store settings for public stores" on "public"."store_settings";

drop policy "Anyone can view stores by slug" on "public"."stores";

drop policy "Users can create their own stores" on "public"."stores";

drop policy "Users can update their own stores" on "public"."stores";

drop policy "Users can view their own stores" on "public"."stores";

revoke delete on table "public"."store_members" from "anon";

revoke insert on table "public"."store_members" from "anon";

revoke references on table "public"."store_members" from "anon";

revoke select on table "public"."store_members" from "anon";

revoke trigger on table "public"."store_members" from "anon";

revoke truncate on table "public"."store_members" from "anon";

revoke update on table "public"."store_members" from "anon";

revoke delete on table "public"."store_members" from "authenticated";

revoke insert on table "public"."store_members" from "authenticated";

revoke references on table "public"."store_members" from "authenticated";

revoke select on table "public"."store_members" from "authenticated";

revoke trigger on table "public"."store_members" from "authenticated";

revoke truncate on table "public"."store_members" from "authenticated";

revoke update on table "public"."store_members" from "authenticated";

revoke delete on table "public"."store_members" from "service_role";

revoke insert on table "public"."store_members" from "service_role";

revoke references on table "public"."store_members" from "service_role";

revoke select on table "public"."store_members" from "service_role";

revoke trigger on table "public"."store_members" from "service_role";

revoke truncate on table "public"."store_members" from "service_role";

revoke update on table "public"."store_members" from "service_role";

alter table "public"."categories" drop constraint "categories_store_id_slug_key";

alter table "public"."store_members" drop constraint "store_members_store_id_fkey";

alter table "public"."store_members" drop constraint "store_members_store_id_user_id_key";

alter table "public"."store_members" drop constraint "store_members_user_id_fkey";

alter table "public"."order_items" drop constraint "order_items_product_id_fkey";

alter table "public"."product_images" drop constraint "product_images_product_id_fkey";

alter table "public"."products" drop constraint "products_category_id_fkey";

alter table "public"."store_sections" drop constraint "store_sections_store_id_fkey";

alter table "public"."stores" drop constraint "stores_user_id_fkey";

drop function if exists "public"."handle_new_store"();

drop function if exists "public"."is_store_admin"(p_store_id uuid);

drop function if exists "public"."update_updated_at_column"();

alter table "public"."store_members" drop constraint "store_members_pkey";

drop index if exists "public"."categories_store_id_slug_key";

drop index if exists "public"."idx_categories_store_id";

drop index if exists "public"."idx_order_items_order_id";

drop index if exists "public"."idx_orders_status";

drop index if exists "public"."idx_orders_store_id";

drop index if exists "public"."idx_products_category_id";

drop index if exists "public"."idx_products_is_active";

drop index if exists "public"."idx_products_store_id";

drop index if exists "public"."idx_store_members_store_id";

drop index if exists "public"."idx_store_members_user_id";

drop index if exists "public"."idx_stores_slug";

drop index if exists "public"."idx_stores_user_id";

drop index if exists "public"."store_members_pkey";

drop index if exists "public"."store_members_store_id_user_id_key";

drop table "public"."store_members";

alter table "public"."categories" drop column "image_url";

alter table "public"."categories" drop column "updated_at";

alter table "public"."categories" alter column "created_at" set default timezone('utc'::text, now());

alter table "public"."categories" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."order_items" alter column "created_at" set default timezone('utc'::text, now());

alter table "public"."order_items" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."orders" alter column "created_at" set default timezone('utc'::text, now());

alter table "public"."orders" alter column "delivery_fee" set default 0;

alter table "public"."orders" alter column "delivery_fee" drop not null;

alter table "public"."orders" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."orders" alter column "status" set default 'pending'::text;

alter table "public"."orders" alter column "status" drop not null;

alter table "public"."orders" alter column "status" set data type text using "status"::text;

alter table "public"."orders" alter column "updated_at" set default timezone('utc'::text, now());

alter table "public"."product_images" alter column "created_at" set default timezone('utc'::text, now());

alter table "public"."product_images" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."products" drop column "updated_at";

alter table "public"."products" alter column "created_at" set default timezone('utc'::text, now());

alter table "public"."products" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."products" alter column "stock" drop not null;

alter table "public"."store_sections" alter column "content" drop default;

alter table "public"."store_sections" alter column "created_at" set default timezone('utc'::text, now());

alter table "public"."store_sections" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."store_sections" alter column "settings" drop default;

alter table "public"."store_sections" alter column "updated_at" set default timezone('utc'::text, now());

alter table "public"."store_settings" drop column "layout_published";

alter table "public"."store_settings" drop column "social_facebook";

alter table "public"."store_settings" drop column "social_instagram";

alter table "public"."store_settings" drop column "social_tiktok";

alter table "public"."store_settings" drop column "updated_at";

alter table "public"."store_settings" add column "features" jsonb default '{}'::jsonb;

alter table "public"."store_settings" add column "monthly_goal" numeric default 0;

alter table "public"."store_settings" add column "subscription_plan" text default 'free'::text;

alter table "public"."store_settings" add column "subscription_status" text default 'inactive'::text;

alter table "public"."store_settings" alter column "accept_card" set default false;

alter table "public"."store_settings" alter column "accept_cash" set default false;

alter table "public"."store_settings" alter column "accept_pix" set default false;

alter table "public"."store_settings" alter column "banner_subtitle" drop default;

alter table "public"."store_settings" alter column "banner_title" drop default;

alter table "public"."store_settings" alter column "created_at" set default timezone('utc'::text, now());

alter table "public"."store_settings" alter column "delivery_fee" set default 0;

alter table "public"."store_settings" alter column "delivery_fee" set data type numeric using "delivery_fee"::numeric;

alter table "public"."store_settings" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."store_settings" alter column "min_order_value" set default 0;

alter table "public"."store_settings" alter column "min_order_value" set data type numeric using "min_order_value"::numeric;

alter table "public"."store_settings" alter column "primary_color" set default '#000000'::text;

alter table "public"."store_settings" alter column "secondary_color" set default '#ffffff'::text;

alter table "public"."store_settings" disable row level security;

alter table "public"."stores" add column "due_date" integer default 5;

alter table "public"."stores" add column "monthly_goal" numeric default 0;

alter table "public"."stores" add column "subscription_plan" text default 'free'::text;

alter table "public"."stores" add column "subscription_price" numeric default 0.00;

alter table "public"."stores" add column "subscription_status" text default 'active'::text;

alter table "public"."stores" alter column "created_at" set default timezone('utc'::text, now());

alter table "public"."stores" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."stores" alter column "updated_at" set default timezone('utc'::text, now());

drop type "public"."order_status";

drop type "public"."store_role";

alter table "public"."order_items" add constraint "order_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) not valid;

alter table "public"."order_items" validate constraint "order_items_product_id_fkey";

alter table "public"."product_images" add constraint "product_images_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) not valid;

alter table "public"."product_images" validate constraint "product_images_product_id_fkey";

alter table "public"."products" add constraint "products_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.categories(id) not valid;

alter table "public"."products" validate constraint "products_category_id_fkey";

alter table "public"."store_sections" add constraint "store_sections_store_id_fkey" FOREIGN KEY (store_id) REFERENCES public.stores(id) not valid;

alter table "public"."store_sections" validate constraint "store_sections_store_id_fkey";

alter table "public"."stores" add constraint "stores_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."stores" validate constraint "stores_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_complete_order(order_payload jsonb, items_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.is_store_admin(_store_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.stores
    WHERE id = _store_id
    AND user_id = auth.uid()
  );
END;
$function$
;


  create policy "Public categories are viewable by everyone"
  on "public"."categories"
  as permissive
  for select
  to public
using (true);



  create policy "Admins can delete order items"
  on "public"."order_items"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.orders o
  WHERE ((o.id = order_items.order_id) AND public.is_store_admin(o.store_id)))));



  create policy "Public can create order items"
  on "public"."order_items"
  as permissive
  for insert
  to public
with check (true);



  create policy "Store owners can view order items"
  on "public"."order_items"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM (public.orders
     JOIN public.stores ON ((orders.store_id = stores.id)))
  WHERE ((order_items.order_id = orders.id) AND (stores.user_id = auth.uid())))));



  create policy "Admins can delete orders"
  on "public"."orders"
  as permissive
  for delete
  to public
using (public.is_store_admin(store_id));



  create policy "Public can create orders"
  on "public"."orders"
  as permissive
  for insert
  to public
with check (true);



  create policy "Store owners can update their store orders"
  on "public"."orders"
  as permissive
  for update
  to public
using ((auth.uid() IN ( SELECT stores.user_id
   FROM public.stores
  WHERE (stores.id = orders.store_id))));



  create policy "Store owners can view their store orders"
  on "public"."orders"
  as permissive
  for select
  to public
using ((auth.uid() IN ( SELECT stores.user_id
   FROM public.stores
  WHERE (stores.id = orders.store_id))));



  create policy "Public product images are viewable by everyone"
  on "public"."product_images"
  as permissive
  for select
  to public
using (true);



  create policy "Users can delete images for their products"
  on "public"."product_images"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM (public.products p
     JOIN public.stores s ON ((p.store_id = s.id)))
  WHERE ((p.id = product_images.product_id) AND (s.user_id = auth.uid())))));



  create policy "Users can insert images for their products"
  on "public"."product_images"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM (public.products p
     JOIN public.stores s ON ((p.store_id = s.id)))
  WHERE ((p.id = product_images.product_id) AND (s.user_id = auth.uid())))));



  create policy "Public products are viewable by everyone"
  on "public"."products"
  as permissive
  for select
  to public
using (true);



  create policy "Users can delete their own products"
  on "public"."products"
  as permissive
  for delete
  to public
using ((auth.uid() IN ( SELECT stores.user_id
   FROM public.stores
  WHERE (stores.id = products.store_id))));



  create policy "Users can insert products for their stores"
  on "public"."products"
  as permissive
  for insert
  to public
with check ((auth.uid() IN ( SELECT stores.user_id
   FROM public.stores
  WHERE (stores.id = products.store_id))));



  create policy "Users can update their own products"
  on "public"."products"
  as permissive
  for update
  to public
using ((auth.uid() IN ( SELECT stores.user_id
   FROM public.stores
  WHERE (stores.id = products.store_id))));



  create policy "Public store sections are viewable by everyone"
  on "public"."store_sections"
  as permissive
  for select
  to public
using (true);



  create policy "Users can manage their own store sections"
  on "public"."store_sections"
  as permissive
  for all
  to public
using ((auth.uid() IN ( SELECT stores.user_id
   FROM public.stores
  WHERE (stores.id = store_sections.store_id))));



  create policy "Users can insert their own store settings"
  on "public"."store_settings"
  as permissive
  for insert
  to public
with check ((store_id IN ( SELECT stores.id
   FROM public.stores
  WHERE (stores.user_id = auth.uid()))));



  create policy "Users can update their own store settings"
  on "public"."store_settings"
  as permissive
  for update
  to public
using ((store_id IN ( SELECT stores.id
   FROM public.stores
  WHERE (stores.user_id = auth.uid()))));



  create policy "Dono pode atualizar sua loja"
  on "public"."stores"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Dono pode deletar sua loja"
  on "public"."stores"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Lojas públicas são visíveis por todos"
  on "public"."stores"
  as permissive
  for select
  to public
using (true);



  create policy "Super Admin manage stores"
  on "public"."stores"
  as permissive
  for all
  to public
using (((auth.jwt() ->> 'email'::text) = 'mguimarcos39@gmail.com'::text));



  create policy "Usuários podem criar sua própria loja"
  on "public"."stores"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));


drop policy "Anyone can view store assets" on "storage"."objects";

drop policy "Authenticated users can delete store assets" on "storage"."objects";

drop policy "Authenticated users can update store assets" on "storage"."objects";

drop policy "Authenticated users can upload store assets" on "storage"."objects";


  create policy "Authenticated users can delete"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'store-assets'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Authenticated users can update"
  on "storage"."objects"
  as permissive
  for update
  to public
with check (((bucket_id = 'store-assets'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Authenticated users can upload"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'store-assets'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Dono pode atualizar seus logos"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'logos'::text) AND (auth.uid() = owner)));



  create policy "Dono pode deletar seus logos"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'logos'::text) AND (auth.uid() = owner)));



  create policy "Logos são públicos"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'logos'::text));



  create policy "Public Access"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'store-assets'::text));



  create policy "Usuários podem fazer upload de logos"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'logos'::text) AND (auth.role() = 'authenticated'::text)));



