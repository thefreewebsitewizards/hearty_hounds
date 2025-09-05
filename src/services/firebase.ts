import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { Product, CartItem } from '../utils/types';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';

// Test Firebase connection
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Test Firestore by trying to get a collection reference
    collection(db, 'products');
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
};



export interface Order {
  id?: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'paid';
  paymentMethod?: string;
  stripeSessionId?: string;
  customerEmail?: string;
  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt?: Timestamp;
}



export interface Customer {
  id?: string;
  email: string;
  name?: string;
  createdAt?: Timestamp;
}

export interface UserProfile {
  id?: string;
  uid: string;
  email: string;
  name?: string;
  role: 'customer' | 'admin';
  userType?: 'customer' | 'admin';
  createdAt?: Timestamp;
}

// Authentication functions
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const registerUser = async (email: string, password: string, name?: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile in Firestore
    const userProfile: Omit<UserProfile, 'id'> = {
      uid: userCredential.user.uid,
      email: userCredential.user.email || email,
      name: name || '',
      role: 'customer', // Default role is customer
      createdAt: Timestamp.now()
    };
    
    await addDoc(collection(db, 'Users'), userProfile);
    
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// User profile functions
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const q = query(collection(db, 'Users'), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const userData = { id: doc.id, ...doc.data() } as UserProfile;
      return userData;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const isUserAdmin = async (uid: string): Promise<boolean> => {
  try {
    const userProfile = await getUserProfile(uid);
    return userProfile?.role === 'admin' || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export const updateUserRole = async (uid: string, role: 'customer' | 'admin'): Promise<boolean> => {
  try {
    const q = query(collection(db, 'Users'), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, 'Users', querySnapshot.docs[0].id);
      await updateDoc(docRef, { role });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
};

// Product functions
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
    return products;
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
};

export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
  } catch (error) {
    console.error('Error getting product:', error);
    return null;
  }
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const q = query(collection(db, 'products'), where('category', '==', category));
    const querySnapshot = await getDocs(q);
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
    return products;
  } catch (error) {
    console.error('Error getting products by category:', error);
    return [];
  }
};

export const addProduct = async (productData: Omit<Product, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding product:', error);
    return null;
  }
};

export const updateProduct = async (productId: string, productData: Partial<Product>): Promise<boolean> => {
  try {
    const docRef = doc(db, 'products', productId);
    await updateDoc(docRef, productData);
    return true;
  } catch (error) {
    console.error('Error updating product:', error);
    return false;
  }
};

export const deleteProduct = async (productId: string): Promise<boolean> => {
  try {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }
    
    // Check if user is admin
    const userProfile = await getUserProfile(auth.currentUser.uid);
    
    if (!userProfile || (userProfile.role !== 'admin' && userProfile.userType !== 'admin')) {
      throw new Error('Insufficient permissions: User is not an admin');
    }
    
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
};

// Order functions
export const createOrder = async (orderData: Omit<Order, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
};

// Create order from Stripe checkout session
export const createOrderFromStripeSession = async (
  sessionId: string,
  userId: string,
  items: CartItem[],
  total: number,
  customerEmail: string,
  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  }
): Promise<string | null> => {
  try {
    // First try the Firebase function approach
    try {
      const API_BASE_URL = process.env.REACT_APP_FIREBASE_FUNCTIONS_URL || 'https://us-central1-ksenia-munoz.cloudfunctions.net';
      const requestUrl = `${API_BASE_URL}/createOrderFromPaymentId`;
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          userId,
          customerEmail
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Order created via Firebase function:', result.orderId);
        return result.orderId;
      }
    } catch (functionError) {
      console.warn('⚠️ Firebase function unavailable, falling back to direct Firestore creation:', functionError);
    }
    
    // Fallback: Create order directly in Firestore
    console.log('📝 Creating order directly in Firestore...');
    
    const orderData: Omit<Order, 'id'> = {
      userId,
      items,
      total,
      status: 'paid',
      paymentMethod: 'stripe',
      stripeSessionId: sessionId,
      customerEmail,
      shippingAddress,
      createdAt: Timestamp.now()
    };
    
    const orderId = await createOrder(orderData);
    
    if (orderId) {
      console.log('✅ Order created directly in Firestore:', orderId);
      return orderId;
    } else {
      throw new Error('Failed to create order in Firestore');
    }
    
  } catch (error) {
    console.error('❌ Error creating order from Stripe session:', error);
    return null;
  }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    // Note: getUserOrdersV2 function is not yet deployed as a v2 function
    // TODO: Update to use v2 function URL when deployed
    const API_BASE_URL = process.env.REACT_APP_FIREBASE_FUNCTIONS_URL || 'https://us-central1-ksenia-munoz.cloudfunctions.net';
    
    const response = await fetch(`${API_BASE_URL}/getUserOrdersV2?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get user orders');
    }
    
    const orders = await response.json();
    return orders;
  } catch (error) {
    console.error('Error getting user orders:', error);
    return [];
  }
};

export const getAllOrders = async (): Promise<Order[]> => {
  try {
    // Note: getAllOrdersV2 function is not yet deployed as a v2 function
    // TODO: Update to use v2 function URL when deployed
    const API_BASE_URL = process.env.REACT_APP_FIREBASE_FUNCTIONS_URL || 'https://us-central1-ksenia-munoz.cloudfunctions.net';
    
    const response = await fetch(`${API_BASE_URL}/getAllOrdersV2`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get all orders');
    }
    
    const orders = await response.json();
    return orders;
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
};

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<boolean> => {
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, { status });
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
};

// Customer functions
export const getAllCustomers = async (): Promise<Customer[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'customers'));
    const customers: Customer[] = [];
    querySnapshot.forEach((doc) => {
      customers.push({ id: doc.id, ...doc.data() } as Customer);
    });
    return customers;
  } catch (error) {
    console.error('Error getting customers:', error);
    return [];
  }
};

// Storage functions
export const uploadProductImage = async (file: File, productId: string): Promise<string | null> => {
  try {
    const storageRef = ref(storage, `products/${productId}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

// Upload multiple product images
export const uploadProductImages = async (files: File[], productId: string): Promise<string[]> => {
  try {
    const uploadPromises = files.map(async (file, index) => {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${index}_${file.name}`;
      const storageRef = ref(storage, `products/${productId}/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    });
    
    const downloadURLs = await Promise.all(uploadPromises);
    return downloadURLs.filter(url => url !== null);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    return [];
  }
};

// Analytics functions
export const getAnalyticsData = async () => {
  try {
    const [products, orders, customers] = await Promise.all([
      getAllProducts(),
      getAllOrders(),
      getAllCustomers()
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;

    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalCustomers: customers.length,
      totalRevenue,
      pendingOrders,
      completedOrders,
      recentOrders: orders.slice(0, 5)
    };
  } catch (error) {
    console.error('Error getting analytics data:', error);
    return null;
  }
};

// Category interface
export interface Category {
  id?: string;
  name: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: Timestamp;
}

// Category functions
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'categories'));
    const categories: Category[] = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() } as Category);
    });
    // Sort by displayOrder if available, otherwise by name
    return categories.sort((a, b) => {
      if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
        return a.displayOrder - b.displayOrder;
      }
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

export const getActiveCategories = async (): Promise<Category[]> => {
  try {
    const allCategories = await getAllCategories();
    return allCategories.filter(category => category.isActive !== false);
  } catch (error) {
    console.error('Error getting active categories:', error);
    return [];
  }
};