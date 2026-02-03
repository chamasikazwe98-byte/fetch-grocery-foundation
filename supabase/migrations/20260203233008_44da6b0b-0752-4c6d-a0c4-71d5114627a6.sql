-- 1. Create chat messages table for customer-driver communication
CREATE TABLE public.order_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'driver')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;

-- Policies: Only order participants can view/send messages
CREATE POLICY "Order participants can view messages"
  ON public.order_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_messages.order_id 
      AND (customer_id = auth.uid() OR driver_id = auth.uid())
    )
  );

CREATE POLICY "Order participants can send messages"
  ON public.order_messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_messages.order_id 
      AND (customer_id = auth.uid() OR driver_id = auth.uid())
    )
  );

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_messages;

-- 2. Create item unavailability tracking table
CREATE TABLE public.order_item_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL CHECK (issue_type IN ('unavailable', 'substituted')),
  customer_choice TEXT CHECK (customer_choice IN ('replacement', 'refund', NULL)),
  replacement_product_id UUID REFERENCES public.products(id),
  replacement_name TEXT,
  replacement_price NUMERIC(10,2),
  driver_notes TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_item_issues ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Order participants can view item issues"
  ON public.order_item_issues
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_item_issues.order_id 
      AND (customer_id = auth.uid() OR driver_id = auth.uid())
    )
  );

CREATE POLICY "Drivers can create item issues"
  ON public.order_item_issues
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_item_issues.order_id 
      AND driver_id = auth.uid()
    )
  );

CREATE POLICY "Order participants can update item issues"
  ON public.order_item_issues
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_item_issues.order_id 
      AND (customer_id = auth.uid() OR driver_id = auth.uid())
    )
  );

-- Enable realtime for item issues
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_item_issues;

-- 3. Add scheduled delivery columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS scheduled_delivery_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_scheduled BOOLEAN DEFAULT FALSE;

-- 4. Create index for chat messages
CREATE INDEX idx_order_messages_order_id ON public.order_messages(order_id);
CREATE INDEX idx_order_messages_created_at ON public.order_messages(created_at);

-- 5. Create index for item issues
CREATE INDEX idx_order_item_issues_order_id ON public.order_item_issues(order_id);

-- 6. Trigger for updated_at on item issues
CREATE TRIGGER update_order_item_issues_updated_at
  BEFORE UPDATE ON public.order_item_issues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();