import { Supermarket } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin } from 'lucide-react';

interface StoreCategorySectionProps {
  title: string;
  icon: string;
  stores: Supermarket[];
  onStoreSelect: (store: Supermarket) => void;
  accentColor: string;
}

// Brand-specific images
const BRAND_IMAGES: Record<string, string> = {
  'Shoprite': 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&q=80',
  'Pick n Pay': 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&q=80',
  'Hungry Lion': 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&q=80',
  'KFC': 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=400&q=80',
  'Nandos': 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&q=80',
  'Pedros': 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&q=80',
  'The Wine Shop': 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=400&q=80',
  'The Bottle Shop': 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&q=80',
  'Elohim Liquor Store': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&q=80',
  'MicMar Hardware': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80',
  'Builders Warehouse': 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400&q=80',
  'The Bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
};

// Group stores by brand name
const groupByBrand = (stores: Supermarket[]): Map<string, Supermarket[]> => {
  const groups = new Map<string, Supermarket[]>();
  stores.forEach(store => {
    const existing = groups.get(store.name) || [];
    groups.set(store.name, [...existing, store]);
  });
  return groups;
};

// Check if store is premium
const isSelectStore = (store: Supermarket): boolean => {
  const branch = store.branch?.toLowerCase() || '';
  return branch.includes('select') || branch.includes('pinnacle');
};

export const StoreCategorySection = ({
  title,
  icon,
  stores,
  onStoreSelect,
  accentColor,
}: StoreCategorySectionProps) => {
  const groupedStores = groupByBrand(stores);

  if (stores.length === 0) return null;

  return (
    <section className="mb-8">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4 px-4">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <Badge variant="secondary" className="ml-auto text-xs">
          {stores.length} stores
        </Badge>
      </div>

      {/* Horizontal scroll of brand cards */}
      <div className="flex gap-3 overflow-x-auto pb-2 px-4 scrollbar-hide">
        {Array.from(groupedStores.entries()).map(([brandName, brandStores]) => (
          <Card
            key={brandName}
            className={`flex-shrink-0 w-[200px] overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 hover:border-${accentColor}`}
            onClick={() => onStoreSelect(brandStores[0])}
          >
            {/* Brand Image */}
            <div className="relative h-24 bg-muted">
              <img
                src={BRAND_IMAGES[brandName] || brandStores[0]?.image_url || 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400'}
                alt={brandName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2">
                <h3 className="text-white font-bold text-sm drop-shadow-lg line-clamp-1">
                  {brandName}
                </h3>
              </div>
            </div>

            <CardContent className="p-3">
              {/* Branch count */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  {brandStores.length} location{brandStores.length !== 1 ? 's' : ''}
                </span>
                {brandName === 'Shoprite' && brandStores.some(isSelectStore) && (
                  <Badge className="bg-amber-500 text-white border-0 text-[10px] px-1.5">
                    <Star className="h-2.5 w-2.5 mr-0.5" />
                    Select
                  </Badge>
                )}
              </div>

              {/* Nearest location */}
              {brandStores[0]?.branch && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="line-clamp-1">{brandStores[0].branch}</span>
                </div>
              )}

              {/* Distance if available */}
              {brandStores[0]?.distance !== undefined && (
                <div className="mt-1">
                  <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                    {brandStores[0].distance.toFixed(1)} km away
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
