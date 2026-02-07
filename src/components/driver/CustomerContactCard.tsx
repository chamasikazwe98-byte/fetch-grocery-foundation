import { Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Profile } from '@/lib/types';

interface CustomerContactCardProps {
  customer: Profile | null;
  customerPhone: string | null;
  onOpenChat: () => void;
}

export const CustomerContactCard = ({
  customer,
  customerPhone,
  onOpenChat,
}: CustomerContactCardProps) => {
  return (
    <div className="mx-4 bg-card rounded-xl border border-border p-4 mb-4">
      <h3 className="font-semibold mb-3">Customer</h3>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          {customer?.avatar_url ? (
            <img
              src={customer.avatar_url}
              alt={customer?.full_name || ''}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-xl">👤</span>
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium text-lg">{customer?.full_name || 'Customer'}</p>
        </div>
      </div>

      {/* Prominent Phone Number with Click-to-Call */}
      {customerPhone ? (
        <a
          href={`tel:${customerPhone}`}
          className="flex items-center justify-between w-full p-4 bg-green-50 border-2 border-green-200 rounded-xl mb-3 hover:bg-green-100 transition-colors active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-green-700 font-medium">Tap to call</p>
              <p className="text-lg font-bold text-green-800">{customerPhone}</p>
            </div>
          </div>
          <div className="text-green-600">
            <Phone className="h-6 w-6" />
          </div>
        </a>
      ) : (
        <div className="p-4 bg-muted rounded-xl mb-3 text-center">
          <p className="text-sm text-muted-foreground">Phone number not available</p>
        </div>
      )}

      {/* Chat Button */}
      <Button
        variant="outline"
        className="w-full border-primary text-primary"
        onClick={onOpenChat}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Message Customer
      </Button>
    </div>
  );
};
