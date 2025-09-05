import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { getAllProducts, addProduct, updateProduct, deleteProduct, updateOrderStatus, uploadProductImage, uploadProductImages } from '../services/firebase';
import { Product } from '../utils/types';
import { collection, getDocs, query, where, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: any;
}

interface Order {
  id: string;
  userId: string;
  customerEmail?: string;
  items: any[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'paid';
  createdAt?: any;
  paymentMethod?: string;
  shippingAddress?: any;
}

interface SellerAddress {
  id?: string;
  name: string;
  company?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  createdAt?: any;
  updatedAt?: any;
}

const Admin: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    images: [] as string[],
    weight: '',
    dimensions: '',
    featured: false
  });
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [sellerAddress, setSellerAddress] = useState<SellerAddress | null>(null);
  const [showEditAddress, setShowEditAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: '',
    company: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    phone: ''
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<{index: number, name: string} | null>(null);

  useEffect(() => {
    loadDashboardData();
    loadSellerAddress();
    loadCategories();
  }, []);

  // Admin verification
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to access the admin panel.</p>
          <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }



  const handleAddProduct = async () => {
    try {
      let imageUrls = [...productForm.images];
      
      // If files are selected, upload them first
      if (selectedImageFiles.length > 0) {
        const tempProductId = Date.now().toString(); // Temporary ID for upload
        const uploadedImageUrls = await uploadProductImages(selectedImageFiles, tempProductId);
        if (uploadedImageUrls.length > 0) {
          imageUrls = uploadedImageUrls;
        } else {
          toast.error('❌ Failed to upload images. Please try again.');
          return;
        }
      }
      
      if (imageUrls.length === 0) {
        toast.error('❌ Please add at least one product image.');
        return;
      }
      
      const productData = {
        ...productForm,
        images: imageUrls,
        image: imageUrls[0], // Set first image as legacy image field
        price: parseFloat(productForm.price),
        weight: productForm.weight || undefined,
        inStock: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await addProduct(productData);
      setShowAddProduct(false);
      setProductForm({ name: '', description: '', price: '', category: '', images: [], weight: '', dimensions: '', featured: false });
      setSelectedImageFiles([]);
      setImagePreviews([]);
      loadDashboardData(); // Refresh data
      toast.success(`✅ Product "${productForm.name}" added successfully!`);
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('❌ Failed to add product. Please try again.');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      images: product.images || [],
      weight: product.weight || '',
      dimensions: product.dimensions || '',
      featured: product.featured || false
    });
    setSelectedImageFiles([]);
    setImagePreviews([]);
    setExistingImages(product.images || []);
    setImagesToDelete([]);
    setShowAddProduct(true);
  };

  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };
  
  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    
    // Validate files
    const validFiles: File[] = [];
    
    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`❌ ${file.name} is not a valid image file.`);
        continue;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`❌ ${file.name} is too large. Maximum size is 5MB.`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (validFiles.length === 0) return;
    
    // Limit to 10 images total (existing + new)
    const currentTotal = existingImages.length + selectedImageFiles.length + validFiles.length;
    if (currentTotal > 10) {
      toast.error('❌ Maximum 10 images allowed per product.');
      return;
    }
    
    setSelectedImageFiles(prev => [...prev, ...validFiles]);
    
    // Create previews for new files
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreviews(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    }
  };
  
  const removeImage = (index: number) => {
    setSelectedImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeExistingImage = (index: number) => {
    const imageToDelete = existingImages[index];
    setExistingImages(prev => prev.filter((_, i) => i !== index));
    setImagesToDelete(prev => [...prev, imageToDelete]);
  };
  
  const restoreImage = (imageUrl: string) => {
    setExistingImages(prev => [...prev, imageUrl]);
    setImagesToDelete(prev => prev.filter(url => url !== imageUrl));
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct?.id) return;
    try {
      let imageUrls = [...existingImages];
      
      // If new files are selected, upload them
      if (selectedImageFiles.length > 0) {
        const uploadedImageUrls = await uploadProductImages(selectedImageFiles, editingProduct.id);
        if (uploadedImageUrls.length > 0) {
          imageUrls = [...imageUrls, ...uploadedImageUrls];
        } else {
          toast.error('❌ Failed to upload new images. Please try again.');
          return;
        }
      }
      
      if (imageUrls.length === 0) {
        toast.error('❌ Please keep at least one product image.');
        return;
      }
      
      const productData = {
        ...productForm,
        images: imageUrls,
        image: imageUrls[0], // Set first image as legacy image field
        price: parseFloat(productForm.price),
        weight: productForm.weight || undefined,
        updatedAt: new Date()
      };
      
      await updateProduct(editingProduct.id, productData);
      setShowAddProduct(false);
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: '', category: '', images: [], weight: '', dimensions: '', featured: false });
      setSelectedImageFiles([]);
      setImagePreviews([]);
      setExistingImages([]);
      setImagesToDelete([]);
      loadDashboardData(); // Refresh data
      toast.success(`✏️ Product "${productForm.name}" updated successfully!`);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('❌ Failed to update product. Please try again.');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const result = await deleteProduct(productId);
        
        if (result) {
          loadDashboardData(); // Refresh data
          toast.success(`🗑️ Product "${product?.name || 'Unknown'}" deleted successfully!`);
        } else {
          toast.error('❌ Failed to delete product. Check console for details.');
        }
      } catch (error) {
        console.error('❌ Error deleting product:', error);
        toast.error('❌ Failed to delete product. Please try again.');
      }
    }
  };

  const handleProductSubmit = () => {
    if (editingProduct) {
      handleUpdateProduct();
    } else {
      handleAddProduct();
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadDashboardData(); // Refresh data
      toast.success(`✅ Order status updated to "${newStatus}"`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('❌ Failed to update order status. Please try again.');
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load products
      const productsData = await getAllProducts();
      setProducts(productsData);
      
      // Load customers
      const customersQuery = query(collection(db, 'Users'));
      const customersSnapshot = await getDocs(customersQuery);
      const customersData = customersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Customer[];
      setCustomers(customersData);
      
      // Load orders
      const ordersQuery = query(collection(db, 'orders'));
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
      
      // Calculate stats
      const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total || 0), 0);
      setStats({
        totalProducts: productsData.length,
        totalOrders: ordersData.length,
        totalCustomers: customersData.length,
        totalRevenue: totalRevenue
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { id: 'products', label: 'Products', icon: 'fas fa-box' },
    { id: 'orders', label: 'Orders', icon: 'fas fa-shopping-cart' },
    { id: 'customers', label: 'Customers', icon: 'fas fa-users' },
    { id: 'seller-address', label: 'Seller Address', icon: 'fas fa-map-marker-alt' },
    { id: 'categories', label: 'Categories', icon: 'fas fa-tags' },
    { id: 'analytics', label: 'Analytics', icon: 'fas fa-chart-bar' }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300" style={{borderRadius: '300px'}}>
          <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-500 to-blue-600 rounded-full flex items-center justify-center text-white mr-3 sm:mr-4">
          <i className="fas fa-box text-lg sm:text-xl"></i>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{loading ? '...' : stats.totalProducts}</h3>
          <p className="text-gray-600 text-xs sm:text-sm">Total Products</p>
              </div>
            </div>
        </div>
        
        <div className="bg-white shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300" style={{borderRadius: '300px'}}>
          <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-pink-500 rounded-full flex items-center justify-center text-white mr-3 sm:mr-4">
          <i className="fas fa-shopping-cart text-lg sm:text-xl"></i>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{loading ? '...' : stats.totalOrders}</h3>
          <p className="text-gray-600 text-xs sm:text-sm">Total Orders</p>
              </div>
            </div>
        </div>
        
        <div className="bg-white shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300" style={{borderRadius: '300px'}}>
          <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center text-white mr-3 sm:mr-4">
          <i className="fas fa-users text-lg sm:text-xl"></i>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{loading ? '...' : stats.totalCustomers}</h3>
          <p className="text-gray-600 text-xs sm:text-sm">Total Customers</p>
              </div>
            </div>
        </div>
        
        <div className="bg-white shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300" style={{borderRadius: '300px'}}>
          <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-pink-400 rounded-full flex items-center justify-center text-white mr-3 sm:mr-4">
          <i className="fas fa-dollar-sign text-lg sm:text-xl"></i>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{loading ? '...' : `$${stats.totalRevenue.toLocaleString()}`}</h3>
          <p className="text-gray-600 text-xs sm:text-sm">Total Revenue</p>
              </div>
            </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Recent Activity</h3>
        <div className="space-y-3 sm:space-y-4">
          {loading ? (
            <div className="text-center py-6 sm:py-8">
              <i className="fas fa-spinner fa-spin text-xl sm:text-2xl text-gray-400 mb-2"></i>
              <p className="text-gray-500 text-sm sm:text-base">Loading recent activity...</p>
            </div>
          ) : (
            <>
              {/* Recent Orders */}
              {orders.slice(0, 2).map((order) => (
                <div key={`order-${order.id}`} className="flex items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm mr-2 sm:mr-3 flex-shrink-0">
                    <i className="fas fa-shopping-cart"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-medium text-sm sm:text-base">New order received</p>
                    <p className="text-gray-600 text-xs sm:text-sm truncate">Order #{order.id?.slice(-8) || 'N/A'} - ${order.total?.toFixed(2) || '0.00'}</p>
                  </div>
                  <span className="text-gray-500 text-xs sm:text-sm flex-shrink-0 ml-2">
                    {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              ))}
              
              {/* Recent Products */}
              {products.slice(0, 2).map((product) => (
                <div key={`product-${product.id}`} className="flex items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm mr-2 sm:mr-3 flex-shrink-0">
                    <i className="fas fa-box"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-medium text-sm sm:text-base">Product available</p>
                    <p className="text-gray-600 text-xs sm:text-sm truncate">{product.name} - ${product.price}</p>
                  </div>
                  <span className="text-gray-500 text-xs sm:text-sm flex-shrink-0 ml-2">
                    ${product.price}
                  </span>
                </div>
              ))}
              
              {/* Recent Customers */}
              {customers.slice(0, 1).map((customer) => (
                <div key={`customer-${customer.id}`} className="flex items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm mr-2 sm:mr-3 flex-shrink-0">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-medium text-sm sm:text-base">Customer registered</p>
                    <p className="text-gray-600 text-xs sm:text-sm truncate">{customer.email}</p>
                  </div>
                  <span className="text-gray-500 text-xs sm:text-sm flex-shrink-0 ml-2">
                    {customer.createdAt ? new Date(customer.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              ))}
              
              {orders.length === 0 && products.length === 0 && customers.length === 0 && (
                <div className="text-center py-8">
                  <i className="fas fa-clock text-4xl text-gray-300 mb-2"></i>
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Product Management</h2>
        <button 
          onClick={() => setShowAddProduct(true)}
          className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:from-blue-500 hover:to-blue-700 transition-all duration-200 flex items-center justify-center text-sm sm:text-base"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Product
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <i className="fas fa-spinner fa-spin text-3xl sm:text-4xl text-gray-400 mb-3 sm:mb-4"></i>
            <p className="text-gray-500 text-sm sm:text-base">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <i className="fas fa-box-open text-4xl sm:text-6xl text-gray-300 mb-3 sm:mb-4"></i>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-4 text-sm sm:text-base">Start by adding your first product to the shop.</p>
            <button 
              onClick={() => setShowAddProduct(true)}
              className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:from-blue-500 hover:to-blue-700 transition-all duration-200 text-sm sm:text-base"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {/* Mobile Card View */}
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col space-y-4">
                      {/* Product Image and Basic Info */}
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <img 
                            src={product.images?.[0] || '/images/placeholder.jpg'} 
                            alt={product.name}
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl shadow-sm border border-gray-100"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-lg text-gray-900 mb-1 leading-tight">{product.name}</h4>
                          <div className="flex items-center mb-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                              {product.category}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-pink-600">${product.price}</span>
                            <span className="text-xs text-gray-500">ID: {product.id?.slice(-6) || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="flex-1 flex items-center justify-center px-4 py-3 bg-pink-100 text-pink-700 rounded-xl hover:bg-pink-200 active:bg-pink-300 transition-all duration-200 text-sm font-medium touch-manipulation"
                        >
                          <i className="fas fa-edit mr-2"></i>
                          Edit Product
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id!)}
                          className="flex-1 flex items-center justify-center px-4 py-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 active:bg-red-200 transition-all duration-200 text-sm font-medium touch-manipulation"
                        >
                          <i className="fas fa-trash mr-2"></i>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Desktop Table View */}
              <table className="hidden md:table w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Product</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Category</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Price</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <img 
                              src={product.images?.[0] || '/images/placeholder.jpg'} 
                              alt={product.name}
                              className="w-14 h-14 object-cover rounded-lg shadow-sm border border-gray-200"
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{product.name}</h4>
                            <p className="text-sm text-gray-500">ID: {product.id?.slice(-8) || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-lg font-bold text-gray-900">${product.price}</span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex justify-center space-x-3">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="inline-flex items-center px-3 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-all duration-200 text-sm font-medium"
                            title="Edit Product"
                          >
                            <i className="fas fa-edit mr-1"></i>
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id!)}
                            className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 text-sm font-medium"
                            title="Delete Product"
                          >
                            <i className="fas fa-trash mr-1"></i>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Order Management</h2>
      
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <i className="fas fa-spinner fa-spin text-3xl sm:text-4xl text-gray-400 mb-3 sm:mb-4"></i>
            <p className="text-gray-500 text-sm sm:text-base">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <i className="fas fa-shopping-cart text-4xl sm:text-6xl text-gray-300 mb-3 sm:mb-4"></i>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No Orders Found</h3>
            <p className="text-gray-500 text-sm sm:text-base">No orders have been placed yet.</p>
          </div>
        ) : (
          <div>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                        <i className="fas fa-receipt text-pink-600"></i>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">#{order.id?.slice(-8) || 'N/A'}</h4>
                        <p className="text-sm text-gray-600">{order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900">${order.total?.toFixed(2) || '0.00'}</span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Customer:</span>
                      <span className="text-sm font-medium text-gray-900">{order.customerEmail || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Items:</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {order.items?.length || 0} items
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <select
                      value={order.status || 'pending'}
                      onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value as Order['status'])}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                        order.status === 'delivered' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        order.status === 'shipped' ? 'bg-pink-50 text-pink-800 border-pink-200' :
                        order.status === 'processing' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        order.status === 'paid' ? 'bg-pink-50 text-pink-800 border-pink-200' :
                        order.status === 'pending' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        order.status === 'cancelled' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        'bg-gray-50 text-gray-800 border-gray-200'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="processing">Preparing</option>
                      <option value="shipped">Shipped Out</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Order ID</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Customer</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Date</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Items</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Total</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                            <i className="fas fa-receipt text-pink-600 text-sm"></i>
                          </div>
                          <span className="font-medium text-gray-900">#{order.id?.slice(-8) || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <i className="fas fa-user text-blue-600 text-sm"></i>
                          </div>
                          <span className="text-gray-900">{order.customerEmail || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {order.items?.length || 0} items
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-lg font-bold text-gray-900">${order.total?.toFixed(2) || '0.00'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={order.status || 'pending'}
                          onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value as Order['status'])}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                            order.status === 'delivered' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            order.status === 'shipped' ? 'bg-pink-50 text-pink-800 border-pink-200' :
                            order.status === 'processing' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            order.status === 'paid' ? 'bg-pink-50 text-pink-800 border-pink-200' :
                            order.status === 'pending' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            order.status === 'cancelled' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            'bg-gray-50 text-gray-800 border-gray-200'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="processing">Preparing</option>
                          <option value="shipped">Shipped Out</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Seller Address CRUD Functions
  const loadSellerAddress = async () => {
    try {
      const addressesRef = collection(db, 'sellerAddresses');
      const snapshot = await getDocs(addressesRef);
      
      if (!snapshot.empty) {
        const addressDoc = snapshot.docs[0]; // Get the first (and only) address
        const addressData = {
          id: addressDoc.id,
          ...addressDoc.data()
        } as SellerAddress;
        setSellerAddress(addressData);
      } else {
        setSellerAddress(null);
      }
    } catch (error) {
      console.error('Error loading seller address:', error);
      toast.error('❌ Failed to load seller address.');
    }
  };

  const handleSaveAddress = async () => {
    try {
      const addressData = {
        ...addressForm,
        updatedAt: new Date()
      };
      
      if (sellerAddress?.id) {
        // Update existing address
        const addressRef = doc(db, 'sellerAddresses', sellerAddress.id);
        await updateDoc(addressRef, addressData);
        toast.success(`✏️ Address updated successfully!`);
      } else {
        // Create new address (delete any existing ones first to ensure only one)
        const addressesRef = collection(db, 'sellerAddresses');
        const snapshot = await getDocs(addressesRef);
        
        // Delete existing addresses
        for (const docSnapshot of snapshot.docs) {
          await deleteDoc(doc(db, 'sellerAddresses', docSnapshot.id));
        }
        
        // Add new address
        const newAddressData = {
          ...addressData,
          createdAt: new Date()
        };
        await addDoc(addressesRef, newAddressData);
        toast.success(`✅ Address added successfully!`);
      }
      
      setShowEditAddress(false);
      setAddressForm({
        name: '',
        company: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'US',
        phone: ''
      });
      loadSellerAddress();
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('❌ Failed to save address. Please try again.');
    }
  };

  const handleEditAddress = () => {
    if (sellerAddress) {
      setAddressForm({
        name: sellerAddress.name,
        company: sellerAddress.company || '',
        street: sellerAddress.street,
        city: sellerAddress.city,
        state: sellerAddress.state,
        zip: sellerAddress.zip,
        country: sellerAddress.country,
        phone: sellerAddress.phone || ''
      });
    } else {
      setAddressForm({
        name: '',
        company: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'US',
        phone: ''
      });
    }
    setShowEditAddress(true);
  };

  const handleDeleteAddress = async () => {
    if (!sellerAddress?.id || !window.confirm('Are you sure you want to delete this address?')) {
      return;
    }
    
    try {
      const addressRef = doc(db, 'sellerAddresses', sellerAddress.id);
      await deleteDoc(addressRef);
      setSellerAddress(null);
      toast.success('🗑️ Address deleted successfully!');
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('❌ Failed to delete address. Please try again.');
    }
  };

  // Category Management Functions
  const loadCategories = async () => {
    try {
      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);
      const categoryList = snapshot.docs.map(doc => doc.data().name);
      setCategories(categoryList.sort());
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback to default categories if none exist
      setCategories(['Dog Food', 'Dog Toys', 'Dog Accessories', 'Dog Treats', 'Dog Health']);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error('❌ Please enter a category name.');
      return;
    }
    
    if (categories.includes(newCategory.trim())) {
      toast.error('❌ Category already exists.');
      return;
    }

    try {
      const categoriesRef = collection(db, 'categories');
      await addDoc(categoriesRef, {
        name: newCategory.trim(),
        createdAt: new Date()
      });
      
      setCategories([...categories, newCategory.trim()].sort());
      setNewCategory('');
      setShowAddCategory(false);
      toast.success(`✅ Category "${newCategory.trim()}" added successfully!`);
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('❌ Failed to add category. Please try again.');
    }
  };

  const handleEditCategory = async (oldName: string, newName: string) => {
    if (!newName.trim()) {
      toast.error('❌ Please enter a category name.');
      return;
    }
    
    if (categories.includes(newName.trim()) && newName.trim() !== oldName) {
      toast.error('❌ Category already exists.');
      return;
    }

    try {
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, where('name', '==', oldName));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docRef = doc(db, 'categories', snapshot.docs[0].id);
        await updateDoc(docRef, {
          name: newName.trim(),
          updatedAt: new Date()
        });
      }
      
      const updatedCategories = categories.map(cat => cat === oldName ? newName.trim() : cat);
      setCategories(updatedCategories.sort());
      setEditingCategory(null);
      toast.success(`✅ Category updated successfully!`);
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('❌ Failed to update category. Please try again.');
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    if (!window.confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
      return;
    }

    try {
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, where('name', '==', categoryName));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        await deleteDoc(doc(db, 'categories', snapshot.docs[0].id));
      }
      
      setCategories(categories.filter(cat => cat !== categoryName));
      toast.success(`🗑️ Category "${categoryName}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('❌ Failed to delete category. Please try again.');
    }
  };

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Category Management</h2>
        <button 
          onClick={() => setShowAddCategory(true)}
          className="bg-gradient-to-r from-pink-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-pink-600 hover:to-blue-700 transition-all duration-200 flex items-center"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Category
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        {loading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-500">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-tags text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Categories Found</h3>
            <p className="text-gray-500 mb-4">Add your first product category to get started.</p>
            <button 
              onClick={() => setShowAddCategory(true)}
              className="bg-gradient-to-r from-pink-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-pink-600 hover:to-blue-700 transition-all duration-200"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                {editingCategory?.index === index ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleEditCategory(category, editingCategory.name);
                        }
                      }}
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditCategory(category, editingCategory.name)}
                        className="flex-1 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="flex-1 bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <i className="fas fa-tag text-pink-500 mr-2"></i>
                      <span className="font-medium text-gray-800">{category}</span>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setEditingCategory({index, name: category})}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                        title="Edit category"
                      >
                        <i className="fas fa-edit text-sm"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                        title="Delete category"
                      >
                        <i className="fas fa-trash text-sm"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Add New Category</h3>
              <button
                onClick={() => {
                  setShowAddCategory(false);
                  setNewCategory('');
                }}
                className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Enter category name"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCategory();
                    }
                  }}
                  autoFocus
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddCategory(false);
                    setNewCategory('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-blue-600 text-white rounded-lg hover:from-pink-600 hover:to-blue-700 transition-all duration-200 font-medium"
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSellerAddress = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Origin Address Management</h2>
        <div className="flex space-x-3">
          <button 
            onClick={loadSellerAddress}
            className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-500 hover:to-blue-700 transition-all duration-200 flex items-center"
          >
            <i className="fas fa-refresh mr-2"></i>
            Refresh
          </button>
          {!sellerAddress && (
            <button 
              onClick={handleEditAddress}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-2 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200 flex items-center"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Address
            </button>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        {loading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-500">Loading address...</p>
          </div>
        ) : !sellerAddress ? (
          <div className="text-center py-12">
            <i className="fas fa-map-marker-alt text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Origin Address Found</h3>
            <p className="text-gray-500 mb-4">Add your shipping origin address to start processing orders.</p>
            <button 
              onClick={handleEditAddress}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-2 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Address
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">{sellerAddress.name}</h4>
                  {sellerAddress.company && (
                    <p className="text-sm text-gray-600">{sellerAddress.company}</p>
                  )}
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full mt-2 inline-block">
                    Origin Address
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1 mb-6">
                <p className="flex items-center"><i className="fas fa-map-marker-alt mr-2 text-gray-400"></i>{sellerAddress.street}</p>
                <p className="flex items-center"><i className="fas fa-city mr-2 text-gray-400"></i>{sellerAddress.city}, {sellerAddress.state} {sellerAddress.zip}</p>
                <p className="flex items-center"><i className="fas fa-flag mr-2 text-gray-400"></i>{sellerAddress.country}</p>
                {sellerAddress.phone && <p className="flex items-center"><i className="fas fa-phone mr-2 text-gray-400"></i>{sellerAddress.phone}</p>}
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={handleEditAddress}
                  className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Edit Address
                </button>
                <button 
                  onClick={handleDeleteAddress}
                  className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                  <i className="fas fa-trash mr-2"></i>
                  Delete Address
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'products':
        return renderProducts();
      case 'orders':
        return renderOrders();
      case 'customers':
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Customer Management</h2>
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              {loading ? (
                <div className="text-center py-8 sm:py-12">
                  <i className="fas fa-spinner fa-spin text-3xl sm:text-4xl text-gray-400 mb-3 sm:mb-4"></i>
                  <p className="text-gray-500 text-sm sm:text-base">Loading customers...</p>
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <i className="fas fa-users text-4xl sm:text-6xl text-gray-300 mb-3 sm:mb-4"></i>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No Customers Found</h3>
                  <p className="text-gray-500 text-sm sm:text-base">No customers have registered yet.</p>
                </div>
              ) : (
                <div>
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3">
                    {customers.map((customer) => (
                      <div key={customer.id} className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2.5">
                              <span className="text-white font-semibold text-xs">
                                {customer.name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-neutral-900 text-sm">{customer.name}</h4>
                              <p className="text-xs text-neutral-600">ID: {customer.id?.slice(-8) || 'N/A'}</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                        
                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-neutral-600">Email:</span>
                            <span className="text-xs font-medium text-neutral-900 truncate ml-2">{customer.email}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-neutral-600">Role:</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                              customer.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800 border-purple-200' 
                                : 'bg-blue-100 text-blue-800 border-blue-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                customer.role === 'admin' ? 'bg-purple-400' : 'bg-blue-400'
                              }`}></span>
                              {customer.role || 'Customer'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-neutral-600">Joined:</span>
                            <span className="text-xs font-medium text-neutral-900">
                              {customer.createdAt ? new Date(customer.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b-2 border-gray-200">
                          <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Customer</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Email</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Role</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Joined</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {customers.map((customer) => (
                          <tr key={customer.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                                  <span className="text-white font-semibold text-sm">
                                    {customer.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                                  <p className="text-sm text-gray-500">ID: {customer.id?.slice(-8) || 'N/A'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-gray-900">{customer.email}</td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                                customer.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-800 border-purple-200' 
                                  : 'bg-blue-100 text-blue-800 border-blue-200'
                              }`}>
                                <span className={`w-2 h-2 rounded-full mr-2 ${
                                  customer.role === 'admin' ? 'bg-purple-400' : 'bg-blue-400'
                                }`}></span>
                                {customer.role || 'Customer'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-gray-600">
                              {customer.createdAt ? new Date(customer.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="py-4 px-6">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'seller-address':
        return renderSellerAddress();
      case 'categories':
        return renderCategories();
      case 'analytics':
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Analytics</h2>
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <p className="text-gray-600 text-center py-8 sm:py-12 text-sm sm:text-base">Analytics dashboard coming soon...</p>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
      {/* Floating Island Sidebar */}
      <aside className={`fixed top-3 left-3 lg:top-6 lg:left-6 z-50 w-64 lg:w-72 bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-lg border border-white/20 text-white transform transition-all duration-300 ease-in-out shadow-2xl ${
         sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
       } lg:translate-x-0 lg:opacity-100`} style={{height: 'calc(100vh - 1.5rem)', borderTopLeftRadius: '30px', borderBottomRightRadius: '30px'}}>
        <div className="flex items-center justify-center h-16 lg:h-20 border-b border-white/20 px-4 lg:px-6">
          <i className="fas fa-paw text-yellow-400 mr-2 lg:mr-3 text-xl lg:text-2xl"></i>
                <h2 className="text-lg lg:text-xl font-bold font-chewy bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">Hearty Hounds Admin</h2>
        </div>
        
        <nav className="mt-4 lg:mt-6 px-4 lg:px-6">
          <ul className="space-y-2 lg:space-y-3">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 lg:px-5 py-3 lg:py-4 text-left rounded-xl lg:rounded-2xl transition-all duration-300 group ${
                    activeSection === item.id
                      ? 'bg-white shadow-lg'
                      : 'hover:bg-white/10 hover:backdrop-blur-sm'
                  }`}
                >
                  <i className={`${item.icon} mr-3 lg:mr-4 w-4 lg:w-5 text-center text-base lg:text-lg ${
                    activeSection === item.id ? 'text-gray-700' : 'text-gray-200 group-hover:text-white'
                  }`}></i>
                  <span className={`font-medium text-sm lg:text-base ${
                     activeSection === item.id ? 'text-gray-700' : 'text-gray-200 group-hover:text-white'
                   }`}>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-4 lg:bottom-6 left-4 lg:left-6 right-4 lg:right-6">
          <Link
            to="/"
            className="w-full flex items-center justify-center px-3 lg:px-5 py-3 lg:py-4 bg-white/10 hover:bg-white/20 rounded-xl lg:rounded-2xl transition-all duration-300 border border-white/20 hover:border-white/30 group"
          >
            <i className="fas fa-sign-out-alt mr-2 lg:mr-3 text-gray-200 group-hover:text-white text-sm lg:text-base"></i>
            <span className="font-medium text-gray-200 group-hover:text-white text-sm lg:text-base">Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="lg:ml-80 transition-all duration-300">
        {/* Floating Header */}
        <header className="mx-3 lg:mx-6 mt-3 lg:mt-6 mb-4 lg:mb-6 bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-lg border border-white/20 shadow-xl" style={{borderRadius: '30px'}}>
          <div className="flex items-center justify-between px-4 lg:px-8 py-4 lg:py-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden mr-3 text-white/90 hover:text-white p-2 rounded-xl hover:bg-white/20 transition-all duration-200"
              >
                <i className="fas fa-bars text-lg lg:text-xl"></i>
              </button>
              <h1 className="text-xl lg:text-3xl font-bold text-white capitalize">
                {activeSection}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-accent-400 to-accent-500 rounded-full flex items-center justify-center">
                <i className="fas fa-user text-accent-800 text-sm lg:text-lg"></i>
              </div>
              <span className="text-white/90 font-semibold text-sm lg:text-base hidden sm:block">Admin</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="px-3 lg:px-6 pb-4 lg:pb-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl lg:rounded-2xl border border-gray-200 shadow-lg p-4 lg:p-8 min-h-[calc(100vh-10rem)] lg:min-h-[calc(100vh-12rem)]">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Product Form Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-lg border border-gray-200 shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto scrollbar-hide" style={{borderTopLeftRadius: '30px', borderBottomRightRadius: '30px', scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            <div className="p-3 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddProduct(false);
                    setEditingProduct(null);
                    setProductForm({ name: '', description: '', price: '', category: '', images: [], weight: '', dimensions: '', featured: false });
                    setSelectedImageFiles([]);
                    setImagePreviews([]);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  <i className="fas fa-times text-lg sm:text-xl"></i>
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleProductSubmit(); }} className="space-y-4 sm:space-y-6">
                {/* Product Name - Full Width */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg sm:rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                
                {/* Description - Full Width */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg sm:rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 resize-none text-sm sm:text-base"
                    placeholder="Describe your product"
                    rows={3}
                  />
                </div>
                
                {/* Price and Category - Side by Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg sm:rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 text-sm sm:text-base"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg sm:rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 text-sm sm:text-base"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Featured Product Toggle */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Featured Product</label>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className={`text-sm font-medium transition-colors duration-200 ${
                        productForm.featured ? 'text-blue-600' : 'text-gray-700'
                      }`}>
                        {productForm.featured ? '⭐ Featured on home page' : 'Not featured'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {productForm.featured ? 'This product will be highlighted' : 'Enable to showcase this product'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProductForm({ ...productForm, featured: !productForm.featured })}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white shadow-lg ${
                        productForm.featured 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-400/30' 
                          : 'bg-gray-200 hover:bg-gray-300 shadow-gray-200/50'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-300 ease-in-out shadow-md ${
                          productForm.featured ? 'translate-x-7 shadow-lg' : 'translate-x-1'
                        }`}
                      >
                        {productForm.featured && (
                          <i className="fas fa-star text-blue-500 text-xs flex items-center justify-center h-full"></i>
                        )}
                      </span>
                    </button>
                  </div>
                  <div className={`mt-3 p-3 rounded-lg border transition-all duration-200 ${
                    productForm.featured 
                      ? 'bg-blue-50 border-blue-200 text-blue-700' 
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}>
                    <p className="text-xs">
                      <i className="fas fa-info-circle mr-1"></i>
                      Featured products appear prominently on the home page to attract customer attention.
                    </p>
                  </div>
                </div>
                
                {/* Shipping Information */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-green-100">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <i className="fas fa-shipping-fast mr-2 text-green-600"></i>
                    Shipping Dimensions & Weight
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Weight (oz)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={productForm.weight}
                        onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg sm:rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200 text-sm sm:text-base"
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Dimensions</label>
                      <input
                        type="text"
                        value={productForm.dimensions}
                        onChange={(e) => setProductForm({ ...productForm, dimensions: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg sm:rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200 text-sm sm:text-base"
                        placeholder="e.g., 12 x 8 x 6 inches"
                      />
                    </div>
                  </div>
                  <div className="mt-3 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-700">
                      <i className="fas fa-info-circle mr-1"></i>
                      These dimensions are used for accurate shipping rate calculations via Shippo.
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (Max 10)</label>
                  <div className="space-y-3">
                    {/* Drag and Drop Area */}
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors ${
                        dragActive
                          ? 'border-accent-400 bg-accent-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageFilesChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="space-y-2">
                        <i className="fas fa-cloud-upload-alt text-2xl sm:text-3xl text-gray-600"></i>
        <p className="text-gray-800 font-medium text-sm sm:text-base">Drag & drop images here</p>
        <p className="text-gray-600 text-xs sm:text-sm">or click to browse files</p>
        <p className="text-gray-500 text-xs">PNG, JPG, GIF, WEBP up to 5MB each</p>
                      </div>
                    </div>
                    
                    {/* Existing Images (for edit mode) */}
                    {editingProduct && existingImages.length > 0 && (
                      <div className="mt-3 sm:mt-4">
                        <p className="text-sm text-gray-700 mb-2 sm:mb-3">Current Images:</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                          {existingImages.map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={imageUrl}
                                alt={`Product ${index + 1}`}
                                className="w-full h-16 sm:h-20 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeExistingImage(index)}
                                className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-5 sm:w-6 h-5 sm:h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                ×
                              </button>
                              {index === 0 && (
                                <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                                  Main
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Images to Delete (for edit mode) */}
                    {editingProduct && imagesToDelete.length > 0 && (
                      <div className="mt-3 sm:mt-4">
                        <p className="text-sm text-gray-700 mb-2 sm:mb-3">Images to be deleted:</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                          {imagesToDelete.map((imageUrl, index) => (
                            <div key={index} className="relative group opacity-50">
                              <img
                                src={imageUrl}
                                alt={`Deleted ${index + 1}`}
                                className="w-full h-16 sm:h-20 object-cover rounded-lg border border-red-400"
                              />
                              <button
                                type="button"
                                onClick={() => restoreImage(imageUrl)}
                                className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-5 sm:w-6 h-5 sm:h-6 bg-green-500 text-white rounded-full text-xs hover:bg-green-600 transition-colors"
                                title="Restore image"
                              >
                                ↶
                              </button>
                              <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
                                <i className="fas fa-trash text-red-400 text-sm sm:text-base"></i>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* New Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="mt-3 sm:mt-4">
                        <p className="text-sm text-gray-700 mb-2 sm:mb-3">{editingProduct ? 'New Images:' : 'Preview:'}</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-16 sm:h-20 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-5 sm:w-6 h-5 sm:h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                ×
                              </button>
                              <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                                New
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                      <p className="text-xs text-gray-700 mb-1">📸 Image Guidelines:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Upload up to 10 high-quality images</li>
                        <li>• First image becomes the main product image</li>
                        <li>• Supported formats: PNG, JPG, GIF, WEBP</li>
                        <li>• Maximum 5MB per image</li>
                        <li>• Drag & drop multiple files for faster upload</li>
                      </ul>
                    </div>
                  </div>
                </div>
                

                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddProduct(false);
                      setEditingProduct(null);
                      setProductForm({ name: '', description: '', price: '', category: '', images: [], weight: '', dimensions: '', featured: false });
                      setSelectedImageFiles([]);
                      setImagePreviews([]);
                    }}
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02] text-sm sm:text-base"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-sm sm:text-base"
                  >
                    <i className={`fas ${editingProduct ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Address Form Modal */}
      {showEditAddress && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-lg border border-white/20 shadow-2xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto scrollbar-hide" style={{borderTopLeftRadius: '50px', borderBottomRightRadius: '50px', scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {sellerAddress ? 'Edit Origin Address' : 'Add Origin Address'}
                </h3>
                <button
                  onClick={() => {
                    setShowEditAddress(false);
                    setAddressForm({
                      name: '',
                      company: '',
                      street: '',
                      city: '',
                      state: '',
                      zip: '',
                      country: 'US',
                      phone: ''
                    });
                  }}
                  className="text-white/70 hover:text-white p-1.5 sm:p-2 rounded-xl hover:bg-white/20 transition-all duration-200"
                >
                  <i className="fas fa-times text-lg sm:text-xl"></i>
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleSaveAddress(); }} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-white/90 mb-1.5 sm:mb-2">Full Name</label>
                  <input
                    type="text"
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white/10 border border-white/20 rounded-md sm:rounded-lg text-sm sm:text-base text-white placeholder-white/50 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 backdrop-blur-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-white/90 mb-1.5 sm:mb-2">Company (Optional)</label>
                  <input
                    type="text"
                    value={addressForm.company}
                    onChange={(e) => setAddressForm({ ...addressForm, company: e.target.value })}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white/10 border border-white/20 rounded-md sm:rounded-lg text-sm sm:text-base text-white placeholder-white/50 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 backdrop-blur-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-white/90 mb-1.5 sm:mb-2">Street Address</label>
                  <input
                    type="text"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white/10 border border-white/20 rounded-md sm:rounded-lg text-sm sm:text-base text-white placeholder-white/50 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 backdrop-blur-sm"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-white/90 mb-1.5 sm:mb-2">City</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white/10 border border-white/20 rounded-md sm:rounded-lg text-sm sm:text-base text-white placeholder-white/50 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 backdrop-blur-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-white/90 mb-1.5 sm:mb-2">State</label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white/10 border border-white/20 rounded-md sm:rounded-lg text-sm sm:text-base text-white placeholder-white/50 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 backdrop-blur-sm"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-white/90 mb-1.5 sm:mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={addressForm.zip}
                      onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white/10 border border-white/20 rounded-md sm:rounded-lg text-sm sm:text-base text-white placeholder-white/50 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 backdrop-blur-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-white/90 mb-1.5 sm:mb-2">Country</label>
                    <select
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white/10 border border-white/20 rounded-md sm:rounded-lg text-sm sm:text-base text-white focus:ring-2 focus:ring-accent-400 focus:border-accent-400 backdrop-blur-sm"
                      style={{
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }}
                      required
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-white/90 mb-1.5 sm:mb-2">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white/10 border border-white/20 rounded-md sm:rounded-lg text-sm sm:text-base text-white placeholder-white/50 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 backdrop-blur-sm"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditAddress(false);
                      setAddressForm({
                        name: '',
                        company: '',
                        street: '',
                        city: '',
                        state: '',
                        zip: '',
                        country: 'US',
                        phone: ''
                      });
                    }}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 border border-white/20 text-white/90 rounded-md sm:rounded-lg text-sm sm:text-base hover:bg-white/20 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-accent-400 to-accent-600 text-white rounded-md sm:rounded-lg text-sm sm:text-base hover:from-accent-500 hover:to-accent-700 transition-all duration-200 font-medium"
                  >
                    {sellerAddress ? 'Update Address' : 'Add Address'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Admin;