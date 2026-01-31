import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface StoreSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const StoreSearch = ({ value, onChange, placeholder = 'Search products...' }: StoreSearchProps) => {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3 border-b">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 pr-10 bg-card border-border h-11 text-base"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => onChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
