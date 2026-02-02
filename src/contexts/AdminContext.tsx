import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface Store {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

interface StoreSettings {
  id: string;
  store_id: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  whatsapp_number: string | null;
  accept_pix: boolean;
  accept_card: boolean;
  accept_cash: boolean;
  pix_key: string | null;
  delivery_fee: number;
  min_order_value: number;
  banner_title: string;
  banner_subtitle: string;
  banner_image_url: string | null;
  mercadopago_enabled: boolean;
  mercadopago_public_key: string | null;
  onboarding_completed: boolean;
}

interface AdminContextType {
  store: Store | null;
  settings: StoreSettings | null;
  loading: boolean;
  error: string | null;
  refreshStore: () => Promise<void>;
  updateSettings: (settings: Partial<StoreSettings>) => Promise<{ error: Error | null }>;
  createStore: (name: string, slug: string) => Promise<{ error: Error | null }>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStore = async () => {
    if (!user) {
      setStore(null);
      setSettings(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch user's store
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (storeError) throw storeError;

      if (storeData) {
        setStore(storeData);

        // Fetch store settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('store_settings')
          .select('*')
          .eq('store_id', storeData.id)
          .limit(1)
          .maybeSingle();

        if (settingsError) throw settingsError;

        if (settingsData) {
          setSettings(settingsData);
        } else {
          // Se não existirem configurações, cria o registro padrão
          const { data: newSettings, error: createError } = await supabase
            .from('store_settings')
            .insert({ store_id: storeData.id })
            .select()
            .single();
            
          if (createError) throw createError;
          setSettings(newSettings);
        }
      } else {
        setStore(null);
        setSettings(null);
      }
    } catch (err: any) {
      console.error('Error fetching store:', err);
      setError(err.message || 'Erro ao carregar dados da loja');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStore();
  }, [user]);

  const refreshStore = async () => {
    await fetchStore();
  };

  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    if (!store) return { error: new Error('No store found') };

    try {
      const { error } = await supabase
        .from('store_settings')
        .update(newSettings)
        .eq('store_id', store.id);

      if (error) throw error;

      await refreshStore();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const createStore = async (name: string, slug: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const { error } = await supabase
        .from('stores')
        .insert({
          user_id: user.id,
          name,
          slug: slug.toLowerCase().replace(/\s+/g, '-')
        });

      if (error) throw error;

      await refreshStore();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return (
    <AdminContext.Provider value={{
      store,
      settings,
      loading,
      error,
      refreshStore,
      updateSettings,
      createStore
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
