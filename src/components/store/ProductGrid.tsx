import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types';
import { useCart } from '@/contexts/CartContext';

interface ProductGridProps {
  products: Product[];
}

export const ProductGrid = ({ products }: ProductGridProps) => {
  const { addItem, removeItem, getItemQuantity } = useCart();

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <span className="text-4xl block mb-3">🔍</span>
        No products found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {products.map((product) => {
        const quantity = getItemQuantity(product.id);
        
        return (
          <div
            key={product.id}
            className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="aspect-square bg-muted relative">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  🛒
                </div>
              )}
              {quantity > 0 && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {quantity}
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">
                {product.name}
              </h3>
              {product.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {product.description}
                </p>
              )}
              <p className="text-primary font-bold mt-1">
                K{product.price.toFixed(2)}
              </p>
              
              {quantity === 0 ? (
                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => addItem(product)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              ) : (
                <div className="flex items-center justify-between mt-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => removeItem(product.id)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold">{quantity}</span>
                  <Button
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => addItem(product)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
