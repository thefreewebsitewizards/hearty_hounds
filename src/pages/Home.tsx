import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShoppingCart } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import { Product } from '../utils/types';
import { getFeaturedProducts } from '../services/productService';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
// Hero component consolidated into Home.tsx
// About component consolidated into Home.tsx
// GallerySection component consolidated into Home.tsx
// Testimonials component consolidated into Home.tsx
import FAQ from '../components/FAQ';
import Socials from '../components/Socials';
import { AnimatedElement } from '../hooks/useScrollAnimation';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar: string;
}

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { getItemCount, addItem } = useCart();

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      location: "Melbourne, VIC",
      rating: 5,
      text: "My Golden Retriever, Max, absolutely loves the chicken jerky treats! They're made with such high-quality ingredients, and I love that they're all natural. Max gets so excited every time he sees the package!",
      avatar: "👩‍🦰"
    },
    {
      id: 2,
      name: "Michael Chen",
      location: "Sydney, NSW",
      rating: 5,
      text: "The pupcakes were a huge hit at my dog's birthday party! All the dogs loved them, and the parents were impressed with the quality ingredients. Will definitely be ordering again for special occasions.",
      avatar: "👨‍💼"
    },
    {
      id: 3,
      name: "Emma Wilson",
      location: "Brisbane, QLD",
      rating: 5,
      text: "As a vet, I'm very particular about what treats I recommend. Hearty Hounds treats are fantastic - wholesome ingredients, no nasty additives, and dogs absolutely love them. Highly recommended!",
      avatar: "👩‍⚕️"
    }
  ];

  const renderStars = (rating: number): React.ReactElement[] => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-5 h-5 ${i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoading(true);
        const productsResponse = await getFeaturedProducts(6); // Get 6 featured products
        if (productsResponse.success && productsResponse.data) {
          setFeaturedProducts(productsResponse.data);
        }
      } catch (error) {
        console.error('Error loading featured products:', error);
        toast.error('Failed to load featured products');
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  const scrollToProducts = (): void => {
    const element = document.getElementById('products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full opacity-10 animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight font-chewy">
                  <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Wholesome
                  </span>
                  <br />
                  <span className="text-gray-800">Treats for Your</span>
                  <br />
                  <span className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                    Furry Friends
                  </span>
                </h1>
                
                <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-spartan">
                  Handcrafted with love, our premium dog treats are made from the finest ingredients to keep your pup healthy, happy, and tail-wagging with joy.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center lg:justify-start">
                <Link
                  to="/gallery"
                  className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Shop Treats Now 🐾
                </Link>
                <button 
                  onClick={scrollToProducts}
                  className="border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg transition-all duration-300"
                >
                  Learn More
                </button>
              </div>
              
              {/* Trust Badges */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="text-3xl mb-2">🥇</div>
                  <div className="text-sm font-semibold text-gray-800 font-spartan">Premium Quality</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="text-3xl mb-2">🏥</div>
                  <div className="text-sm font-semibold text-gray-800 font-spartan">Vet Approved</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="text-3xl mb-2">🌱</div>
                  <div className="text-sm font-semibold text-gray-800 font-spartan">Natural Ingredients</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="text-3xl mb-2">❤️</div>
                  <div className="text-sm font-semibold text-gray-800 font-spartan">Made with Love</div>
                </div>
              </div>
            </div>
            
            {/* Right Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-blue-400 rounded-3xl transform rotate-6 scale-105 opacity-20"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-500">
                  <img 
                    src="/hero.jpg" 
                    alt="Happy dog with Hearty Hounds treats" 
                    className="w-full h-auto max-w-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-16 left-16 w-32 h-32 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full opacity-20 animate-float"></div>
          <div className="absolute bottom-16 right-16 w-36 h-36 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-20 animate-pulse-slow"></div>
          <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full opacity-15 animate-float" style={{animationDelay: '1.8s'}}></div>
          <div className="absolute bottom-1/3 left-1/3 w-24 h-24 bg-gradient-to-br from-pink-100 to-blue-100 rounded-full opacity-25 animate-pulse-slow" style={{animationDelay: '0.8s'}}></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Image */}
            <div className="order-2 lg:order-1">
              <div className="relative">
                <img 
                  src="/our story.jpg" 
                  alt="Our story - Happy dogs" 
                  className="rounded-2xl shadow-xl w-full h-auto"
                />
                <div className="absolute -bottom-6 -right-6 bg-pink-500 text-white p-4 rounded-2xl shadow-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold">5+</div>
                    <div className="text-sm">Years of Love</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Content */}
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl lg:text-5xl text-gray-800 mb-6 font-chewy">
                Our Story
              </h2>
              
              <div className="space-y-6 text-gray-600 text-lg leading-relaxed font-spartan">
                <p>
                  Founded with a passion for our four-legged family members, Hearty Hounds began as a small kitchen operation driven by love and dedication to canine health.
                </p>
                
                <p>
                  After seeing our own dogs struggle with store-bought treats filled with preservatives and artificial ingredients, we decided to create something better. Every recipe is carefully crafted using only the finest, natural ingredients that we'd feel comfortable feeding our own pets.
                </p>
                
                <p>
                  Today, we're proud to serve hundreds of happy dogs and their families, maintaining our commitment to quality, health, and that special bond between pets and their humans.
                </p>
              </div>
              
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="text-3xl mb-3">🏆</div>
                  <h3 className="text-gray-800 mb-2 font-chewy">Quality Promise</h3>
                  <p className="text-gray-600 text-sm font-spartan">Premium ingredients sourced from trusted suppliers</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="text-3xl mb-3">🏥</div>
                  <h3 className="text-gray-800 mb-2 font-chewy">Vet-Safe Recipes</h3>
                  <p className="text-gray-600 text-sm font-spartan">Veterinarian approved formulations for optimal health</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="text-3xl mb-3">🌿</div>
                  <h3 className="text-gray-800 mb-2 font-chewy">Allergy-Conscious</h3>
                  <p className="text-gray-600 text-sm font-spartan">Carefully crafted to avoid common allergens</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="text-3xl mb-3">❤️</div>
                  <h3 className="text-gray-800 mb-2 font-chewy">Made with Love</h3>
                  <p className="text-gray-600 text-sm font-spartan">Every treat is handcrafted with care and attention</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Products Section */}
      <section id="products" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement variant="fadeInUp" className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl mb-6">
              <span className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                Our Delicious
              </span>
              <span className="block text-gray-800">Product Range</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From crunchy biscuits to gourmet treats, we have everything your furry friend needs to stay happy and healthy.
            </p>
          </AnimatedElement>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="h-64 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {featuredProducts.map((product, index) => (
                  <AnimatedElement 
                    key={product.id}
                    variant="scaleIn"
                    delay={index * 100}
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                      showAddToCart={true}
                      className="transform hover:scale-105 transition-transform duration-300 hover-lift"
                    />
                  </AnimatedElement>
                ))}
              </div>
              
              {/* Call to Action */}
              <AnimatedElement variant="fadeInUp" delay={300} className="text-center">
                <Link
                  to="/gallery"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover-glow"
                >
                  View All Products
                  <FiArrowRight className="h-5 w-5" />
                </Link>
              </AnimatedElement>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🐕</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No featured products available</h3>
              <p className="text-gray-600 mb-6">
                Check back soon for our latest featured products!
              </p>
              <Link
                to="/gallery"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse All Products
                <FiArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 px-6 bg-blue-50">
        <div className="container mx-auto">
          <AnimatedElement variant="fadeInUp">
            <h2 className="text-4xl lg:text-6xl text-center text-gray-800 mb-16 font-chewy">
              Happy <span className="text-pink-500">Moments</span>
            </h2>
          </AnimatedElement>
          
          <AnimatedElement variant="fadeInUp" delay={200}>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto text-lg font-spartan">
              See the joy our treats bring to dogs and their families
            </p>
          </AnimatedElement>
          
          {/* Responsive Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { src: '/g1.jpg', alt: 'Happy dog with treat', className: 'col-span-1 row-span-2' },
              { src: '/g2.jpg', alt: 'Dog enjoying treats', className: 'col-span-1' },
              { src: '/g3.jpg', alt: 'Cute puppy', className: 'col-span-1' },
              { src: '/g4.jpg', alt: 'Dog with birthday cake', className: 'col-span-1 row-span-2 hidden lg:block' },
              { src: '/g5.jpg', alt: 'Playful dog', className: 'col-span-1' },
              { src: '/g6.jpg', alt: 'Dog with treats', className: 'col-span-1' },
              { src: '/g7.jpg', alt: 'Happy dog moment', className: 'col-span-1' },
              { src: '/g8.jpg', alt: 'Dog enjoying snack', className: 'col-span-1 row-span-2' },
              { src: '/g9.jpg', alt: 'Adorable puppy', className: 'col-span-1' },
              { src: '/g10.jpg', alt: 'Dog with family', className: 'col-span-1 hidden lg:block' },
            ].map((image, index) => (
              <AnimatedElement 
                key={index}
                variant="scaleIn"
                delay={index * 100}
                className={`${image.className} hover-lift`}
              >
                <img 
                  src={image.src} 
                  alt={image.alt} 
                  className={`w-full object-cover rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                    image.className.includes('row-span-2') ? 'h-full' : 'h-48'
                  }`}
                  onError={(e) => {
                    // Fallback to a placeholder if image doesn't exist
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/400x300/f472b6/ffffff?text=Happy+Dog';
                  }}
                />
              </AnimatedElement>
            ))}
          </div>
        </div>
      </section>

      {/* Shopping Cart Promotion */}
      {getItemCount() === 0 && (
        <section className="py-20 bg-white relative overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full opacity-20 animate-float"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-20 animate-pulse-slow"></div>
          </div>
          
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedElement variant="scaleIn">
              <div className="bg-gradient-to-br from-pink-100 to-blue-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-8">
                <img 
                  src="/HH-removebg-preview.png" 
                  alt="Hearty Hounds Logo" 
                  className="h-20 w-20 object-contain"
                />
              </div>
            </AnimatedElement>
            <AnimatedElement variant="fadeInUp" delay={200}>
              <h2 className="text-5xl lg:text-7xl font-chewy font-bold mb-6">
                <span className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Start Your Pet's
                </span>
                <span className="block text-gray-800">Journey Today</span>
              </h2>
            </AnimatedElement>
            <AnimatedElement variant="fadeInUp" delay={400}>
              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Browse our curated selection of premium pet products and find the perfect treats and toys for your furry friend. 
                <span className="block mt-2 font-semibold text-pink-600">Free Australia-wide shipping on orders over $75! 🚚</span>
              </p>
            </AnimatedElement>
            <AnimatedElement variant="fadeInUp" delay={600}>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  to="/gallery"
                  className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover-glow"
                >
                  <FiShoppingCart className="h-5 w-5" />
                  Shop Now
                </Link>
                <Link
                  to="/gallery?category=featured"
                  className="inline-flex items-center gap-2 px-10 py-4 border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white rounded-full font-bold text-lg transition-all duration-300"
                >
                  View Featured
                  <FiArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </AnimatedElement>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-pink-50 to-blue-50 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full opacity-20 animate-float"></div>
          <div className="absolute bottom-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-20 animate-pulse-slow"></div>
          <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full opacity-15 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/3 left-1/2 w-28 h-28 bg-gradient-to-br from-pink-100 to-blue-100 rounded-full opacity-25 animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <AnimatedElement variant="fadeInUp">
              <h2 className="text-4xl lg:text-5xl font-chewy text-gray-800 mb-6">
                What Our Customers Say
              </h2>
            </AnimatedElement>
            <AnimatedElement variant="fadeInUp" delay={200}>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-spartan">
                Don't just take our word for it - hear from the humans (and pups) who love our treats!
              </p>
            </AnimatedElement>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <AnimatedElement 
                key={testimonial.id} 
                variant="scaleIn" 
                delay={index * 150}
                className="hover-lift"
              >
                <div className="testimonial-card bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                {/* Stars */}
                <div className="flex justify-center mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                
                {/* Quote */}
                <blockquote className="text-gray-600 text-center mb-6 leading-relaxed italic font-spartan">
                  "{testimonial.text}"
                </blockquote>
                
                {/* Customer Info */}
                <div className="text-center">
                  <div className="text-4xl mb-3">{testimonial.avatar}</div>
                  <h4 className="text-gray-800 text-lg font-chewy">{testimonial.name}</h4>
                  <p className="text-gray-500 text-sm font-spartan">{testimonial.location}</p>
                </div>
                </div>
              </AnimatedElement>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <AnimatedElement variant="fadeInUp">
              <div className="bg-gradient-to-r from-pink-50 to-blue-50 rounded-2xl p-8 max-w-4xl mx-auto border border-pink-200">
                <h3 className="text-2xl lg:text-3xl font-chewy text-gray-800 mb-4">
                  Join Our Happy Customer Family! 🐕💕
                </h3>
                <p className="text-gray-600 mb-6 text-lg font-spartan">
                  Ready to see your pup's tail wag with joy? Try our premium treats today and become part of our growing family of satisfied customers.
                </p>
                <button 
                  onClick={() => {
                    const element = document.getElementById('products');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="bg-gradient-to-r from-pink-500 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-pink-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl hover-glow"
                >
                  Shop Now 🛒
                </button>
              </div>
            </AnimatedElement>
          </div>

          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-pink-500 mb-2">500+</div>
              <div className="text-gray-600 font-medium">Happy Dogs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-blue-500 mb-2">5⭐</div>
              <div className="text-gray-600 font-medium">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-pink-500 mb-2">100%</div>
              <div className="text-gray-600 font-medium">Natural Ingredients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-blue-500 mb-2">5+</div>
              <div className="text-gray-600 font-medium">Years Experience</div>
            </div>
          </div>
        </div>
      </section>
      <FAQ />
      <Socials />
    </div>
  );
};

export default Home;