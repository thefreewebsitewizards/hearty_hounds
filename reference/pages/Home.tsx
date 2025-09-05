import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts, Product, testFirebaseConnection } from '../services/firebase';
import { useCart } from '../context/CartContext';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const { addItem } = useCart();

  // Set meta description for Home page
  useEffect(() => {
    document.title = 'Ksenia Moroz - Nature-Inspired Watercolor Art | Phoenix Artist';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Watercolor art by Phoenix-based artist Ksenia Moroz. Nature-inspired landscapes, floral paintings, and custom commissions for collectors, designers, and art lovers.');
    }
  }, []);

  // Available images for the carousel
  const carouselImages = [
    {
      src: "/Honey Dipper.jpeg",
      alt: "Original commissioned watercolor art by Ksenia Moroz"
    },
    {
      src: "/Hand-Painted Watercolor Bookmark - Yellow Desert Wildflowers.jpeg",
      alt: "Nature-inspired floral watercolor artwork"
    },
    {
      src: "/Smoky Mountain Forest Watercolor Bookmark - Misty Night Rain Scene.jpeg",
      alt: "Watercolor landscape painting by Ksenia Moroz"
    },
    {
      src: "/Wildflower Meadow Watercolor Bookmark - Golden Field Art.jpeg",
      alt: "Nature-inspired floral watercolor artwork"
    },
    {
      src: "/Water drops.jpeg",
      alt: "Original commissioned watercolor art by Ksenia Moroz"
    },
    {
      src: "/Moroz.jpg",
      alt: "Phoenix-based watercolor artist Ksenia Moroz artwork"
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      quote: "Ksenia's art adds warmth and life to any room. Every piece feels like a story unfolding on paper.",
      author: "Art Collector",
      location: "Phoenix"
    },
    {
      quote: "The attention to detail in her watercolors is extraordinary. I've commissioned three pieces and each one exceeded my expectations.",
      author: "Interior Designer",
      location: "Scottsdale"
    },
    {
      quote: "Her nature-inspired paintings bring such tranquility to our home. The colors are vibrant yet soothing.",
      author: "Private Collector",
      location: "Tempe"
    },
    {
      quote: "Working with Ksenia on a custom piece was a wonderful experience. She truly captured the essence of what I envisioned.",
      author: "Gallery Owner",
      location: "Phoenix"
    },
    {
      quote: "The quality and craftsmanship of her work is unmatched. These aren't just paintings, they're emotional experiences.",
      author: "Art Enthusiast",
      location: "Mesa"
    }
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const nextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  // Auto-advance testimonials with pause on hover
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000); // Slower than image carousel

    return () => clearInterval(interval);
  }, [testimonials.length]);

  useEffect(() => {
    const fetchProducts = async () => {
      // Test Firebase connection first
      const connectionTest = await testFirebaseConnection();
      
      try {
        const products = await getAllProducts();
      
      // Get first 6 products for featured section
      setFeaturedProducts(products.slice(0, 6));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    if (product.id) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images || [],
        weight: product.weight,
        dimensions: {
          length: product.length || 12,
          width: product.width || 9,
          height: product.height || 0.1
        }
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center overflow-hidden -mt-28 bg-gradient-to-br from-primary-500 to-accent-500" 
        style={{
          paddingTop: '7rem'
        }}
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
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Side - Enhanced Text Content */}
            <div className="space-y-10 text-center lg:text-left">
              {/* Artist Badge */}
              <div className="inline-block animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <span className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white text-sm font-medium tracking-wide uppercase rounded-full border border-white/30 shadow-lg">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                  </svg>
                  Watercolor Artist
                </span>
              </div>
              
              <div className="space-y-8">
                <h1 
                  className="font-patrick-hand text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight text-white animate-fade-in-up drop-shadow-lg"
                  style={{ animationDelay: '0.2s' }}
                >
                  Nature-Inspired
                  <span className="block bg-gradient-to-r from-accent-200 to-accent-300 bg-clip-text text-transparent mt-2">
                    Watercolors with
                  </span>
                  <span className="block bg-gradient-to-r from-white to-accent-100 bg-clip-text text-transparent">
                    a Story
                  </span>
                </h1>
                <p 
                  className="font-inter text-lg lg:text-xl leading-relaxed text-white/95 max-w-xl animate-fade-in-up drop-shadow-sm"
                  style={{ animationDelay: '0.4s' }}
                >
                  Phoenix-based artist Ksenia Moroz blends the soulful depth of Russian artistry with the vibrant freedom of the American Southwest.
                </p>
                
                {/* Feature highlights */}
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-2 text-white/90">
                    <div className="w-2 h-2 bg-accent-300 rounded-full animate-pulse"></div>
                    <span className="font-inter text-sm font-medium">Handcrafted Originals</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <div className="w-2 h-2 bg-accent-300 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <span className="font-inter text-sm font-medium">Custom Commissions</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <div className="w-2 h-2 bg-accent-300 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                    <span className="font-inter text-sm font-medium">Worldwide Shipping</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <Link
                  to="/gallery"
                  className="inline-flex items-center justify-center px-10 py-4 bg-white text-primary-600 font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 hover:shadow-2xl group shadow-lg"
                >
                  <span>View Portfolio</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-10 py-4 bg-white text-primary-600 font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 hover:shadow-2xl group shadow-lg"
                >
                  <span>Request a Custom Piece</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right Side - Modern Art Showcase */}
            <div className="flex justify-center lg:justify-end animate-fade-in-right" style={{ animationDelay: '0.8s' }}>
              <div className="relative">
                {/* Main artwork display */}
                <div className="relative bg-white/10 backdrop-blur-lg p-4 sm:p-6 rounded-3xl border border-white/20 shadow-2xl w-full max-w-xs sm:max-w-sm mx-auto">
                  <div className="relative overflow-hidden rounded-2xl aspect-[4/5] w-full">
                    <img 
                      src={carouselImages[currentImageIndex].src}
                      alt={carouselImages[currentImageIndex].alt}
                      className="w-full h-full object-cover transition-all duration-700 ease-in-out"
                    />
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    
                    {/* Navigation */}
                    <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {carouselImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentImageIndex 
                              ? 'bg-white scale-125' 
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                    
                    {/* Arrow navigation */}
                    <button
                      onClick={prevImage}
                      className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-1.5 sm:p-2 transition-all duration-200"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={nextImage}
                      className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-1.5 sm:p-2 transition-all duration-200"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Artwork info */}
                  <div className="mt-3 sm:mt-4 text-center px-2">
                    <h3 className="font-patrick-hand text-white font-semibold text-sm sm:text-base leading-tight line-clamp-2">{carouselImages[currentImageIndex].alt}</h3>
                    <p className="font-inter text-white/70 text-xs sm:text-sm mt-1">Original Watercolor</p>
                  </div>
                </div>
                
                {/* Floating elements around the showcase */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-accent-300 rounded-full opacity-80 animate-bounce" style={{ animationDelay: '1s' }}></div>
                <div className="absolute -bottom-6 -left-6 w-6 h-6 bg-accent-400 rounded-full opacity-80 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute top-1/2 -left-8 w-4 h-4 bg-primary-300 rounded-full opacity-70 animate-bounce" style={{ animationDelay: '2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom CSS for animations */}
       <style>{`
         @keyframes fade-in-up {
           from {
             opacity: 0;
             transform: translateY(30px);
           }
           to {
             opacity: 1;
             transform: translateY(0);
           }
         }
         
         @keyframes fade-in-right {
           from {
             opacity: 0;
             transform: translateX(50px);
           }
           to {
             opacity: 1;
             transform: translateX(0);
           }
         }
         
         .animate-fade-in-up {
           animation: fade-in-up 0.8s ease-out forwards;
           opacity: 0;
         }
         
         .animate-fade-in-right {
           animation: fade-in-right 0.8s ease-out forwards;
           opacity: 0;
         }
       `}</style>

      {/* Featured Products */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary-200/30 to-primary-300/30 rounded-full blur-xl"></div>
          <div className="absolute bottom-32 right-20 w-40 h-40 bg-gradient-to-br from-accent-200/30 to-accent-300/30 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-neutral-200/30 to-neutral-300/30 rounded-full blur-xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-sm font-medium rounded-full shadow-lg">
                ✨ Handcrafted Collection
              </span>
            </div>
            <h2 
              className="font-patrick-hand-sc text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-neutral-800 via-primary-800 to-neutral-800 bg-clip-text text-transparent leading-tight"
            >
              Featured Works
            </h2>
            <p 
              className="font-patrick-hand text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed"
              style={{ color: '#64748b' }}
            >
              A glimpse into Ksenia's world of watercolor landscapes, floral studies, and one-of-a-kind commissions. Each piece tells a story—of nature, travel, and emotion.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto mt-8 rounded-full"></div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[...Array(6)].map((_, index) => (
                <div 
                  key={index} 
                  className="bg-gradient-to-br from-neutral-200 to-neutral-300 animate-pulse h-96 relative overflow-hidden"
                  style={{
                    borderTopLeftRadius: '80px',
                    borderBottomRightRadius: '80px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {featuredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="group bg-white overflow-hidden transition-all duration-500 hover:scale-105 relative flex flex-col h-full"
                  style={{ 
                     boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                     borderTopLeftRadius: '80px',
                     borderBottomRightRadius: '80px',
                     border: '1px solid rgba(226, 232, 240, 0.8)'
                   }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  }}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ borderTopLeftRadius: '80px', borderBottomRightRadius: '80px' }}></div>
                  <div className="aspect-square overflow-hidden relative bg-neutral-200 flex items-center justify-center">
                    <img
                      src={product.images?.[0] || ''}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzE4My40IDE1MDE3MCA4NyAxNzAgODcgMjAwUzEwMy40IDI1MCA4NyAyNTBTMTcwIDI2NyAyMDAgMjY3UzI1MCAyNTAgMjUwIDIyMFMyMzMuNiAxNTAgMjAwIDE1MFoiIGZpbGw9IiNEMUQ1REIiLz4KPHBhdGggZD0iTTE3NSAxODBDMTc1IDE4NS41MjMgMTc5LjQ3NyAxOTAgMTg1IDE5MFMxOTUgMTg1LjUyMyAxOTUgMTgwUzE5MC41MjMgMTcwIDE4NSAxNzBTMTc1IDE3NC40NzcgMTc1IDE4MFoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';
                      }}
                    />
                    {/* Image overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Quick view badge */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <span className="bg-white/90 backdrop-blur-sm text-slate-700 px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                        Quick View
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-8 relative flex flex-col flex-grow">
                    <div className="mb-4 flex-grow">
                      <h3 
                        className="font-patrick-hand-sc text-xl font-bold mb-3 group-hover:text-primary-700 transition-colors duration-300"
                        style={{ color: '#1e293b' }}
                      >
                        {product.name}
                      </h3>
                      <p 
                        className="font-patrick-hand text-sm leading-relaxed line-clamp-2"
                        style={{ color: '#64748b' }}
                      >
                        {product.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <span 
                          className="font-patrick-hand-sc text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent"
                        >
                          ${product.price}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">USD</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-auto">
                      <Link
                        to={`/product/${product.id}`}
                        className="flex-1 font-patrick-hand px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition-all duration-300 text-center font-medium group-hover:shadow-lg"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 font-patrick-hand px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-16">
            <div className="inline-flex flex-col items-center gap-4">
              <p className="font-patrick-hand text-slate-600 text-lg">
                Explore our complete collection of unique watercolor artworks
              </p>
              <Link
                to="/gallery"
                className="group font-patrick-hand-sc inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600 text-white font-bold rounded-full transition-all duration-500 transform hover:scale-105 hover:shadow-2xl relative overflow-hidden"
                style={{
                  boxShadow: '0 10px 30px rgba(166, 187, 162, 0.3)'
                }}
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <span className="relative z-10">View All Products</span>
                <svg className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              
              {/* Stats */}
              <div className="flex items-center gap-8 mt-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                  <span>50+ Unique Pieces</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></div>
                  <span>Handcrafted Quality</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
                  <span>Free Shipping $50+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20" style={{ background: 'white' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 
                className="font-patrick-hand-sc text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-neutral-800 via-primary-800 to-neutral-800 bg-clip-text text-transparent leading-tight"
              >
                Meet Ksenia
              </h2>
              <p 
                className="font-patrick-hand text-xl lg:text-2xl mb-6 leading-relaxed"
                style={{ color: '#64748b' }}
              >
                Originally from Russia and now living in Phoenix, Arizona, Ksenia Moroz has been passionate about watercolor painting since childhood. Her style combines delicate washes with colored pencil details, capturing the beauty of nature and the freedom of self-expression.
              </p>
              <p 
                className="font-patrick-hand text-xl lg:text-2xl mb-6 leading-relaxed"
                style={{ color: '#64748b' }}
              >
                With travels across 12 countries and years of artistic exploration, her work reflects both personal stories and universal emotions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary-500 text-white"
                  >
                    <i className="fas fa-palette text-xl"></i>
                  </div>
                  <h3 
                    className="font-inter text-lg font-semibold mb-2"
                    style={{ color: '#2c3e50' }}
                  >
                    Original Art
                  </h3>
                  <p className="font-inter" style={{ color: '#7f8c8d' }}>
                    Every piece is hand-painted and unique
                  </p>
                </div>
                
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary-500 text-white"
                  >
                    <i className="fas fa-leaf text-xl"></i>
                  </div>
                  <h3 
                    className="font-inter text-lg font-semibold mb-2"
                    style={{ color: '#2c3e50' }}
                  >
                    Nature Inspired
                  </h3>
                  <p className="font-inter" style={{ color: '#7f8c8d' }}>
                    Capturing the beauty of landscapes and wildlife
                  </p>
                </div>
                
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary-500 text-white"
                  >
                    <i className="fas fa-heart text-xl"></i>
                  </div>
                  <h3 
                    className="font-inter text-lg font-semibold mb-2"
                    style={{ color: '#2c3e50' }}
                  >
                    Made with Love
                  </h3>
                  <p className="font-inter" style={{ color: '#7f8c8d' }}>
                    Crafted with passion and attention to detail
                  </p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="/Hand-Painted Watercolor Bookmark - Yellow Desert Wildflowers.jpeg" 
                alt="Nature-inspired floral watercolor artwork" 
                className="w-full h-96 object-cover"
                style={{ 
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                  borderTopLeftRadius: '80px',
                  borderBottomRightRadius: '80px'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/Water drops.jpeg';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Collaborations & Commissions Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="font-patrick-hand-sc text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-neutral-800 via-primary-800 to-neutral-800 bg-clip-text text-transparent leading-tight"
            >
              Collaborate or Commission a Piece
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto mt-8 mb-8 rounded-full"></div>
            <p 
              className="font-patrick-hand text-xl lg:text-2xl max-w-4xl mx-auto leading-relaxed mb-8"
              style={{ color: '#64748b' }}
            >
              Ksenia partners with interior designers, galleries, local businesses, and private collectors to create custom watercolor pieces that elevate spaces and events. From small prints to large statement paintings, each work is tailored to bring beauty and emotion into your world.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 hover:shadow-2xl group"
            >
              <span>Contact for Collaborations</span>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-100 via-white to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="font-patrick-hand-sc text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-neutral-800 via-primary-800 to-neutral-800 bg-clip-text text-transparent leading-tight"
            >
              What People Are Saying
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto mt-8 mb-12 rounded-full"></div>
            
            {/* Testimonial Carousel */}
            <div className="max-w-4xl mx-auto relative">
              <div className="relative overflow-hidden">
                <div 
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${currentTestimonialIndex * 100}%)` }}
                >
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="w-full flex-shrink-0">
                      <blockquote className="text-center px-4">
                        <p 
                          className="font-patrick-hand text-2xl lg:text-3xl leading-relaxed mb-8 italic"
                          style={{ color: '#64748b' }}
                        >
                          "{testimonial.quote}"
                        </p>
                        <footer className="font-inter text-lg font-medium" style={{ color: '#2c3e50' }}>
                          — {testimonial.author}, {testimonial.location}
                        </footer>
                      </blockquote>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Navigation Arrows */}
              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 group"
              >
                <svg className="w-5 h-5 text-primary-600 group-hover:text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 group"
              >
                <svg className="w-5 h-5 text-primary-600 group-hover:text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Dot Indicators */}
              <div className="flex justify-center space-x-3 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonialIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonialIndex 
                        ? 'bg-primary-600 scale-125' 
                        : 'bg-primary-300 hover:bg-primary-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-accent-50 via-white to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="font-patrick-hand-sc text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-neutral-800 via-primary-800 to-neutral-800 bg-clip-text text-transparent leading-tight"
            >
              Get in Touch
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto mt-8 mb-8 rounded-full"></div>
            <p 
              className="font-patrick-hand text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed mb-12"
              style={{ color: '#64748b' }}
            >
              Have a question, collaboration idea, or want to purchase a painting? I'd love to hear from you!
            </p>
            
            {/* Social Media Icons */}
            <div className="flex justify-center space-x-8 mb-12">
              <a href="#" className="text-primary-600 hover:text-accent-600 transition-colors transform hover:scale-110">
                <i className="fab fa-instagram text-3xl"></i>
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-primary-600 hover:text-accent-600 transition-colors transform hover:scale-110">
                <i className="fab fa-tiktok text-3xl"></i>
                <span className="sr-only">TikTok</span>
              </a>
              <a href="#" className="text-primary-600 hover:text-accent-600 transition-colors transform hover:scale-110">
                <i className="fab fa-etsy text-3xl"></i>
                <span className="sr-only">Etsy</span>
              </a>
              <a href="mailto:contact@morozcustomart.com" className="text-primary-600 hover:text-accent-600 transition-colors transform hover:scale-110">
                <i className="fas fa-envelope text-3xl"></i>
                <span className="sr-only">Email</span>
              </a>
            </div>
            
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 hover:shadow-2xl group"
            >
              <span>Contact Form</span>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Policies Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="font-inter text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-neutral-800 to-primary-600 bg-clip-text text-transparent"
            >
              Shipping & Policies
            </h2>
            <div className="w-24 h-1 mx-auto mb-8 bg-gradient-to-r from-primary-500 to-accent-500"></div>
            <p 
              className="font-inter text-xl max-w-3xl mx-auto leading-relaxed"
              style={{ color: '#555', lineHeight: '1.8' }}
            >
              We're committed to providing you with exceptional service and ensuring your beautiful artwork arrives safely at your doorstep.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div 
              className="p-10 text-center group relative overflow-hidden"
              style={{ 
                backgroundColor: 'white',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                borderTopLeftRadius: '50px',
                borderBottomRightRadius: '60px',
                border: '1px solid rgba(139, 154, 91, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 25px 60px rgba(139, 154, 91, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.08)';
              }}
            >
              <div 
                className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-accent-500"
              ></div>
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-300 bg-gradient-to-r from-primary-500 to-accent-500"
                style={{ 
                  boxShadow: '0 10px 25px rgba(166, 187, 162, 0.3)'
                }}
              >
                <i className="fas fa-shipping-fast text-white text-2xl"></i>
              </div>
              <h3 
                className="font-inter text-2xl font-bold mb-6"
                style={{ color: '#2c3e50' }}
              >
                Fast Shipping
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-neutral-100">
                  <span className="font-inter font-medium text-neutral-800">Postcards/Bookmarks</span>
                  <span className="font-inter font-bold text-primary-600">$6</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-neutral-100">
                  <span className="font-inter font-medium text-neutral-800">Wall Art (Small)</span>
                  <span className="font-inter font-bold text-primary-600">$12</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-neutral-100">
                  <span className="font-inter font-medium text-neutral-800">Wall Art (Large)</span>
                  <span className="font-inter font-bold text-primary-600">$20</span>
                </div>
                <div 
                  className="p-4 rounded-lg text-center font-inter font-bold text-white bg-gradient-to-r from-primary-500 to-accent-500"
                >
                  FREE shipping on orders $50+
                </div>
                <p className="font-inter text-sm mt-4 text-neutral-500">
                  <i className="fas fa-map-marker-alt mr-2 text-primary-600"></i>
                  Local Phoenix delivery available
                </p>
              </div>
            </div>
            
            <div 
              className="p-10 text-center group relative overflow-hidden"
              style={{ 
                backgroundColor: 'white',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                borderTopLeftRadius: '50px',
                borderBottomRightRadius: '60px',
                border: '1px solid rgba(139, 154, 91, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 25px 60px rgba(139, 154, 91, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.08)';
              }}
            >
              <div 
                className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-accent-500"
              ></div>
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-300 bg-gradient-to-r from-primary-500 to-accent-500"
                style={{ 
                  boxShadow: '0 10px 25px rgba(166, 187, 162, 0.3)'
                }}
              >
                <i className="fas fa-credit-card text-white text-2xl"></i>
              </div>
              <h3 
                className="font-inter text-2xl font-bold mb-6"
                style={{ color: '#2c3e50' }}
              >
                Secure Payment
              </h3>
              <div className="space-y-4">
                <div className="flex items-center p-3 rounded-lg bg-neutral-100">
                  <i className="fas fa-shield-alt mr-3 text-primary-600"></i>
                  <span className="font-inter text-neutral-800">SSL encrypted checkout</span>
                </div>
                <div className="flex items-center p-3 rounded-lg bg-neutral-100">
                  <i className="fas fa-credit-card mr-3 text-primary-600"></i>
                  <span className="font-inter text-neutral-800">All major cards accepted</span>
                </div>
                <div className="flex items-center p-3 rounded-lg bg-neutral-100">
                  <i className="fab fa-paypal mr-3 text-primary-600"></i>
                  <span className="font-inter text-neutral-800">PayPal available</span>
                </div>
                <div className="flex items-center p-3 rounded-lg bg-neutral-100">
                  <i className="fas fa-lock mr-3 text-primary-600"></i>
                  <span className="font-inter text-neutral-800">Bank-level security</span>
                </div>
                <div 
                  className="p-4 rounded-lg text-center font-inter font-bold text-white bg-gradient-to-r from-primary-500 to-accent-500"
                >
                  No hidden fees ever
                </div>
              </div>
            </div>
            
            <div 
              className="p-10 text-center group relative overflow-hidden"
              style={{ 
                backgroundColor: 'white',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                borderTopLeftRadius: '50px',
                borderBottomRightRadius: '60px',
                border: '1px solid rgba(139, 154, 91, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 25px 60px rgba(139, 154, 91, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.08)';
              }}
            >
              <div 
                className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-accent-500"
              ></div>
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-300 bg-gradient-to-r from-primary-500 to-accent-500"
                style={{ 
                  boxShadow: '0 10px 25px rgba(166, 187, 162, 0.3)'
                }}
              >
                <i className="fas fa-shield-alt text-white text-2xl"></i>
              </div>
              <h3 
                className="font-inter text-2xl font-bold mb-6"
                style={{ color: '#2c3e50' }}
              >
                Quality Guarantee
              </h3>
              <div className="space-y-4">
                <div className="flex items-center p-3 rounded-lg bg-neutral-100">
                  <i className="fas fa-star mr-3 text-primary-600"></i>
                  <span className="font-inter text-neutral-800">100% satisfaction guarantee</span>
                </div>
                <div className="flex items-center p-3 rounded-lg bg-neutral-100">
                  <i className="fas fa-undo mr-3 text-primary-600"></i>
                  <span className="font-inter text-neutral-800">30-day return policy</span>
                </div>
                <div className="flex items-center p-3 rounded-lg bg-neutral-100">
                  <i className="fas fa-box mr-3 text-primary-600"></i>
                  <span className="font-inter text-neutral-800">Professional packaging</span>
                </div>
                <div className="flex items-center p-3 rounded-lg bg-neutral-100">
                  <i className="fas fa-headset mr-3 text-primary-600"></i>
                  <span className="font-inter text-neutral-800">Dedicated support team</span>
                </div>
                <div 
                  className="p-4 rounded-lg text-center font-inter font-bold text-white bg-gradient-to-r from-primary-500 to-accent-500"
                >
                  Insured shipping included
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CSS Animations for floating elements */}
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
          
          @keyframes bubble {
            0% {
              transform: translateY(0px) scale(1);
              opacity: 0.7;
            }
            50% {
              transform: translateY(-15px) scale(1.1);
              opacity: 0.9;
            }
            100% {
              transform: translateY(-30px) scale(0.9);
              opacity: 0.5;
            }
          }
          
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          
          .animate-bubble {
            animation: bubble 4s ease-in-out infinite;
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

export default Home;