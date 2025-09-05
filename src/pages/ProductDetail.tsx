import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiHeart, FiShare2, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import ImageCarousel from '../components/ImageCarousel';
import { Product } from '../utils/types';
import { getProductById } from '../services/productService';
import { useCart } from '../context/CartContext';
import { formatCurrency, truncateText } from '../utils/helpers';
import { toast } from 'react-toastify';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Check if product is in cart
  const itemInCart = items.find((item: any) => item.product.id === id);
  const quantityInCart = itemInCart?.quantity || 0;

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError('Product ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const productData = await getProductById(id);
        
        if (!productData) {
          setError('Product not found');
        } else {
          setProduct(productData.data || null);
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Failed to load product. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    try {
      addItem(product, selectedQuantity);
      
      toast.success(`Added ${selectedQuantity} ${product.name} to cart!`);
    } catch (error) {
      toast.error('Failed to add item to cart');
    }
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success('Product link copied to clipboard!');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Loading Breadcrumb */}
          <div className="mb-6">
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Loading Image */}
            <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
            
            {/* Loading Content */}
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐕</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error || 'Product not found'}
            </h2>
            <p className="text-gray-600 mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
              <Link
                to="/gallery"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Browse Shop
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link to="/" className="hover:text-gray-700 transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/gallery" className="hover:text-gray-700 transition-colors">
                Shop
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">
              {truncateText(product.name, 30)}
            </li>
          </ol>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          {/* @ts-ignore */}
          <FiArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Carousel */}
          <div className="">
            <ImageCarousel
              images={product.images || []}
              alt={product.name}
              className="w-full"
              showThumbnails={true}
              autoPlay={false}
            />
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              {product.category && (
                <div className="text-sm text-blue-600 font-medium mb-2 uppercase tracking-wide">
                  {product.category}
                </div>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-2 font-chewy">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatCurrency(product.price)}
                </span>
                {product.featured && (
                  <span className="bg-yellow-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                    Featured
                  </span>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                product.inStock ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className={`text-sm font-medium ${
                product.inStock ? 'text-green-700' : 'text-red-700'
              }`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
              {quantityInCart > 0 && (
                <span className="text-sm text-blue-600 ml-2">
                  ({quantityInCart} in cart)
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 font-chewy">Description</h3>
              <div className="text-gray-600 leading-relaxed font-spartan">
                {showFullDescription || product.description.length <= 200 ? (
                  <p>{product.description}</p>
                ) : (
                  <>
                    <p>{truncateText(product.description, 200)}</p>
                    <button
                      onClick={() => setShowFullDescription(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                    >
                      Read more
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Product Details */}
            {product.dimensions && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
                <dl className="grid grid-cols-1 gap-2 text-sm">
                  {product.dimensions && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Dimensions:</dt>
                      <dd className="text-gray-900 font-medium">{product.dimensions}</dd>
                    </div>
                  )}


                </dl>
              </div>
            )}

            {/* Quantity Selector */}
            {product.inStock && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <select
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(parseInt(e.target.value))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: Math.min(10, product.inStock ? 10 : 1) }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    product.inStock
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {/* @ts-ignore */}
                  <FiShoppingCart className="h-5 w-5" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
                
                <button
                  onClick={handleWishlist}
                  className={`px-4 py-3 rounded-lg border transition-colors ${
                    isWishlisted
                      ? 'border-red-500 text-red-500 bg-red-50'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {/* @ts-ignore */}
                  <FiHeart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                
                <button
                  onClick={handleShare}
                  className="px-4 py-3 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 transition-colors"
                >
                  {/* @ts-ignore */}
                  <FiShare2 className="h-5 w-5" />
                </button>
              </div>
              
              <Link
                to="/gallery"
                className="block w-full text-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center gap-2">
                  {/* @ts-ignore */}
                  <FiTruck className="h-6 w-6 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Free Shipping</div>
                    <div className="text-xs text-gray-600">On orders over $100</div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  {/* @ts-ignore */}
                  <FiShield className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Secure Payment</div>
                    <div className="text-xs text-gray-600">SSL encrypted</div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  {/* @ts-ignore */}
                  <FiRefreshCw className="h-6 w-6 text-purple-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Easy Returns</div>
                    <div className="text-xs text-gray-600">30-day policy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;