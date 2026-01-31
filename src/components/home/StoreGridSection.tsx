import { useState } from 'react';
import { Supermarket } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface StoreGridSectionProps {
  title: string;
  icon: string;
  stores: Supermarket[];
  onStoreSelect: (store: Supermarket) => void;
  gradient: string;
  showNoMarkupBadge?: boolean;
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

export const StoreGridSection = ({
  title,
  icon,
  stores,
  onStoreSelect,
  gradient,
  showNoMarkupBadge = false,
}: StoreGridSectionProps) => {
  const [selectedBrand, setSelectedBrand] = useState<{ name: string; stores: Supermarket[] } | null>(null);
  const groupedStores = groupByBrand(stores);

  if (stores.length === 0) return null;

  return (
    <section className="mb-6">
      {/* Section Header */}
      <div className={`${gradient} rounded-xl mx-4 p-4 mb-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{icon}</span>
            <div>
              <h2 className="text-lg font-bold text-foreground">{title}</h2>
              <p className="text-xs text-muted-foreground">
                {Array.from(groupedStores.keys()).length} brands • {stores.length} locations
              </p>
            </div>
          </div>
          {showNoMarkupBadge && (
            <Badge className="bg-emerald-500 text-white border-0 text-[10px] px-2 py-1">
              ✓ In-Store Prices
            </Badge>
          )}
        </div>
      </div>

      {/* Grid of brand cards */}
      <div className="grid grid-cols-2 gap-3 px-4">
        {Array.from(groupedStores.entries()).map(([brandName, brandStores]) => (
          <Card
            key={brandName}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => {
              if (brandStores.length === 1) {
                onStoreSelect(brandStores[0]);
              } else {
                setSelectedBrand({ name: brandName, stores: brandStores });
              }
            }}
          >
            {/* Brand Image */}
            <div className="relative h-20 bg-muted">
              <img
                src={BRAND_IMAGES[brandName] || brandStores[0]?.image_url || 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400'}
                alt={brandName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2">
                <h3 className="text-white font-semibold text-sm drop-shadow-lg line-clamp-1">
                  {brandName}
                </h3>
              </div>
              {brandStores.length > 1 && (
                <Badge className="absolute top-2 right-2 bg-black/50 text-white border-0 text-[10px]">
                  {brandStores.length}
                </Badge>
              )}
            </div>

            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground line-clamp-1">
                  {brandStores[0]?.branch || 'Multiple locations'}
                </span>
                {brandStores.length > 1 && (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Branch Selection Dialog */}
      <Dialog open={!!selectedBrand} onOpenChange={() => setSelectedBrand(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{icon}</span>
              {selectedBrand?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {selectedBrand?.stores
              .sort((a, b) => {
                // Select stores first
                const aSelect = isSelectStore(a);
                const bSelect = isSelectStore(b);
                if (aSelect && !bSelect) return -1;
                if (!aSelect && bSelect) return 1;
                // Then by distance
                return (a.distance || 0) - (b.distance || 0);
              })
              .map((store) => (
                <Button
                  key={store.id}
                  variant="outline"
                  className="w-full justify-start h-auto py-3"
                  onClick={() => {
                    onStoreSelect(store);
                    setSelectedBrand(null);
                  }}
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{store.branch}</span>
                      {isSelectStore(store) && (
                        <Badge className="bg-amber-500 text-white border-0 text-[10px]">
                          <Star className="h-2.5 w-2.5 mr-0.5" />
                          Select
                        </Badge>
                      )}
                    </div>
                    {store.address && (
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {store.address}
                      </p>
                    )}
                  </div>
                  {store.distance !== undefined && (
                    <Badge variant="secondary" className="text-[10px] ml-2">
                      {store.distance.toFixed(1)} km
                    </Badge>
                  )}
                </Button>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
