import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StripeCheckout from '../components/StripeCheckout';
import ShippingSelector, { ShippingSelectorRef } from '../components/ShippingSelector';
import { STRIPE_CONFIG } from '../config/stripe';
import { ShippingRate, ShippingAddress } from '../services/clientShipping';

const Cart: React.FC = () => {
  const { items, clearCart, updateQuantity, getTotal } = useCart();
  const { user } = useAuth();
  const [selectedShippingRate, setSelectedShippingRate] = useState<ShippingRate | null>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | undefined>(undefined);
  const shippingSelectorRef = useRef<ShippingSelectorRef>(null);
  
  // Calculate total including shipping
  const shippingCost = selectedShippingRate ? selectedShippingRate.amount / 100 : 0;
  const total = getTotal();
  const finalTotal = total + shippingCost;

  const handleStripeSuccess = async () => {
    // Order creation is now handled in OrderConfirmation component
    // after successful Stripe payment verification
    toast.success('🎉 Payment successful! Redirecting to confirmation...');
  };

  const handleStripeCancel = () => {
    toast.info('Payment cancelled. Your items are still in your cart.');
  };

  if (items.length === 0) {
    return (
      <div 
        className="min-h-screen relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-200/30 to-blue-200/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-32 right-20 w-40 h-40 bg-gradient-to-br from-blue-200/30 to-pink-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-pink-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-br from-pink-200/30 to-blue-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div 
            className="bg-white/80 backdrop-blur-sm p-12 relative overflow-hidden text-center"
            style={{
              borderRadius: '40px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(226, 232, 240, 0.8)'
            }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-blue-500"></div>
            
            <div 
              className="w-32 h-32 mx-auto mb-8 flex items-center justify-center bg-gradient-to-br from-pink-500 via-blue-500 to-pink-600 rounded-[40px] shadow-2xl" 
            >
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01" />
              </svg>
            </div>
            
            <h2 className="font-chewy text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 via-pink-800 to-gray-800 bg-clip-text text-transparent">
              Your Cart is Empty
            </h2>
            <p className="font-spartan text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Looks like you haven't added any premium pet products to your cart yet. Discover our amazing collection of treats and toys!
            </p>
            <Link
              to="/gallery"
              className="group font-chewy inline-flex items-center justify-center gap-3 px-10 py-4 text-white font-bold rounded-full transition-all duration-500 transform hover:scale-105 hover:shadow-2xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #8b9a5b 0%, #d4a574 50%, #8b9a5b 100%)',
                boxShadow: '0 10px 30px rgba(139, 154, 91, 0.3)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              <span className="relative z-10">Explore Gallery</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-200/30 to-blue-200/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-32 right-20 w-40 h-40 bg-gradient-to-br from-blue-200/30 to-pink-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-pink-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-br from-pink-200/30 to-blue-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Enhanced Breadcrumb */}
        <nav className="flex items-center space-x-3 mb-12">
          <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20" style={{ boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)' }}>
            <Link to="/" className="font-spartan text-slate-600 hover:text-pink-600 transition-colors duration-300 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <span className="text-slate-400">/</span>
            <Link to="/gallery" className="font-spartan text-slate-600 hover:text-pink-600 transition-colors duration-300">
              Gallery
            </Link>
            <span className="text-slate-400">/</span>
            <span className="font-spartan text-slate-900 font-semibold">Your Cart</span>
          </div>
        </nav>
        
        {/* Header Section */}
        <div className="mb-12">
          <div 
            className="bg-white/80 backdrop-blur-sm p-8 relative overflow-hidden"
            style={{
              borderRadius: '40px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(226, 232, 240, 0.8)'
            }}
          >
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(135deg, #8b9a5b 0%, #d4a574 100%)' }}></div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <h1 className="font-chewy text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-gray-800 via-pink-800 to-gray-800 bg-clip-text text-transparent">
                  Your Cart
                </h1>
                <p className="font-spartan text-xl text-gray-600">
                  {items.length} {items.length === 1 ? 'product' : 'products'} ready for checkout
                </p>
                
                {/* Rating stars for cart experience */}
                <div className="flex items-center gap-2 mt-4 justify-center sm:justify-start">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="font-spartan text-gray-500 text-sm">(Secure Shopping Experience)</span>
                </div>
              </div>
              
              <button
                onClick={clearCart}
                className="font-chewy px-8 py-4 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all duration-300 font-bold hover:shadow-lg"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Cart Items */}
          <div className="space-y-8">
            {/* Cart Items Header */}
            <div 
              className="bg-white/80 backdrop-blur-sm p-8 relative overflow-hidden"
              style={{
                borderRadius: '40px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(226, 232, 240, 0.8)'
              }}
            >
              <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(135deg, #8b9a5b 0%, #d4a574 100%)' }}></div>
              
              <div className="mb-6">
                <span 
                  className="inline-block px-4 py-2 text-sm font-medium text-white rounded-full"
                  style={{ background: 'linear-gradient(135deg, #8b9a5b 0%, #d4a574 100%)' }}
                >
                  ✨ Your Collection
                </span>
              </div>
              
              <h2 className="font-chewy text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-800 via-pink-800 to-gray-800 bg-clip-text text-transparent">
                Selected Products ({items.length})
              </h2>
              
              <p className="font-spartan text-xl text-gray-600 leading-relaxed">
                Premium pet products ready to make your furry friend happy
              </p>
            </div>
            
            {/* Cart Items List */}
            <div className="space-y-6">
              {items.map((item, index) => (
                <div 
                  key={item.id} 
                  className="group bg-white/80 backdrop-blur-sm p-8 relative overflow-hidden transition-all duration-500 hover:shadow-2xl"
                  style={{
                    borderTopLeftRadius: '60px',
                    borderBottomRightRadius: '60px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  
                  <div className="flex flex-col sm:flex-row gap-6 relative z-10">
                    {/* Product Image */}
                    <div className="relative">
                      <div 
                        className="w-full sm:w-32 h-48 sm:h-32 overflow-hidden bg-white shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                        style={{
                          borderTopLeftRadius: '30px',
                          borderBottomRightRadius: '30px'
                        }}
                      >
                        <img
                          src={item.product.images?.[0] || ''}
                          alt={item.product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-chewy text-2xl lg:text-3xl font-bold mb-2 bg-gradient-to-r from-gray-800 via-pink-800 to-gray-800 bg-clip-text text-transparent group-hover:from-pink-600 group-hover:to-blue-600 transition-all duration-300">
                          {item.product.name}
                        </h3>
                        <p className="font-spartan text-gray-600 mb-4">
                          Original Watercolor on Premium Paper
                        </p>
                        
                        {/* Value proposition */}
                        <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                          <div className="flex items-center gap-1 text-gray-600">
                            <svg className="w-3 h-3 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-spartan text-xs">Original</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <svg className="w-3 h-3 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-spartan text-xs">Handcrafted</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <svg className="w-3 h-3 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-spartan text-xs">Premium Quality</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="font-chewy text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                            ${item.product.price.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-400 font-medium">USD</span>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="font-spartan text-blue-700 text-sm font-medium">In Stock</span>
                        </div>
                      </div>
                      
                      {/* Package Information */}
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h4 className="font-chewy text-lg font-bold mb-3 text-gray-700">Package Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-spartan text-sm text-gray-600 block mb-1">Weight (oz)</label>
                            <div className="w-full font-spartan p-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
                              {item.product.weight || 8}
                            </div>
                          </div>
                          <div>
                            <label className="font-spartan text-sm text-gray-600 block mb-1">Dimensions (in)</label>
                            <div className="w-full font-spartan p-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
                              {item.product.dimensions || '12 x 9 x 0.1 inches'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 font-spartan">L × W × H</div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 font-spartan">
                          📦 Package dimensions are set based on product specifications
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
                              {/* Order Summary */}
          <div className="space-y-8">
            {/* Order Summary Header */}
            <div 
              className="bg-white/80 backdrop-blur-sm p-8 relative overflow-hidden"
              style={{
                borderRadius: '40px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(226, 232, 240, 0.8)'
              }}
            >
              <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(135deg, #8b9a5b 0%, #d4a574 100%)' }}></div>
              
              <div className="mb-6">
                <span 
                  className="inline-block px-4 py-2 text-sm font-medium text-white rounded-full"
                  style={{ background: 'linear-gradient(135deg, #8b9a5b 0%, #d4a574 100%)' }}
                >
                  🛒 Checkout
                </span>
              </div>
              
              <h2 className="font-chewy text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-slate-800 via-pink-800 to-slate-800 bg-clip-text text-transparent">
                Order Summary
              </h2>
              
              <p className="font-spartan text-lg sm:text-xl text-gray-600 leading-relaxed">
                Review your order and complete your purchase
              </p>
            </div>
            
            {/* Shipping Address */}
            <div 
              className="bg-white/80 backdrop-blur-sm p-8 relative overflow-hidden"
              style={{
                borderRadius: '40px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(226, 232, 240, 0.8)'
              }}
            >
              <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(135deg, #8b9a5b 0%, #d4a574 100%)' }}></div>
              
              <h3 className="font-chewy text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">Shipping Address</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="font-spartan text-sm text-gray-600 block mb-2">Street Address</label>
                  <input
                    type="text"
                    value={shippingAddress?.street1 || ''}
                    onChange={(e) => setShippingAddress(prev => prev ? { ...prev, street1: e.target.value } : { street1: e.target.value, city: '', state: '', zip: '', country: '' })}
                    className="w-full font-spartan p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                    placeholder="123 Main Street"
                  />
                </div>
                
                <div>
                  <label className="font-spartan text-sm text-gray-600 block mb-2">City</label>
                  <input
                    type="text"
                    value={shippingAddress?.city || ''}
                    onChange={(e) => setShippingAddress(prev => prev ? { ...prev, city: e.target.value } : { street1: '', city: e.target.value, state: '', zip: '', country: '' })}
                    className="w-full font-spartan p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                    placeholder="New York"
                  />
                </div>
                
                <div>
                  <label className="font-spartan text-sm text-gray-600 block mb-2">State</label>
                  <input
                    type="text"
                    value={shippingAddress?.state || ''}
                    onChange={(e) => setShippingAddress(prev => prev ? { ...prev, state: e.target.value } : { street1: '', city: '', state: e.target.value, zip: '', country: '' })}
                    className="w-full font-spartan p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                    placeholder="NY"
                  />
                </div>
                
                <div>
                  <label className="font-spartan text-sm text-gray-600 block mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={shippingAddress?.zip || ''}
                    onChange={(e) => setShippingAddress(prev => prev ? { ...prev, zip: e.target.value } : { street1: '', city: '', state: '', zip: e.target.value, country: '' })}
                    className="w-full font-spartan p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                    placeholder="10001"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="font-spartan text-sm text-gray-600 block mb-2">Country</label>
                  <input
                    type="text"
                    value={shippingAddress?.country || ''}
                    onChange={(e) => setShippingAddress(prev => prev ? { ...prev, country: e.target.value } : { street1: '', city: '', state: '', zip: '', country: e.target.value })}
                    className="w-full font-spartan p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                    placeholder="United States"
                  />
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-chewy text-lg font-bold mb-2 text-gray-700">Address Format Guide</h4>
                <p className="font-spartan text-sm text-gray-600">
                  📍 Please ensure your address is complete and accurate for successful delivery
                </p>
              </div>
              
              <button
                onClick={() => shippingSelectorRef.current?.refreshRates()}
                className="mt-4 sm:mt-6 w-full font-chewy px-4 sm:px-6 py-2 sm:py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all duration-300 font-bold text-sm sm:text-base"
              >
                Calculate Shipping Rates
              </button>
            </div>
            
            {/* Shipping Selector */}
            <ShippingSelector
              ref={shippingSelectorRef}
              orderTotal={total}
              connectedAccountId={STRIPE_CONFIG.connectedAccountId}
              onShippingSelect={setSelectedShippingRate}
              selectedShippingRate={selectedShippingRate}
              shippingAddress={shippingAddress}
              cartItems={items}
            />
            
            {/* Price Breakdown */}
            <div 
              className="bg-white/80 backdrop-blur-sm p-8 relative overflow-hidden"
              style={{
                borderRadius: '40px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(226, 232, 240, 0.8)'
              }}
            >
              <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(135deg, #8b9a5b 0%, #d4a574 100%)' }}></div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-spartan text-base sm:text-lg text-gray-600">Subtotal</span>
                  <span className="font-chewy text-lg sm:text-xl font-bold text-gray-800">${total.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-spartan text-base sm:text-lg text-gray-600">Shipping & Handling</span>
                  <span className="font-chewy text-lg sm:text-xl font-bold text-gray-800">
                    {selectedShippingRate ? `$${shippingCost.toFixed(2)}` : 'TBD'}
                  </span>
                </div>
                
                <div className="border-t border-gray-200 pt-3 sm:pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-chewy text-xl sm:text-2xl font-bold text-gray-800">Total</span>
                    <span className="font-chewy text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3 sm:space-y-4">
              {!user ? (
                <Link
                  to="/login"
                  className="w-full font-chewy px-6 sm:px-8 py-3 sm:py-4 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-all duration-300 font-bold text-center block text-sm sm:text-base"
                >
                  Sign In to Checkout
                </Link>
              ) : (
                <StripeCheckout
                  totalAmount={finalTotal}
                  connectedAccountId={STRIPE_CONFIG.connectedAccountId}
                  onSuccess={handleStripeSuccess}
                  onCancel={handleStripeCancel}
                  disabled={!selectedShippingRate}
                  selectedShippingRate={selectedShippingRate}
                />
              )}
              
              <Link
                to="/gallery"
                className="w-full font-chewy px-6 sm:px-8 py-3 sm:py-4 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all duration-300 font-bold text-center block text-sm sm:text-base"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        
        {/* Enhanced Security Section */}
        <div className="mt-16">
          <div 
            className="bg-white/80 backdrop-blur-sm p-8 relative overflow-hidden"
            style={{
              borderRadius: '40px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(226, 232, 240, 0.8)'
            }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-br from-pink-200/20 to-blue-200/20 rounded-full blur-lg animate-float"></div>
              <div className="absolute bottom-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-200/20 to-pink-200/20 rounded-full blur-lg animate-float" style={{animationDelay: '2s'}}></div>
            </div>
            
            <div className="text-center relative z-10">
              <h3 className="font-chewy text-2xl font-bold mb-6 text-gray-800">Secure Checkout</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-chewy font-bold text-gray-800">SSL Encrypted</div>
                    <div className="font-spartan text-sm text-gray-600">256-bit security</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-chewy font-bold text-gray-800">PCI Compliant</div>
                    <div className="font-spartan text-sm text-gray-600">Secure payments</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Cart;