import { useState } from 'react';
import { ChevronDown, ChevronRight, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Supermarket } from '@/lib/types';

interface StoreGroup {
  name: string;
  stores: Supermarket[];
}

interface StoreDropdownProps {
  groups: StoreGroup[];
  onStoreSelect: (store: Supermarket) => void;
}

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
        <Badge className="bg-amber-500 text-white border-0 text-xs">
          <Star className="h-3 w-3 mr-1" />
          Select
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500 text-white border-0 text-xs">
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
    <div className="space-y-2">
      {groups.map((group) => (
        <div key={group.name} className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Group Header */}
          <button
            onClick={() => toggleGroup(group.name)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                🏪
              </div>
              <div className="text-left">
                <h3 className="font-semibold">{group.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {group.stores.length} location{group.stores.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {expandedGroups.has(group.name) ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {/* Expanded Store List */}
          {expandedGroups.has(group.name) && (
            <div className="border-t border-border">
              {group.stores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => onStoreSelect(store)}
                  className="w-full flex items-center justify-between p-3 pl-14 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{store.branch || store.name}</span>
                      {getStoreBadge(store, group.name)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{store.address}</p>
                  </div>
                  {store.distance !== undefined && (
                    <span className="text-xs text-primary font-medium ml-2">
                      {store.distance.toFixed(1)} km
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Helper function to group supermarkets by brand
export const groupSupermarketsByBrand = (supermarkets: Supermarket[]): StoreGroup[] => {
  const groups: Map<string, Supermarket[]> = new Map();
  
  supermarkets.forEach(store => {
    const brandName = store.name.split(' - ')[0].split(' ')[0]; // Get first word as brand
    const existing = groups.get(brandName) || [];
    groups.set(brandName, [...existing, store]);
  });

  // Sort stores within each group
  return Array.from(groups.entries()).map(([name, stores]) => ({
    name,
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
