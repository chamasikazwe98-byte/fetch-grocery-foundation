import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, DollarSign, MapPin, LogOut, Truck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Order, Profile } from '@/lib/types';
import { format } from 'date-fns';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [isAvailable, setIsAvailable] = useState(profile?.is_available || false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      // Fetch available (pending) orders using secure RPC function
      // This function only exposes non-sensitive order data (no addresses/customer info)
      const { data: pending } = await supabase.rpc('get_pending_orders_for_drivers');

      if (pending) {
        // Map to Order type with limited fields
        setAvailableOrders(pending.map((p: any) => ({
          id: p.id,
          supermarket_id: p.supermarket_id,
          supermarket: {
            id: p.supermarket_id,
            name: p.supermarket_name,
            branch: p.supermarket_branch,
            address: p.supermarket_address,
          },
          delivery_zone_id: p.delivery_zone_id,
          subtotal: p.subtotal,
          zone_fee: p.zone_fee,
          driver_payout: p.driver_payout,
          requires_car_driver: p.requires_car_driver,
          created_at: p.created_at,
          status: 'pending',
          delivery_address: 'Address shown after acceptance', // Hidden for privacy
        })) as Order[]);
      }

      // Fetch my active orders (full details visible to assigned driver)
      if (user) {
        const { data: active } = await supabase
          .from('orders')
          .select('*, supermarket:supermarkets(*)')
          .eq('driver_id', user.id)
          .in('status', ['accepted', 'shopping', 'ready_for_pickup', 'in_transit'])
          .order('created_at', { ascending: false });

        if (active) {
          setMyOrders(active as Order[]);
        }
      }

      setIsLoading(false);
    };

    fetchOrders();

    // Subscribe to order updates
    const channel = supabase
      .channel('driver-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleAvailabilityChange = async (available: boolean) => {
    setIsAvailable(available);

    const { error } = await supabase
      .from('profiles')
      .update({ is_available: available })
      .eq('id', user?.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update availability',
        variant: 'destructive',
      });
      setIsAvailable(!available);
    } else {
      refreshProfile();
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    // Use secure server-side function for accepting orders
    // This prevents race conditions and validates driver role
    const { error } = await supabase.rpc('accept_order', {
      p_order_id: orderId,
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message || 'Order may have been taken by another driver',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Order Accepted!',
        description: 'Head to the store to start shopping',
      });
      navigate(`/driver/orders/${orderId}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="gradient-primary px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm">Welcome back,</p>
            <h1 className="text-xl font-bold text-white">{profile?.full_name || 'Driver'}</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        {/* Availability Toggle */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-400' : 'bg-gray-400'}`} />
            <span className="text-white font-medium">
              {isAvailable ? 'Available for Orders' : 'Offline'}
            </span>
          </div>
          <Switch checked={isAvailable} onCheckedChange={handleAvailabilityChange} />
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-3 mb-4">
        <div className="bg-card rounded-xl border border-border p-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">K{profile?.wallet_balance?.toFixed(2) || '0.00'}</p>
            <p className="text-sm text-muted-foreground">Wallet Balance</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{myOrders.length}</p>
            <p className="text-sm text-muted-foreground">Active Orders</p>
          </div>
        </div>
      </div>

      {/* Orders Tabs */}
      <Tabs defaultValue="available" className="px-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Available ({availableOrders.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            My Orders ({myOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-4 space-y-3">
          {availableOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No available orders right now</p>
              <p className="text-sm">Check back soon!</p>
            </div>
          ) : (
            availableOrders.map((order) => (
              <div
                key={order.id}
                className="bg-card rounded-xl border border-border p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{order.supermarket?.name}</h3>
                    {order.supermarket?.branch && (
                      <p className="text-sm text-muted-foreground">{order.supermarket.branch}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <DollarSign className="h-3 w-3 mr-1" />
                    K{order.driver_payout?.toFixed(2)}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1 italic">Address revealed after acceptance</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(order.created_at), 'h:mm a')}
                  </span>
                  <Button size="sm" onClick={() => handleAcceptOrder(order.id)}>
                    Accept Order
                  </Button>
                </div>

                {order.requires_car_driver && (
                  <Badge variant="secondary" className="mt-2">
                    🚗 Requires Car
                  </Badge>
                )}
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-4 space-y-3">
          {myOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Truck className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No active orders</p>
              <p className="text-sm">Accept an order to get started</p>
            </div>
          ) : (
            myOrders.map((order) => (
              <div
                key={order.id}
                className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:border-primary transition-colors"
                onClick={() => navigate(`/driver/orders/${order.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{order.supermarket?.name}</h3>
                    {order.supermarket?.branch && (
                      <p className="text-sm text-muted-foreground">{order.supermarket.branch}</p>
                    )}
                  </div>
                  <Badge className="bg-primary capitalize">
                    {order.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">{order.delivery_address}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">
                    Payout: K{order.driver_payout?.toFixed(2)}
                  </span>
                  <Button size="sm" variant="outline">
                    View Details →
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DriverDashboard;
