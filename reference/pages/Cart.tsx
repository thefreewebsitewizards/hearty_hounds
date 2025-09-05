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
  const { items, total, clearCart, updateItem } = useCart();
  const { currentUser } = useAuth();
  const [selectedShippingRate, setSelectedShippingRate] = useState<ShippingRate | null>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | undefined>(undefined);
  const shippingSelectorRef = useRef<ShippingSelectorRef>(null);
  
  // Calculate total including shipping
  const shippingCost = selectedShippingRate ? selectedShippingRate.amount / 100 : 0;
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
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary-200/30 to-accent-200/30 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-32 right-20 w-40 h-40 bg-gradient-to-br from-accent-200/30 to-primary-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-accent-200/30 to-primary-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
          <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-br from-primary-200/30 to-accent-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '1s'}}></div>
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
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-accent-500"></div>
            
            <div 
              className="w-32 h-32 mx-auto mb-8 flex items-center justify-center bg-gradient-to-br from-primary-500 via-accent-500 to-primary-600 rounded-[40px] shadow-2xl" 
            >
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01" />
              </svg>
            </div>
            
            <h2 className="font-patrick-hand-sc text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-neutral-800 via-primary-800 to-neutral-800 bg-clip-text text-transparent">
              Your Cart is Empty
            </h2>
            <p className="font-patrick-hand text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Looks like you haven't added any beautiful artworks to your cart yet. Discover our unique watercolor collection!
            </p>
            <Link
              to="/gallery"
              className="group font-patrick-hand-sc inline-flex items-center justify-center gap-3 px-10 py-4 text-white font-bold rounded-full transition-all duration-500 transform hover:scale-105 hover:shadow-2xl relative overflow-hidden"
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
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary-200/30 to-accent-200/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-32 right-20 w-40 h-40 bg-gradient-to-br from-accent-200/30 to-primary-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-accent-200/30 to-primary-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-br from-primary-200/30 to-accent-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '1s'}}></div>
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
            <span className="font-patrick-hand text-slate-900 font-semibold">Your Cart</span>
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
                <h1 className="font-patrick-hand-sc text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-slate-800 via-primary-800 to-slate-800 bg-clip-text text-transparent">
                  Your Cart
                </h1>
                <p className="font-patrick-hand text-xl text-slate-600">
                  {items.length} {items.length === 1 ? 'artwork' : 'artworks'} ready for checkout
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
                  <span className="font-patrick-hand text-slate-500 text-sm">(Secure Shopping Experience)</span>
                </div>
              </div>
              
              <button
                onClick={clearCart}
                className="font-patrick-hand-sc px-8 py-4 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-all duration-300 font-bold hover:shadow-lg"
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
              
              <h2 className="font-patrick-hand-sc text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-slate-800 via-primary-800 to-slate-800 bg-clip-text text-transparent">
                Selected Artworks ({items.length})
              </h2>
              
              <p className="font-patrick-hand text-xl text-neutral-600 leading-relaxed">
                Handpicked watercolor masterpieces ready for your collection
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
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  
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
                          src={item.images?.[0] || ''}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-patrick-hand-sc text-2xl lg:text-3xl font-bold mb-2 bg-gradient-to-r from-neutral-800 via-primary-800 to-neutral-800 bg-clip-text text-transparent group-hover:from-primary-600 group-hover:to-accent-600 transition-all duration-300">
                          {item.name}
                        </h3>
                        <p className="font-patrick-hand text-neutral-600 mb-4">
                          Original Watercolor on Premium Paper
                        </p>
                        
                        {/* Value proposition */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <div className="flex items-center gap-1 text-neutral-600">
                            <svg className="w-3 h-3 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-patrick-hand text-xs">Original</span>
                          </div>
                          <div className="flex items-center gap-1 text-neutral-600">
                            <svg className="w-3 h-3 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-patrick-hand text-xs">Handcrafted</span>
                          </div>
                          <div className="flex items-center gap-1 text-neutral-600">
                            <svg className="w-3 h-3 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-patrick-hand text-xs">Premium Quality</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="font-patrick-hand-sc text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                            ${item.price.toFixed(2)}
                          </span>
                          <span className="text-sm text-neutral-400 font-medium">USD</span>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-accent-50 px-3 py-1 rounded-full">
                          <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></div>
                          <span className="font-patrick-hand text-accent-700 text-sm font-medium">In Stock</span>
                        </div>
                      </div>
                      
                      {/* Package Information */}
                      <div className="bg-neutral-50 p-4 rounded-xl">
                        <h4 className="font-patrick-hand-sc text-lg font-bold mb-3 text-neutral-700">Package Information</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-patrick-hand text-sm text-neutral-600 block mb-1">Weight (oz)</label>
                            <div className="w-full font-patrick-hand p-2 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-700">
                              {item.weight || 8}
                            </div>
                          </div>
                          <div>
                            <label className="font-patrick-hand text-sm text-neutral-600 block mb-1">Dimensions (in)</label>
                            <div className="grid grid-cols-3 gap-1">
                              <div className="w-full font-patrick-hand p-2 bg-white border border-neutral-200 rounded-lg text-xs text-neutral-700 text-center">
                                {item.dimensions?.length || 12}
                              </div>
                              <div className="w-full font-patrick-hand p-2 bg-white border border-neutral-200 rounded-lg text-xs text-neutral-700 text-center">
                                {item.dimensions?.width || 9}
                              </div>
                              <div className="w-full font-patrick-hand p-2 bg-white border border-neutral-200 rounded-lg text-xs text-neutral-700 text-center">
                                {item.dimensions?.height || 0.1}
                              </div>
                            </div>
                            <div className="text-xs text-neutral-500 mt-1 font-patrick-hand">L × W × H</div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-neutral-500 font-patrick-hand">
                          📦 Package dimensions are set based on artwork specifications
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-8">
            {/* Unified Order Summary Section */}
            <div 
              className="bg-white/80 backdrop-blur-sm p-8 relative overflow-hidden space-y-8"
              style={{
                borderRadius: '40px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(226, 232, 240, 0.8)'
              }}
            >
              <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(135deg, #8b9a5b 0%, #d4a574 100%)' }}></div>
              
              {/* Order Header */}
              <div>
                <div className="mb-6">
                  <span 
                    className="inline-block px-4 py-2 text-sm font-medium text-white rounded-full"
                    style={{ background: 'linear-gradient(135deg, #8b9a5b 0%, #d4a574 100%)' }}
                  >
                    💳 Checkout
                  </span>
                </div>
                
                <h2 className="font-patrick-hand-sc text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-neutral-800 via-primary-800 to-neutral-800 bg-clip-text text-transparent">
                  Order Summary
                </h2>
                
                <p className="font-patrick-hand text-xl text-neutral-600 leading-relaxed">
                  Ready to complete your purchase?
                </p>
              </div>

              {/* Shipping Address */}
              <div className="border-t border-neutral-200 pt-8">
                <h3 className="font-patrick-hand-sc text-xl font-bold mb-4 text-neutral-800">
                  Shipping Address
                </h3>
                <div className="bg-neutral-50 p-4 rounded-2xl mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                       type="text"
                       placeholder="123 Main Street, Apt 4B"
                       className="font-patrick-hand p-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                       onChange={(e) => setShippingAddress({
                         name: 'Customer',
                         street1: e.target.value,
                         city: shippingAddress?.city || '',
                         state: shippingAddress?.state || 'CA',
                         zip: shippingAddress?.zip || '90210',
                         country: 'US'
                       })}
                     />
                     <input
                       type="text"
                       placeholder="Los Angeles"
                       className="font-patrick-hand p-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                       onChange={(e) => setShippingAddress({
                         name: 'Customer',
                         street1: shippingAddress?.street1 || '',
                         city: e.target.value,
                         state: shippingAddress?.state || 'CA',
                         zip: shippingAddress?.zip || '90210',
                         country: 'US'
                       })}
                     />
                     <input
                       type="text"
                       placeholder="CA (2-letter code)"
                       maxLength={2}
                       className="font-patrick-hand p-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase"
                       onChange={(e) => setShippingAddress({
                         name: 'Customer',
                         street1: shippingAddress?.street1 || '',
                         city: shippingAddress?.city || '',
                         state: e.target.value.toUpperCase(),
                         zip: shippingAddress?.zip || '90210',
                         country: 'US'
                       })}
                     />
                     <input
                       type="text"
                       placeholder="90210 (5-digit ZIP)"
                       pattern="[0-9]{5}"
                       maxLength={5}
                       className="font-patrick-hand p-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                       onChange={(e) => setShippingAddress({
                         name: 'Customer',
                         street1: shippingAddress?.street1 || '',
                         city: shippingAddress?.city || '',
                         state: shippingAddress?.state || 'CA',
                         zip: e.target.value,
                         country: 'US'
                       })}
                     />
                  </div>
                  
                  {/* Address Format Guide */}
                  <div className="mt-3 p-3 bg-primary-50 rounded-lg border border-primary-200">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm">
                        <p className="font-patrick-hand text-primary-700 font-medium mb-1">Address Format Guide:</p>
                        <ul className="font-patrick-hand text-primary-600 text-xs space-y-1">
                          <li>• Street: Include house number, street name, and apartment/unit if applicable</li>
                          <li>• State: Use 2-letter abbreviation (e.g., CA, NY, TX)</li>
                          <li>• ZIP: Enter 5-digit postal code for accurate shipping rates</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* Calculate Shipping Button */}
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        // Use the ref to refresh the ShippingSelector component
                        if (shippingSelectorRef.current) {
                          shippingSelectorRef.current.refreshRates();
                        }
                      }}
                      className="w-full font-patrick-hand-sc px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold rounded-xl hover:from-primary-700 hover:to-accent-700 transition-all duration-300 hover:shadow-lg"
                    >
                      📦 Calculate Shipping Rates
                    </button>
                  </div>
                </div>
              </div>

              {/* Shipping Selector */}
              <div className="border-t border-neutral-200 pt-8">
                <ShippingSelector
                  ref={shippingSelectorRef}
                  orderTotal={total}
                  connectedAccountId={STRIPE_CONFIG.connectedAccountId}
                  onShippingSelect={setSelectedShippingRate}
                  selectedShippingRate={selectedShippingRate}
                  shippingAddress={shippingAddress}
                  cartItems={items}
                />
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-neutral-200 pt-8">
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center p-4 rounded-2xl" style={{ backgroundColor: '#f8f9fa' }}>
                    <span className="font-patrick-hand font-medium text-neutral-700">Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                    <span className="font-patrick-hand-sc font-bold text-neutral-900">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-2xl" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="flex flex-col">
                      <span className="font-patrick-hand font-medium text-neutral-700">Shipping & Handling</span>
                      {selectedShippingRate && (
                        <span className="font-patrick-hand text-sm text-neutral-600">
                          {selectedShippingRate.display_name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedShippingRate ? (
                        <span className={`font-patrick-hand-sc font-bold ${
                          selectedShippingRate.amount === 0 ? 'text-accent-600' : 'text-neutral-900'
                        }`}>
                          {selectedShippingRate.amount === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                        </span>
                      ) : (
                        <span className="font-patrick-hand-sc font-bold text-neutral-900">Select shipping option</span>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-neutral-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-patrick-hand-sc text-2xl font-bold text-neutral-900">Total</span>
                      <span className="font-patrick-hand-sc text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                        ${finalTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-neutral-200 pt-8">
                <div className="space-y-4">
                  {!currentUser ? (
                    <div className="space-y-4">
                      <div className="p-6 bg-primary-50 border border-primary-200 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3">
                          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <h3 className="font-patrick-hand-sc text-xl font-bold text-primary-800">
                            Sign In Required
                          </h3>
                        </div>
                        <p className="font-patrick-hand text-primary-700 mb-4">
                          Please sign in to your account to complete your purchase and track your orders.
                        </p>
                        <Link
                          to="/login"
                          state={{ from: '/cart', message: 'Please sign in to complete your purchase' }}
                          className="w-full font-patrick-hand-sc inline-flex items-center justify-center gap-3 px-8 py-4 text-white font-bold rounded-full transition-all duration-300 hover:shadow-lg"
                          style={{
                            background: 'linear-gradient(135deg, #8b9a5b 0%, #d4a574 50%, #8b9a5b 100%)'
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h18" />
                          </svg>
                          Sign In to Checkout
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {!selectedShippingRate && (
                        <div className="p-4 bg-accent-50 border border-accent-200 rounded-xl">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span className="font-patrick-hand text-accent-700 font-medium">
                              Please select a shipping option to continue
                            </span>
                          </div>
                        </div>
                      )}
                      <StripeCheckout 
                        onSuccess={handleStripeSuccess}
                        onCancel={handleStripeCancel}
                        disabled={!selectedShippingRate}
                        selectedShippingRate={selectedShippingRate}
                        connectedAccountId={STRIPE_CONFIG.connectedAccountId}
                        totalAmount={finalTotal}

                      />
                    </div>
                  )}
                  <Link
                    to="/gallery"
                    className="w-full font-patrick-hand-sc inline-flex items-center justify-center gap-3 px-8 py-4 bg-neutral-100 text-neutral-700 rounded-full hover:bg-neutral-200 transition-all duration-300 text-center font-bold hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Enhanced Security Section */}
              <div className="border-t border-neutral-200 pt-8">
                <div 
                  className="p-6 relative overflow-hidden bg-gradient-to-br from-primary-500 to-accent-600 rounded-3xl shadow-2xl"
                >
                  <div className="flex items-start space-x-4">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-patrick-hand-sc text-lg font-bold text-white mb-2">
                        Secure Checkout
                      </h4>
                      <p className="font-patrick-hand text-white/90 text-sm">
                        Your payment information is encrypted and secure. All transactions are protected.
                      </p>
                      
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-accent-300 rounded-full animate-pulse"></div>
                          <span className="font-patrick-hand text-white/90 text-xs">SSL Encrypted</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-primary-300 rounded-full animate-pulse"></div>
                          <span className="font-patrick-hand text-white/90 text-xs">PCI Compliant</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
  );
};

export default Cart;