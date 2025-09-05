import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { getAllProducts, addProduct, updateProduct, deleteProduct, Product, updateOrderStatus, uploadProductImage, uploadProductImages } from '../services/firebase';
import { collection, getDocs, query, where, Timestamp, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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
  const { isAdmin, currentUser, loading: authLoading } = useAuth();
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
    length: '',
    width: '',
    height: ''
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

  useEffect(() => {
    loadDashboardData();
    loadSellerAddress();
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

  if (!currentUser) {
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have admin privileges to access this page.</p>
          <p className="text-sm text-gray-500 mb-4">Please contact an administrator if you believe this is an error.</p>
          <Link to="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Go to Home
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
        weight: productForm.weight ? parseFloat(productForm.weight) : undefined,
        length: productForm.length ? parseFloat(productForm.length) : undefined,
        width: productForm.width ? parseFloat(productForm.width) : undefined,
        height: productForm.height ? parseFloat(productForm.height) : undefined,
        createdAt: Timestamp.now()
      };
      
      await addProduct(productData);
      setShowAddProduct(false);
      setProductForm({ name: '', description: '', price: '', category: '', images: [], weight: '', length: '', width: '', height: '' });
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
      weight: product.weight?.toString() || '',
      length: product.length?.toString() || '',
      width: product.width?.toString() || '',
      height: product.height?.toString() || ''
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
        weight: productForm.weight ? parseFloat(productForm.weight) : undefined,
        length: productForm.length ? parseFloat(productForm.length) : undefined,
        width: productForm.width ? parseFloat(productForm.width) : undefined,
        height: productForm.height ? parseFloat(productForm.height) : undefined
      };
      
      await updateProduct(editingProduct.id, productData);
      setShowAddProduct(false);
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: '', category: '', images: [], weight: '', length: '', width: '', height: '' });
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
    { id: 'analytics', label: 'Analytics', icon: 'fas fa-chart-bar' }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300" style={{borderRadius: '300px'}}>
          <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full flex items-center justify-center text-white mr-3 sm:mr-4">
                <i className="fas fa-box text-sm sm:text-lg"></i>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-800 truncate">{loading ? '...' : stats.totalProducts}</h3>
                <p className="text-neutral-600 text-xs sm:text-sm">Total Products</p>
              </div>
            </div>
        </div>
        
        <div className="bg-white shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300" style={{borderRadius: '300px'}}>
          <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent-500 to-primary-500 rounded-full flex items-center justify-center text-white mr-3 sm:mr-4">
                <i className="fas fa-shopping-cart text-sm sm:text-lg"></i>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-800 truncate">{loading ? '...' : stats.totalOrders}</h3>
                <p className="text-neutral-600 text-xs sm:text-sm">Total Orders</p>
              </div>
            </div>
        </div>
        
        <div className="bg-white shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300" style={{borderRadius: '300px'}}>
          <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-white mr-3 sm:mr-4">
                <i className="fas fa-users text-sm sm:text-lg"></i>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-800 truncate">{loading ? '...' : stats.totalCustomers}</h3>
                <p className="text-neutral-600 text-xs sm:text-sm">Total Customers</p>
              </div>
            </div>
        </div>
        
        <div className="bg-white shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300" style={{borderRadius: '300px'}}>
          <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent-400 to-primary-400 rounded-full flex items-center justify-center text-white mr-3 sm:mr-4">
                <i className="fas fa-dollar-sign text-sm sm:text-lg"></i>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-800 truncate">{loading ? '...' : `$${stats.totalRevenue.toLocaleString()}`}</h3>
                <p className="text-neutral-600 text-xs sm:text-sm">Total Revenue</p>
              </div>
            </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-neutral-800 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-2xl text-neutral-400 mb-2"></i>
              <p className="text-neutral-500">Loading recent activity...</p>
            </div>
          ) : (
            <>
              {/* Recent Orders */}
              {orders.slice(0, 2).map((order) => (
                <div key={`order-${order.id}`} className="flex items-center p-3 bg-neutral-50 rounded-lg">
                  <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center text-white text-sm mr-3">
                    <i className="fas fa-shopping-cart"></i>
                  </div>
                  <div>
                    <p className="text-neutral-800 font-medium">New order received</p>
                    <p className="text-neutral-600 text-sm">Order #{order.id?.slice(-8) || 'N/A'} - ${order.total?.toFixed(2) || '0.00'}</p>
                  </div>
                  <span className="ml-auto text-neutral-500 text-sm">
                    {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              ))}
              
              {/* Recent Products */}
              {products.slice(0, 2).map((product) => (
                <div key={`product-${product.id}`} className="flex items-center p-3 bg-neutral-50 rounded-lg">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm mr-3">
                    <i className="fas fa-box"></i>
                  </div>
                  <div>
                    <p className="text-neutral-800 font-medium">Product available</p>
                    <p className="text-neutral-600 text-sm">{product.name} - ${product.price}</p>
                  </div>
                  <span className="ml-auto text-neutral-500 text-sm">
                    ${product.price}
                  </span>
                </div>
              ))}
              
              {/* Recent Customers */}
              {customers.slice(0, 1).map((customer) => (
                <div key={`customer-${customer.id}`} className="flex items-center p-3 bg-neutral-50 rounded-lg">
                  <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center text-white text-sm mr-3">
                    <i className="fas fa-user"></i>
                  </div>
                  <div>
                    <p className="text-neutral-800 font-medium">Customer registered</p>
                    <p className="text-neutral-600 text-sm">{customer.email}</p>
                  </div>
                  <span className="ml-auto text-neutral-500 text-sm">
                    {customer.createdAt ? new Date(customer.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              ))}
              
              {orders.length === 0 && products.length === 0 && customers.length === 0 && (
                <div className="text-center py-8">
                  <i className="fas fa-clock text-4xl text-neutral-300 mb-2"></i>
                  <p className="text-neutral-500">No recent activity</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Product Management</h2>
        <button 
          onClick={() => setShowAddProduct(true)}
          className="bg-gradient-to-r from-accent-400 to-accent-600 text-white px-6 py-2 rounded-lg hover:from-accent-500 hover:to-accent-700 transition-all duration-200 flex items-center"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Product
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        {loading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-neutral-400 mb-4"></i>
            <p className="text-neutral-500">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-box-open text-6xl text-neutral-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-neutral-600 mb-2">No Products Found</h3>
            <p className="text-neutral-500 mb-4">Start by adding your first artwork to the gallery.</p>
            <button 
              onClick={() => setShowAddProduct(true)}
              className="bg-gradient-to-r from-accent-400 to-accent-600 text-white px-6 py-2 rounded-lg hover:from-accent-500 hover:to-accent-700 transition-all duration-200"
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
                  <div key={product.id} className="bg-white rounded-xl p-5 border border-neutral-200 shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col space-y-4">
                      {/* Product Image and Basic Info */}
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <img 
                            src={product.images?.[0] || '/images/placeholder.jpg'} 
                            alt={product.name}
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl shadow-sm border border-neutral-100"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-lg text-neutral-900 mb-1 leading-tight">{product.name}</h4>
                          <div className="flex items-center mb-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {product.category}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-primary-600">${product.price}</span>
                            <span className="text-xs text-neutral-500">ID: {product.id?.slice(-6) || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="flex-1 flex items-center justify-center px-4 py-3 bg-primary-100 text-primary-700 rounded-xl hover:bg-primary-200 active:bg-primary-300 transition-all duration-200 text-sm font-medium touch-manipulation"
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
                  <tr className="bg-neutral-50 border-b-2 border-neutral-200">
                    <th className="text-left py-4 px-6 font-semibold text-neutral-700 uppercase tracking-wider text-sm">Product</th>
                    <th className="text-left py-4 px-6 font-semibold text-neutral-700 uppercase tracking-wider text-sm">Category</th>
                    <th className="text-left py-4 px-6 font-semibold text-neutral-700 uppercase tracking-wider text-sm">Price</th>
                    <th className="text-center py-4 px-6 font-semibold text-neutral-700 uppercase tracking-wider text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-neutral-50 transition-colors duration-150">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <img 
                              src={product.images?.[0] || '/images/placeholder.jpg'} 
                              alt={product.name}
                              className="w-14 h-14 object-cover rounded-lg shadow-sm border border-neutral-200"
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold text-neutral-900">{product.name}</h4>
                            <p className="text-sm text-neutral-500">ID: {product.id?.slice(-8) || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-lg font-bold text-neutral-900">${product.price}</span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex justify-center space-x-3">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="inline-flex items-center px-3 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-all duration-200 text-sm font-medium"
                            title="Edit Product"
                          >
                            <i className="fas fa-edit mr-1"></i>
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id!)}
                            className="inline-flex items-center px-3 py-2 bg-accent-100 text-accent-700 rounded-lg hover:bg-accent-200 transition-all duration-200 text-sm font-medium"
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Order Management</h2>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        {loading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-neutral-400 mb-4"></i>
            <p className="text-neutral-500">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-shopping-cart text-6xl text-neutral-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-neutral-600 mb-2">No Orders Found</h3>
            <p className="text-neutral-500">No orders have been placed yet.</p>
          </div>
        ) : (
          <div>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <i className="fas fa-receipt text-primary-600"></i>
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900">#{order.id?.slice(-8) || 'N/A'}</h4>
                        <p className="text-sm text-neutral-600">{order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-neutral-900">${order.total?.toFixed(2) || '0.00'}</span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Customer:</span>
                      <span className="text-sm font-medium text-neutral-900">{order.customerEmail || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Items:</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                        {order.items?.length || 0} items
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Status:</span>
                    <select
                      value={order.status || 'pending'}
                      onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value as Order['status'])}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border-2 focus:outline-none focus:ring-2 focus:ring-accent-500 transition-all duration-200 ${
                        order.status === 'delivered' ? 'bg-accent-50 text-accent-800 border-accent-200' :
                        order.status === 'shipped' ? 'bg-primary-50 text-primary-800 border-primary-200' :
                        order.status === 'processing' ? 'bg-accent-50 text-accent-800 border-accent-200' :
                        order.status === 'paid' ? 'bg-primary-50 text-primary-800 border-primary-200' :
                        order.status === 'pending' ? 'bg-accent-50 text-accent-800 border-accent-200' :
                        order.status === 'cancelled' ? 'bg-accent-50 text-accent-800 border-accent-200' :
                        'bg-neutral-50 text-neutral-800 border-neutral-200'
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
                  <tr className="bg-neutral-50 border-b-2 border-neutral-200">
                    <th className="text-left py-4 px-6 font-semibold text-neutral-700 uppercase tracking-wider text-sm">Order ID</th>
                    <th className="text-left py-4 px-6 font-semibold text-neutral-700 uppercase tracking-wider text-sm">Customer</th>
                    <th className="text-left py-4 px-6 font-semibold text-neutral-700 uppercase tracking-wider text-sm">Date</th>
                    <th className="text-left py-4 px-6 font-semibold text-neutral-700 uppercase tracking-wider text-sm">Items</th>
                    <th className="text-left py-4 px-6 font-semibold text-neutral-700 uppercase tracking-wider text-sm">Total</th>
                    <th className="text-left py-4 px-6 font-semibold text-neutral-700 uppercase tracking-wider text-sm">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50 transition-colors duration-150">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            <i className="fas fa-receipt text-primary-600 text-sm"></i>
                          </div>
                          <span className="font-medium text-neutral-900">#{order.id?.slice(-8) || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center mr-3">
                            <i className="fas fa-user text-accent-600 text-sm"></i>
                          </div>
                          <span className="text-neutral-900">{order.customerEmail || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-neutral-600">
                        {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                          {order.items?.length || 0} items
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-lg font-bold text-neutral-900">${order.total?.toFixed(2) || '0.00'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={order.status || 'pending'}
                          onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value as Order['status'])}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border-2 focus:outline-none focus:ring-2 focus:ring-accent-500 transition-all duration-200 ${
                            order.status === 'delivered' ? 'bg-accent-50 text-accent-800 border-accent-200' :
                            order.status === 'shipped' ? 'bg-primary-50 text-primary-800 border-primary-200' :
                            order.status === 'processing' ? 'bg-accent-50 text-accent-800 border-accent-200' :
                            order.status === 'paid' ? 'bg-primary-50 text-primary-800 border-primary-200' :
                            order.status === 'pending' ? 'bg-accent-50 text-accent-800 border-accent-200' :
                            order.status === 'cancelled' ? 'bg-accent-50 text-accent-800 border-accent-200' :
                            'bg-neutral-50 text-neutral-800 border-neutral-200'
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
        updatedAt: Timestamp.now()
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
          createdAt: Timestamp.now()
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

  const renderSellerAddress = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Origin Address Management</h2>
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
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Customer Management</h2>
            <div className="bg-white rounded-xl shadow-lg p-6">
              {loading ? (
                <div className="text-center py-12">
                  <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                  <p className="text-gray-500">Loading customers...</p>
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-users text-6xl text-gray-300 mb-4"></i>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Customers Found</h3>
                  <p className="text-gray-500">No customers have registered yet.</p>
                </div>
              ) : (
                <div>
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4">
                    {customers.map((customer) => (
                      <div key={customer.id} className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white font-semibold text-sm">
                                {customer.name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-neutral-900">{customer.name}</h4>
                              <p className="text-sm text-neutral-600">ID: {customer.id?.slice(-8) || 'N/A'}</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral-600">Email:</span>
                            <span className="text-sm font-medium text-neutral-900">{customer.email}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral-600">Role:</span>
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
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral-600">Joined:</span>
                            <span className="text-sm font-medium text-neutral-900">
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
      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Analytics</h2>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-gray-600 text-center py-12">Analytics dashboard coming soon...</p>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Floating Island Sidebar */}
      <aside className={`fixed top-6 left-6 z-50 w-72 bg-gradient-to-br from-primary-600/90 to-accent-600/90 backdrop-blur-lg border border-white/20 text-white transform transition-all duration-300 ease-in-out shadow-2xl ${
         sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
       } lg:translate-x-0 lg:opacity-100`} style={{height: 'calc(100vh - 3rem)', borderTopLeftRadius: '50px', borderBottomRightRadius: '50px'}}>
        <div className="flex items-center justify-center h-20 border-b border-white/20 px-6">
          <i className="fas fa-palette text-yellow-400 mr-3 text-2xl"></i>
          <h2 className="text-xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">Moroz Art Admin</h2>
        </div>
        
        <nav className="mt-6 px-6">
          <ul className="space-y-3">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-5 py-4 text-left rounded-2xl transition-all duration-300 group ${
                    activeSection === item.id
                      ? 'bg-white shadow-lg'
                      : 'hover:bg-white/10 hover:backdrop-blur-sm'
                  }`}
                >
                  <i className={`${item.icon} mr-4 w-5 text-center text-lg ${
                    activeSection === item.id ? 'text-gray-700' : 'text-white/80 group-hover:text-white'
                  }`}></i>
                  <span className={`font-medium ${
                     activeSection === item.id ? 'text-gray-700' : 'text-white/90 group-hover:text-white'
                   }`}>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-6 left-6 right-6">
          <Link
            to="/"
            className="w-full flex items-center justify-center px-5 py-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all duration-300 border border-white/20 hover:border-white/30 group"
          >
            <i className="fas fa-sign-out-alt mr-3 text-white/80 group-hover:text-white"></i>
            <span className="font-medium text-white/90 group-hover:text-white">Back to Site</span>
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
        <header className="mx-6 mt-6 mb-6 bg-gradient-to-r from-primary-600/90 to-accent-600/90 backdrop-blur-lg border border-white/20 shadow-xl" style={{borderRadius: '50px'}}>
          <div className="flex items-center justify-between px-8 py-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden mr-4 text-white/90 hover:text-white p-2 rounded-xl hover:bg-white/20 transition-all duration-200"
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
              <h1 className="text-3xl font-bold text-white capitalize">
                {activeSection}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-400 to-accent-500 rounded-full flex items-center justify-center">
                <i className="fas fa-user text-accent-800 text-lg"></i>
              </div>
              <span className="text-white/90 font-semibold">Admin</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="px-6 pb-6">
          <div className="bg-gradient-to-br from-primary-600/90 to-accent-600/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8 min-h-[calc(100vh-12rem)]">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Product Form Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-gradient-to-br from-primary-600/95 to-accent-600/95 backdrop-blur-lg border border-white/20 shadow-2xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto scrollbar-hide" style={{borderTopLeftRadius: '50px', borderBottomRightRadius: '50px', scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddProduct(false);
                    setEditingProduct(null);
                    setProductForm({ name: '', description: '', price: '', category: '', images: [], weight: '', length: '', width: '', height: '' });
                    setSelectedImageFiles([]);
                    setImagePreviews([]);
                  }}
                  className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/20 transition-all duration-200"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleProductSubmit(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 backdrop-blur-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 backdrop-blur-sm"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 backdrop-blur-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-accent-400 focus:border-accent-400 backdrop-blur-sm"
                    style={{
                      color: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="postcards">Postcards</option>
                    <option value="wall-art">Wall Art</option>
                    <option value="bookmarks">Bookmarks</option>
                    <option value="custom">Custom Pieces</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-3">Shipping Dimensions & Weight</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Weight (oz)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={productForm.weight}
                        onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 backdrop-blur-sm"
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Length (in)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={productForm.length}
                        onChange={(e) => setProductForm({ ...productForm, length: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 backdrop-blur-sm"
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Width (in)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={productForm.width}
                        onChange={(e) => setProductForm({ ...productForm, width: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 backdrop-blur-sm"
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Height (in)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={productForm.height}
                        onChange={(e) => setProductForm({ ...productForm, height: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 backdrop-blur-sm"
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-white/60 mt-2">These dimensions are used for accurate shipping rate calculations via Shippo.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Product Images (Max 10)</label>
                  <div className="space-y-3">
                    {/* Drag and Drop Area */}
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive
                          ? 'border-accent-400 bg-accent-400/10'
                          : 'border-white/30 hover:border-white/50'
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
                        <i className="fas fa-cloud-upload-alt text-3xl text-white/60"></i>
                        <p className="text-white/80 font-medium">Drag & drop images here</p>
                        <p className="text-white/60 text-sm">or click to browse files</p>
                        <p className="text-white/50 text-xs">PNG, JPG, GIF, WEBP up to 5MB each</p>
                      </div>
                    </div>
                    
                    {/* Existing Images (for edit mode) */}
                    {editingProduct && existingImages.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-white/70 mb-3">Current Images:</p>
                        <div className="grid grid-cols-4 gap-3">
                          {existingImages.map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={imageUrl}
                                alt={`Product ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg border border-white/20"
                              />
                              <button
                                type="button"
                                onClick={() => removeExistingImage(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
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
                      <div className="mt-4">
                        <p className="text-sm text-white/70 mb-3">Images to be deleted:</p>
                        <div className="grid grid-cols-4 gap-3">
                          {imagesToDelete.map((imageUrl, index) => (
                            <div key={index} className="relative group opacity-50">
                              <img
                                src={imageUrl}
                                alt={`Deleted ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg border border-red-400"
                              />
                              <button
                                type="button"
                                onClick={() => restoreImage(imageUrl)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full text-xs hover:bg-green-600 transition-colors"
                                title="Restore image"
                              >
                                ↶
                              </button>
                              <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
                                <i className="fas fa-trash text-red-400"></i>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* New Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-white/70 mb-3">{editingProduct ? 'New Images:' : 'Preview:'}</p>
                        <div className="grid grid-cols-4 gap-3">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg border border-white/20"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
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
                    
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-white/70 mb-1">📸 Image Guidelines:</p>
                      <ul className="text-xs text-white/60 space-y-1">
                        <li>• Upload up to 10 high-quality images</li>
                        <li>• First image becomes the main product image</li>
                        <li>• Supported formats: PNG, JPG, GIF, WEBP</li>
                        <li>• Maximum 5MB per image</li>
                        <li>• Drag & drop multiple files for faster upload</li>
                      </ul>
                    </div>
                  </div>
                </div>
                

                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddProduct(false);
                      setEditingProduct(null);
                      setProductForm({ name: '', description: '', price: '', category: '', images: [], weight: '', length: '', width: '', height: '' });
                      setSelectedImageFiles([]);
                      setImagePreviews([]);
                    }}
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 text-white/90 rounded-lg hover:bg-white/20 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-accent-400 to-accent-600 text-white rounded-lg hover:from-accent-500 hover:to-accent-700 transition-all duration-200 font-medium"
                  >
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
          <div className="bg-gradient-to-br from-primary-600/95 to-accent-600/95 backdrop-blur-lg border border-white/20 shadow-2xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto scrollbar-hide" style={{borderTopLeftRadius: '50px', borderBottomRightRadius: '50px', scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
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
                  className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/20 transition-all duration-200"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleSaveAddress(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 backdrop-blur-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Company (Optional)</label>
                  <input
                    type="text"
                    value={addressForm.company}
                    onChange={(e) => setAddressForm({ ...addressForm, company: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 backdrop-blur-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Street Address</label>
                  <input
                    type="text"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 backdrop-blur-sm"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">City</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 backdrop-blur-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">State</label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 backdrop-blur-sm"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={addressForm.zip}
                      onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 backdrop-blur-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Country</label>
                    <select
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-accent-400 focus:border-accent-400 backdrop-blur-sm"
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
                  <label className="block text-sm font-medium text-white/90 mb-2">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 backdrop-blur-sm"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
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
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 text-white/90 rounded-lg hover:bg-white/20 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-accent-400 to-accent-600 text-white rounded-lg hover:from-accent-500 hover:to-accent-700 transition-all duration-200 font-medium"
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