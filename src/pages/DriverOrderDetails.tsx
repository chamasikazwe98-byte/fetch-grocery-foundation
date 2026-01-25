import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Camera, CheckCircle, Loader2, AlertCircle, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Order, OrderItem, Profile, OrderStatus } from '@/lib/types';

const statusFlow: OrderStatus[] = ['accepted', 'shopping', 'ready_for_pickup', 'in_transit', 'delivered'];

const DriverOrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customer, setCustomer] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showTillRequest, setShowTillRequest] = useState(false);

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
        setReceiptImage(orderData.receipt_image_url);

        // Fetch order items
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*, product:products(*)')
          .eq('order_id', id);

        if (itemsData) {
          setOrderItems(itemsData as OrderItem[]);
        }

        // Fetch customer
        const { data: customerData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', orderData.customer_id)
          .single();

        if (customerData) {
          setCustomer(customerData as Profile);
        }
      }

      setIsLoading(false);
    };

    fetchOrder();
  }, [id]);

  const handleReceiptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !order) return;

    setIsUploading(true);

    try {
      // For demo purposes, we'll use a data URL
      // In production, you'd upload to Supabase Storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        const { error } = await supabase
          .from('orders')
          .update({ receipt_image_url: base64 })
          .eq('id', order.id);

        if (error) throw error;

        setReceiptImage(base64);
        toast({
          title: 'Receipt Uploaded',
          description: 'You can now start the delivery',
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload receipt. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return;

    // Block "in_transit" if no receipt uploaded
    if (newStatus === 'in_transit' && !receiptImage) {
      toast({
        title: 'Receipt Required',
        description: 'Please upload the paper receipt before starting delivery',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id);

      if (error) throw error;

      setOrder({ ...order, status: newStatus });

      if (newStatus === 'delivered') {
        toast({
          title: 'Order Delivered! 🎉',
          description: `You earned K${order.driver_payout?.toFixed(2)}`,
        });
        navigate('/driver');
      } else {
        toast({
          title: 'Status Updated',
          description: `Order is now "${newStatus.replace('_', ' ')}"`,
        });
      }
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getNextStatus = (): OrderStatus | null => {
    if (!order) return null;
    const currentIndex = statusFlow.indexOf(order.status);
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) return null;
    return statusFlow[currentIndex + 1];
  };

  const getNextStatusLabel = (status: OrderStatus): string => {
    switch (status) {
      case 'shopping': return 'Start Shopping';
      case 'ready_for_pickup': return 'Done Shopping';
      case 'in_transit': return 'Start Delivery';
      case 'delivered': return 'Complete Delivery';
      default: return 'Next Step';
    }
  };

  const isShoprite = order?.supermarket?.name?.toLowerCase().includes('shoprite');

  if (isLoading || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const nextStatus = getNextStatus();
  const canStartDelivery = order.status === 'ready_for_pickup';

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="gradient-primary px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/driver')} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-white">Order Details</h1>
        </div>
      </div>

      {/* Status */}
      <div className="px-4 py-4">
        <Badge className="bg-primary text-white capitalize text-sm px-4 py-2">
          {order.status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Payout Info */}
      <div className="mx-4 bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-700">Your Payout</p>
            <p className="text-2xl font-bold text-green-700">K{order.driver_payout?.toFixed(2)}</p>
          </div>
          <div className="text-right text-sm text-green-600">
            <p>Zone Fee: K{order.zone_fee.toFixed(2)}</p>
            <p>Commission: 20%</p>
          </div>
        </div>
      </div>

      {/* Shoprite Till Request */}
      {isShoprite && order.status === 'shopping' && (
        <div className="mx-4 mb-4">
          <Dialog open={showTillRequest} onOpenChange={setShowTillRequest}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full border-orange-300 text-orange-700 hover:bg-orange-50">
                <Banknote className="h-4 w-4 mr-2" />
                Request Funds for Till
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Till Funds Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="font-medium text-orange-800">Amount Requested</p>
                  <p className="text-2xl font-bold text-orange-700">K{order.subtotal.toFixed(2)}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  This will simulate a Flutterwave disbursement to your mobile money account for cash withdrawal at the Shoprite till.
                </p>
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  onClick={() => {
                    toast({
                      title: 'Funds Disbursed! 💰',
                      description: `K${order.subtotal.toFixed(2)} sent via Mobile Money`,
                    });
                    setShowTillRequest(false);
                  }}
                >
                  Confirm Disbursement
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Customer Info */}
      <div className="mx-4 bg-card rounded-xl border border-border p-4 mb-4">
        <h3 className="font-semibold mb-3">Customer</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              👤
            </div>
            <div>
              <p className="font-medium">{customer?.full_name || 'Customer'}</p>
              <p className="text-sm text-muted-foreground">{customer?.phone || 'No phone'}</p>
            </div>
          </div>
          {customer?.phone && (
            <Button size="icon" variant="outline" asChild>
              <a href={`tel:${customer.phone}`}>
                <Phone className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Delivery Address */}
      <div className="mx-4 bg-card rounded-xl border border-border p-4 mb-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Delivery Address
        </h3>
        <p className="text-sm">{order.delivery_address}</p>
      </div>

      {/* Store */}
      <div className="mx-4 bg-card rounded-xl border border-border p-4 mb-4">
        <h3 className="font-semibold mb-2">Store</h3>
        <p className="font-medium">{order.supermarket?.name}</p>
        {order.supermarket?.branch && (
          <p className="text-sm text-muted-foreground">{order.supermarket.branch}</p>
        )}
        {order.supermarket?.address && (
          <p className="text-sm text-muted-foreground mt-1">{order.supermarket.address}</p>
        )}
      </div>

      {/* Shopping List */}
      <div className="mx-4 bg-card rounded-xl border border-border p-4 mb-4">
        <h3 className="font-semibold mb-3">Shopping List ({orderItems.length} items)</h3>
        <div className="space-y-2">
          {orderItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2 border-b last:border-0">
              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-lg">
                {item.product?.image_url ? (
                  <img src={item.product.image_url} alt="" className="w-full h-full object-cover rounded" />
                ) : '🛒'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.product?.name}</p>
                <p className="text-xs text-muted-foreground">K{item.unit_price.toFixed(2)} each</p>
              </div>
              <Badge variant="secondary">{item.quantity}x</Badge>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t flex justify-between font-medium">
          <span>Order Total</span>
          <span>K{order.subtotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Receipt Upload */}
      {(order.status === 'shopping' || order.status === 'ready_for_pickup') && (
        <div className="mx-4 bg-card rounded-xl border border-border p-4 mb-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Receipt Photo
            {!receiptImage && <span className="text-destructive text-sm">(Required)</span>}
          </h3>
          
          {receiptImage ? (
            <div className="space-y-3">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                <img src={receiptImage} alt="Receipt" className="w-full h-full object-cover" />
                <CheckCircle className="absolute top-2 right-2 h-6 w-6 text-green-500 bg-white rounded-full" />
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                Replace Photo
              </Button>
            </div>
          ) : (
            <div>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">
                  Upload the paper receipt to start delivery
                </p>
                <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleReceiptUpload}
          />
        </div>
      )}

      {/* Action Button */}
      {nextStatus && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4">
          {canStartDelivery && !receiptImage ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                Upload receipt photo to unlock "Start Delivery"
              </p>
            </div>
          ) : null}
          
          <Button
            className="w-full h-14 text-lg"
            onClick={() => handleStatusUpdate(nextStatus)}
            disabled={isUpdating || (canStartDelivery && !receiptImage)}
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              getNextStatusLabel(nextStatus)
            )}
          </Button>
        </div>
      )}

      {order.status === 'delivered' && (
        <div className="fixed bottom-0 left-0 right-0 bg-green-500 p-4 text-center">
          <CheckCircle className="h-6 w-6 text-white mx-auto mb-2" />
          <p className="text-white font-semibold">Order Completed!</p>
          <p className="text-white/80 text-sm">K{order.driver_payout?.toFixed(2)} added to your wallet</p>
        </div>
      )}
    </div>
  );
};

export default DriverOrderDetails;
