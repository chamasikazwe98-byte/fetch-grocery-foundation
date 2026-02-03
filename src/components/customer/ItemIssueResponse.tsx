import { useState } from 'react';
import { RefreshCw, Banknote, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ItemIssue {
  id: string;
  order_id: string;
  order_item_id: string;
  issue_type: string;
  customer_choice: string | null;
  driver_notes: string | null;
  resolved: boolean;
  product_name?: string;
}

interface ItemIssueResponseProps {
  issue: ItemIssue;
  onResolved: () => void;
}

export const ItemIssueResponse = ({ issue, onResolved }: ItemIssueResponseProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChoice = async (choice: 'replacement' | 'refund') => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('order_item_issues')
        .update({
          customer_choice: choice,
          resolved: true,
        })
        .eq('id', issue.id);

      if (error) throw error;

      // Send message to driver
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('order_messages').insert({
          order_id: issue.order_id,
          sender_id: user.id,
          sender_type: 'customer',
          message: choice === 'replacement'
            ? `✅ I'd like a replacement for "${issue.product_name}". Please pick a similar item.`
            : `💰 Please refund for "${issue.product_name}". No replacement needed.`,
        });
      }

      toast({
        title: choice === 'replacement' ? 'Replacement requested' : 'Refund requested',
        description: 'Your driver has been notified.',
      });

      onResolved();
    } catch (error) {
      console.error('Error responding to issue:', error);
      toast({
        title: 'Error',
        description: 'Failed to send your response.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (issue.resolved) return null;

  return (
    <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-amber-800">Item Unavailable</h4>
          <p className="text-sm text-amber-700 mt-1">
            <span className="font-medium">"{issue.product_name}"</span> is not available.
          </p>
          {issue.driver_notes && (
            <p className="text-xs text-amber-600 mt-1 italic">
              Driver note: {issue.driver_notes}
            </p>
          )}
          
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={() => handleChoice('replacement')}
              disabled={isSubmitting}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Replacement
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
              onClick={() => handleChoice('refund')}
              disabled={isSubmitting}
            >
              <Banknote className="h-4 w-4 mr-1" />
              Refund
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
