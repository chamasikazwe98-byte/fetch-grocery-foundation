import { useState } from 'react';
import { CreditCard, Loader2, CheckCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  orderId: string | null;
  orderTotal: number;
  onPaymentComplete: () => void;
  onClose: () => void;
}

export const PaymentConfirmationModal = ({
  isOpen,
  orderId,
  orderTotal,
  onPaymentComplete,
  onClose,
}: PaymentConfirmationModalProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePayment = async () => {
    if (!orderId) return;

    setIsProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Call the server-side function to confirm payment and update status to pending
      const { error } = await supabase.rpc('confirm_order_payment', {
        p_order_id: orderId,
      });

      if (error) throw error;

      setPaymentSuccess(true);
      
      toast({
        title: 'Payment Successful! ✅',
        description: 'Finding a driver for your order...',
      });

      // Short delay to show success state before redirecting
      setTimeout(() => {
        onPaymentComplete();
      }, 1500);
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
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
            <CreditCard className="h-5 w-5 text-primary" />
            Confirm Payment
          </DialogTitle>
          <DialogDescription>
            Complete your payment to submit your order to drivers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {paymentSuccess ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-700">Payment Confirmed!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Finding a driver for your order...
              </p>
            </div>
          ) : (
            <>
              {/* Order Total */}
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Order Total</span>
                  <span className="text-2xl font-bold text-primary">K{orderTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Secure Payment</p>
                    <p className="text-sm text-blue-700 mt-1">
                      If you are sure of your final order, please press pay to transfer funds into the App.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <Button
                className="w-full h-12 text-base"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Pay K{orderTotal.toFixed(2)}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Your order will only be visible to drivers after payment is confirmed.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
