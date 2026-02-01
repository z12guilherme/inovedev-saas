import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      to={`/categoria/${category.slug}`}
      className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-6 hover:from-primary/20 hover:to-primary/10 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{category.name}</h3>
        <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </Link>
  );
}
