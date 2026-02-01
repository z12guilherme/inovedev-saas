import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RealtimeNotificationsProps {
  storeId: string;
}

export function useRealtimeNotifications({ storeId }: RealtimeNotificationsProps) {
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  useEffect(() => {
    if (!storeId) return;

    // Subscribe to new orders
    const ordersChannel = supabase
      .channel(`orders-${storeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${storeId}`
        },
        (payload) => {
          console.log('New order received:', payload);
          setNewOrdersCount(prev => prev + 1);
          
          // Show toast notification
          const order = payload.new as any;
          toast.success(
            `🛒 Novo pedido #${order.order_number}!`,
            {
              description: `${order.customer_name} - R$ ${Number(order.total).toFixed(2)}`,
              duration: 10000,
              action: {
                label: 'Ver pedido',
                onClick: () => window.location.href = '/admin/pedidos'
              }
            }
          );

          // Play notification sound
          playNotificationSound();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${storeId}`
        },
        (payload) => {
          const order = payload.new as any;
          const oldOrder = payload.old as any;

          // Notify on payment status changes
          if (order.payment_status !== oldOrder.payment_status) {
            if (order.payment_status === 'approved') {
              toast.success(
                `💳 Pagamento confirmado!`,
                {
                  description: `Pedido #${order.order_number} - Pagamento aprovado`,
                  duration: 8000
                }
              );
            } else if (order.payment_status === 'rejected') {
              toast.error(
                `❌ Pagamento recusado`,
                {
                  description: `Pedido #${order.order_number} - Entre em contato com o cliente`,
                  duration: 10000
                }
              );
            }
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, [storeId]);

  const clearNewOrdersCount = useCallback(() => {
    setNewOrdersCount(0);
  }, []);

  return {
    newOrdersCount,
    clearNewOrdersCount
  };
}

function playNotificationSound() {
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    // Audio not supported, ignore
    console.log('Audio notification not supported');
  }
}

// Component version for use in layouts
export function RealtimeNotifications({ storeId }: RealtimeNotificationsProps) {
  useRealtimeNotifications({ storeId });
  return null;
}
