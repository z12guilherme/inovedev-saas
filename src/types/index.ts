import { Database } from '@/integrations/supabase/types';

export type Store = Database['public']['Tables']['stores']['Row'];

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  stock: number;
  featured?: boolean;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface StoreConfig {
  name: string;
  logo?: string;
  whatsappNumber: string;
  primaryColor: string;
  banners: Banner[];
  deliveryFee: number;
  minOrderValue: number;
  pixKey?: string;
  acceptCard: boolean;
  acceptPix: boolean;
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  link?: string;
}

export interface Order {
  id: string;
  order_number: number;
  items: CartItem[];
  customer: CustomerInfo;
  total: number;
  deliveryFee: number;
  status: OrderStatus;
  paymentMethod: 'pix' | 'card' | 'cash';
  createdAt: Date;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  neighborhood: string;
  city: string;
  complement?: string;
  reference?: string;
}
