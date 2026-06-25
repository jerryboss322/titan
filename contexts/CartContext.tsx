'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD'; product: Product; quantity: number; size?: string; color?: string }
  | { type: 'REMOVE'; productId: string }
  | { type: 'UPDATE_QTY'; productId: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'LOAD'; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const key = `${action.product.id}-${action.size}-${action.color}`;
      const existing = state.items.find(
        i => i.product.id === action.product.id && i.selectedSize === action.size && i.selectedColor === action.color
      );
      if (existing) {
        return {
          items: state.items.map(i =>
            i.product.id === action.product.id && i.selectedSize === action.size && i.selectedColor === action.color
              ? { ...i, quantity: Math.min(10, i.quantity + action.quantity) }
              : i
          ),
        };
      }
      return {
        items: [...state.items, { product: action.product, quantity: action.quantity, selectedSize: action.size, selectedColor: action.color }],
      };
    }
    case 'REMOVE':
      return { items: state.items.filter(i => i.product.id !== action.productId) };
    case 'UPDATE_QTY':
      return {
        items: state.items.map(i =>
          i.product.id === action.productId ? { ...i, quantity: Math.max(1, Math.min(10, action.quantity)) } : i
        ),
      };
    case 'CLEAR':
      return { items: [] };
    case 'LOAD':
      return { items: action.items };
    default:
      return state;
  }
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    const stored = localStorage.getItem('titan_cart');
    if (stored) {
      try { dispatch({ type: 'LOAD', items: JSON.parse(stored) }); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_cart', JSON.stringify(state.items));
  }, [state.items]);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items: state.items,
      totalItems,
      subtotal,
      addToCart: (p, qty = 1, size, color) => dispatch({ type: 'ADD', product: p, quantity: qty, size, color }),
      removeFromCart: (id) => dispatch({ type: 'REMOVE', productId: id }),
      updateQuantity: (id, qty) => dispatch({ type: 'UPDATE_QTY', productId: id, quantity: qty }),
      clearCart: () => dispatch({ type: 'CLEAR' }),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
