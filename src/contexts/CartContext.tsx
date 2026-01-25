import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '@/lib/types';

interface CartContextType {
  items: CartItem[];
  supermarketId: string | null;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  subtotal: number;
  serviceFee: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'fetch_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [supermarketId, setSupermarketId] = useState<string | null>(null);

  // Load cart from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setItems(parsed.items || []);
        setSupermarketId(parsed.supermarketId || null);
      } catch (e) {
        console.error('Error parsing cart:', e);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items, supermarketId }));
  }, [items, supermarketId]);

  const addItem = (product: Product) => {
    // If cart is empty or same supermarket, add item
    if (!supermarketId || supermarketId === product.supermarket_id) {
      setSupermarketId(product.supermarket_id);
      
      setItems(prev => {
        const existing = prev.find(item => item.product.id === product.id);
        if (existing) {
          return prev.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { product, quantity: 1 }];
      });
    } else {
      // Different supermarket - clear cart and add new item
      setItems([{ product, quantity: 1 }]);
      setSupermarketId(product.supermarket_id);
    }
  };

  const removeItem = (productId: string) => {
    setItems(prev => {
      const updated = prev.filter(item => item.product.id !== productId);
      if (updated.length === 0) {
        setSupermarketId(null);
      }
      return updated;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setSupermarketId(null);
  };

  const getItemQuantity = (productId: string) => {
    return items.find(item => item.product.id === productId)?.quantity || 0;
  };

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  const serviceFee = subtotal * 0.1; // 10% service fee

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        supermarketId,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemQuantity,
        subtotal,
        serviceFee,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
