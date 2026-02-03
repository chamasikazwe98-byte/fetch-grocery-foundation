import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, MapPin, ChevronDown, ChevronUp, Clock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { Product, Category, Supermarket } from '@/lib/types';
import { DepartmentGrid } from '@/components/store/DepartmentGrid';
import { StoreSearch } from '@/components/store/StoreSearch';
import { ProductGrid } from '@/components/store/ProductGrid';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ProductGridSkeleton, DepartmentGridSkeleton } from '@/components/ui/product-skeleton';

// Determine store type from name
const getStoreType = (storeName: string): 'supermarket' | 'hardware' | 'liquor' | 'fast-food' => {
  const name = storeName.toLowerCase();
  if (name.includes('kfc') || name.includes('nandos') || name.includes('pedro') || name.includes('pizza')) {
    return 'fast-food';
  }
  if (name.includes('wine') || name.includes('liquor') || name.includes('bottle') || name.includes('elohim')) {
    return 'liquor';
  }
  if (name.includes('micmar') || name.includes('builders') || name.includes('hardware')) {
    return 'hardware';
  }
  return 'supermarket';
};

const Store = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  
  const [supermarket, setSupermarket] = useState<Supermarket | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDepartmentsOpen, setIsDepartmentsOpen] = useState(true);

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
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Auto-collapse departments when searching
  useEffect(() => {
    if (searchQuery) {
      setIsDepartmentsOpen(false);
    }
  }, [searchQuery]);

  const storeType = supermarket ? getStoreType(supermarket.name) : 'supermarket';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Loading Header Skeleton */}
        <div className="gradient-primary px-4 pt-4 pb-5">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => navigate(-1)} className="text-white">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <button onClick={() => navigate('/cart')} className="relative text-white">
              <ShoppingCart className="h-6 w-6" />
            </button>
          </div>
          <div className="h-6 w-32 bg-white/30 rounded animate-pulse" />
          <div className="h-4 w-24 bg-white/20 rounded animate-pulse mt-2" />
        </div>
        
        {/* Department Skeleton */}
        <div className="py-4">
          <DepartmentGridSkeleton />
        </div>
        
        {/* Product Grid Skeleton */}
        <ProductGridSkeleton count={6} />
      </div>
    );
  }

  // Hardcoded contact number
  const STORE_CONTACT = '+260 977 123 456';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-primary px-4 pt-4 pb-5">
        <div className="flex items-center justify-between mb-3">
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
        
        {/* Store Info: Hours & Contact */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-white text-xs font-medium">
            <Clock className="h-3.5 w-3.5" />
            <span>07:00 - 20:00</span>
          </div>
          <a 
            href={`tel:${STORE_CONTACT}`} 
            className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-white text-xs font-medium hover:bg-white/30 transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>Contact Store</span>
          </a>
        </div>
      </div>

      {/* Sticky Search Bar */}
      <StoreSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={`Search in ${supermarket?.name || 'store'}...`}
      />

      {/* Collapsible Department Grid - Hidden for restaurants */}
      {storeType !== 'fast-food' && (
        <Collapsible open={isDepartmentsOpen} onOpenChange={setIsDepartmentsOpen}>
          <CollapsibleTrigger asChild>
            <div className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
              <h2 className="font-semibold text-foreground">
                {storeType === 'supermarket' ? 'Shop by Department' : 
                 storeType === 'hardware' ? 'Shop by Category' :
                 'Browse Selection'}
              </h2>
              {isDepartmentsOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <DepartmentGrid
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
                storeType={storeType}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Restaurant Menu Header */}
      {storeType === 'fast-food' && (
        <div className="px-4 py-3 border-b border-border">
          <h2 className="font-semibold text-foreground">🍽️ Full Menu</h2>
        </div>
      )}

      {/* Selected Category Header */}
      {selectedCategory && (
        <div className="px-4 py-2 bg-primary/5 border-y border-border flex items-center justify-between">
          <span className="text-sm font-medium text-primary">
            {categories.find(c => c.id === selectedCategory)?.icon}{' '}
            {categories.find(c => c.id === selectedCategory)?.name}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-7"
            onClick={() => setSelectedCategory(null)}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Products Grid */}
      <div className="px-4 py-4">
        <ProductGrid products={filteredProducts} />
      </div>

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
