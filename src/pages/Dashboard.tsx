import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ShoppingCart, User, Settings, LogOut, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Supermarket, Category } from '@/lib/types';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, hasRole, signOut } = useAuth();
  const { itemCount } = useCart();
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Default to Lusaka center
          setUserLocation({ lat: -15.4167, lng: 28.2833 });
        }
      );
    } else {
      setUserLocation({ lat: -15.4167, lng: 28.2833 });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      const [supermarketsRes, categoriesRes] = await Promise.all([
        supabase.from('supermarkets').select('*').eq('is_active', true),
        supabase.from('categories').select('*'),
      ]);

      if (supermarketsRes.data) {
        let sortedSupermarkets = supermarketsRes.data as Supermarket[];
        
        // Calculate distance and sort by proximity
        if (userLocation) {
          sortedSupermarkets = sortedSupermarkets.map(s => ({
            ...s,
            distance: calculateDistance(
              userLocation.lat,
              userLocation.lng,
              Number(s.latitude),
              Number(s.longitude)
            ),
          })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }
        
        setSupermarkets(sortedSupermarkets);
      }

      if (categoriesRes.data) {
        setCategories(categoriesRes.data);
      }

      setIsLoading(false);
    };

    if (userLocation) {
      fetchData();
    }
  }, [userLocation]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (deg: number) => deg * (Math.PI / 180);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  // Redirect drivers to their dashboard
  useEffect(() => {
    if (hasRole('driver')) {
      navigate('/driver', { replace: true });
    }
  }, [hasRole, navigate]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-primary px-4 pt-4 pb-6 safe-area-inset-top">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-white/80" />
            <div>
              <p className="text-xs text-white/70">Delivery to</p>
              <p className="text-sm font-semibold text-white">Lusaka, Zambia</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => navigate('/cart')}
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-primary">
                    {itemCount}
                  </span>
                )}
              </div>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => navigate('/profile')}
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for groceries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-0 shadow-card"
            onClick={() => navigate('/search')}
            readOnly
          />
        </div>
      </div>

      {/* Greeting */}
      <div className="px-4 py-4">
        <h1 className="text-xl font-bold">
          Hi, {profile?.full_name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-muted-foreground text-sm">What would you like to order today?</p>
      </div>

      {/* Categories */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Categories</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => navigate(`/search?category=${category.id}`)}
              className="flex flex-col items-center gap-2 min-w-[72px]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-2xl">
                {category.icon}
              </div>
              <span className="text-xs font-medium text-center">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Supermarkets */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Nearby Stores</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {supermarkets.map((supermarket) => (
              <button
                key={supermarket.id}
                onClick={() => navigate(`/store/${supermarket.id}`)}
                className="w-full flex items-center gap-4 p-3 bg-card rounded-2xl shadow-soft border border-border/50 hover:shadow-card transition-shadow"
              >
                <div className="h-16 w-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  {supermarket.image_url ? (
                    <img
                      src={supermarket.image_url}
                      alt={supermarket.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-2xl">
                      🏪
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold">
                    {supermarket.name}
                    {supermarket.branch && ` - ${supermarket.branch}`}
                  </h3>
                  <p className="text-sm text-muted-foreground">{supermarket.address}</p>
                  {supermarket.distance !== undefined && (
                    <p className="text-xs text-primary font-medium mt-1">
                      {supermarket.distance.toFixed(1)} km away
                    </p>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-2 safe-area-inset-bottom">
        <div className="flex items-center justify-around">
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2 text-primary">
            <MapPin className="h-5 w-5 mb-1" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-col h-auto py-2 text-muted-foreground"
            onClick={() => navigate('/orders')}
          >
            <ShoppingCart className="h-5 w-5 mb-1" />
            <span className="text-xs">Orders</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-col h-auto py-2 text-muted-foreground"
            onClick={() => navigate('/profile')}
          >
            <User className="h-5 w-5 mb-1" />
            <span className="text-xs">Profile</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-col h-auto py-2 text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mb-1" />
            <span className="text-xs">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
