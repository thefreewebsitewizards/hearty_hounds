// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  dimensions?: string;
  weight?: string;
  inStock: boolean;
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Cart Types
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  addedAt: Date;
}

export interface CartState {
  items: CartItem[];
  itemCount: number;
  total: number;
  isLoading: boolean;
}

export interface CartContextType {
  state: CartState;
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: () => number;
  getItemQuantity: (productId: string) => number;
}

// User Types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Order Types
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: ShippingAddress;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentIntentId?: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Filter Types
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Stripe Types
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}

// Component Props Types
export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  showAddToCart?: boolean;
  className?: string;
}

export interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}