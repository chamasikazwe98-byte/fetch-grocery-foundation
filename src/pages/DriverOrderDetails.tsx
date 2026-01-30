import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Camera, CheckCircle, Loader2, AlertCircle, Phone, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Order, OrderItem, Profile, OrderStatus } from '@/lib/types';
import { compressImage, getFileSizeInMB } from '@/lib/imageCompression';
import { useDriverLocationTracker } from '@/hooks/useDriverLocationTracker';
import { TillFundingDialog } from '@/components/driver/TillFundingDialog';
import { LoadSafetyCheckbox } from '@/components/driver/LoadSafetyCheckbox';

const statusFlow: OrderStatus[] = ['accepted', 'arrived_at_store', 'shopping', 'shopping_completed', 'in_transit', 'delivered'];

const DriverOrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile: driverProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customer, setCustomer] = useState<Profile | null>(null);
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showTillFunding, setShowTillFunding] = useState(false);
  const [loadSafetyConfirmed, setLoadSafetyConfirmed] = useState(false);

  // Track driver location when order is accepted and not delivered
  const shouldTrackLocation = order && 
    ['accepted', 'arrived_at_store', 'shopping', 'shopping_completed', 'in_transit'].includes(order.status);
  
  useDriverLocationTracker({
    orderId: id || null,
    isActive: !!shouldTrackLocation,
    intervalMs: 30000, // Send location every 30 seconds
  });

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;

      const { data: orderData } = await supabase
        .from('orders')
        .select('*, supermarket:supermarkets(*)')
        .eq('id', id)
        .single();

      if (orderData) {
        setOrder(orderData as unknown as Order);
        
        // If receipt exists, get signed URL for display
        if (orderData.receipt_image_url && !orderData.receipt_image_url.startsWith('data:')) {
          const { data: urlData } = await supabase.storage
            .from('receipts')
            .createSignedUrl(orderData.receipt_image_url, 3600); // 1 hour
          
          if (urlData?.signedUrl) {
            setReceiptImage(urlData.signedUrl);
          }
        } else {
          // Legacy base64 data (for backwards compatibility)
          setReceiptImage(orderData.receipt_image_url);
        }

        // Fetch order items
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*, product:products(*)')
          .eq('order_id', id);

        if (itemsData) {
          setOrderItems(itemsData as OrderItem[]);
        }

        // Fetch customer - use public_profiles view for limited info (name, avatar only)
        const { data: customerData } = await supabase
          .from('public_profiles')
          .select('*')
          .eq('id', orderData.customer_id)
          .single();

        if (customerData) {
          setCustomer(customerData as Profile);
        }

        // Fetch customer phone from profiles (driver can see after accepting order)
        const { data: phoneData } = await supabase
          .from('profiles')
          .select('phone')
          .eq('id', orderData.customer_id)
          .single();

        if (phoneData?.phone) {
          setCustomerPhone(phoneData.phone);
        }
      }

      setIsLoading(false);
    };

    fetchOrder();
  }, [id]);

  const handleReceiptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !order || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload an image file (JPG, PNG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Compress image to max 1200px width and 70% quality
      toast({
        title: 'Processing Image',
        description: 'Compressing image for upload...',
      });

      const compressedBlob = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1600,
        quality: 0.7,
        mimeType: 'image/jpeg',
      });

      const compressedSizeMB = getFileSizeInMB(compressedBlob);
      console.log(`Original: ${getFileSizeInMB(file).toFixed(2)}MB, Compressed: ${compressedSizeMB.toFixed(2)}MB`);

      // Final size check (should always be under 5MB after compression)
      if (compressedSizeMB > 5) {
        toast({
          title: 'Image Too Large',
          description: 'Could not compress image below 5MB. Please try a different image.',
          variant: 'destructive',
        });
        setIsUploading(false);
        return;
      }

      // Generate unique file path: {driver_id}/{order_id}/{timestamp}.jpg
      const filePath = `${user.id}/${order.id}/${Date.now()}.jpg`;

      // Upload compressed image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, compressedBlob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      // Store the path in the database (not base64)
      const { error: updateError } = await supabase
        .from('orders')
        .update({ receipt_image_url: filePath })
        .eq('id', order.id);

      if (updateError) throw updateError;

      // Get signed URL for immediate display
      const { data: urlData } = await supabase.storage
        .from('receipts')
        .createSignedUrl(filePath, 3600);

      if (urlData?.signedUrl) {
        setReceiptImage(urlData.signedUrl);
      }

      toast({
        title: 'Receipt Uploaded',
        description: 'You can now start the delivery',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error?.message || 'Failed to upload receipt. Please try again.',
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

    // Block "in_transit" if load safety not confirmed
    if (newStatus === 'in_transit' && !loadSafetyConfirmed) {
      toast({
        title: 'Safety Confirmation Required',
        description: 'Please confirm the load is secure before starting delivery',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);

    try {
      // Use secure server-side function for delivery completion
      // This atomically updates order status, creates payout record, and updates wallet
      if (newStatus === 'delivered') {
        const { error } = await supabase.rpc('complete_order_delivery', {
          p_order_id: order.id,
        });

        if (error) throw error;

        toast({
          title: 'Order Delivered! 🎉',
          description: `You earned K${order.driver_payout?.toFixed(2)}`,
        });
        navigate('/driver');
      } else {
        // For other status updates, use direct update
        const { error } = await supabase
          .from('orders')
          .update({ status: newStatus })
          .eq('id', order.id);

        if (error) throw error;

        setOrder({ ...order, status: newStatus });
        toast({
          title: 'Status Updated',
          description: `Order is now "${newStatus.replace('_', ' ')}"`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error?.message || 'Failed to update order status',
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
      case 'arrived_at_store': return 'Arrived at Store';
      case 'shopping': return 'Start Shopping';
      case 'shopping_completed': return 'Done Shopping';
      case 'in_transit': return 'Start Delivery';
      case 'delivered': return 'Complete Delivery';
      default: return 'Next Step';
    }
  };

  // Open Google Maps with customer's coordinates
  const handleNavigateToCustomer = () => {
    if (order?.delivery_latitude && order?.delivery_longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${order.delivery_latitude},${order.delivery_longitude}&travelmode=driving`;
      window.open(url, '_blank');
    }
  };

  // Call customer
  const handleCallCustomer = () => {
    if (customerPhone) {
      window.location.href = `tel:${customerPhone}`;
    } else {
      toast({
        title: 'Phone Not Available',
        description: 'Customer phone number is not available.',
        variant: 'destructive',
      });
    }
  };

  const isShoprite = order?.supermarket?.name?.toLowerCase().includes('shoprite');
  const fundsConfirmed = order?.funds_confirmed || false;

  // For Shoprite, hide receipt upload until funds are confirmed
  const canShowReceiptUpload = isShoprite 
    ? fundsConfirmed && (order?.status === 'shopping' || order?.status === 'shopping_completed')
    : (order?.status === 'shopping' || order?.status === 'shopping_completed');

  // For Shoprite, hide "Done Shopping" button until funds are confirmed
  const canAdvanceFromShopping = isShoprite
    ? fundsConfirmed
    : true;

  if (isLoading || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const nextStatus = getNextStatus();
  const canStartDelivery = order.status === 'shopping_completed';

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

      {/* Estimated Package Size - Vehicle Compatibility */}
      <div className="mx-4 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📦</span>
            <span className="text-sm font-medium text-blue-700">Est. Package Size</span>
          </div>
          <Badge className={`${
            orderItems.length <= 5 ? 'bg-green-500' : 
            orderItems.length <= 15 ? 'bg-yellow-500' : 
            'bg-red-500'
          } text-white border-0`}>
            {orderItems.length <= 5 ? 'Small' : orderItems.length <= 15 ? 'Medium' : 'Large'}
            {orderItems.length > 15 && ' 🚗'}
          </Badge>
        </div>
        {orderItems.length > 15 && (
          <p className="text-xs text-blue-600 mt-1">
            ⚠️ Large order - Car recommended
          </p>
        )}
      </div>

      {/* Shoprite Till Request - Only when funds not yet confirmed */}
      {isShoprite && order.status === 'shopping' && !fundsConfirmed && (
        <div className="mx-4 mb-4">
          <Button 
            variant="outline" 
            className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
            onClick={() => setShowTillFunding(true)}
          >
            💰 Request Funds for Till
          </Button>
        </div>
      )}

      {/* Funds Confirmed Badge for Shoprite */}
      {isShoprite && fundsConfirmed && (
        <div className="mx-4 mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-700 font-medium">Funds Received - K{order.till_amount?.toFixed(2)}</span>
        </div>
      )}

      {/* Customer Info with Call Button */}
      <div className="mx-4 bg-card rounded-xl border border-border p-4 mb-4">
        <h3 className="font-semibold mb-3">Customer</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              {customer?.avatar_url ? (
                <img src={customer.avatar_url} alt={customer?.full_name || ''} className="w-full h-full rounded-full object-cover" />
              ) : (
                '👤'
              )}
            </div>
            <div>
              <p className="font-medium">{customer?.full_name || 'Customer'}</p>
              {customerPhone && (
                <p className="text-sm text-muted-foreground">{customerPhone}</p>
              )}
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-primary text-primary"
            onClick={handleCallCustomer}
          >
            <Phone className="h-4 w-4 mr-1" />
            Call
          </Button>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="mx-4 bg-card rounded-xl border border-border p-4 mb-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Delivery Address
        </h3>
        <p className="text-sm">{order.delivery_address}</p>
        
        {/* Navigate to Customer button - only shown when in_transit */}
        {order.status === 'in_transit' && order.delivery_latitude && order.delivery_longitude && (
          <Button 
            className="w-full mt-3 bg-blue-600 hover:bg-blue-700" 
            onClick={handleNavigateToCustomer}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Navigate to Customer
          </Button>
        )}
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
        <div className="mt-3 pt-3 border-t space-y-1">
          <div className="flex justify-between text-sm">
            <span>Order Subtotal</span>
            <span>K{order.subtotal.toFixed(2)}</span>
          </div>
          {(order.carrier_bags_count || 0) > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Carrier Bags ({order.carrier_bags_count})</span>
              <span>K{order.carrier_bags_total?.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Upload - Hidden for Shoprite until funds confirmed */}
      {canShowReceiptUpload && (
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

      {/* Load Safety Checkbox - Before starting delivery */}
      {canStartDelivery && receiptImage && (
        <div className="mx-4 mb-4">
          <LoadSafetyCheckbox
            vehicleType={driverProfile?.vehicle_type || null}
            isChecked={loadSafetyConfirmed}
            onChange={setLoadSafetyConfirmed}
          />
        </div>
      )}

      {/* Action Button */}
      {nextStatus && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4">
          {/* Show warning if Shoprite and funds not confirmed during shopping */}
          {isShoprite && order.status === 'shopping' && !fundsConfirmed && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                Request funds before proceeding to checkout
              </p>
            </div>
          )}

          {canStartDelivery && !receiptImage && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                Upload receipt photo to unlock "Start Delivery"
              </p>
            </div>
          )}

          {canStartDelivery && receiptImage && !loadSafetyConfirmed && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                Confirm load safety to start delivery
              </p>
            </div>
          )}
          
          <Button
            className="w-full h-14 text-lg"
            onClick={() => handleStatusUpdate(nextStatus)}
            disabled={
              isUpdating || 
              (canStartDelivery && !receiptImage) || 
              (canStartDelivery && !loadSafetyConfirmed) ||
              (isShoprite && order.status === 'shopping' && !fundsConfirmed && nextStatus === 'shopping_completed')
            }
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

      {/* Till Funding Dialog */}
      {order && (
        <TillFundingDialog
          isOpen={showTillFunding}
          onClose={() => setShowTillFunding(false)}
          order={order}
          onFundsConfirmed={() => {
            setShowTillFunding(false);
            // Refresh order to get updated funds_confirmed state
            setOrder({ ...order, funds_confirmed: true });
          }}
        />
      )}
    </div>
  );
};

export default DriverOrderDetails;
