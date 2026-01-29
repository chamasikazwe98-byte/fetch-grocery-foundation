import { useState } from 'react';
import { Banknote, Loader2, Minus, Plus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/lib/types';

const BAG_PRICE = 3.50;

interface TillFundingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onFundsConfirmed: () => void;
}

export const TillFundingDialog = ({
  isOpen,
  onClose,
  order,
  onFundsConfirmed,
}: TillFundingDialogProps) => {
  const { toast } = useToast();
  const [tillAmount, setTillAmount] = useState<string>(order.subtotal.toString());
  const [adjustedBagCount, setAdjustedBagCount] = useState(order.carrier_bags_count || 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fundsReceived, setFundsReceived] = useState(false);

  const bagsTotal = adjustedBagCount * BAG_PRICE;
  const totalFundsNeeded = parseFloat(tillAmount || '0') + bagsTotal;

  const handleConfirmFunds = async () => {
    setIsProcessing(true);

    try {
      // Simulate Flutterwave disbursement delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update order with till amount and confirm funds
      const { error } = await supabase
        .from('orders')
        .update({
          till_amount: parseFloat(tillAmount || '0'),
          carrier_bags_count: adjustedBagCount,
          carrier_bags_total: bagsTotal,
          funds_confirmed: true,
        })
        .eq('id', order.id);

      if (error) throw error;

      setFundsReceived(true);
      
      toast({
        title: 'Funds Disbursed! 💰',
        description: `K${totalFundsNeeded.toFixed(2)} sent via Mobile Money`,
      });

      setTimeout(() => {
        onFundsConfirmed();
      }, 1500);
    } catch (error: any) {
      console.error('Funding error:', error);
      toast({
        title: 'Disbursement Failed',
        description: error?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isProcessing && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-orange-600" />
            Request Till Funds
          </DialogTitle>
          <DialogDescription>
            Enter the actual till amount and adjust bags if needed before requesting funds.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {fundsReceived ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-700">Funds Received!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                K{totalFundsNeeded.toFixed(2)} sent to your Mobile Money
              </p>
            </div>
          ) : (
            <>
              {/* Till Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="tillAmount">Actual Till Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    K
                  </span>
                  <Input
                    id="tillAmount"
                    type="number"
                    step="0.01"
                    value={tillAmount}
                    onChange={(e) => setTillAmount(e.target.value)}
                    className="pl-8 text-lg font-semibold"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Original estimate: K{order.subtotal.toFixed(2)}
                </p>
              </div>

              {/* Bag Count Adjustment */}
              <div className="space-y-2">
                <Label>Carrier Bags (K{BAG_PRICE.toFixed(2)} each)</Label>
                <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => setAdjustedBagCount(Math.max(0, adjustedBagCount - 1))}
                      disabled={adjustedBagCount === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-bold text-lg w-8 text-center">{adjustedBagCount}</span>
                    <Button
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setAdjustedBagCount(adjustedBagCount + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="font-medium">K{bagsTotal.toFixed(2)}</span>
                </div>
                {adjustedBagCount !== order.carrier_bags_count && (
                  <p className="text-xs text-orange-600">
                    Adjusted from {order.carrier_bags_count || 0} bags
                  </p>
                )}
              </div>

              {/* Total Summary */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Till Amount</span>
                  <span>K{parseFloat(tillAmount || '0').toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Carrier Bags ({adjustedBagCount})</span>
                  <span>K{bagsTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-orange-300">
                  <span>Total Funds Needed</span>
                  <span className="text-orange-700">K{totalFundsNeeded.toFixed(2)}</span>
                </div>
              </div>

              {/* Request Button */}
              <Button
                className="w-full h-12 bg-orange-500 hover:bg-orange-600"
                onClick={handleConfirmFunds}
                disabled={isProcessing || !tillAmount}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing Disbursement...
                  </>
                ) : (
                  <>
                    <Banknote className="h-5 w-5 mr-2" />
                    Request K{totalFundsNeeded.toFixed(2)}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Funds will be sent via Flutterwave to your Mobile Money.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
