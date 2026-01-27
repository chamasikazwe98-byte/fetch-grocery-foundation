import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Package, Truck, CheckCircle, XCircle, Navigation, Store, ShoppingCart, CreditCard, Car, Bike } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem, OrderStatus, Profile } from '@/lib/types';
import { format } from 'date-fns';
import { DriverTrackingMap } from '@/components/DriverTrackingMap';
import { OrderCompletionModal } from '@/components/OrderCompletionModal';
import { useToast } from '@/hooks/use-toast';

const statusConfig: Record<OrderStatus, { label: string; description: string; color: string; icon: React.ReactNode; step: number }> = {
  pending: { 
    label: 'Finding Driver', 
    description: 'Looking for a driver near the store...',
    color: 'bg-yellow-500', 
    icon: <Clock className="h-5 w-5" />, 
    step: 1 
  },
  accepted: { 
    label: 'Driver Found', 
    description: 'Driver found and headed to store',
    color: 'bg-blue-500', 
    icon: <Truck className="h-5 w-5" />, 
    step: 2 
  },
  arrived_at_store: { 
    label: 'At Store', 
    description: 'Driver has arrived at the store',
    color: 'bg-indigo-500', 
    icon: <Store className="h-5 w-5" />, 
    step: 3 
  },
  shopping: { 
    label: 'Shopping', 
    description: 'Driver is currently picking your items',
    color: 'bg-purple-500', 
    icon: <ShoppingCart className="h-5 w-5" />, 
    step: 4 
  },
  shopping_completed: { 
    label: 'Checking Out', 
    description: 'Driver is checking out at the till',
    color: 'bg-pink-500', 
    icon: <CreditCard className="h-5 w-5" />, 
    step: 5 
  },
  in_transit: { 
    label: 'On the Way', 
    description: 'Driver is on the way to you!',
    color: 'bg-primary', 
    icon: <Truck className="h-5 w-5" />, 
    step: 6 
  },
  delivered: { 
    label: 'Delivered', 
    description: 'Order has been delivered',
    color: 'bg-green-500', 
    icon: <CheckCircle className="h-5 w-5" />, 
    step: 7 
  },
  cancelled: { 
    label: 'Cancelled', 
    description: 'Order was cancelled',
    color: 'bg-red-500', 
    icon: <XCircle className="h-5 w-5" />, 
    step: 0 
  },
};

