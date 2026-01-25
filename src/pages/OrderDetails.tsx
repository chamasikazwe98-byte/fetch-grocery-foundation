import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem, OrderStatus, Profile } from '@/lib/types';
import { format } from 'date-fns';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode; step: number }> = {
  pending: { label: 'Finding Driver', color: 'bg-yellow-500', icon: <Clock className="h-5 w-5" />, step: 1 },
  accepted: { label: 'Driver Accepted', color: 'bg-blue-500', icon: <Package className="h-5 w-5" />, step: 2 },
  shopping: { label: 'Shopping', color: 'bg-purple-500', icon: <Package className="h-5 w-5" />, step: 3 },
  ready_for_pickup: { label: 'Ready for Pickup', color: 'bg-indigo-500', icon: <Package className="h-5 w-5" />, step: 4 },
  in_transit: { label: 'On the Way', color: 'bg-primary', icon: <Truck className="h-5 w-5" />, step: 5 },
  delivered: { label: 'Delivered', color: 'bg-green-500', icon: <CheckCircle className="h-5 w-5" />, step: 6 },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: <XCircle className="h-5 w-5" />, step: 0 },
};

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [driver, setDriver] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;

      const { data: orderData } = await supabase
        .from('orders')
        .select('*, supermarket:supermarkets(*)')
        .eq('id', id)
        .single();

      if (orderData) {
        setOrder(orderData as Order);

        // Fetch order items
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*, product:products(*)')
          .eq('order_id', id);

        if (itemsData) {
          setOrderItems(itemsData as OrderItem[]);
        }

        // Fetch driver if assigned - use public_profiles view for limited info
        if (orderData.driver_id) {
          const { data: driverData } = await supabase
            .from('public_profiles')
            .select('*')
            .eq('id', orderData.driver_id)
            .single();

          if (driverData) {
            setDriver(driverData as Profile);
          }
        }
      }

      setIsLoading(false);
    };

    fetchOrder();

    // Subscribe to order updates
    const channel = supabase
      .channel(`order-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`,
        },
        () => {
          fetchOrder();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (isLoading || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const status = statusConfig[order.status];
  const activeSteps = ['pending', 'accepted', 'shopping', 'ready_for_pickup', 'in_transit', 'delivered'];

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="gradient-primary px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/orders')} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-white">Order Details</h1>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`${status.color} text-white px-4 py-4`}>
        <div className="flex items-center gap-3">
          {status.icon}
          <div>
            <p className="font-semibold">{status.label}</p>
            <p className="text-sm text-white/80">
              {order.status === 'pending' && 'Looking for a driver...'}
              {order.status === 'accepted' && 'Driver is heading to the store'}
              {order.status === 'shopping' && 'Driver is shopping your items'}
              {order.status === 'ready_for_pickup' && 'Items are ready, starting delivery soon'}
              {order.status === 'in_transit' && 'Your order is on the way!'}
              {order.status === 'delivered' && 'Order has been delivered'}
              {order.status === 'cancelled' && order.cancellation_reason}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      {order.status !== 'cancelled' && (
        <div className="px-4 py-4">
          <div className="flex justify-between">
            {activeSteps.map((step, index) => {
              const stepStatus = statusConfig[step as OrderStatus];
              const isActive = status.step >= stepStatus.step;
              const isCurrent = status.step === stepStatus.step;
              
              return (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isActive ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                    } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  >
                    {index + 1}
                  </div>
                  {index < activeSteps.length - 1 && (
                    <div className={`h-1 w-8 mt-4 ${isActive ? 'bg-primary' : 'bg-muted'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Driver Info */}
      {driver && (
        <div className="mx-4 bg-card rounded-xl border border-border p-4 mb-4">
          <h3 className="font-semibold mb-3">Your Driver</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              {driver.avatar_url ? (
                <img src={driver.avatar_url} alt={driver.full_name || ''} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-xl">👤</span>
              )}
            </div>
            <div>
              <p className="font-medium">{driver.full_name}</p>
              <p className="text-sm text-muted-foreground">Driver</p>
            </div>
          </div>
        </div>
      )}

      {/* Store Info */}
      <div className="mx-4 bg-card rounded-xl border border-border p-4 mb-4">
        <h3 className="font-semibold mb-2">Store</h3>
        <p className="font-medium">{order.supermarket?.name}</p>
        {order.supermarket?.branch && (
          <p className="text-sm text-muted-foreground">{order.supermarket.branch}</p>
        )}
      </div>

      {/* Delivery Address */}
      <div className="mx-4 bg-card rounded-xl border border-border p-4 mb-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Delivery Address
        </h3>
        <p className="text-sm">{order.delivery_address}</p>
      </div>

      {/* Order Items */}
      <div className="mx-4 bg-card rounded-xl border border-border p-4 mb-4">
        <h3 className="font-semibold mb-3">Order Items ({orderItems.length})</h3>
        <div className="space-y-3">
          {orderItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                {item.product?.image_url ? (
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">🛒</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{item.product?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity}x @ K{item.unit_price.toFixed(2)}
                </p>
              </div>
              <p className="font-medium">K{item.total_price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="mx-4 bg-card rounded-xl border border-border p-4">
        <h3 className="font-semibold mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>K{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service Fee (10%)</span>
            <span>K{order.service_fee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Zone Fee</span>
            <span>K{order.zone_fee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span className="text-primary">K{order.total.toFixed(2)}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Order placed on {format(new Date(order.created_at), 'MMMM d, yyyy • h:mm a')}
        </p>
      </div>
    </div>
  );
};

export default OrderDetails;
