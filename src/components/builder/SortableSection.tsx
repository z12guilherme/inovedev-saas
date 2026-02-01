import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Trash2, Settings, Copy } from 'lucide-react';
import { Section } from '@/types/builder';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SortableSectionProps {
  section: Section;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (section: Section) => void;
  onDuplicate: (section: Section) => void;
}

const sectionLabels: Record<string, { label: string; icon: string }> = {
  banner: { label: 'Banner', icon: '🖼️' },
  featured_products: { label: 'Produtos em Destaque', icon: '⭐' },
  category_list: { label: 'Categorias', icon: '📁' },
  product_grid: { label: 'Grade de Produtos', icon: '📦' },
  text_block: { label: 'Bloco de Texto', icon: '📝' },
  cta_button: { label: 'Botão de Ação', icon: '🔘' },
  divider: { label: 'Divisor', icon: '➖' },
  social_links: { label: 'Redes Sociais', icon: '📱' }
};

export function SortableSection({ 
  section, 
  onToggleVisibility, 
  onDelete, 
  onEdit,
  onDuplicate
}: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sectionInfo = sectionLabels[section.section_type] || { label: section.section_type, icon: '📄' };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`transition-all ${
        isDragging ? 'opacity-50 ring-2 ring-primary shadow-lg' : ''
      } ${!section.is_visible ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Drag handle */}
        <button
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Section info */}
        <span className="text-xl">{sectionInfo.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{sectionInfo.label}</p>
          {section.title && (
            <p className="text-xs text-muted-foreground truncate">{section.title}</p>
          )}
        </div>

        {/* Visibility badge */}
        {!section.is_visible && (
          <Badge variant="secondary" className="text-xs">Oculto</Badge>
        )}

        {/* Actions */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(section)}
            title="Editar"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDuplicate(section)}
            title="Duplicar"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onToggleVisibility(section.id)}
            title={section.is_visible ? 'Ocultar' : 'Mostrar'}
          >
            {section.is_visible ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(section.id)}
            title="Excluir"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}