import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck, Store, ShoppingCart, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Order, OrderStatus } from '@/lib/types';
import { format } from 'date-fns';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500', icon: <Clock className="h-4 w-4" /> },
  accepted: { label: 'Accepted', color: 'bg-blue-500', icon: <Package className="h-4 w-4" /> },
  arrived_at_store: { label: 'At Store', color: 'bg-indigo-500', icon: <Store className="h-4 w-4" /> },
  shopping: { label: 'Shopping', color: 'bg-purple-500', icon: <ShoppingCart className="h-4 w-4" /> },
  shopping_completed: { label: 'Checkout', color: 'bg-pink-500', icon: <CreditCard className="h-4 w-4" /> },
  in_transit: { label: 'On the way', color: 'bg-primary', icon: <Truck className="h-4 w-4" /> },
  delivered: { label: 'Delivered', color: 'bg-green-500', icon: <CheckCircle className="h-4 w-4" /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: <XCircle className="h-4 w-4" /> },
};

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('orders')
        .select('*, supermarket:supermarkets(*)')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setOrders(data as Order[]);
      }
      setIsLoading(false);
    };

    fetchOrders();

    // Subscribe to order updates
    const channel = supabase
      .channel('orders-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `customer_id=eq.${user?.id}`,
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-primary px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-white">My Orders</h1>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground">
            Your order history will appear here
          </p>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          {orders.map((order) => {
            const status = statusConfig[order.status];
            
            return (
              <div
                key={order.id}
                className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:border-primary transition-colors"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{order.supermarket?.name}</h3>
                    {order.supermarket?.branch && (
                      <p className="text-sm text-muted-foreground">{order.supermarket.branch}</p>
                    )}
                  </div>
                  <Badge className={`${status.color} text-white flex items-center gap-1`}>
                    {status.icon}
                    {status.label}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {format(new Date(order.created_at), 'MMM d, yyyy • h:mm a')}
                  </span>
                  <span className="font-bold text-primary">K{order.total.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
