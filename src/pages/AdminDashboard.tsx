import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, DollarSign, CheckCircle, Clock, LogOut, Users, Package, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Order } from '@/lib/types';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { signOut, profile, roles } = useAuth();
  const { toast } = useToast();

  const [fundingRequests, setFundingRequests] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect if not admin
    if (roles.length > 0 && !roles.includes('admin')) {
      navigate('/dashboard');
      return;
    }

    const fetchData = async () => {
      // Fetch Shoprite orders awaiting funding (shopping_completed, not funded, till_amount set)
      const { data: pendingFunds } = await supabase
        .from('orders')
        .select('*, supermarket:supermarkets(*), driver:profiles!orders_driver_id_fkey(*)')
        .eq('status', 'shopping_completed')
        .eq('funds_confirmed', false)
        .not('till_amount', 'is', null)
        .order('created_at', { ascending: false });

      if (pendingFunds) {
        setFundingRequests(pendingFunds as unknown as Order[]);
      }

      // Fetch all recent orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*, supermarket:supermarkets(*)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (orders) {
        setAllOrders(orders as unknown as Order[]);
      }

      setIsLoading(false);
    };

    fetchData();

    // Real-time subscription for funding requests
    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roles, navigate]);

  const handleApproveFunding = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ funds_confirmed: true })
      .eq('id', orderId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve funding',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Funds Approved ✓',
        description: 'Driver can now proceed to the till',
      });
      setFundingRequests(prev => prev.filter(o => o.id !== orderId));
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
      <div className="bg-slate-900 px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-yellow-400" />
            <div>
              <p className="text-white/80 text-sm">Admin Panel</p>
              <h1 className="text-xl font-bold text-white">{profile?.full_name || 'Admin'}</h1>
            </div>
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

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-yellow-400">{fundingRequests.length}</p>
            <p className="text-xs text-white/80">Pending Funds</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{allOrders.filter(o => o.status === 'pending').length}</p>
            <p className="text-xs text-white/80">Pending Orders</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{allOrders.filter(o => o.status === 'delivered').length}</p>
            <p className="text-xs text-white/80">Delivered</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="funding" className="px-4 -mt-3">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="funding" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Funding ({fundingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            All Orders
          </TabsTrigger>
        </TabsList>

        {/* Funding Requests Tab */}
        <TabsContent value="funding" className="mt-4 space-y-3">
          {fundingRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No pending funding requests</p>
              <p className="text-sm">Shoprite funding requests will appear here</p>
            </div>
          ) : (
            fundingRequests.map((order) => (
              <div
                key={order.id}
                className="bg-card rounded-xl border-2 border-orange-300 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-orange-500 text-white">
                        💰 Funding Request
                      </Badge>
                    </div>
                    <h3 className="font-semibold">{order.supermarket?.name}</h3>
                    {order.supermarket?.branch && (
                      <p className="text-sm text-muted-foreground">{order.supermarket.branch}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">
                      K{order.till_amount?.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">Requested</p>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-2 mb-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Subtotal:</span>
                    <span>K{order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Driver:</span>
                    <span>{(order as any).driver?.full_name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Requested:</span>
                    <span>{format(new Date(order.created_at), 'h:mm a')}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApproveFunding(order.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve & Send Funds
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* All Orders Tab */}
        <TabsContent value="orders" className="mt-4 space-y-3">
          {allOrders.map((order) => (
            <div
              key={order.id}
              className="bg-card rounded-xl border border-border p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{order.supermarket?.name}</h3>
                  {order.supermarket?.branch && (
                    <p className="text-sm text-muted-foreground">{order.supermarket.branch}</p>
                  )}
                </div>
                <Badge className={`capitalize ${
                  order.status === 'delivered' ? 'bg-green-500' :
                  order.status === 'cancelled' ? 'bg-red-500' :
                  order.status === 'pending' ? 'bg-yellow-500' :
                  'bg-primary'
                }`}>
                  {order.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {format(new Date(order.created_at), 'MMM d, h:mm a')}
                </span>
                <span className="font-medium text-primary">K{order.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
