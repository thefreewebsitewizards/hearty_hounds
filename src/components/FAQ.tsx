import React, { useState } from 'react';
import { AnimatedElement } from '../hooks/useScrollAnimation';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      id: 1,
      question: "What ingredients do you use in your treats?",
      answer: "We use only premium, natural ingredients sourced from trusted suppliers. Our treats contain no artificial preservatives, colors, or flavors. Common ingredients include free-range chicken, wild-caught salmon, organic vegetables, and natural binding agents like sweet potato and oats."
    },
    {
      id: 2,
      question: "Are your treats suitable for dogs with allergies?",
      answer: "Yes! We're very conscious of common dog allergies and clearly label all ingredients. Many of our treats are grain-free, and we avoid common allergens like corn, soy, and wheat. If your dog has specific allergies, please check the ingredient list or contact us for personalized recommendations."
    },
    {
      id: 3,
      question: "How long do the treats stay fresh?",
      answer: "Our treats have a shelf life of 6-12 months when stored in a cool, dry place. Once opened, we recommend consuming within 2-3 weeks for optimal freshness. All packages include a 'best by' date, and we recommend storing opened treats in an airtight container."
    },
    {
      id: 4,
      question: "Do you offer custom cakes for special occasions?",
      answer: "Absolutely! We love creating custom pupcakes for birthdays, gotcha days, and other special celebrations. We can customize shapes, sizes, and even add your pup's name. Please contact us at least 48 hours in advance for custom orders."
    },
    {
      id: 5,
      question: "Are your treats vet-approved?",
      answer: "Yes, all our recipes are developed in consultation with veterinary nutritionists to ensure they're safe and beneficial for dogs. However, we always recommend consulting with your vet before introducing new treats, especially if your dog has health conditions or dietary restrictions."
    },
    {
      id: 6,
      question: "What's your delivery policy?",
      answer: "We currently offer local delivery within Melbourne and surrounding areas. Delivery is usually within 2-3 business days. For areas outside our delivery zone, we're working on shipping options. Contact us to check if we deliver to your area!"
    },
    {
      id: 7,
      question: "How should I introduce new treats to my dog?",
      answer: "We recommend starting with small portions to ensure your dog tolerates the new treat well. Give 1-2 small pieces initially and monitor for any adverse reactions. Treats should make up no more than 10% of your dog's daily caloric intake."
    },
    {
      id: 8,
      question: "Do you have treats for puppies?",
      answer: "Yes! Many of our treats are suitable for puppies over 12 weeks old. We recommend our softer options like our biscuits for younger pups. Always break treats into appropriate sizes for your puppy's mouth and supervise during treat time."
    }
  ];

  const toggleAccordion = (id: number): void => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 bg-gray-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-16 right-16 w-36 h-36 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-16 left-16 w-28 h-28 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-20 animate-pulse-slow"></div>
        <div className="absolute top-1/3 left-1/3 w-20 h-20 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full opacity-15 animate-float" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-br from-pink-100 to-blue-100 rounded-full opacity-25 animate-pulse-slow" style={{animationDelay: '0.5s'}}></div>
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <AnimatedElement variant="fadeInUp">
            <h2 className="text-4xl lg:text-5xl text-gray-800 mb-6">
              Frequently Asked Questions
            </h2>
          </AnimatedElement>
          <AnimatedElement variant="fadeInUp" delay={200}>
            <p className="text-xl text-gray-600">
              Got questions? We've got answers! Here are some common questions from our customers.
            </p>
          </AnimatedElement>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <AnimatedElement 
              key={faq.id} 
              variant="slideInUp" 
              delay={index * 100}
              className="hover-lift"
            >
              <div className={`accordion bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 ${
                activeAccordion === faq.id ? 'active shadow-lg' : 'hover:shadow-lg'
              }`}>
              <button
                onClick={() => toggleAccordion(faq.id)}
                className="w-full px-6 py-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-gray-50"
              >
                <h3 className="text-lg text-gray-800 pr-4">
                  {faq.question}
                </h3>
                <div className={`transform transition-transform duration-300 text-pink-500 ${
                  activeAccordion === faq.id ? 'rotate-180' : ''
                }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              <div className={`accordion-content transition-all duration-300 ease-in-out ${
                activeAccordion === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              } overflow-hidden`}>
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
              </div>
            </AnimatedElement>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-16">
          <AnimatedElement variant="scaleIn">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl text-gray-800 mb-4">
                Still Have Questions? 🤔
              </h3>
              <p className="text-gray-600 mb-6">
                We're here to help! Don't hesitate to reach out if you need more information about our products or have specific questions about your pup's dietary needs.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a 
                  href="mailto:info@heartyhounds.com" 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 hover-glow"
                >
                  <span>📧</span>
                  <span>Email Us</span>
                </a>
                <a 
                  href="https://wa.me/1234567890" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full font-semibold hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 hover-glow"
                >
                  <span>💬</span>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </AnimatedElement>
        </div>
      </div>
    </section>
  );
};

export default FAQ;