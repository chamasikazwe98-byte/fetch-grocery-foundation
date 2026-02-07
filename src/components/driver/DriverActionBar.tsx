import { Loader2, Navigation, AlertCircle, Banknote, Camera, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderStatus } from '@/lib/types';

interface DriverActionBarProps {
  orderStatus: OrderStatus;
  nextStatus: OrderStatus | null;
  isShoprite: boolean;
  fundsConfirmed: boolean;
  hasReceipt: boolean;
  loadSafetyConfirmed: boolean;
  isUpdating: boolean;
  hasDeliveryCoords: boolean;
  onStatusUpdate: (status: OrderStatus) => void;
  onRequestFunds: () => void;
  onNavigateToCustomer: () => void;
  getNextStatusLabel: (status: OrderStatus) => string;
}

export const DriverActionBar = ({
  orderStatus,
  nextStatus,
  isShoprite,
  fundsConfirmed,
  hasReceipt,
  loadSafetyConfirmed,
  isUpdating,
  hasDeliveryCoords,
  onStatusUpdate,
  onRequestFunds,
  onNavigateToCustomer,
  getNextStatusLabel,
}: DriverActionBarProps) => {
  const canStartDelivery = orderStatus === 'shopping_completed';
  
  // Determine what to show based on current state
  const showFundingButton = isShoprite && orderStatus === 'shopping_completed' && !fundsConfirmed;
  const showReceiptWarning = canStartDelivery && !hasReceipt && (!isShoprite || fundsConfirmed);
  const showSafetyWarning = canStartDelivery && hasReceipt && !loadSafetyConfirmed;
  const showNavigateButton = orderStatus === 'in_transit' && hasDeliveryCoords;

  // For in_transit, show large navigation button as primary action
  if (showNavigateButton) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 z-40 shadow-lg">
        <Button
          className="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700"
          onClick={onNavigateToCustomer}
        >
          <Navigation className="h-6 w-6 mr-3" />
          Navigate to Customer
        </Button>
        
        {/* Secondary delivery complete button */}
        {nextStatus && (
          <Button
            className="w-full h-12 mt-3"
            variant="outline"
            onClick={() => onStatusUpdate(nextStatus)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Complete Delivery
              </>
            )}
          </Button>
        )}
      </div>
    );
  }

  // For shopping_completed, show appropriate action based on workflow state
  if (showFundingButton) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 z-40 shadow-lg">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3 flex items-center gap-2">
          <Banknote className="h-5 w-5 text-orange-600 flex-shrink-0" />
          <p className="text-sm text-orange-700 font-medium">
            Step 1: Request funds to pay at the till
          </p>
        </div>
        <Button
          className="w-full h-14 text-lg bg-orange-500 hover:bg-orange-600"
          onClick={onRequestFunds}
        >
          <Banknote className="h-5 w-5 mr-2" />
          Request Till Funds
        </Button>
      </div>
    );
  }

  if (!nextStatus) return null;

  // Standard action button for other states
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 z-40 shadow-lg">
      {/* Shoprite funds confirmed message */}
      {isShoprite && orderStatus === 'shopping_completed' && fundsConfirmed && !hasReceipt && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700">
            Step 2: Pay at till, then upload receipt
          </p>
        </div>
      )}

      {showReceiptWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 flex items-center gap-2">
          <Camera className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            Upload receipt photo to unlock delivery
          </p>
        </div>
      )}

      {showSafetyWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            Confirm load is secure to start delivery
          </p>
        </div>
      )}

      <Button
        className="w-full h-14 text-lg"
        onClick={() => onStatusUpdate(nextStatus)}
        disabled={
          isUpdating ||
          (canStartDelivery && !hasReceipt) ||
          (canStartDelivery && !loadSafetyConfirmed) ||
          (isShoprite && orderStatus === 'shopping_completed' && !fundsConfirmed)
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
  );
};
