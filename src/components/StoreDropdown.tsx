import { useState } from 'react';
import { ChevronDown, ChevronRight, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Supermarket } from '@/lib/types';

interface StoreGroup {
  name: string;
  stores: Supermarket[];
  bannerImage: string;
}

interface StoreDropdownProps {
  groups: StoreGroup[];
  onStoreSelect: (store: Supermarket) => void;
}

// Brand banner images from Unsplash
const BRAND_IMAGES: Record<string, string> = {
  'Shoprite': 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80',
  'Pick n Pay': 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80',
  'Hungry Lion': 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800&q=80',
};

// Brand-specific colors
const BRAND_COLORS: Record<string, { bg: string; text: string }> = {
  'Shoprite': { bg: 'bg-red-500', text: 'text-white' },
  'Pick n Pay': { bg: 'bg-blue-600', text: 'text-white' },
  'Hungry Lion': { bg: 'bg-orange-500', text: 'text-white' },
};

// Helper to determine if a store is "Select" tier (premium)
const isSelectStore = (store: Supermarket): boolean => {
  const branch = store.branch?.toLowerCase() || '';
  return branch.includes('select') || branch.includes('pinnacle');
};

// Get badge for store tier
const getStoreBadge = (store: Supermarket, groupName: string) => {
  if (groupName.toLowerCase().includes('shoprite')) {
    if (isSelectStore(store)) {
      return (
        <Badge className="bg-amber-500 text-white border-0 text-xs shadow-sm">
          <Star className="h-3 w-3 mr-1" />
          Select
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500 text-white border-0 text-xs shadow-sm">
        Regular
      </Badge>
    );
  }
  return null;
};

export const StoreDropdown = ({ groups, onStoreSelect }: StoreDropdownProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const brandColor = BRAND_COLORS[group.name] || { bg: 'bg-primary', text: 'text-primary-foreground' };
        
        return (
          <div 
            key={group.name} 
            className="bg-card rounded-2xl border border-border overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
          >
            {/* Group Header with Banner Image */}
            <button
              onClick={() => toggleGroup(group.name)}
              className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="relative">
                <AspectRatio ratio={16 / 7}>
                  <img 
                    src={group.bannerImage}
                    alt={group.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </AspectRatio>
                
                {/* Brand name and store count overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white drop-shadow-lg">{group.name}</h3>
                      <p className="text-sm text-white/80">
                        {group.stores.length} location{group.stores.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className={`${brandColor.bg} ${brandColor.text} rounded-full p-2 shadow-lg`}>
                      {expandedGroups.has(group.name) ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </button>

            {/* Expanded Store List */}
            {expandedGroups.has(group.name) && (
              <div className="border-t border-border divide-y divide-border/50">
                {group.stores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => onStoreSelect(store)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm group-hover:text-primary transition-colors">
                          {store.branch || store.name}
                        </span>
                        {getStoreBadge(store, group.name)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{store.address}</p>
                    </div>
                    {store.distance !== undefined && (
                      <span className="text-xs text-primary font-semibold ml-2 bg-primary/10 px-2 py-1 rounded-full">
                        {store.distance.toFixed(1)} km
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Helper function to group supermarkets by brand
export const groupSupermarketsByBrand = (supermarkets: Supermarket[]): StoreGroup[] => {
  const groups: Map<string, Supermarket[]> = new Map();
  
  supermarkets.forEach(store => {
    // Use full brand name for grouping
    let brandName = store.name;
    const existing = groups.get(brandName) || [];
    groups.set(brandName, [...existing, store]);
  });

  // Sort stores within each group
  return Array.from(groups.entries()).map(([name, stores]) => ({
    name,
    bannerImage: BRAND_IMAGES[name] || 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80',
    stores: stores.sort((a, b) => {
      // Select stores first for Shoprite
      if (name.toLowerCase().includes('shoprite')) {
        const aSelect = isSelectStore(a);
        const bSelect = isSelectStore(b);
        if (aSelect && !bSelect) return -1;
        if (!aSelect && bSelect) return 1;
      }
      // Then by distance
      return (a.distance || 0) - (b.distance || 0);
    }),
  }));
};
