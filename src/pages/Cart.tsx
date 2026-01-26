import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DeliveryZone } from '@/lib/types';
import { LocationPicker } from '@/components/LocationPicker';
import { Coordinates } from '@/lib/geoUtils';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, subtotal, serviceFee } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCoords, setDeliveryCoords] = useState<Coordinates | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocationSelect = (coords: Coordinates, address: string) => {
    setDeliveryCoords(coords);
    setDeliveryAddress(address);
  };

  useEffect(() => {
    const fetchZones = async () => {
      const { data } = await supabase
        .from('delivery_zones')
        .select('*')
        .order('fee');
      
      if (data) {
        setDeliveryZones(data as DeliveryZone[]);
      }
    };

    fetchZones();
  }, []);

  const zoneFee = deliveryZones.find(z => z.id === selectedZone)?.fee || 0;
  const orderTotal = subtotal + serviceFee + zoneFee;

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

    if (!selectedZone) {
      toast({
        title: 'Select delivery zone',
        description: 'Please select a delivery zone to continue.',
        variant: 'destructive',
      });
      return;
    }

    if (!deliveryAddress.trim()) {
      toast({
        title: 'Enter delivery address',
        description: 'Please enter your delivery address.',
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

    // Get supermarket from first item
    const supermarketId = items[0].product.supermarket_id;

    setIsSubmitting(true);

    try {
      // Prepare items for server-side validation
      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));

      // Use secure server-side function for order creation
      // This validates all prices and calculations on the server
      const { data: orderId, error: orderError } = await supabase
        .rpc('create_secure_order', {
          p_supermarket_id: supermarketId,
          p_delivery_zone_id: selectedZone,
          p_delivery_address: deliveryAddress,
          p_notes: notes || null,
          p_items: orderItems,
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
        
        <div className="space-y-2">
          <Label>Delivery Zone</Label>
          <Select value={selectedZone} onValueChange={setSelectedZone}>
            <SelectTrigger>
              <SelectValue placeholder="Select delivery zone" />
            </SelectTrigger>
            <SelectContent>
              {deliveryZones.map((zone) => (
                <SelectItem key={zone.id} value={zone.id}>
                  {zone.name} - K{zone.fee.toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Picker with GPS and Address Search */}
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          initialAddress={deliveryAddress}
        />

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
            <span className="text-muted-foreground">Zone Fee</span>
            <span>K{zoneFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span className="text-primary">K{orderTotal.toFixed(2)}</span>
          </div>
        </div>

        <Button 
          className="w-full h-12" 
          onClick={handleCheckout}
          disabled={isSubmitting}
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
