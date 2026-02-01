import { Section, SectionType } from '@/types/builder';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SectionPreviewProps {
  section: Section;
  products: any[];
  categories: any[];
  storeSlug: string;
  settings: any;
  onAddToCart?: (product: any) => void;
}

export function SectionPreview({ 
  section, 
  products, 
  categories,
  storeSlug,
  settings,
  onAddToCart
}: SectionPreviewProps) {
  if (!section.is_visible) return null;

  switch (section.section_type) {
    case 'banner':
      return <BannerSection section={section} />;
    case 'featured_products':
      return (
        <ProductGridSection 
          section={section} 
          products={products.filter(p => p.is_featured).slice(0, section.content.limit || 4)}
          storeSlug={storeSlug}
          onAddToCart={onAddToCart}
        />
      );
    case 'category_list':
      return <CategoryListSection section={section} categories={categories} storeSlug={storeSlug} />;
    case 'product_grid':
      const filteredProducts = section.content.category_id
        ? products.filter(p => p.category_id === section.content.category_id)
        : products;
      return (
        <ProductGridSection 
          section={section} 
          products={filteredProducts.slice(0, section.content.limit || 8)}
          storeSlug={storeSlug}
          onAddToCart={onAddToCart}
        />
      );
    case 'text_block':
      return <TextBlockSection section={section} />;
    case 'cta_button':
      return <CTAButtonSection section={section} settings={settings} />;
    case 'divider':
      return <DividerSection section={section} />;
    case 'social_links':
      return <SocialLinksSection section={section} settings={settings} />;
    default:
      return null;
  }
}

