import { useState, useEffect } from 'react';
import { RefreshCw, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/lib/types';

interface RecentProduct extends Product {
  last_ordered: string;
  order_count: number;
}

export const BuyItAgainSection = () => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchRecentProducts = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Get recent order items for this customer
        const { data, error } = await supabase
          .from('order_items')
          .select(`
            product_id,
            product:products(*),
            order:orders!inner(customer_id, created_at)
          `)
          .eq('order.customer_id', user.id)
          .order('order(created_at)', { ascending: false })
          .limit(50);

        if (error) throw error;

        // Aggregate and deduplicate products
        const productMap = new Map<string, RecentProduct>();
        
        (data || []).forEach((item: any) => {
          if (item.product && item.product.in_stock) {
            const existing = productMap.get(item.product_id);
            if (existing) {
              existing.order_count += 1;
            } else {
              productMap.set(item.product_id, {
                ...item.product,
                last_ordered: item.order.created_at,
                order_count: 1,
              });
            }
          }
        });

        // Sort by order count (most ordered first), take top 10
        const sorted = Array.from(productMap.values())
          .sort((a, b) => b.order_count - a.order_count)
          .slice(0, 10);

        setRecentProducts(sorted);
      } catch (error) {
        console.error('Error fetching recent products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentProducts();
  }, [user]);

  const handleAddToCart = async (product: RecentProduct) => {
    setAddingIds((prev) => new Set(prev).add(product.id));
    
    try {
      addItem(product);
      toast({
        title: 'Added to cart',
        description: `${product.name} added to your cart`,
      });
    } finally {
      setTimeout(() => {
        setAddingIds((prev) => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
      }, 500);
    }
  };

  if (!user || isLoading) return null;
  if (recentProducts.length === 0) return null;

  return (
    <section className="mb-6">
      {/* Section Header */}
      <div className="px-4 mb-3">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Buy it Again</h2>
        </div>
        <p className="text-xs text-muted-foreground">Your frequently ordered items</p>
      </div>

      {/* Horizontal Scroll */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 px-4 pb-2">
          {recentProducts.map((product) => (
            <div
              key={product.id}
              className="w-32 flex-shrink-0 bg-card rounded-xl border border-border overflow-hidden"
            >
              {/* Product Image */}
              <div className="h-24 bg-muted relative">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">
                    🛒
                  </div>
                )}
                {/* Order count badge */}
                {product.order_count > 1 && (
                  <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                    ×{product.order_count}
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="p-2">
                <p className="text-xs font-medium line-clamp-2 h-8 leading-tight">
                  {product.name}
                </p>
                <p className="text-sm font-bold text-primary mt-1">
                  K{product.price.toFixed(2)}
                </p>
                
                <Button
                  size="sm"
                  className="w-full h-7 mt-2 text-xs"
                  onClick={() => handleAddToCart(product)}
                  disabled={addingIds.has(product.id)}
                >
                  {addingIds.has(product.id) ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
};
