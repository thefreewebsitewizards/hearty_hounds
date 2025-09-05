import React from 'react';

const Policies: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 py-20 lg:py-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-200 to-pink-200 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-100 to-blue-100 rounded-full opacity-10 animate-spin" style={{animationDuration: '20s'}}></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-400 to-blue-600 rounded-full mb-6 shadow-lg">
            <i className="fas fa-file-contract text-white text-2xl"></i>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-chewy bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent mb-4 sm:mb-6">
            Store Policies
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-spartan px-4">
            Everything you need to know about shopping with <span className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent font-semibold">Hearty Hounds</span>
          </p>
          <div className="mt-8 w-24 h-1 bg-gradient-to-r from-pink-400 to-blue-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid gap-8 lg:gap-12">
          {/* Payment Methods */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 lg:p-10 border border-pink-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-pink-400 to-blue-600 rounded-2xl flex items-center justify-center mr-4 lg:mr-6 shadow-lg">
                <i className="fas fa-credit-card text-white text-xl lg:text-2xl"></i>
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold font-chewy bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">Payment Methods</h2>
                <p className="text-gray-600 mt-1 font-spartan">Secure and flexible payment options</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="group text-center p-6 lg:p-8 bg-gradient-to-br from-pink-50 to-blue-50 border border-pink-200 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-pink-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <i className="fab fa-paypal text-white text-xl lg:text-2xl"></i>
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 font-chewy">PayPal</h3>
            <p className="text-gray-600 text-sm lg:text-base leading-relaxed font-spartan">Secure and convenient online payments with buyer protection</p>
              </div>
              <div className="group text-center p-6 lg:p-8 bg-gradient-to-br from-pink-50 to-blue-50 border border-pink-200 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-pink-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-mobile-alt text-white text-xl lg:text-2xl"></i>
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 font-chewy">Venmo</h3>
            <p className="text-gray-600 text-sm lg:text-base leading-relaxed font-spartan">Quick and easy mobile payments for US customers</p>
              </div>
              <div className="group text-center p-6 lg:p-8 bg-gradient-to-br from-pink-50 to-blue-50 border border-pink-200 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-pink-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-university text-white text-xl lg:text-2xl"></i>
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 font-chewy">Zelle</h3>
            <p className="text-gray-600 text-sm lg:text-base leading-relaxed font-spartan">Direct bank transfers for instant payments</p>
              </div>
            </div>
            <div className="mt-8 p-6 bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl border border-pink-200">
              <p className="text-pink-800 text-sm lg:text-base flex items-start">
                <i className="fas fa-info-circle mr-3 mt-1 text-pink-600"></i>
                <span>All payments are processed securely with industry-standard encryption. We're always open to suggestions for additional payment methods that would be more convenient for our customers.</span>
              </p>
            </div>
          </div>

          {/* Shipping Rates & Delivery */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 lg:p-10 border border-pink-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-pink-400 to-blue-600 rounded-2xl flex items-center justify-center mr-4 lg:mr-6 shadow-lg">
                <i className="fas fa-shipping-fast text-white text-xl lg:text-2xl"></i>
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold font-chewy bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">Shipping Rates & Delivery</h2>
                <p className="text-gray-600 mt-1 font-spartan">Fast and reliable shipping worldwide</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-calculator text-pink-600 mr-3"></i>
                  Shipping Rates
                </h3>
                <div className="space-y-4">
                  <div className="group flex justify-between items-center p-6 bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl border border-pink-200 hover:shadow-lg transition-all duration-300">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Small Flat Items</h4>
                      <p className="text-sm text-gray-600 mt-1">(0–0.5 lb) • Bookmarks, postcards</p>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">$6</span>
                  </div>
                  <div className="group flex justify-between items-center p-6 bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl border border-pink-200 hover:shadow-lg transition-all duration-300">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Medium Framed Items</h4>
                      <p className="text-sm text-gray-600 mt-1">(up to 5 lb) • Framed prints</p>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">$20</span>
                  </div>
                  <div className="group flex justify-between items-center p-6 bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl border border-pink-200 hover:shadow-lg transition-all duration-300">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Large Products</h4>
                      <p className="text-sm text-gray-600 mt-1">Calculated based on weight & zone</p>
                    </div>
                    <span className="text-lg font-semibold text-gray-600">Variable</span>
                  </div>
                </div>
                
                <div className="mt-8 space-y-4">
                  <div className="flex items-center p-4 bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl border border-pink-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-blue-600 rounded-full flex items-center justify-center mr-4">
                      <i className="fas fa-gift text-white"></i>
                    </div>
                    <span className="text-pink-800 font-semibold">Free shipping on orders over $50</span>
                  </div>
                  <div className="flex items-center p-4 bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl border border-pink-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-blue-600 rounded-full flex items-center justify-center mr-4">
                      <i className="fas fa-map-marker-alt text-white"></i>
                    </div>
                    <span className="text-pink-800 font-semibold">Free local delivery within Phoenix, AZ</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-box text-pink-600 mr-3"></i>
                  Packaging & Delivery
                </h3>
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-pink-50 to-gray-100 border border-pink-200 rounded-xl hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-shield-alt text-white text-sm"></i>
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg">Packaging & Insurance</h4>
                    </div>
                    <p className="text-gray-600 leading-relaxed ml-11">
                      All orders are carefully wrapped using rigid mailers with cardboard inserts or foam. 
                      Large products are shipped in a double-box with protective corners for maximum safety.
                    </p>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-r from-pink-50 to-gray-100 border border-pink-200 rounded-xl hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-truck text-white text-sm"></i>
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg">Delivery Time & Tracking</h4>
                    </div>
                    <ul className="text-gray-600 space-y-2 ml-11">
                      <li className="flex items-center">
                        <i className="fas fa-circle text-pink-400 text-xs mr-3"></i>
                        USPS First Class: 3–7 business days (tracking included)
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-circle text-pink-400 text-xs mr-3"></i>
                        Priority Mail: 2–4 business days
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-circle text-pink-400 text-xs mr-3"></i>
                        Larger items: Delivery cost calculated based on weight and shipping zone; tracking provided
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-gray-100 border border-blue-200 rounded-xl">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-pink-400 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-clock text-white text-sm"></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-800 mb-2">Processing Time</h4>
                        <p className="text-blue-700">
                          Orders are shipped from Phoenix, AZ. Please allow 3–5 business days for processing.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Returns & Refunds Policy */}
          <div className="bg-gray-100/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 lg:p-10 border border-pink-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-pink-400 to-blue-400 rounded-2xl flex items-center justify-center mr-4 lg:mr-6 shadow-lg">
                <i className="fas fa-shield-alt text-white text-xl lg:text-2xl"></i>
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">Returns & Refunds Policy</h2>
                <p className="text-gray-600 mt-1">Your satisfaction is our priority</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <div>
                <div className="p-6 bg-gradient-to-r from-blue-50 to-gray-100 border border-blue-200 rounded-xl mb-8">
                  <div className="flex items-start mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-pink-400 rounded-full flex items-center justify-center mr-3 mt-1">
                      <i className="fas fa-exclamation-triangle text-white"></i>
                    </div>
                    <h3 className="text-xl font-bold text-blue-800">
                      Important Notice
                    </h3>
                  </div>
                  <p className="text-blue-700 leading-relaxed ml-13">
                    All sales of custom products and special orders are final — no returns or refunds for these items.
                  </p>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <i className="fas fa-tools text-pink-600 mr-3"></i>
                    Damaged Items
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    If an item arrives damaged, please contact me within 7 days of delivery with clear photos of the damage and packaging.
                  </p>
                  
                  <h4 className="font-bold text-gray-900 mb-4 text-lg">Possible Solutions:</h4>
                  <div className="space-y-4">
                    <div className="flex items-start p-4 bg-gradient-to-r from-pink-50 to-gray-100 rounded-xl border border-pink-200">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-sync-alt text-white text-sm"></i>
                      </div>
                      <span className="text-gray-700 font-medium">Replacement (if available for prints or small items)</span>
                    </div>
                    <div className="flex items-start p-4 bg-gradient-to-r from-pink-50 to-gray-100 rounded-xl border border-pink-200">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-undo text-white text-sm"></i>
                      </div>
                      <span className="text-gray-700 font-medium">Full refund after the item is returned (buyer covers return shipping)</span>
                    </div>
                    <div className="flex items-start p-4 bg-gradient-to-r from-pink-50 to-gray-100 rounded-xl border border-pink-200">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-percentage text-white text-sm"></i>
                      </div>
                      <span className="text-gray-700 font-medium">Partial refund if the buyer wishes to keep the damaged item</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <i className="fas fa-info-circle text-pink-600 mr-3"></i>
                  Important Notes
                </h3>
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-pink-50 to-gray-100 border border-pink-200 rounded-xl hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-paw text-white text-sm"></i>
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg">Color Variations</h4>
                    </div>
                    <p className="text-gray-600 leading-relaxed ml-11">
                      Colors may vary slightly due to different screen settings. Refunds are not offered for minor color differences.
                    </p>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-r from-pink-50 to-gray-100 border border-pink-200 rounded-xl hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-times-circle text-white text-sm"></i>
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg">Order Cancellations</h4>
                    </div>
                    <p className="text-gray-600 leading-relaxed ml-11">
                      Order cancellations are accepted within 24 hours, as long as the order has not yet shipped.
                    </p>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-gray-100 border border-blue-200 rounded-xl">
                    <div className="flex items-start mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-pink-400 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-heart text-white text-sm"></i>
                      </div>
                      <h4 className="font-bold text-blue-800 text-lg">Need Help?</h4>
                    </div>
                    <p className="text-blue-700 leading-relaxed ml-11">
                      For any other concerns, please feel free to contact me — I'll do my best to help.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Store Policies Summary */}
          <div className="bg-gray-100/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 lg:p-10 border border-pink-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-pink-400 to-blue-400 rounded-2xl flex items-center justify-center mr-4 lg:mr-6 shadow-lg">
                <i className="fas fa-store text-white text-xl lg:text-2xl"></i>
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">Additional Store Policies</h2>
                <p className="text-gray-600 mt-1">Important information for all customers</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <div className="space-y-8">
                <div className="p-6 bg-gradient-to-r from-pink-50 to-gray-100 border border-pink-200 rounded-xl hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center mr-4 mt-1">
                      <i className="fas fa-globe text-white"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">International Orders</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed ml-14">
                    International buyers are responsible for any customs duties or import taxes that may apply.
                  </p>
                </div>
                
                <div className="p-6 bg-gradient-to-r from-pink-50 to-gray-100 border border-pink-200 rounded-xl hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center mr-4 mt-1">
                      <i className="fas fa-paint-brush text-white"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Product Details</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed ml-14">
                    Each item is handmade with care, and slight variations from the photos may occur. 
                    Colors may appear slightly different due to screen settings.
                  </p>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-gray-100 border border-blue-200 rounded-xl hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-pink-400 rounded-full flex items-center justify-center mr-4 mt-1">
                      <i className="fas fa-copyright text-white"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Copyright</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed ml-14">
                    All products remain the copyright of Hearty Hounds. Purchasing a physical product 
                    does not grant reproduction or commercial rights.
                  </p>
                </div>
                
                <div className="p-6 bg-gradient-to-r from-blue-50 to-gray-100 border border-blue-200 rounded-xl hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-pink-400 rounded-full flex items-center justify-center mr-4 mt-1">
                      <i className="fas fa-clock text-white"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Delivery Information</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed ml-14">
                    Delivery time varies by location (US orders usually 2–7 days via USPS). 
                    All orders include tracking information for your peace of mind.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-blue-300 to-pink-300 rounded-[100px] shadow-lg p-8 text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Questions About Our Policies?</h2>
              <p className="text-blue-100 mb-6">
                We're here to help! Don't hesitate to reach out if you have any questions about our policies or need assistance with your order.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/contact" className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors">
                  Contact Us
                </a>
                <a href="mailto:info@heartyhounds.com" className="border border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                  Email Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Policies;