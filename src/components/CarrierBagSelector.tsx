import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const BAG_PRICE = 3.50;

interface CarrierBagSelectorProps {
  count: number;
  onChange: (count: number) => void;
}

export const CarrierBagSelector = ({ count, onChange }: CarrierBagSelectorProps) => {
  const total = count * BAG_PRICE;

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ShoppingBag className="h-5 w-5 text-primary" />
        <Label className="font-semibold">Need Carrier Bags?</Label>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Add reusable carrier bags to your order at K{BAG_PRICE.toFixed(2)} each.
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="outline"
            className="h-9 w-9"
            onClick={() => onChange(Math.max(0, count - 1))}
            disabled={count === 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="font-bold text-xl w-8 text-center">{count}</span>
          <Button
            size="icon"
            className="h-9 w-9"
            onClick={() => onChange(count + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {count > 0 && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{count} bag{count > 1 ? 's' : ''}</p>
            <p className="font-bold text-primary">K{total.toFixed(2)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const BAG_UNIT_PRICE = BAG_PRICE;
