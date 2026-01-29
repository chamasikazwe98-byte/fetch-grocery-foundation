import { Package } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface LoadSafetyCheckboxProps {
  vehicleType: string | null;
  isChecked: boolean;
  onChange: (checked: boolean) => void;
}

export const LoadSafetyCheckbox = ({
  vehicleType,
  isChecked,
  onChange,
}: LoadSafetyCheckboxProps) => {
  const vehicleLabel = vehicleType 
    ? vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)
    : 'Vehicle';

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Checkbox
          id="loadSafety"
          checked={isChecked}
          onCheckedChange={(checked) => onChange(checked === true)}
          className="mt-1"
        />
        <div className="flex-1">
          <Label htmlFor="loadSafety" className="font-medium text-amber-800 cursor-pointer">
            <Package className="h-4 w-4 inline mr-2" />
            Safety Confirmation Required
          </Label>
          <p className="text-sm text-amber-700 mt-1">
            I confirm the load is secure for my <strong>{vehicleLabel}</strong> and safely packed.
          </p>
        </div>
      </div>
    </div>
  );
};
