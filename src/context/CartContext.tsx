import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { CartItem, CartState, CartContextType, Product } from '../utils/types';

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<CartItem> } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        // For products, don't add duplicates - just show a message
        return state;
      } else {
        const newItems = [...state.items, action.payload];
        const total = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        const itemCount = newItems.length;
        
        return { items: newItems, total, itemCount, isLoading: false };
      }
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const total = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const itemCount = newItems.length;
      
      return { items: newItems, total, itemCount, isLoading: false };
    }
    
    case 'UPDATE_ITEM': {
      const newItems = state.items.map(item => 
        item.id === action.payload.id 
          ? { ...item, ...action.payload.updates }
          : item
      );
      const total = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const itemCount = newItems.length;
      
      return { items: newItems, total, itemCount, isLoading: false };
    }
    
    case 'CLEAR_CART':
      return { items: [], total: 0, itemCount: 0, isLoading: false };
    
    case 'LOAD_CART': {
      const total = action.payload.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const itemCount = action.payload.length;
      return { items: action.payload, total, itemCount, isLoading: false };
    }
    
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (product: Product, quantity: number = 1) => {
    const existingItem = state.items.find(cartItem => cartItem.id === product.id);
    
    if (existingItem) {
      toast.info(`🎨 ${product.name} is already in your cart!`);
      return;
    }
    
    const cartItem: CartItem = {
      id: product.id,
      product,
      quantity,
      addedAt: new Date()
    };
    
    dispatch({ type: 'ADD_ITEM', payload: cartItem });
    toast.success(`🛒 ${product.name} added to cart!`);
  };

  const removeItem = (id: string) => {
    const item = state.items.find(cartItem => cartItem.id === id);
    dispatch({ type: 'REMOVE_ITEM', payload: id });
    
    if (item) {
      toast.info(`🗑️ ${item.product.name} removed from cart`);
    }
  };

  const updateItem = (id: string, updates: Partial<CartItem>) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { id, updates } });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { id: productId, updates: { quantity } } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    toast.success('🧹 Cart cleared!');
  };

  const value: CartContextType = {
    state,
    items: state.items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount: () => state.itemCount,
    getTotal: () => state.total,
    getItemQuantity: (productId: string) => {
      const item = state.items.find(item => item.id === productId);
      return item ? item.quantity : 0;
    }
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;