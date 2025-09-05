import React, { useEffect } from 'react';

const About: React.FC = () => {
  // Set meta description for About page
  useEffect(() => {
    document.title = 'About - Hearty Hounds Premium Pet Products';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn about Hearty Hounds, our mission, values, and the story behind our premium pet products and treats.');
    }
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50 to-blue-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-200 to-blue-200 rounded-full opacity-30 animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-200 to-pink-200 rounded-full opacity-40 animate-float-delayed"></div>
        <div className="absolute bottom-40 left-20 w-40 h-40 bg-gradient-to-br from-pink-200 to-blue-200 rounded-full opacity-25 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-gradient-to-br from-blue-200 to-pink-200 rounded-full opacity-35 animate-float-delayed"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16 lg:mb-20 pt-16 lg:pt-20">
          <div className="inline-block mb-6">
            <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-blue-500 text-white text-sm font-medium tracking-wide uppercase rounded-full shadow-lg">
              <i className="fas fa-heart mr-2"></i>
              Premium Pet Products
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-chewy text-gray-900 mb-4 sm:mb-6 lg:mb-8 leading-tight">
            About <span className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">Hearty</span> Hounds
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-spartan font-light px-4">
            Welcome to Hearty Hounds! We're passionate about creating premium, nutritious treats and products that keep your furry friends happy and healthy.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16 lg:mb-20">
          {/* Artist Image */}
          <div className="relative order-2 lg:order-1 group">
            <div className="relative">
              {/* Main image container */}
              <div className="relative overflow-hidden rounded-3xl shadow-2xl transform group-hover:scale-[1.02] transition-all duration-500">
                <img 
                  src="/our story.jpg" 
                  alt="Happy dogs enjoying Hearty Hounds premium treats" 
                  className="w-full h-[40rem] object-cover"
                  style={{
                    borderTopLeftRadius: '80px',
                    borderBottomRightRadius: '80px'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                {/* Brand overlay */}
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-sm font-medium opacity-90">Premium Pet Products</p>
                  <p className="text-xl font-bold">Hearty Hounds</p>
                </div>
              </div>
              
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-lg border-4 border-pink-100 group-hover:rotate-12 transition-transform duration-300">
                <i className="fas fa-paw text-pink-600 text-xl"></i>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-20 h-20 lg:w-28 lg:h-28 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 lg:w-36 lg:h-36 bg-gradient-to-br from-blue-400 to-pink-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
              
              {/* Artistic frame effect */}
              <div className="absolute inset-0 rounded-3xl border-2 border-white/20 pointer-events-none"></div>
            </div>
          </div>

          {/* Our Story */}
          <div className="space-y-8 order-1 lg:order-2">
            {/* Main story card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 lg:p-10 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                  <i className="fas fa-heart text-white text-xl"></i>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold font-chewy text-gray-900">
                  Our Story
                </h2>
              </div>
              
              <div className="space-y-6">
                <p className="text-gray-700 text-lg leading-relaxed font-spartan">
                  Every product is carefully crafted using premium, natural ingredients and rigorous quality standards. 
                  Based in <span className="font-semibold text-pink-600">Melbourne, Australia</span>, we draw inspiration from our love for dogs and 
                  commitment to their health and happiness.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed font-spartan">
                  Every treat is <span className="font-semibold text-blue-600">made with love and care</span>, ensuring your furry friends get the nutrition 
                  and taste they deserve.
                </p>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-500">1000+</div>
                    <div className="text-sm text-gray-600">Happy Dogs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">3+</div>
                    <div className="text-sm text-gray-600">Years Experience</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="relative overflow-hidden bg-gradient-to-r from-yellow-300 to-orange-300 rounded-2xl p-8 text-white shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-paw text-white text-lg"></i>
                  </div>
                  <h3 className="text-2xl font-bold font-chewy">
                    Giving Back
                  </h3>
                </div>
                <p className="text-white/90 text-lg leading-relaxed font-spartan">
                  <span className="font-semibold">5% of all sales</span> are donated to local animal shelters, supporting rescue efforts and pet welfare.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Products & Pricing */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold font-chewy text-gray-900 mb-6">
              Premium Pet Products
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-spartan">
              Discover nutritious treats and products that bring joy and health to your furry friends
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {/* Premium Treats */}
            <div className="group relative bg-white rounded-2xl shadow-xl p-8 text-center transform hover:scale-105 transition-all duration-500 hover:shadow-2xl border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-blue-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                  <i className="fas fa-bone text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold font-chewy text-gray-900 mb-2">🦴 Premium Treats</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">$25</span>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 font-spartan">Natural, nutritious treats made with premium ingredients for your dog's health</p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <i className="fas fa-check text-green-500"></i>
                  <span>All Natural & Healthy</span>
                </div>
              </div>
            </div>

            {/* Interactive Toys */}
            <div className="group relative bg-white rounded-2xl shadow-xl p-8 text-center transform hover:scale-105 transition-all duration-500 hover:shadow-2xl border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-blue-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                  <i className="fas fa-baseball-ball text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold font-chewy text-gray-900 mb-2">🎾 Interactive Toys</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">$35</span>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 font-spartan">Engaging toys designed to stimulate your dog's mind and keep them active</p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <i className="fas fa-check text-green-500"></i>
                  <span>Mental Stimulation</span>
                </div>
              </div>
            </div>

            {/* Accessories */}
            <div className="group relative bg-white rounded-2xl shadow-xl p-8 text-center transform hover:scale-105 transition-all duration-500 hover:shadow-2xl border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-blue-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                  <i className="fas fa-tag text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold font-chewy text-gray-900 mb-2">🎀 Accessories</h3>
                <div className="mb-4">
                  <span className="text-2xl text-gray-500">Starting</span>
                  <span className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent ml-2">$15</span>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 font-spartan">Premium collars, leashes, and accessories to keep your dog stylish and safe</p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <i className="fas fa-check text-green-500"></i>
                  <span>Durable & Stylish</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & Social */}
        <div className="grid md:grid-cols-2 gap-10 lg:gap-12 mb-20">
          {/* Shipping Info */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 lg:p-10 border border-white/30 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-blue-500 rounded-xl flex items-center justify-center mr-4">
              <i className="fas fa-shipping-fast text-white text-xl"></i>
            </div>
              <h3 className="text-2xl lg:text-3xl font-bold font-chewy text-gray-900">
                Shipping Information
              </h3>
            </div>
            
            <div className="space-y-6">
              <div className="group flex items-start p-6 bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl hover:from-pink-100 hover:to-blue-100 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-blue-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-globe text-white text-lg"></i>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg mb-1">📦 Australia-wide Shipping</p>
                  <p className="text-gray-600 font-spartan">Fast and secure delivery nationwide with tracking</p>
                </div>
              </div>
              
              <div className="group flex items-start p-6 bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl hover:from-pink-100 hover:to-blue-100 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-blue-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-hand-holding-heart text-white text-lg"></i>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg mb-1">🎁 Perfect for Pet Parents</p>
                  <p className="text-gray-600 font-spartan">Premium products made with love for your furry family members</p>
                </div>
              </div>
              
              <div className="group flex items-start p-6 bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl hover:from-pink-100 hover:to-blue-100 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-blue-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-shield-alt text-white text-lg"></i>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg mb-1">🛡️ Secure Packaging</p>
                  <p className="text-gray-600 font-spartan">Carefully packaged to ensure your pet products arrive fresh and safe</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 lg:p-10 border border-white/30 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                <i className="fas fa-share-alt text-white text-xl"></i>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold font-chewy text-gray-900">
                Follow Our Journey
              </h3>
            </div>
            
            <div className="space-y-6">
              <a 
                href="https://www.instagram.com/heartyhounds/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center p-6 bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl hover:from-pink-100 hover:to-blue-100 transition-all duration-300 transform hover:scale-[1.02]"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-blue-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <i className="fab fa-instagram text-white text-xl"></i>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">Instagram</p>
                  <p className="text-gray-600 font-spartan">@heartyhounds • Follow for daily pet tips and updates</p>
                </div>
                <i className="fas fa-external-link-alt text-gray-400 group-hover:text-pink-500 transition-colors duration-300 text-lg"></i>
              </a>
              
              <a 
                href="https://www.youtube.com/@heartyhounds" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center p-6 bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl hover:from-pink-100 hover:to-blue-100 transition-all duration-300 transform hover:scale-[1.02]"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-blue-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <i className="fab fa-youtube text-white text-xl"></i>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">YouTube</p>
                  <p className="text-gray-600 font-spartan">@heartyhounds • Watch pet care tips and product reviews</p>
                </div>
                <i className="fas fa-external-link-alt text-gray-400 group-hover:text-red-500 transition-colors duration-300 text-lg"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-400 to-pink-500 rounded-[300px] p-12 lg:p-16 text-white shadow-2xl">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full -translate-x-16 -translate-y-16"></div>
          
          <div className="relative z-10 text-center">
            <div className="inline-block mb-6">
              <span className="inline-flex items-center px-4 py-2 bg-white/20 text-white text-sm font-medium rounded-full border border-white/30">
                <i className="fas fa-paw mr-2"></i>
                Start Your Pet's Journey
              </span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold font-chewy mb-6 leading-tight">
              Ready to Spoil Your Furry Friend?
            </h2>
            
            <p className="text-xl lg:text-2xl mb-10 opacity-90 max-w-3xl mx-auto leading-relaxed font-spartan">
              Explore our collection of premium pet products and bring joy and health to your beloved companion
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="/gallery" 
                className="group inline-flex items-center px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                <i className="fas fa-shopping-bag mr-3 group-hover:rotate-12 transition-transform duration-300"></i>
                Shop Products
                <i className="fas fa-arrow-right ml-3 group-hover:translate-x-1 transition-transform duration-300"></i>
              </a>
              
              <a 
                href="/contact" 
                className="group inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105"
              >
                <i className="fas fa-envelope mr-3"></i>
                Get in Touch
              </a>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                    <i className="fas fa-shipping-fast text-white text-lg"></i>
                  </div>
                  <p className="text-sm opacity-90 font-spartan">Free Australia Shipping</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                    <i className="fas fa-hand-holding-heart text-white text-lg"></i>
                  </div>
                  <p className="text-sm opacity-90 font-spartan">Made with Love</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                    <i className="fas fa-certificate text-white text-lg"></i>
                  </div>
                  <p className="text-sm opacity-90 font-spartan">Premium Quality</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;