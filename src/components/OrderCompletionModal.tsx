import { CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface OrderCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewOrders: () => void;
}

export function OrderCompletionModal({ isOpen, onClose, onViewOrders }: OrderCompletionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <DialogTitle className="text-2xl text-center">Order Complete!</DialogTitle>
          <DialogDescription className="text-center">
            Your order has been delivered successfully. Thank you for using Fetch!
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          {/* Rating Prompt */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              How was your delivery experience?
            </p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className="p-1 hover:scale-110 transition-transform"
                  onClick={() => {
                    // TODO: Implement rating
                  }}
                >
                  <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                </button>
              ))}
            </div>
          </div>

          <Button onClick={onViewOrders} className="w-full">
            View Order History
          </Button>
          
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
