import { useDraggable } from '@dnd-kit/core';
import { SECTION_TEMPLATES, SectionTemplate } from '@/types/builder';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DraggableTemplateProps {
  template: SectionTemplate;
}

function DraggableTemplate({ template }: DraggableTemplateProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `template-${template.type}`,
    data: { template }
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
      }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing transition-all hover:border-primary ${
        isDragging ? 'opacity-50 ring-2 ring-primary' : ''
      }`}
    >
      <CardContent className="p-3 flex items-center gap-3">
        <span className="text-2xl">{template.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{template.label}</p>
          <p className="text-xs text-muted-foreground truncate">{template.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SectionPalette() {
  return (
    <div className="w-64 border-r bg-background h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-bold text-sm">Componentes</h2>
        <p className="text-xs text-muted-foreground">Arraste para adicionar</p>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {SECTION_TEMPLATES.map((template) => (
            <DraggableTemplate key={template.type} template={template} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}