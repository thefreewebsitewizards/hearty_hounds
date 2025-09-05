import React from 'react';

const Socials: React.FC = () => {
  const currentYear: number = new Date().getFullYear();

  return (
    <section id="socials" className="py-20 bg-gradient-to-br from-pink-50 to-purple-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full opacity-20 animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-15 animate-float" style={{animationDelay: '2.5s'}}></div>
        <div className="absolute top-1/4 right-1/3 w-28 h-28 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full opacity-25 animate-pulse-slow" style={{animationDelay: '1.2s'}}></div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl text-gray-800 mb-6">
            Get In Touch
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We'd love to hear from you! Follow us on social media or get in touch directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Social Media Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl text-gray-800 mb-6 text-center">
              Follow Our Journey 📱
            </h3>
            
            <div className="space-y-6">
              {/* Instagram */}
              <a 
                href="https://instagram.com/heartyhounds" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <div className="text-3xl mr-4">📷</div>
                <div>
                  <h4 className="text-lg">Instagram</h4>
                  <p className="text-purple-100">@heartyhounds - Daily dose of cuteness!</p>
                </div>
              </a>
              
              {/* Facebook */}
              <a 
                href="https://facebook.com/heartyhounds" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <div className="text-3xl mr-4">👍</div>
                <div>
                  <h4 className="text-lg">Facebook</h4>
                  <p className="text-blue-100">Hearty Hounds - Join our community!</p>
                </div>
              </a>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                Tag us in your posts with <span className="font-semibold text-pink-500">#HeartyhoundsTreats</span> to be featured!
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl text-gray-800 mb-6 text-center">
              Contact Information 📞
            </h3>
            
            <div className="space-y-6">
              {/* Phone */}
              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <div className="text-3xl mr-4 text-green-500">📱</div>
                <div>
                  <h4 className="text-gray-800">Phone</h4>
                  <a href="tel:+61412345678" className="text-gray-600 hover:text-green-500 transition-colors">
                    +61 412 345 678
                  </a>
                </div>
              </div>
              
              {/* Email */}
              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <div className="text-3xl mr-4 text-blue-500">📧</div>
                <div>
                  <h4 className="text-gray-800">Email</h4>
                  <a href="mailto:info@heartyhounds.com" className="text-gray-600 hover:text-blue-500 transition-colors">
                    info@heartyhounds.com
                  </a>
                </div>
              </div>
              
              {/* Address */}
              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <div className="text-3xl mr-4 text-red-500">📍</div>
                <div>
                  <h4 className="text-gray-800">Address</h4>
                  <p className="text-gray-600">
                    123 Puppy Lane<br />
                    Melbourne, VIC 3000<br />
                    Australia
                  </p>
                </div>
              </div>
              
              {/* Business Hours */}
              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <div className="text-3xl mr-4 text-purple-500">🕒</div>
                <div>
                  <h4 className="text-gray-800">Business Hours</h4>
                  <div className="text-gray-600">
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday: 10:00 AM - 4:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Contact CTA */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl text-gray-800 mb-4">
              Ready to Order? 🛒
            </h3>
            <p className="text-gray-600 mb-6">
              Get in touch with us today to place your order or ask any questions about our delicious treats!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="https://wa.me/61412345678" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full font-semibold hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <span>💬</span>
                <span>WhatsApp Us</span>
              </a>
              <a 
                href="mailto:info@heartyhounds.com" 
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <span>📧</span>
                <span>Email Us</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Socials;