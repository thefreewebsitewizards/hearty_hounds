import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string>('');

  // Set meta description for Contact page
  useEffect(() => {
    document.title = 'Contact - Hearty Hounds Premium Pet Products';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Get in touch with Hearty Hounds for premium pet products, custom orders, or any questions about our treats and toys.');
    }
  }, []);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return '';
      case 'subject':
        if (!value.trim()) return 'Subject is required';
        if (value.trim().length < 3) return 'Subject must be at least 3 characters';
        return '';
      case 'message':
        if (!value.trim()) return 'Message is required';
        if (value.trim().length < 10) return 'Message must be at least 10 characters';
        if (value.trim().length > 1000) return 'Message must be less than 1000 characters';
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form before submitting.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate form submission (replace with actual email service)
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate random failure for demonstration
          if (Math.random() > 0.8) {
            reject(new Error('Network error occurred'));
          } else {
            resolve(true);
          }
        }, 1000);
      });
      
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setErrors({});
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setSubmitError(`Failed to send message: ${errorMessage}. Please try again.`);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-28 overflow-hidden min-h-[50vh] bg-gradient-to-br from-pink-500 to-blue-500">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Decorative background effect */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-64 h-8 bg-white/10 rounded-full transform -rotate-12 blur-sm"></div>
            <div className="absolute top-20 right-20 w-48 h-6 bg-white/15 rounded-full transform rotate-45 blur-sm"></div>
            <div className="absolute bottom-20 left-1/3 w-72 h-10 bg-white/8 rounded-full transform -rotate-6 blur-sm"></div>
          </div>
          {/* Decorative Background Elements */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-white/15 rounded-full blur-lg"></div>
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-white/8 rounded-full blur-2xl"></div>
          <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-white/10 rounded-full blur-lg"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent leading-tight">
              Let's Connect
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto opacity-90 text-white px-4 leading-relaxed">
              Ready to spoil your furry friend with premium pet products? 
              Let's make your pet's tail wag with joy!
            </p>
            {/* Decorative elements */}
            <div className="flex justify-center space-x-2 mb-4">
              <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
              <div className="w-4 h-4 bg-pink-400 rounded-full"></div>
              <div className="w-4 h-4 bg-blue-300 rounded-full"></div>
              <div className="w-4 h-4 bg-pink-300 rounded-full"></div>
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <div className="w-4 h-4 bg-pink-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-300 border border-pink-100">
              <div className="text-center mb-6">
              <h2 className="text-3xl bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
                Let's Make Tails Wag
              </h2>
            </div>
              <p className="text-gray-700 text-lg leading-relaxed mb-8 text-center">
                Whether you're looking for premium treats for your furry friend, have questions about our products, 
                or want to discuss custom orders, we're here to help make your pet happy and healthy!
              </p>
              
              {/* Contact Methods */}
              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-center space-x-4 p-5 bg-gradient-to-r from-pink-50 to-blue-50 rounded-2xl hover:shadow-lg transition-all duration-300 border-l-4 border-pink-400">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-pink-500 to-blue-500">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-800 text-lg">Email Me</h3>
                    <a 
                      href="mailto:info@heartyhounds.com" 
                      className="text-pink-600 hover:text-blue-600 transition-colors duration-300 font-medium"
                    >
                      info@heartyhounds.com
                    </a>
                  </div>
                </div>

                {/* Instagram */}
                <div className="flex items-center space-x-4 p-5 bg-gradient-to-r from-blue-50 to-pink-50 rounded-2xl hover:shadow-lg transition-all duration-300 border-l-4 border-blue-400">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-800 text-lg">Follow Us</h3>
                    <a 
                      href="https://www.instagram.com/heartyhounds/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-pink-600 transition-colors duration-300 font-medium"
                    >
                      @heartyhounds
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center space-x-4 p-5 bg-gradient-to-r from-pink-50 to-blue-50 rounded-2xl hover:shadow-lg transition-all duration-300 border-l-4 border-pink-400">
                  <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-800 text-lg">Store Location</h3>
                    <p className="text-gray-600 font-medium">Melbourne, Australia</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Time Info Card */}
            <div className="rounded-full shadow-2xl p-8 text-white relative overflow-hidden bg-gradient-to-br from-pink-500 to-blue-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              <div className="relative text-center">
                <div className="flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                </svg>
                <h3 className="text-2xl">
                  Response Time
                </h3>
              </div>
                <p className="text-pink-100 text-lg leading-relaxed">
                  We typically respond to messages within 24-48 hours. 
                  For urgent orders or time-sensitive requests, please mention it in your message!
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-pink-100 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-3 h-3 bg-pink-300 rounded-full opacity-60"></div>
            <div className="absolute top-8 right-8 w-2 h-2 bg-blue-300 rounded-full opacity-40"></div>
            <div className="absolute bottom-6 left-6 w-4 h-4 bg-blue-300 rounded-full opacity-50"></div>
            
            <div className="text-center mb-8">
              <h2 className="text-3xl bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                Send Your Message
              </h2>
              <p className="text-gray-600 mt-2">Let's start our creative journey together</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitError && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{submitError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-300 bg-pink-50/50 ${
                      errors.name 
                        ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
                        : 'border-pink-200 focus:ring-pink-400 focus:border-pink-400 hover:border-pink-300'
                    }`}
                    placeholder="Your name"
                    aria-invalid={errors.name ? 'true' : 'false'}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="mt-1 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.name}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-300 bg-pink-50/50 ${
                      errors.email 
                        ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
                        : 'border-pink-200 focus:ring-pink-400 focus:border-pink-400 hover:border-pink-300'
                    }`}
                    placeholder="your@email.com"
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-300 bg-pink-50/50 ${
                    errors.subject 
                      ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
                      : 'border-pink-200 focus:ring-pink-400 focus:border-pink-400 hover:border-pink-300'
                  }`}
                  placeholder="What masterpiece shall we create?"
                  aria-invalid={errors.subject ? 'true' : 'false'}
                  aria-describedby={errors.subject ? 'subject-error' : undefined}
                />
                {errors.subject && (
                  <p id="subject-error" className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.subject}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message * <span className="text-gray-500 text-xs">({formData.message.length}/1000)</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  rows={6}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-300 resize-none bg-pink-50/50 ${
                    errors.message 
                      ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
                      : 'border-pink-200 focus:ring-pink-400 focus:border-pink-400 hover:border-pink-300'
                  }`}
                  placeholder="Tell us about your pet's needs... Share details about your furry friend, product preferences, special requirements, or any questions about our premium pet products!"
                  aria-invalid={errors.message ? 'true' : 'false'}
                  aria-describedby={errors.message ? 'message-error' : undefined}
                ></textarea>
                {errors.message && (
                  <p id="message-error" className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.message}
                  </p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-white font-bold py-4 px-8 rounded-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl relative overflow-hidden bg-gradient-to-br from-pink-500 to-blue-500"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                {isSubmitting ? (
                  <span className="flex items-center justify-center relative z-10">
                    Creating magic...
                  </span>
                ) : (
                  <span className="flex items-center justify-center relative z-10">
                    Send My Message
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="rounded-full shadow-2xl p-12 text-white max-w-4xl mx-auto relative overflow-hidden bg-gradient-to-br from-blue-400 to-pink-500">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-20 -translate-y-20"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 translate-y-16"></div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/5 rounded-full -translate-x-12 -translate-y-12"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl mb-6">
                Ready to Spoil Your Furry Friend?
              </h2>
              <p className="text-xl mb-8 opacity-90 leading-relaxed">
                Let's create something extraordinary together! From premium treats to stylish accessories, 
                every product is selected with love, quality, and your pet's happiness in mind.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://www.instagram.com/heartyhounds/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-blue-600 font-bold py-4 px-8 rounded-2xl hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Follow Our Pet Journey
                </a>
                <a
                  href="mailto:contact@heartyhounds.com"
                  className="bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-2xl hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-300"
                >
                  Start Our Conversation
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;