import { useState } from 'react';
import { AlertTriangle, RefreshCw, Banknote, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OrderItem } from '@/lib/types';

interface ItemUnavailableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderItem: OrderItem | null;
  orderId: string;
}

export const ItemUnavailableDialog = ({
  isOpen,
  onClose,
  orderItem,
  orderId,
}: ItemUnavailableDialogProps) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMarkUnavailable = async () => {
    if (!orderItem) return;

    setIsSubmitting(true);
    try {
      // Create issue record
      const { error } = await supabase.from('order_item_issues').insert({
        order_id: orderId,
        order_item_id: orderItem.id,
        issue_type: 'unavailable',
        driver_notes: notes || null,
      });

      if (error) throw error;

      // Send a message to customer about the unavailable item
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('order_messages').insert({
          order_id: orderId,
          sender_id: user.id,
          sender_type: 'driver',
          message: `⚠️ Item Unavailable: "${orderItem.product?.name}" is not available. Please choose: Replacement or Refund?`,
        });
      }

      toast({
        title: 'Item marked unavailable',
        description: 'Customer has been notified to choose a replacement or refund.',
      });

      onClose();
      setNotes('');
    } catch (error) {
      console.error('Error marking item unavailable:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark item as unavailable.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Mark Item Unavailable
          </DialogTitle>
          <DialogDescription>
            Notify the customer that this item is not available.
          </DialogDescription>
        </DialogHeader>

        {orderItem && (
          <div className="space-y-4">
            {/* Item Info */}
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-12 h-12 rounded bg-background flex items-center justify-center">
                {orderItem.product?.image_url ? (
                  <img
                    src={orderItem.product.image_url}
                    alt=""
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  '🛒'
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{orderItem.product?.name}</p>
                <p className="text-xs text-muted-foreground">
                  Qty: {orderItem.quantity} × K{orderItem.unit_price.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Notes (optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Store is out of stock, only larger size available..."
                className="h-20"
              />
            </div>

            {/* Customer will be asked */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800 font-medium mb-2">
                Customer will be asked to choose:
              </p>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-3 py-2">
                  <RefreshCw className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Replacement</span>
                </div>
                <div className="flex-1 flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-3 py-2">
                  <Banknote className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Refund</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleMarkUnavailable}
                disabled={isSubmitting}
                className="flex-1 bg-amber-500 hover:bg-amber-600"
              >
                {isSubmitting ? 'Sending...' : 'Notify Customer'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
