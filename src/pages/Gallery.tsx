import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts, getProductsByCategory, getActiveCategories, Category } from '../services/firebase';
import { Product } from '../utils/types';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { AnimatedElement } from '../hooks/useScrollAnimation';

const Gallery: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { addItem } = useCart();

  // Set meta description for Shop page
  useEffect(() => {
    document.title = 'Shop - Hearty Hounds Premium Pet Products';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Shop premium pet products from Hearty Hounds. Quality treats, toys, and accessories to keep your furry friends happy and healthy.');
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          getAllProducts(),
          getActiveCategories()
        ]);
        setProducts(fetchedProducts);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Memoized filtered products for better performance
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => {
        // Match by category name (case insensitive)
        const selectedCategoryObj = categories.find(cat => cat.name.toLowerCase() === selectedCategory.toLowerCase());
        if (selectedCategoryObj) {
          return product.category.toLowerCase() === selectedCategoryObj.name.toLowerCase();
        }
        // Fallback to direct string comparison
        return product.category.toLowerCase() === selectedCategory.toLowerCase();
      });
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [products, selectedCategory, searchTerm, categories]);

  const handleAddToCart = useCallback((product: Product) => {
    if (product.id) {
      addItem(product, 1);
    }
  }, [addItem]);


  return (
    <>
      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-10px) translateX(-15px);
          }
          75% {
            transform: translateY(-30px) translateX(5px);
          }
        }
        
        @keyframes bubble {
          0% {
            transform: translateY(0px) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-100px) scale(1.1);
            opacity: 0.4;
          }
          100% {
            transform: translateY(-200px) scale(0.8);
            opacity: 0;
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-bubble {
          animation: bubble 8s ease-in-out infinite;
        }
      `}</style>
      
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section 
        className="relative py-16 lg:py-20 overflow-hidden min-h-[50vh] bg-gradient-to-br from-pink-500 to-blue-500"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Geometric shapes */}
          <div className="absolute top-20 left-10 w-20 h-20 border-2 border-white/20 rounded-full animate-float" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-lg rotate-45 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-32 left-1/4 w-24 h-24 border-2 border-white/15 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
          <div className="absolute top-1/3 right-1/3 w-12 h-12 bg-white/10 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
          
          {/* Floating dots */}
          <div className="absolute top-60 left-1/2 w-3 h-3 bg-white/30 rounded-full animate-bubble" style={{animationDelay: '3s'}}></div>
          <div className="absolute bottom-40 right-10 w-4 h-4 bg-white/25 rounded-full animate-bubble" style={{animationDelay: '5s'}}></div>
          <div className="absolute top-1/4 left-20 w-2 h-2 bg-white/40 rounded-full animate-bubble" style={{animationDelay: '1.5s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <AnimatedElement variant="fadeInUp">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-chewy text-white mb-4 sm:mb-6 lg:mb-8 leading-tight">
                Premium Pet <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Gallery</span>
              </h1>
            </AnimatedElement>
            <AnimatedElement variant="fadeInUp" delay={200}>
              <p className="text-lg sm:text-xl lg:text-2xl font-spartan text-white/90 max-w-3xl mx-auto px-4 mb-6 sm:mb-8 lg:mb-12 leading-relaxed">
                Discover our handcrafted collection of premium treats, toys, and accessories designed to bring joy and health to your beloved pets.
              </p>
            </AnimatedElement>
            
            {/* Search and Filters */}
            <div className="flex flex-col items-center gap-8 mt-12">
              {/* Search */}
              <AnimatedElement variant="scaleIn" delay={400}>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-2xl mx-auto px-4">
                  <div className="relative flex-1 w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && setSearchTerm(searchTerm)}
                      className="block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/70 text-sm sm:text-base lg:text-lg transition-all duration-300 focus:bg-white/30"
                    />
                  </div>
                  <button
                    onClick={() => setSearchTerm(searchTerm)}
                    className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 focus:ring-2 focus:ring-white/50 backdrop-blur-sm border border-white/20 w-full sm:w-auto"
                  >
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 mx-auto sm:mx-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </AnimatedElement>

              {/* Category Filter */}
              <AnimatedElement variant="fadeInUp" delay={600}>
                <div className="flex flex-wrap gap-2 justify-center">
                  {/* All categories button */}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 lg:px-6 lg:py-3 rounded-full text-xs lg:text-sm font-medium transition-all duration-300 backdrop-blur-sm ${
                      selectedCategory === 'all'
                        ? 'bg-gradient-to-r from-blue-300 to-pink-300 text-white shadow-lg'
                        : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                    }`}
                  >
                    All
                  </button>
                  {/* Dynamic categories from Firestore */}
                  {categories.map((category) => (
                    <button
                      key={category.id || category.name}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`px-4 py-2 lg:px-6 lg:py-3 rounded-full text-xs lg:text-sm font-medium transition-all duration-300 backdrop-blur-sm ${
                        selectedCategory === category.name
                          ? 'bg-gradient-to-r from-blue-300 to-pink-300 text-white shadow-lg'
                          : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </AnimatedElement>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error ? (
            <div className="text-center py-16">
              <div 
                className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto"
                style={{
                  borderRadius: '40px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="font-chewy text-2xl font-bold text-gray-900 mb-4">
                  Error Loading Gallery
                </h3>
                <p className="font-spartan text-gray-600 mb-6">
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 text-white font-bold rounded-full transition-all duration-300 hover:shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #3b82f6 100%)'
                  }}
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filter criteria.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="btn-primary"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <AnimatedElement variant="fadeInUp">
                <div className="flex items-center justify-between mb-8">
                  <p className="text-gray-600 font-medium">
                    Showing {filteredProducts.length} of {products.length} products
                  </p>
                </div>
              </AnimatedElement>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map((product, index) => (
                  <AnimatedElement 
                    key={product.id} 
                    variant="scaleIn" 
                    delay={index * 100}
                    className="hover-lift"
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  </AnimatedElement>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
    </>
  );
};

export default Gallery;