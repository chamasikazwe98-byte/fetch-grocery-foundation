import { Category } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DepartmentGridProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  storeType: 'supermarket' | 'hardware' | 'liquor' | 'fast-food';
}

// Supermarket departments (physical stores)
const SUPERMARKET_DEPARTMENTS = [
  'Pantry & Staples',
  'Breakfast & Cereals', 
  'Dairy & Eggs',
  'Dairy',
  'Bakery & Snacks',
  'Bakery',
  'Butchery & Frozen',
  'Meat & Poultry',
  'Beverages',
  'Fruits & Vegetables',
  'Bathroom & Hygiene',
  'Personal Care',
  'Laundry & Home Care',
  'Household',
  'Baby Care',
  'Snacks',
];

const HARDWARE_DEPARTMENTS = [
  'Building Materials',
  'Power Tools',
  'Plumbing',
  'Electrical',
  'Paint & Decor',
  'Hardware',
];

const LIQUOR_DEPARTMENTS = [
  'Wine & Liquor',
  'Beverages',
];

// For restaurants, we DON'T show department grid - show menu directly
const FAST_FOOD_DEPARTMENTS: string[] = [];

export const DepartmentGrid = ({
  categories,
  selectedCategory,
  onCategorySelect,
  storeType,
}: DepartmentGridProps) => {
  // Filter categories based on store type
  const relevantDepartments = storeType === 'supermarket' 
    ? SUPERMARKET_DEPARTMENTS 
    : storeType === 'hardware' 
    ? HARDWARE_DEPARTMENTS
    : storeType === 'liquor'
    ? LIQUOR_DEPARTMENTS
    : FAST_FOOD_DEPARTMENTS;

  const filteredCategories = categories.filter(cat => 
    relevantDepartments.some(dept => 
      cat.name.toLowerCase().includes(dept.toLowerCase()) ||
      dept.toLowerCase().includes(cat.name.toLowerCase())
    )
  );

  // If no categories match the filter, show all available categories
  const displayCategories = filteredCategories.length > 0 ? filteredCategories : categories;

  return (
    <div className="grid grid-cols-3 gap-2">
      {/* All Items option */}
      <Card
        className={cn(
          'cursor-pointer transition-all hover:scale-105 hover:shadow-md border-2',
          selectedCategory === null 
            ? 'border-primary bg-primary/5 shadow-md' 
            : 'border-transparent hover:border-primary/30'
        )}
        onClick={() => onCategorySelect(null)}
      >
        <CardContent className="p-3 flex flex-col items-center justify-center text-center min-h-[80px]">
          <span className="text-2xl mb-1">🛒</span>
          <span className="text-xs font-medium leading-tight">All Items</span>
        </CardContent>
      </Card>

      {displayCategories.map((category) => (
        <Card
          key={category.id}
          className={cn(
            'cursor-pointer transition-all hover:scale-105 hover:shadow-md border-2',
            selectedCategory === category.id 
              ? 'border-primary bg-primary/5 shadow-md' 
              : 'border-transparent hover:border-primary/30'
          )}
          onClick={() => onCategorySelect(category.id)}
        >
          <CardContent className="p-3 flex flex-col items-center justify-center text-center min-h-[80px]">
            <span className="text-2xl mb-1">{category.icon || '📦'}</span>
            <span className="text-xs font-medium leading-tight line-clamp-2">
              {category.name}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
