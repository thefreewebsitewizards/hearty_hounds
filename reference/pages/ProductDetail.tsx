import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, Product } from '../services/firebase';
import { useCart } from '../context/CartContext';
import ImageCarousel from '../components/ImageCarousel';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Product ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const productData = await getProductById(id);
        
        if (!productData) {
          setError('Product not found');
        } else {
          setProduct(productData);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product && product.id) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images || [],
        description: product.description,
        weight: product.weight,
        dimensions: {
          length: product.length || 12,
          width: product.width || 9,
          height: product.height || 0.1
        }
      });
    }
  };

  // Get product images with backward compatibility
  const getProductImages = (product: Product): string[] => {
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    if (product.image) {
      return [product.image];
    }
    return [];
  };

  const productImages = product ? getProductImages(product) : [];

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-32 right-20 w-40 h-40 bg-gradient-to-br from-pink-200/30 to-orange-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-yellow-200/30 to-green-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div 
              className="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse relative overflow-hidden"
              style={{
                borderTopLeftRadius: '80px',
                borderBottomRightRadius: '80px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
            <div className="space-y-6">
              <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl animate-pulse"></div>
              <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl animate-pulse"></div>
              <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl w-2/3 animate-pulse"></div>
              <div className="h-6 bg-gradient-to-r from-primary-200 to-accent-200 rounded-xl w-1/3 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || (!product && !loading)) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div 
            className="bg-white p-12 relative overflow-hidden"
            style={{
              borderRadius: '40px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(135deg, #A6BBA2 0%, #D9A273 100%)' }}></div>
            
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h1 className="font-patrick-hand-sc text-4xl font-bold mb-6 bg-gradient-to-r from-slate-800 via-primary-800 to-slate-800 bg-clip-text text-transparent">
              {error === 'Product not found' ? 'Product Not Found' : 'Error Loading Product'}
            </h1>
            <p className="font-patrick-hand text-xl text-slate-600 mb-8 leading-relaxed">
              {error || 'The product you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-3 px-10 py-4 text-white font-bold rounded-full transition-all duration-500 transform hover:scale-105 hover:shadow-2xl mr-4"
                style={{
                  background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                  boxShadow: '0 10px 30px rgba(107, 114, 128, 0.3)'
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Try Again</span>
              </button>
              <Link 
                to="/gallery" 
                className="inline-flex items-center gap-3 px-10 py-4 text-white font-bold rounded-full transition-all duration-500 transform hover:scale-105 hover:shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #A6BBA2 0%, #D9A273 50%, #A6BBA2 100%)',
                  boxShadow: '0 10px 30px rgba(166, 187, 162, 0.3)'
                }}
              >
                <span>Back to Gallery</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary-200/30 to-accent-200/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-32 right-20 w-40 h-40 bg-gradient-to-br from-accent-200/30 to-primary-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-primary-200/30 to-accent-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-br from-accent-200/30 to-primary-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Enhanced Breadcrumb */}
        <nav className="flex items-center space-x-3 mb-12">
          <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20" style={{ boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)' }}>
            <Link to="/" className="font-patrick-hand text-slate-600 hover:text-primary-600 transition-colors duration-300 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <span className="text-slate-400">/</span>
            <Link to="/gallery" className="font-patrick-hand text-slate-600 hover:text-primary-600 transition-colors duration-300">
              Gallery
            </Link>
            <span className="text-slate-400">/</span>
            <span className="font-patrick-hand text-slate-900 font-semibold">{product?.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Image Carousel */}
          <div className="space-y-6">
            <ImageCarousel
              images={productImages}
              productName={product?.name || 'Product'}
              className="aspect-square"
            />
            
            {/* Enhanced Shipping Info - Moved to Left */}
            <div 
              className="p-8 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #A6BBA2 0%, #D9A273 100%)',
                borderRadius: '100px',
                boxShadow: '0 20px 40px rgba(166, 187, 162, 0.3)'
              }}
            >
              <div className="flex items-start space-x-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-patrick-hand-sc text-xl font-bold text-white mb-3">
                    Shipping & Secure Packaging
                  </h4>
                  <div className="space-y-2 text-white/90">
                    <p className="font-patrick-hand text-lg">
                      <span className="font-semibold">Small items:</span> $6 • <span className="font-semibold">Medium framed:</span> $20
                    </p>
                    <p className="font-patrick-hand text-lg">
                      <span className="font-semibold">FREE shipping</span> on orders over $50
                    </p>
                    <p className="font-patrick-hand text-lg">
                      Free local delivery in Phoenix, AZ. All items carefully packaged with tracking.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent-300 rounded-full animate-pulse"></div>
                      <span className="font-patrick-hand text-white/90 text-sm">Insured Shipping</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary-300 rounded-full animate-pulse"></div>
                      <span className="font-patrick-hand text-white/90 text-sm">Tracking Included</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Product Info - Combined Section */}
          <div className="space-y-8">
            {/* Unified Product Info Section */}
            <div 
              className="bg-white/80 backdrop-blur-sm p-8 relative overflow-hidden space-y-8"
              style={{
                borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(226, 232, 240, 0.8)'
              }}
            >
              <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(135deg, #A6BBA2 0%, #D9A273 100%)' }}></div>
              
              {/* Product Header */}
              <div>
                <div className="mb-6">
                  <span 
                    className="inline-block px-4 py-2 text-sm font-medium text-white rounded-full"
                    style={{ background: 'linear-gradient(135deg, #A6BBA2 0%, #D9A273 100%)' }}
                  >
                    ✨ {product?.category}
                  </span>
                </div>
                
                <h1 className="font-patrick-hand-sc text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-800 via-primary-800 to-slate-800 bg-clip-text text-transparent leading-tight">
                  {product?.name}
                </h1>
                
                <p className="font-patrick-hand text-xl text-slate-600 leading-relaxed">
                  {product?.description}
                </p>
                
                {/* Rating stars */}
                <div className="flex items-center gap-2 mt-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-accent-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="font-patrick-hand text-slate-500">(Original Artwork)</span>
                </div>
              </div>

              {/* Price Section */}
              <div className="border-t border-slate-200 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="font-patrick-hand-sc text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                      ${product?.price}
                    </span>
                    <span className="text-sm text-slate-400 font-medium">USD</span>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                    <span className="font-patrick-hand text-primary-700 text-sm font-medium">In Stock</span>
                  </div>
                </div>
                
                {/* Value proposition */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-patrick-hand text-sm">Original Artwork</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-patrick-hand text-sm">Handcrafted</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-patrick-hand text-sm">Free Shipping $50+</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-patrick-hand text-sm">30-Day Returns</span>
                  </div>
                </div>
              </div>

              {/* Add to Cart Section */}
              <div className="border-t border-slate-200 pt-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 group font-patrick-hand-sc inline-flex items-center justify-center gap-3 px-8 py-4 text-white font-bold rounded-full transition-all duration-500 transform hover:scale-105 hover:shadow-2xl relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #A6BBA2 0%, #D9A273 50%, #A6BBA2 100%)',
                      boxShadow: '0 10px 30px rgba(166, 187, 162, 0.3)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8.5" />
                    </svg>
                    <span className="relative z-10">Add to Cart - ${product?.price?.toFixed(2)}</span>
                  </button>
                  
                  <Link
                    to="/cart"
                    className="flex-1 font-patrick-hand-sc inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-all duration-300 text-center font-bold hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Cart
                  </Link>
                </div>
              </div>
            </div>

            {/* Enhanced Product Details */}
            <div 
              className="bg-white/80 backdrop-blur-sm p-8 relative overflow-hidden"
              style={{
                borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(226, 232, 240, 0.8)'
              }}
            >
              <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(135deg, #A6BBA2 0%, #D9A273 100%)' }}></div>
              
              <h3 className="font-patrick-hand-sc text-2xl font-bold mb-6 bg-gradient-to-r from-slate-800 via-primary-800 to-slate-800 bg-clip-text text-transparent">
                Product Details
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-neutral-100">
                  <span className="font-patrick-hand font-medium text-slate-700">Category:</span>
                  <span className="font-patrick-hand-sc font-bold text-primary-600">{product?.category}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 rounded-2xl bg-neutral-100">
                  <span className="font-patrick-hand font-medium text-slate-700">Medium:</span>
                  <span className="font-patrick-hand-sc font-bold text-primary-600">Watercolor on Paper</span>
                </div>
                
                <div className="flex justify-between items-center p-4 rounded-2xl bg-neutral-100">
                  <span className="font-patrick-hand font-medium text-slate-700">Shipping:</span>
                  <span className="font-patrick-hand-sc font-bold text-primary-600">From $6 (Free over $50)</span>
                </div>
                
                <div className="flex justify-between items-center p-4 rounded-2xl bg-neutral-100">
                  <span className="font-patrick-hand font-medium text-slate-700">Processing Time:</span>
                  <span className="font-patrick-hand-sc font-bold text-primary-600">1-2 Business Days</span>
                </div>
                
                {product?.weight && (
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-neutral-100">
                    <span className="font-patrick-hand font-medium text-slate-700">Weight:</span>
                    <span className="font-patrick-hand-sc font-bold text-primary-600">{product.weight} oz</span>
                  </div>
                )}
                
                {product?.height && (
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-neutral-100">
                    <span className="font-patrick-hand font-medium text-slate-700">Height:</span>
                    <span className="font-patrick-hand-sc font-bold text-primary-600">{product.height} inches</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* CSS Animations */}
        <style>
          {`
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
            
            .animate-float {
              animation: float 6s ease-in-out infinite;
            }
            
            @keyframes shimmer {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(100%);
              }
            }
            
            .animate-shimmer {
              animation: shimmer 2s ease-in-out infinite;
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default ProductDetail;