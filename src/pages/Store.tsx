import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ShoppingCart, Plus, Minus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { Product, Category, Supermarket } from '@/lib/types';
import { cn } from '@/lib/utils';

const Store = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, addItem, removeItem, getItemQuantity, itemCount } = useCart();
  
  const [supermarket, setSupermarket] = useState<Supermarket | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      // Fetch supermarket
      const { data: storeData } = await supabase
        .from('supermarkets')
        .select('*')
        .eq('id', id)
        .single();

      if (storeData) {
        setSupermarket(storeData as Supermarket);
      }

      // Fetch products for this supermarket
      const { data: productsData } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('supermarket_id', id)
        .eq('in_stock', true);

      if (productsData) {
        setProducts(productsData as Product[]);
      }

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesData) {
        setCategories(categoriesData as Category[]);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [id]);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-primary px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={() => navigate('/cart')} 
            className="relative text-white"
          >
            <ShoppingCart className="h-6 w-6" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-primary text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
        
        <h1 className="text-xl font-bold text-white">{supermarket?.name}</h1>
        {supermarket?.branch && (
          <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
            <MapPin className="h-4 w-4" />
            {supermarket.branch}
          </p>
        )}

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
      </div>

      {/* Category Chips */}
      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          <Badge
            variant={selectedCategory === null ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-2"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              className="cursor-pointer px-4 py-2 whitespace-nowrap"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.icon} {category.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {filteredProducts.map((product) => {
          const quantity = getItemQuantity(product.id);
          
          return (
            <div
              key={product.id}
              className="bg-card rounded-xl border border-border overflow-hidden"
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
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">
                  {product.name}
                </h3>
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

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No products found
        </div>
      )}

      {/* Floating Cart Button */}
      {itemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4">
          <Button 
            className="w-full h-14 text-lg shadow-lg"
            onClick={() => navigate('/cart')}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            View Cart ({itemCount} items)
          </Button>
        </div>
      )}
    </div>
  );
};

export default Store;
