export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          created_at: string
          debug_mode: boolean | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          debug_mode?: boolean | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          debug_mode?: boolean | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      delivery_zones: {
        Row: {
          created_at: string
          description: string | null
          fee: number
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          fee: number
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          fee?: number
          id?: string
          name?: string
        }
        Relationships: []
      }
      driver_locations: {
        Row: {
          accuracy: number | null
          created_at: string
          driver_id: string
          heading: number | null
          id: string
          latitude: number
          longitude: number
          order_id: string | null
          speed: number | null
          updated_at: string
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          driver_id: string
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          order_id?: string | null
          speed?: number | null
          updated_at?: string
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          driver_id?: string
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          order_id?: string | null
          speed?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_locations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_locations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "pending_orders_for_drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_payouts: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string
          driver_id: string
          id: string
          order_id: string
          status: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          driver_id: string
          id?: string
          order_id: string
          status?: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          driver_id?: string
          id?: string
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_payouts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_payouts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "pending_orders_for_drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      order_item_issues: {
        Row: {
          created_at: string
          customer_choice: string | null
          driver_notes: string | null
          id: string
          issue_type: string
          order_id: string
          order_item_id: string
          replacement_name: string | null
          replacement_price: number | null
          replacement_product_id: string | null
          resolved: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_choice?: string | null
          driver_notes?: string | null
          id?: string
          issue_type: string
          order_id: string
          order_item_id: string
          replacement_name?: string | null
          replacement_price?: number | null
          replacement_product_id?: string | null
          resolved?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_choice?: string | null
          driver_notes?: string | null
          id?: string
          issue_type?: string
          order_id?: string
          order_item_id?: string
          replacement_name?: string | null
          replacement_price?: number | null
          replacement_product_id?: string | null
          resolved?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_item_issues_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_item_issues_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "pending_orders_for_drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_item_issues_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_item_issues_replacement_product_id_fkey"
            columns: ["replacement_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "pending_orders_for_drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          order_id: string
          sender_id: string
          sender_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          order_id: string
          sender_id: string
          sender_type: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          order_id?: string
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "pending_orders_for_drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cancellation_reason: string | null
          carrier_bags_count: number | null
          carrier_bags_total: number | null
          created_at: string
          customer_id: string
          delivery_address: string
          delivery_latitude: number | null
          delivery_longitude: number | null
          delivery_zone_id: string | null
          driver_id: string | null
          driver_payout: number | null
          estimated_package_size: string | null
          funds_confirmed: boolean | null
          id: string
          is_physical_store: boolean | null
          is_scheduled: boolean | null
          notes: string | null
          personal_shopper_fee: number | null
          receipt_image_url: string | null
          requires_car_driver: boolean | null
          scheduled_delivery_time: string | null
          service_fee: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          supermarket_id: string
          till_amount: number | null
          total: number
          updated_at: string
          zone_fee: number
        }
        Insert: {
          cancellation_reason?: string | null
          carrier_bags_count?: number | null
          carrier_bags_total?: number | null
          created_at?: string
          customer_id: string
          delivery_address: string
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          delivery_zone_id?: string | null
          driver_id?: string | null
          driver_payout?: number | null
          estimated_package_size?: string | null
          funds_confirmed?: boolean | null
          id?: string
          is_physical_store?: boolean | null
          is_scheduled?: boolean | null
          notes?: string | null
          personal_shopper_fee?: number | null
          receipt_image_url?: string | null
          requires_car_driver?: boolean | null
          scheduled_delivery_time?: string | null
          service_fee: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          supermarket_id: string
          till_amount?: number | null
          total: number
          updated_at?: string
          zone_fee: number
        }
        Update: {
          cancellation_reason?: string | null
          carrier_bags_count?: number | null
          carrier_bags_total?: number | null
          created_at?: string
          customer_id?: string
          delivery_address?: string
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          delivery_zone_id?: string | null
          driver_id?: string | null
          driver_payout?: number | null
          estimated_package_size?: string | null
          funds_confirmed?: boolean | null
          id?: string
          is_physical_store?: boolean | null
          is_scheduled?: boolean | null
          notes?: string | null
          personal_shopper_fee?: number | null
          receipt_image_url?: string | null
          requires_car_driver?: boolean | null
          scheduled_delivery_time?: string | null
          service_fee?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          supermarket_id?: string
          till_amount?: number | null
          total?: number
          updated_at?: string
          zone_fee?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_delivery_zone_id_fkey"
            columns: ["delivery_zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_supermarket_id_fkey"
            columns: ["supermarket_id"]
            isOneToOne: false
            referencedRelation: "supermarkets"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          in_stock: boolean | null
          is_heavy: boolean | null
          name: string
          price: number
          supermarket_id: string
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          is_heavy?: boolean | null
          name: string
          price: number
          supermarket_id: string
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          is_heavy?: boolean | null
          name?: string
          price?: number
          supermarket_id?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supermarket_id_fkey"
            columns: ["supermarket_id"]
            isOneToOne: false
            referencedRelation: "supermarkets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_available: boolean | null
          latitude: number | null
          longitude: number | null
          phone: string | null
          updated_at: string
          vehicle_type: Database["public"]["Enums"]["vehicle_type"] | null
          wallet_balance: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_available?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          updated_at?: string
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"] | null
          wallet_balance?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_available?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          updated_at?: string
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"] | null
          wallet_balance?: number | null
        }
        Relationships: []
      }
      supermarkets: {
        Row: {
          address: string | null
          branch: string | null
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean | null
          latitude: number
          longitude: number
          name: string
        }
        Insert: {
          address?: string | null
          branch?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude: number
          longitude: number
          name: string
        }
        Update: {
          address?: string | null
          branch?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      pending_orders_for_drivers: {
        Row: {
          created_at: string | null
          delivery_zone_id: string | null
          driver_payout: number | null
          id: string | null
          requires_car_driver: boolean | null
          subtotal: number | null
          supermarket_id: string | null
          zone_fee: number | null
        }
        Insert: {
          created_at?: string | null
          delivery_zone_id?: string | null
          driver_payout?: number | null
          id?: string | null
          requires_car_driver?: boolean | null
          subtotal?: number | null
          supermarket_id?: string | null
          zone_fee?: number | null
        }
        Update: {
          created_at?: string | null
          delivery_zone_id?: string | null
          driver_payout?: number | null
          id?: string | null
          requires_car_driver?: boolean | null
          subtotal?: number | null
          supermarket_id?: string | null
          zone_fee?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_delivery_zone_id_fkey"
            columns: ["delivery_zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_supermarket_id_fkey"
            columns: ["supermarket_id"]
            isOneToOne: false
            referencedRelation: "supermarkets"
            referencedColumns: ["id"]
          },
        ]
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string | null
          vehicle_type: Database["public"]["Enums"]["vehicle_type"] | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string | null
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"] | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string | null
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_order: { Args: { p_order_id: string }; Returns: boolean }
      complete_order_delivery: {
        Args: { p_order_id: string }
        Returns: boolean
      }
      confirm_order_payment: { Args: { p_order_id: string }; Returns: boolean }
      create_secure_order:
        | {
            Args: {
              p_delivery_address: string
              p_delivery_zone_id: string
              p_items: Json
              p_notes: string
              p_supermarket_id: string
            }
            Returns: string
          }
        | {
            Args: {
              p_carrier_bags_count?: number
              p_delivery_address: string
              p_delivery_distance_km?: number
              p_delivery_latitude?: number
              p_delivery_longitude?: number
              p_delivery_zone_id: string
              p_items: Json
              p_notes: string
              p_supermarket_id: string
            }
            Returns: string
          }
        | {
            Args: {
              p_delivery_address: string
              p_delivery_latitude?: number
              p_delivery_longitude?: number
              p_delivery_zone_id: string
              p_items: Json
              p_notes: string
              p_supermarket_id: string
            }
            Returns: string
          }
        | {
            Args: {
              p_delivery_address: string
              p_delivery_distance_km?: number
              p_delivery_latitude?: number
              p_delivery_longitude?: number
              p_delivery_zone_id: string
              p_items: Json
              p_notes: string
              p_supermarket_id: string
            }
            Returns: string
          }
      get_pending_orders_for_drivers: {
        Args: never
        Returns: {
          created_at: string
          delivery_zone_id: string
          driver_payout: number
          id: string
          requires_car_driver: boolean
          subtotal: number
          supermarket_address: string
          supermarket_branch: string
          supermarket_id: string
          supermarket_name: string
          zone_fee: number
          zone_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      upsert_driver_location: {
        Args: {
          p_accuracy?: number
          p_heading?: number
          p_latitude: number
          p_longitude: number
          p_order_id: string
          p_speed?: number
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "customer" | "driver" | "admin"
      order_status:
        | "awaiting_payment"
        | "pending"
        | "accepted"
        | "arrived_at_store"
        | "shopping"
        | "shopping_completed"
        | "ready_for_pickup"
        | "in_transit"
        | "delivered"
        | "cancelled"
      vehicle_type: "bicycle" | "motorcycle" | "car"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["customer", "driver", "admin"],
      order_status: [
        "awaiting_payment",
        "pending",
        "accepted",
        "arrived_at_store",
        "shopping",
        "shopping_completed",
        "ready_for_pickup",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      vehicle_type: ["bicycle", "motorcycle", "car"],
    },
  },
} as const
