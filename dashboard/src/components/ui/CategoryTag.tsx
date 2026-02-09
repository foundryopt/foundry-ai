import type { TaskCategory } from '@/lib/types';
import { CATEGORY_COLORS } from '@/lib/constants';
import { Badge } from './Badge';

interface CategoryTagProps {
  category: TaskCategory;
}

export function CategoryTag({ category }: CategoryTagProps) {
  return <Badge className={CATEGORY_COLORS[category]}>{category}</Badge>;
}
