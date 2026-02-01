export type SectionType = 
  | 'banner'
  | 'featured_products'
  | 'category_list'
  | 'product_grid'
  | 'text_block'
  | 'cta_button'
  | 'divider'
  | 'social_links';

export interface Section {
  id: string;
  store_id: string;
  section_type: SectionType | string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, any>;
  settings: Record<string, any>;
  sort_order: number;
  is_visible: boolean;
}

export interface SectionTemplate {
  type: SectionType;
  label: string;
  icon: string;
  description: string;
  defaultContent: Record<string, any>;
  defaultSettings: Record<string, any>;
}

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    type: 'banner',
    label: 'Banner',
    icon: '🖼️',
    description: 'Banner principal com imagem e texto',
    defaultContent: {
      image_url: '',
      title: 'Bem-vindo à nossa loja!',
      subtitle: 'Confira nossos produtos',
      button_text: 'Ver produtos',
      button_link: '#products'
    },
    defaultSettings: {
      height: 'medium', // small, medium, large
      overlay: true,
      text_align: 'center'
    }
  },
  {
    type: 'featured_products',
    label: 'Produtos em Destaque',
    icon: '⭐',
    description: 'Exibe produtos marcados como destaque',
    defaultContent: {
      limit: 4
    },
    defaultSettings: {
      columns: 4,
      show_price: true,
      show_button: true
    }
  },
  {
    type: 'category_list',
    label: 'Categorias',
    icon: '📁',
    description: 'Lista de categorias da loja',
    defaultContent: {},
    defaultSettings: {
      layout: 'horizontal', // horizontal, grid
      show_count: false
    }
  },
  {
    type: 'product_grid',
    label: 'Grade de Produtos',
    icon: '📦',
    description: 'Exibe todos os produtos ou de uma categoria',
    defaultContent: {
      category_id: null, // null = all products
      limit: 8
    },
    defaultSettings: {
      columns: 4,
      show_price: true,
      show_button: true
    }
  },
  {
    type: 'text_block',
    label: 'Bloco de Texto',
    icon: '📝',
    description: 'Título, subtítulo e texto personalizado',
    defaultContent: {
      title: 'Título',
      subtitle: 'Subtítulo',
      text: 'Seu texto aqui...'
    },
    defaultSettings: {
      text_align: 'center',
      background: 'transparent'
    }
  },
  {
    type: 'cta_button',
    label: 'Botão de Ação',
    icon: '🔘',
    description: 'Botão para WhatsApp ou link',
    defaultContent: {
      text: 'Fale conosco',
      link: '',
      link_type: 'whatsapp' // whatsapp, external, internal
    },
    defaultSettings: {
      size: 'large',
      variant: 'primary'
    }
  },
  {
    type: 'divider',
    label: 'Divisor',
    icon: '➖',
    description: 'Linha separadora entre seções',
    defaultContent: {},
    defaultSettings: {
      style: 'line', // line, space, dots
      spacing: 'medium'
    }
  },
  {
    type: 'social_links',
    label: 'Redes Sociais',
    icon: '📱',
    description: 'Links para redes sociais',
    defaultContent: {},
    defaultSettings: {
      show_labels: false,
      size: 'medium'
    }
  }
];