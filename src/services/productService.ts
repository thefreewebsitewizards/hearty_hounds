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
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Product, ProductFilters, ApiResponse } from '../utils/types';

const COLLECTION_NAME = 'products';

// Convert Firestore document to Product type
const convertDocToProduct = (doc: DocumentSnapshot): Product | null => {
  if (!doc.exists()) return null;
  
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    description: data.description,
    price: data.price,
    images: data.images || [],
    category: data.category,
    dimensions: data.dimensions,
    weight: data.weight,
    inStock: data.inStock ?? true,
    featured: data.featured ?? false,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Get all products
export const getAllProducts = async (): Promise<ApiResponse<Product[]>> => {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const product = convertDocToProduct(doc);
      if (product) products.push(product);
    });
    
    return {
      success: true,
      data: products,
      message: 'Products fetched successfully',
    };
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to fetch products',
    };
  }
};

// Get featured products
export const getFeaturedProducts = async (limitCount: number = 6): Promise<ApiResponse<Product[]>> => {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    // Simplified query to avoid composite index requirement
    const q = query(
      productsRef,
      where('featured', '==', true),
      where('inStock', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const product = convertDocToProduct(doc);
      if (product) products.push(product);
    });
    
    // Sort by createdAt in memory and limit results
    const sortedProducts = products
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limitCount);
    
    return {
      success: true,
      data: sortedProducts,
      message: 'Featured products fetched successfully',
    };
  } catch (error: any) {
    console.error('Error fetching featured products:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to fetch featured products',
    };
  }
};

// Get products by category
export const getProductsByCategory = async (category: string): Promise<ApiResponse<Product[]>> => {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const q = query(
      productsRef,
      where('category', '==', category),
      where('inStock', '==', true),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const product = convertDocToProduct(doc);
      if (product) products.push(product);
    });
    
    return {
      success: true,
      data: products,
      message: `Products in ${category} category fetched successfully`,
    };
  } catch (error: any) {
    console.error('Error fetching products by category:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to fetch products by category',
    };
  }
};

// Get single product by ID
export const getProductById = async (productId: string): Promise<ApiResponse<Product>> => {
  try {
    const productRef = doc(db, COLLECTION_NAME, productId);
    const productDoc = await getDoc(productRef);
    
    const product = convertDocToProduct(productDoc);
    
    if (!product) {
      return {
        success: false,
        error: 'Product not found',
        message: 'Product not found',
      };
    }
    
    return {
      success: true,
      data: product,
      message: 'Product fetched successfully',
    };
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to fetch product',
    };
  }
};

// Search products
export const searchProducts = async (searchTerm: string): Promise<ApiResponse<Product[]>> => {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation that searches by name
    // For better search, consider using Algolia or similar service
    
    const productsRef = collection(db, COLLECTION_NAME);
    const q = query(
      productsRef,
      where('inStock', '==', true),
      orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const product = convertDocToProduct(doc);
      if (product) {
        // Client-side filtering for search
        const searchLower = searchTerm.toLowerCase();
        if (
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower)
        ) {
          products.push(product);
        }
      }
    });
    
    return {
      success: true,
      data: products,
      message: 'Search completed successfully',
    };
  } catch (error: any) {
    console.error('Error searching products:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to search products',
    };
  }
};

// Get product categories
export const getProductCategories = async (): Promise<ApiResponse<string[]>> => {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const querySnapshot = await getDocs(productsRef);
    
    const categories = new Set<string>();
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.category) {
        categories.add(data.category);
      }
    });
    
    return {
      success: true,
      data: Array.from(categories).sort(),
      message: 'Categories fetched successfully',
    };
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to fetch categories',
    };
  }
};

// Admin functions (for future admin panel)

// Create new product
export const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Product>> => {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(productsRef, {
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    const newProduct: Product = {
      ...productData,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return {
      success: true,
      data: newProduct,
      message: 'Product created successfully',
    };
  } catch (error: any) {
    console.error('Error creating product:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to create product',
    };
  }
};

// Update product
export const updateProduct = async (productId: string, updates: Partial<Product>): Promise<ApiResponse<Product>> => {
  try {
    const productRef = doc(db, COLLECTION_NAME, productId);
    await updateDoc(productRef, {
      ...updates,
      updatedAt: new Date(),
    });
    
    // Fetch updated product
    const updatedProductResponse = await getProductById(productId);
    
    return updatedProductResponse;
  } catch (error: any) {
    console.error('Error updating product:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to update product',
    };
  }
};

// Delete product
export const deleteProduct = async (productId: string): Promise<ApiResponse<void>> => {
  try {
    const productRef = doc(db, COLLECTION_NAME, productId);
    await deleteDoc(productRef);
    
    return {
      success: true,
      message: 'Product deleted successfully',
    };
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to delete product',
    };
  }
};