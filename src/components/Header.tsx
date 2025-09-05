import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const { getItemCount } = useCart();
  const itemCount = getItemCount();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    setIsAccountDropdownOpen(false);
  };

  return (
    <>
     
      
      <header 
        className={`fixed top-4 left-4 right-4 md:left-8 md:right-8 lg:left-12 lg:right-12 xl:left-16 xl:right-16 z-50 transition-all duration-300 rounded-[80px] ${
          isScrolled 
            ? 'md:backdrop-blur-xl md:shadow-2xl md:border md:border-white/20 bg-white/95 md:bg-transparent shadow-lg border border-gray-200' 
            : 'md:backdrop-blur-md md:shadow-lg md:border md:border-white/30 bg-white/90 md:bg-transparent shadow-md border border-gray-100'
        }`}
        style={{
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Business Name - Left */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 group transition-transform duration-300 hover:scale-105"
              style={{ fontFamily: 'Chewy, cursive' }}
            >
              <img 
                src="/HH-removebg-preview.png" 
                alt="Hearty Hounds Logo" 
                className="h-12 w-12 transition-transform duration-300 group-hover:scale-110"
              />
              <span className="text-2xl font-bold transition-colors duration-300 group-hover:text-pink-500">
                <span className="text-pink-500">Hearty</span> <span className="text-blue-600">Hounds</span>
              </span>
            </Link>

            {/* Navigation Links - Center */}
            <nav className="hidden lg:flex items-center space-x-2">
              {[
                { to: '/', label: 'Home', icon: 'fas fa-home' },
                { to: '/gallery', label: 'Shop', icon: 'fas fa-store' },
                { to: '/about', label: 'About', icon: 'fas fa-info-circle' },
                { to: '/policies', label: 'Policies', icon: 'fas fa-file-contract' },
                { to: '/contact', label: 'Contact', icon: 'fas fa-envelope' }
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group nav-link flex items-center space-x-2 text-base font-medium font-spartan transition-all duration-300 hover:text-pink-600 px-4 py-2 rounded-full border border-transparent hover:border-pink-200/50 hover:shadow-md"
                >
                  <i className={`${item.icon} text-sm group-hover:scale-110 transition-transform duration-300`}></i>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Right Section - Cart & Account */}
            <div className="flex items-center space-x-3">
              {/* Enhanced Cart Icon */}
              <Link
                to="/cart"
                className="group relative flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 text-gray-800 hover:text-pink-500 hover:scale-105 border border-transparent hover:border-pink-200/50"
              >
                <i className="fas fa-shopping-cart text-lg group-hover:animate-bounce"></i>
                <span className="hidden sm:inline-block font-medium text-sm font-spartan">Cart</span>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold bg-gradient-to-r from-pink-500 to-blue-500 shadow-lg animate-pulse">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Account Section - Hidden on Mobile */}
              {user ? (
                <div className="relative hidden lg:block">
                  <button
                    onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                    className="group flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 text-gray-800 hover:text-pink-500 border border-transparent hover:border-pink-200/50 hover:shadow-md"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block font-medium text-sm font-spartan">{user.email}</span>
                    <i className={`fas fa-chevron-down text-xs transition-transform duration-300 ${isAccountDropdownOpen ? 'rotate-180' : ''}`}></i>
                  </button>

                  {/* Enhanced Dropdown Menu */}
                  {isAccountDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setIsAccountDropdownOpen(false)}
                      ></div>
                      <div 
                        className="absolute right-0 mt-3 w-64 backdrop-blur-xl rounded-xl shadow-2xl border border-pink-200 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200"
                        style={{ 
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }}
                      >
                        {/* User Info Header */}
                        <div 
                          className="px-6 py-4 bg-gradient-to-r from-pink-50 to-blue-50 border-b border-pink-100"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-blue-500 flex items-center justify-center shadow-lg">
                              <i className="fas fa-user text-white"></i>
                            </div>
                            <div>
                              <p className="font-inter text-sm font-bold text-gray-900">Welcome back!</p>
                              <p className="font-inter text-xs truncate text-gray-600">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                            <Link
                              to="/admin"
                              className="flex items-center space-x-3 px-6 py-3 font-inter text-sm text-gray-800 transition-all duration-300 hover:bg-gradient-to-r hover:from-pink-50 hover:to-blue-50 hover:text-pink-600 border-l-4 border-transparent hover:border-pink-400"
                              onClick={() => setIsAccountDropdownOpen(false)}
                            >
                              <i className="fas fa-cog text-pink-500"></i>
                              <span>Admin Dashboard</span>
                            </Link>
                          <Link
                            to="/orders"
                            className="flex items-center space-x-3 px-6 py-3 font-inter text-sm text-gray-800 transition-all duration-300 hover:bg-gradient-to-r hover:from-pink-50 hover:to-blue-50 hover:text-pink-600 border-l-4 border-transparent hover:border-pink-400"
                            onClick={() => setIsAccountDropdownOpen(false)}
                          >
                            <i className="fas fa-box text-pink-500"></i>
                            <span>My Orders</span>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-6 py-3 font-inter text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 border-l-4 border-transparent hover:border-red-400"
                          >
                            <i className="fas fa-sign-out-alt text-red-500"></i>
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden lg:flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 px-3 py-2 font-inter text-base font-medium text-gray-800 rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-pink-50 hover:to-blue-50 hover:text-pink-500 border border-transparent hover:border-pink-200"
                  >
                    <i className="fas fa-sign-in-alt text-sm"></i>
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center space-x-2 px-3 py-2 font-inter text-base font-medium text-white bg-gradient-to-br from-pink-500 to-blue-500 rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border border-pink-400"
                  >
                    <i className="fas fa-user-plus text-sm"></i>
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-800 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-pink-50 hover:to-blue-50"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ec4899';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#1f2937';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <div className="relative w-6 h-6">
                  <span className={`absolute top-0 left-0 w-full h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 top-2.5' : ''}`}></span>
                  <span className={`absolute top-2.5 left-0 w-full h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                  <span className={`absolute top-5 left-0 w-full h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45 top-2.5' : ''}`}></span>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
            isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="py-4 space-y-2 border-t border-gray-200 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {/* Navigation Links */}
              {[
                { to: '/', label: 'Home', icon: 'fas fa-home' },
                { to: '/gallery', label: 'Shop', icon: 'fas fa-store' },
                { to: '/about', label: 'About', icon: 'fas fa-info-circle' },
                { to: '/policies', label: 'Policies', icon: 'fas fa-file-contract' },
                { to: '/contact', label: 'Contact', icon: 'fas fa-envelope' }
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center space-x-3 px-4 py-3 font-spartan text-base font-medium text-gray-600 transition-all duration-300 hover:text-pink-500 rounded-lg mx-2 border border-transparent hover:border-pink-200/50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className={`${item.icon} text-pink-500 w-5`}></i>
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Account Section for Mobile */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                {user ? (
                  <>
                    {/* User Info */}
                    <div className="px-4 py-3 mx-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-blue-500 flex items-center justify-center">
                          <i className="fas fa-user text-white text-sm"></i>
                        </div>
                        <div>
                          <p className="font-inter text-sm font-semibold text-gray-800">Welcome back!</p>
                          <p className="font-inter text-xs truncate text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Admin Dashboard Link */}
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-3 font-inter text-gray-800 rounded-lg mx-2 transition-all duration-300"
                        onClick={() => setIsMenuOpen(false)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#ec4899';
                          e.currentTarget.style.paddingLeft = '1.25rem';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#1f2937';
                          e.currentTarget.style.paddingLeft = '1rem';
                        }}
                      >
                        <i className="fas fa-cog mr-3 text-pink-500"></i>
                        Admin Dashboard
                      </Link>
                    
                    {/* Order History Link */}
                    <Link
                      to="/orders"
                      className="flex items-center px-4 py-3 font-inter text-gray-800 rounded-lg mx-2 transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ec4899';
                        e.currentTarget.style.paddingLeft = '1.25rem';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#1f2937';
                        e.currentTarget.style.paddingLeft = '1rem';
                      }}
                    >
                      <i className="fas fa-box mr-3 text-pink-500"></i>
                      My Orders
                    </Link>
                    
                    {/* Sign Out Button */}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 font-inter text-gray-800 rounded-lg mx-2 transition-all duration-300"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#e74c3c';
                        e.currentTarget.style.paddingLeft = '1.25rem';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#1f2937';
                        e.currentTarget.style.paddingLeft = '1rem';
                      }}
                    >
                      <i className="fas fa-sign-out-alt mr-3 text-red-500"></i>
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    {/* Sign In Link */}
                    <Link
                      to="/login"
                      className="flex items-center space-x-3 px-4 py-3 font-spartan text-base font-medium text-gray-600 transition-all duration-300 hover:text-pink-500 rounded-lg mx-2 border border-transparent hover:border-pink-200/50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <i className="fas fa-sign-in-alt text-pink-500 w-5"></i>
                      <span>Sign In</span>
                    </Link>
                    
                    {/* Sign Up Link */}
                    <Link
                      to="/register"
                      className="flex items-center justify-center space-x-2 px-4 py-3 font-spartan text-base font-medium text-white bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg mx-2 mt-2 hover:from-pink-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl border border-pink-400"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <i className="fas fa-user-plus text-sm"></i>
                      <span>Sign Up</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;