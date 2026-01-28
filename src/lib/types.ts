export type AppRole = 'customer' | 'driver' | 'admin';
export type VehicleType = 'bicycle' | 'motorcycle' | 'car';
export type OrderStatus = 'awaiting_payment' | 'pending' | 'accepted' | 'arrived_at_store' | 'shopping' | 'shopping_completed' | 'in_transit' | 'delivered' | 'cancelled';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  wallet_balance: number;
  vehicle_type: VehicleType | null;
  is_available: boolean;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Supermarket {
  id: string;
  name: string;
  branch: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  distance?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  supermarket_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  supermarket?: Supermarket;
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  description: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  driver_id: string | null;
  supermarket_id: string;
  status: OrderStatus;
  delivery_address: string;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  delivery_zone_id: string | null;
  subtotal: number;
  service_fee: number;
  zone_fee: number;
  total: number;
  driver_payout: number | null;
  receipt_image_url: string | null;
  requires_car_driver: boolean;
  cancellation_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  supermarket?: Supermarket;
  items?: OrderItem[];
  customer?: Profile;
  driver?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  product?: Product;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AppSettings {
  id: string;
  user_id: string;
  debug_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface DriverLocation {
  id: string;
  driver_id: string;
  order_id: string | null;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  created_at: string;
  updated_at: string;
}
