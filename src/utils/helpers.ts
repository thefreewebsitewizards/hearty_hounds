import { CartItem, Product } from './types';

// Currency formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Date formatting
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// Generate unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Calculate cart totals
export const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
};

// Calculate cart item count
export const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

// LocalStorage helpers
export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

// Image URL helpers
export const getImageUrl = (imagePath: string): string => {
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a relative path, prepend the public folder path
  return `${process.env.PUBLIC_URL}/${imagePath}`;
};

// Debounce function for search
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Capitalize first letter
export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Convert string to slug
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Check if product is in cart
export const isProductInCart = (productId: string, cartItems: CartItem[]): boolean => {
  return cartItems.some(item => item.product.id === productId);
};

// Get product quantity in cart
export const getProductQuantityInCart = (productId: string, cartItems: CartItem[]): number => {
  const item = cartItems.find(item => item.product.id === productId);
  return item ? item.quantity : 0;
};

// Filter products based on search and filters
export const filterProducts = (
  products: Product[],
  searchTerm: string,
  category?: string,
  minPrice?: number,
  maxPrice?: number
): Product[] => {
  return products.filter(product => {
    // Search filter
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = !category || product.category === category;
    
    // Price filters
    const matchesMinPrice = minPrice === undefined || product.price >= minPrice;
    const matchesMaxPrice = maxPrice === undefined || product.price <= maxPrice;
    
    return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
  });
};

// Sort products
export const sortProducts = (products: Product[], sortBy: string): Product[] => {
  const sorted = [...products];
  
  switch (sortBy) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    default:
      return sorted;
  }
};