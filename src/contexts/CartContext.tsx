import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, CustomerInfo } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from './StoreContext';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  checkout: (paymentMethod: 'mercadopago' | 'pix' | 'cash', customer: CustomerInfo) => Promise<string | void>;
  isCheckingOut: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { store, config } = useStore();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  // Save cart to local storage on change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    toast.success('Produto adicionado ao carrinho');
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setItems(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const checkout = async (paymentMethod: 'mercadopago' | 'pix' | 'cash', customer: CustomerInfo): Promise<string | void> => {
    if (!store) {
      toast.error('Erro na loja. Tente novamente.');
      return;
    }

    if (items.length === 0) {
      toast.error('Seu carrinho está vazio.');
      return;
    }

    setIsCheckingOut(true);

    const deliveryFee = config?.deliveryFee || 0;

    try {
      // Preparar payloads para a RPC
      const orderPayload = {
        store_id: store.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: customer.address,
        customer_neighborhood: customer.neighborhood,
        customer_city: customer.city,
        customer_complement: customer.complement || null,
        customer_reference: customer.reference || null,
        payment_method: paymentMethod,
        subtotal: total,
        delivery_fee: deliveryFee,
        total: total + deliveryFee
      };

      const itemsPayload = items.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity
      }));

      // 1. Chamar função segura no banco (Cria Pedido + Itens)
      const { data: orderData, error: orderError } = await supabase.rpc('create_complete_order', {
        order_payload: orderPayload,
        items_payload: itemsPayload
      });

      if (orderError) throw orderError;

      // Objeto de pedido simplificado para uso local
      const order = {
        id: orderData.id,
        order_number: orderData.order_number
      };

      if (paymentMethod === 'mercadopago') {
        const { data, error } = await supabase.functions.invoke('create-payment', {
          body: {
            items: items.map(item => ({
              id: item.product.id,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              image: item.product.images[0]
            })),
            storeId: store.id,
            orderId: order.id, // Vincula o pagamento ao pedido criado
            deliveryFee: deliveryFee,
            payer: {
              name: customer.name,
              phone: customer.phone?.replace(/\D/g, '') // Remove formatação para enviar apenas números
            },
            backUrls: {
                success: window.location.origin + '/sucesso',
                failure: window.location.origin + '/erro',
                pending: window.location.origin + '/pendente'
            }
          }
        });

        if (error) throw error;

        // CRÍTICO: Salvar o ID da preferência no pedido para o Webhook identificar depois
        if (data?.preferenceId) {
          await supabase
            .from('orders')
            .update({ mercadopago_preference_id: data.preferenceId })
            .eq('id', order.id);
        }

        if (data?.initPoint) {
            return data.initPoint; // Retorna a URL para redirecionamento
        }
      } else {
        // Fluxo para Pix/Dinheiro (Pagamento na entrega ou manual)
        toast.success(`Pedido #${order.order_number} realizado com sucesso!`);

        clearCart();
        return `/sucesso?order_id=${order.id}`;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Erro ao processar pagamento.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total,
      itemCount,
      checkout,
      isCheckingOut
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}