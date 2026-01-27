import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Supermarket } from '@/lib/types';
import { LocationPicker } from '@/components/LocationPicker';
import { Coordinates, calculateDistance } from '@/lib/geoUtils';

// K10 per kilometer, minimum K30
const RATE_PER_KM = 10;
const MIN_DELIVERY_FEE = 30;

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, subtotal, serviceFee } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const [supermarket, setSupermarket] = useState<Supermarket | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCoords, setDeliveryCoords] = useState<Coordinates | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryDistance, setDeliveryDistance] = useState<number | null>(null);

  // Fetch supermarket details for distance calculation
  useEffect(() => {
    const fetchSupermarket = async () => {
      if (items.length === 0) return;
      
      const supermarketId = items[0].product.supermarket_id;
      const { data } = await supabase
        .from('supermarkets')
        .select('*')
        .eq('id', supermarketId)
        .single();
      
      if (data) {
        setSupermarket(data as Supermarket);
      }
    };

    fetchSupermarket();
  }, [items]);

  const handleLocationSelect = (coords: Coordinates, address: string) => {
    setDeliveryCoords(coords);
    setDeliveryAddress(address);

    // Calculate distance from supermarket to delivery location
    if (supermarket) {
      const distance = calculateDistance(
        { latitude: supermarket.latitude, longitude: supermarket.longitude },
        coords
      );
      setDeliveryDistance(distance);
    }
  };

  // Calculate delivery fee based on distance (K10/km, min K30)
  const deliveryFee = deliveryDistance !== null 
    ? Math.max(Math.round(deliveryDistance * RATE_PER_KM * 100) / 100, MIN_DELIVERY_FEE)
    : MIN_DELIVERY_FEE;

  const orderTotal = subtotal + serviceFee + deliveryFee;

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to place an order.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (!deliveryAddress.trim()) {
      toast({
        title: 'Enter delivery address',
        description: 'Please select or enter your delivery address.',
        variant: 'destructive',
      });
      return;
    }

    if (!deliveryCoords) {
      toast({
        title: 'Set delivery location',
        description: 'Please use GPS or search for your delivery location.',
        variant: 'destructive',
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Add some items to your cart first.',
        variant: 'destructive',
      });
      return;
    }

    const supermarketId = items[0].product.supermarket_id;
    setIsSubmitting(true);

    try {
      // Prepare items for server-side validation
      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));

      // Use secure server-side function for order creation
      // Now passing distance for distance-based pricing
      const { data: orderId, error: orderError } = await supabase
        .rpc('create_secure_order', {
          p_supermarket_id: supermarketId,
          p_delivery_zone_id: null, // No longer using zones
          p_delivery_address: deliveryAddress,
          p_notes: notes || null,
          p_items: orderItems,
          p_delivery_latitude: deliveryCoords.latitude,
          p_delivery_longitude: deliveryCoords.longitude,
          p_delivery_distance_km: deliveryDistance,
        });

      if (orderError) throw orderError;

      clearCart();

      toast({
        title: 'Order placed!',
        description: 'Your order has been submitted successfully.',
      });

      navigate(`/orders/${orderId}`);
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout failed',
        description: 'There was an error placing your order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="gradient-primary px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-white">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-white">Your Cart</h1>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Add some delicious groceries to get started!
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Browse Stores
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-48">
      {/* Header */}
      <div className="gradient-primary px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-white">Your Cart</h1>
        </div>
      </div>

      {/* Store Info */}
      {supermarket && (
        <div className="mx-4 mt-4 bg-card rounded-xl border border-border p-3">
          <p className="font-medium">{supermarket.name}</p>
          {supermarket.branch && (
            <p className="text-sm text-muted-foreground">{supermarket.branch}</p>
          )}
        </div>
      )}

      {/* Cart Items */}
      <div className="px-4 py-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="bg-card rounded-xl border border-border p-3 flex gap-3"
          >
            <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
              {item.product.image_url ? (
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  🛒
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm line-clamp-2">{item.product.name}</h3>
              <p className="text-primary font-bold mt-1">
                K{item.product.price.toFixed(2)}
              </p>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="font-semibold w-6 text-center">{item.quantity}</span>
                  <Button
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive"
                  onClick={() => {
                    for (let i = 0; i < item.quantity; i++) {
                      removeItem(item.product.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Details */}
      <div className="px-4 py-4 space-y-4 border-t">
        <h2 className="font-semibold text-lg">Delivery Details</h2>
        
        {/* Location Picker with GPS and Address Search */}
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          initialAddress={deliveryAddress}
        />

        {/* Distance Info */}
        {deliveryDistance !== null && (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Distance from store</span>
              <span className="font-medium">{deliveryDistance.toFixed(1)} km</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Delivery fee (K{RATE_PER_KM}/km)</span>
              <span className="font-medium text-primary">K{deliveryFee.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Manual Address Override */}
        {deliveryCoords && (
          <div className="space-y-2">
            <Label>Delivery Address Details</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Textarea
                placeholder="Add apartment number, building name, landmarks..."
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="pl-10 min-h-[80px]"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Notes (optional)</Label>
          <Textarea
            placeholder="Any special instructions for your order..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Order Summary - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>K{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service Fee (10%)</span>
            <span>K{serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Delivery Fee {deliveryDistance !== null && `(${deliveryDistance.toFixed(1)}km)`}
            </span>
            <span>K{deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span className="text-primary">K{orderTotal.toFixed(2)}</span>
          </div>
        </div>

        <Button 
          className="w-full h-12" 
          onClick={handleCheckout}
          disabled={isSubmitting || !deliveryCoords}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Placing Order...
            </>
          ) : (
            `Place Order - K${orderTotal.toFixed(2)}`
          )}
        </Button>
      </div>
    </div>
  );
};

export default Cart;