function BannerSection({ section }: { section: Section }) {
  const heightClasses = {
    small: 'h-48 md:h-64',
    medium: 'h-64 md:h-80',
    large: 'h-80 md:h-[28rem]'
  };

  const alignClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end'
  };

  const height = heightClasses[section.settings.height as keyof typeof heightClasses] || heightClasses.medium;
  const align = alignClasses[section.settings.text_align as keyof typeof alignClasses] || alignClasses.center;

  return (
    <section 
      className={`relative ${height} w-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5`}
    >
      {section.content.image_url && (
        <img 
          src={section.content.image_url} 
          alt={section.content.title || ''} 
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {section.settings.overlay && section.content.image_url && (
        <div className="absolute inset-0 bg-black/40" />
      )}
      <div className={`relative z-10 flex flex-col justify-center h-full container px-4 ${align}`}>
        {section.content.title && (
          <h1 className={`text-3xl md:text-5xl font-bold mb-4 ${section.content.image_url ? 'text-white' : 'text-foreground'}`}>
            {section.content.title}
          </h1>
        )}
        {section.content.subtitle && (
          <p className={`text-lg md:text-xl mb-6 ${section.content.image_url ? 'text-white/90' : 'text-muted-foreground'}`}>
            {section.content.subtitle}
          </p>
        )}
        {section.content.button_text && (
          <Button size="lg" variant={section.content.image_url ? 'secondary' : 'default'}>
            {section.content.button_text}
          </Button>
        )}
      </div>
    </section>
  );
}

function ProductGridSection({ 
  section, 
  products, 
  storeSlug,
  onAddToCart 
}: { 
  section: Section; 
  products: any[];
  storeSlug: string;
  onAddToCart?: (product: any) => void;
}) {
  const columnsClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  };

  const columns = columnsClasses[section.settings.columns as keyof typeof columnsClasses] || columnsClasses[4];

  if (products.length === 0) {
    return (
      <section className="py-8 container">
        <p className="text-center text-muted-foreground">Nenhum produto encontrado</p>
      </section>
    );
  }

  return (
    <section className="py-8 container">
      {section.title && (
        <h2 className="text-2xl font-bold mb-6">{section.title}</h2>
      )}
      <div className={`grid ${columns} gap-4`}>
        {products.map((product) => {
          const hasDiscount = product.original_price && Number(product.original_price) > Number(product.price);
          return (
            <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all">
              <Link to={`/loja/${storeSlug}/produto/${product.id}`}>
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                  )}
                  {hasDiscount && (
                    <Badge className="absolute top-2 left-2 bg-destructive">
                      -{Math.round((1 - Number(product.price) / Number(product.original_price)) * 100)}%
                    </Badge>
                  )}
                </div>
              </Link>
              <CardContent className="p-4">
                <Link to={`/loja/${storeSlug}/produto/${product.id}`}>
                  <h3 className="font-medium line-clamp-2 hover:text-primary min-h-[2.5rem]">
                    {product.name}
                  </h3>
                </Link>
                {section.settings.show_price !== false && (
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(Number(product.price))}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatCurrency(Number(product.original_price))}
                      </span>
                    )}
                  </div>
                )}
                {section.settings.show_button !== false && onAddToCart && (
                  <Button 
                    className="w-full mt-3" 
                    size="sm" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      onAddToCart(product); 
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function CategoryListSection({ 
  section, 
  categories,
  storeSlug 
}: { 
  section: Section; 
  categories: any[];
  storeSlug: string;
}) {
  if (categories.length === 0) return null;

  return (
    <section className="py-6 border-b">
      <div className="container">
        {section.title && (
          <h2 className="text-xl font-bold mb-4">{section.title}</h2>
        )}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/loja/${storeSlug}/categoria/${cat.slug}`}>
              <Button variant="outline" size="sm">
                {cat.name}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TextBlockSection({ section }: { section: Section }) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const bgClasses = {
    transparent: '',
    muted: 'bg-muted',
    primary: 'bg-primary text-primary-foreground'
  };

  const align = alignClasses[section.settings.text_align as keyof typeof alignClasses] || alignClasses.center;
  const bg = bgClasses[section.settings.background as keyof typeof bgClasses] || bgClasses.transparent;

  return (
    <section className={`py-12 ${bg}`}>
      <div className={`container ${align}`}>
        {section.content.title && (
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{section.content.title}</h2>
        )}
        {section.content.subtitle && (
          <p className="text-lg text-muted-foreground mb-4">{section.content.subtitle}</p>
        )}
        {section.content.text && (
          <p className="max-w-2xl mx-auto">{section.content.text}</p>
        )}
      </div>
    </section>
  );
}

function CTAButtonSection({ section, settings }: { section: Section; settings: any }) {
  const sizeClasses = {
    small: 'py-8',
    medium: 'py-12',
    large: 'py-16'
  };

  const buttonSizeMap = {
    small: 'default' as const,
    medium: 'lg' as const,
    large: 'lg' as const
  };

  const variantMap = {
    primary: 'default' as const,
    secondary: 'secondary' as const,
    outline: 'outline' as const
  };

  const size = sizeClasses[section.settings.size as keyof typeof sizeClasses] || sizeClasses.large;
  const buttonSize = buttonSizeMap[section.settings.size as keyof typeof buttonSizeMap] || 'lg';
  const variant = variantMap[section.settings.variant as keyof typeof variantMap] || 'default';

  let href = '#';
  if (section.content.link_type === 'whatsapp' && settings?.whatsapp_number) {
    href = `https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`;
  } else if (section.content.link_type === 'external' && section.content.link) {
    href = section.content.link;
  }

  return (
    <section className={`${size} bg-primary/5`}>
      <div className="container text-center">
        <Button size={buttonSize} variant={variant} asChild>
          <a href={href} target="_blank" rel="noopener noreferrer">
            {section.content.link_type === 'whatsapp' && (
              <MessageCircle className="h-5 w-5 mr-2" />
            )}
            {section.content.text || 'Clique aqui'}
          </a>
        </Button>
      </div>
    </section>
  );
}

function DividerSection({ section }: { section: Section }) {
  const spacingClasses = {
    small: 'py-4',
    medium: 'py-8',
    large: 'py-12'
  };

  const spacing = spacingClasses[section.settings.spacing as keyof typeof spacingClasses] || spacingClasses.medium;

  if (section.settings.style === 'space') {
    return <div className={spacing} />;
  }

  if (section.settings.style === 'dots') {
    return (
      <div className={`${spacing} flex justify-center gap-2`}>
        <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
      </div>
    );
  }

  return (
    <div className={spacing}>
      <hr className="container border-muted" />
    </div>
  );
}

function SocialLinksSection({ section, settings }: { section: Section; settings: any }) {
  const socialLinks = [
    { key: 'social_instagram', label: 'Instagram', icon: '📸' },
    { key: 'social_facebook', label: 'Facebook', icon: '📘' },
    { key: 'social_tiktok', label: 'TikTok', icon: '🎵' }
  ].filter(s => settings?.[s.key]);

  if (socialLinks.length === 0) return null;

  return (
    <section className="py-8">
      <div className="container flex justify-center gap-4">
        {socialLinks.map((social) => (
          <a
            key={social.key}
            href={settings[social.key]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <span className="text-xl">{social.icon}</span>
            {section.settings.show_labels && (
              <span className="text-sm font-medium">{social.label}</span>
            )}
          </a>
        ))}
      </div>
    </section>
  );
}