import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentItem {
  title: string;
  quantity: number;
  unit_price: number;
}

interface Payer {
  name: string;
  email?: string;
  phone: string;
}

interface CreatePaymentParams {
  storeId: string;
  orderId: string;
  items: PaymentItem[];
  payer: Payer;
  deliveryFee: number;
  redirectUrl: string;
}

interface PaymentPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

export function useMercadoPago() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = async (params: CreatePaymentParams): Promise<PaymentPreference | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await supabase.functions.invoke('create-payment', {
        body: {
          storeId: params.storeId,
          orderId: params.orderId,
          items: params.items,
          payer: params.payer,
          deliveryFee: params.deliveryFee,
          // redirectUrl não é usado diretamente na edge function atual, ela usa backUrls ou gera automático
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data as PaymentPreference;
      return data;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Payment creation error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const redirectToPayment = (preference: PaymentPreference, sandbox = false) => {
    const url = sandbox ? preference.sandbox_init_point : preference.init_point;
    window.location.href = url;
  };

  return {
    createPayment,
    redirectToPayment,
    loading,
    error
  };
}