const statusNotifications: Record<OrderStatus, { title: string; description: string }> = {
  pending: { title: '🔍 Finding Driver', description: 'We\'re looking for a driver near the store...' },
  accepted: { title: '🚗 Driver Found!', description: 'Your driver is heading to the store now.' },
  arrived_at_store: { title: '🏪 Driver Arrived', description: 'Your driver has arrived at the store.' },
  shopping: { title: '🛒 Shopping Started', description: 'Your driver is now picking your items.' },
  shopping_completed: { title: '💳 Checking Out', description: 'Your driver is at the checkout.' },
  in_transit: { title: '🚚 On the Way!', description: 'Your order is being delivered now!' },
  delivered: { title: '✅ Delivered!', description: 'Your order has been delivered. Enjoy!' },
  cancelled: { title: '❌ Order Cancelled', description: 'Your order has been cancelled.' },
};

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [driver, setDriver] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const previousStatusRef = useRef<OrderStatus | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;

      const { data: orderData } = await supabase
        .from('orders')
        .select('*, supermarket:supermarkets(*)')
        .eq('id', id)
        .single();

      if (orderData) {
        const newOrder = orderData as Order;
        
        // Check if status changed and show notification
        if (previousStatusRef.current && previousStatusRef.current !== newOrder.status) {
          const notification = statusNotifications[newOrder.status];
          toast({
            title: notification.title,
            description: notification.description,
            duration: 5000,
          });
          
          // Show completion modal when delivered
          if (newOrder.status === 'delivered') {
            setShowCompletionModal(true);
          }
        }
        
        previousStatusRef.current = newOrder.status;
        setOrder(newOrder);

        // Fetch order items
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*, product:products(*)')
          .eq('order_id', id);

        if (itemsData) {
          setOrderItems(itemsData as OrderItem[]);
        }

        // Fetch driver if assigned - need full profile for vehicle_type
        if (orderData.driver_id) {
          const { data: driverData } = await supabase
            .from('profiles')
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

    // Subscribe to order updates with improved real-time sync
    const channel = supabase
      .channel(`order-realtime-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          console.log('Order update received:', payload);
          fetchOrder();
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, toast]);

  const handleCloseCompletionModal = () => {
    setShowCompletionModal(false);
  };

  const handleViewOrders = () => {
    setShowCompletionModal(false);
    navigate('/orders');
  };

  const getVehicleIcon = (vehicleType: string | null) => {
    switch (vehicleType) {
      case 'car':
        return <Car className="h-4 w-4" />;
      case 'motorcycle':
        return <Bike className="h-4 w-4" />;
      default:
        return <Truck className="h-4 w-4" />;
    }
  };

  const getVehicleLabel = (vehicleType: string | null) => {
    switch (vehicleType) {
      case 'car':
        return 'Car';
      case 'motorcycle':
        return 'Motorcycle';
      case 'bicycle':
        return 'Bicycle';
      default:
        return 'Vehicle';
    }
  };

  if (isLoading || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const status = statusConfig[order.status];
  const activeSteps = ['pending', 'accepted', 'arrived_at_store', 'shopping', 'shopping_completed', 'in_transit', 'delivered'];
  const stepLabels = ['Finding', 'Accepted', 'At Store', 'Shopping', 'Checkout', 'En Route', 'Delivered'];

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
            <p className="text-sm text-white/80">{status.description}</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      {order.status !== 'cancelled' && (
        <div className="px-4 py-4 overflow-x-auto">
          <div className="flex justify-between min-w-[500px]">
            {activeSteps.map((step, index) => {
              const stepStatus = statusConfig[step as OrderStatus];
              const isActive = status.step >= stepStatus.step;
              const isCurrent = status.step === stepStatus.step;
              
              return (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isActive ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                    } ${isCurrent ? 'ring-2 ring-primary ring-offset-2 scale-110' : ''}`}
                  >
                    {isActive ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  <p className={`text-xs mt-1 text-center ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {stepLabels[index]}
                  </p>
                  {index < activeSteps.length - 1 && (
                    <div className={`h-0.5 w-full mt-2 ${isActive ? 'bg-primary' : 'bg-muted'}`} />
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
            <div className="flex-1">
              <p className="font-medium">{driver.full_name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {getVehicleIcon(driver.vehicle_type)}
                <span>{getVehicleLabel(driver.vehicle_type)}</span>
              </div>
            </div>
            {driver.vehicle_type && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                driver.vehicle_type === 'car' ? 'bg-blue-100 text-blue-700' : 
                driver.vehicle_type === 'motorcycle' ? 'bg-orange-100 text-orange-700' : 
                'bg-green-100 text-green-700'
              }`}>
                {getVehicleLabel(driver.vehicle_type)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Real-time Driver Tracking Map */}
      {order.status !== 'cancelled' && order.status !== 'delivered' && order.status !== 'pending' && (
        <div className="mx-4 bg-card rounded-xl border border-border p-4 mb-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary" />
            Live Tracking
          </h3>
          <DriverTrackingMap
            orderId={order.id}
            driverId={order.driver_id}
            deliveryLatitude={order.delivery_latitude}
            deliveryLongitude={order.delivery_longitude}
            vehicleType={driver?.vehicle_type}
          />
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
            <span className="text-muted-foreground">Delivery Fee</span>
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

      {/* Order Completion Modal */}
      <OrderCompletionModal
        isOpen={showCompletionModal}
        onClose={handleCloseCompletionModal}
        onViewOrders={handleViewOrders}
      />
    </div>
  );
};

export default OrderDetails;
