import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getCheckoutSession } from '../services/stripe';
import { createOrderFromStripeSession } from '../services/firebase';
import { toast } from 'react-toastify';

interface OrderConfirmationProps {}

const OrderConfirmation: React.FC<OrderConfirmationProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<'pending' | 'paid' | 'failed'>('pending');
  const [loading, setLoading] = useState(true);
  const processedSessionRef = useRef<string | null>(null); // Track processed session ID
  const [cartLoaded, setCartLoaded] = useState(false);

  // Track when cart is loaded from localStorage
  useEffect(() => {
    // Give cart context time to load from localStorage
    const timer = setTimeout(() => {
      setCartLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only proceed when cart is loaded or we have a session ID
    // Get session ID from URL parameters
    const urlParams = new URLSearchParams(location.search);
    const sessionId = urlParams.get('session_id');
    
    if (!cartLoaded || !sessionId || processedSessionRef.current === sessionId) {
      return;
    }
    
    const handleOrderConfirmation = async () => {
      try {
        // Session ID already extracted above
        

        
        if (sessionId) {
  
          
          if (!user) {
            console.warn('⚠️ No authenticated user found, proceeding with test user for order creation');
            // Don't redirect, continue with test user
          }

          try {
            // First verify the payment was successful by checking session status
            const sessionData = await getCheckoutSession(sessionId); // getCheckoutSession already returns the session data directly
            
            // Check if payment was successful
            const paymentCondition = sessionData.payment_status === 'paid' || 
                                   sessionData.status === 'complete' ||
                                   sessionData.status === 'open'; // For test mode

            
            if (paymentCondition) {
              // Payment confirmed, now create the order using session data
              const userIdToUse = user?.id || 'guest';
              const emailToUse = user?.email || sessionData.customer_email || sessionData.customer_details?.email;
              
              if (!emailToUse) {
                throw new Error('Customer email is required for order creation');
              }
              

              
              const createdOrderId = await createOrderFromStripeSession(
                  sessionId,
                  userIdToUse,
                  items || [], // Use empty array if items not loaded yet
                  sessionData.amount_total ? sessionData.amount_total / 100 : getTotal() || 0,
                  emailToUse,
                  undefined
                );
                

               
               if (createdOrderId) {
                 setOrderId(createdOrderId);
                 setOrderStatus('paid');
                 processedSessionRef.current = sessionId; // Mark this session as processed
                 clearCart();
                 toast.success('🎉 Payment successful! Your order has been placed.');
               } else {
                 throw new Error('Order creation failed');
               }
            } else {

              throw new Error(`Payment not completed. Status: ${sessionData.payment_status || sessionData.status}`);
            }
          } catch (error) {
             console.error('❌ Error processing order:', error);
             setOrderStatus('failed');
             processedSessionRef.current = sessionId; // Mark this session as processed even on error
             const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
             toast.error(`Order processing failed: ${errorMessage}. Please contact support with session ID: ${sessionId}`);
             // Don't clear cart or set success status if order creation failed
           }
        } else {

          // Check for order ID from navigation state (fallback)
          const orderIdFromState = location.state?.orderId;
          
          if (orderIdFromState) {

            setOrderId(orderIdFromState);
            clearCart();
          } else {

            // If no session ID or order ID, redirect to home
            navigate('/');
            return;
          }
        }
      } catch (error) {
        console.error('❌ Error in order confirmation process:', error);
        // Get session ID for fallback
        const urlParams = new URLSearchParams(location.search);
        const sessionId = urlParams.get('session_id');
        
        if (sessionId) {

          setOrderId(sessionId);
          clearCart();
          toast.success('🎉 Payment successful! Your order has been confirmed.');
        } else {
          console.error('❌ Critical error: No session ID available for fallback');
          toast.error('Unable to confirm order. Please contact support.');
          navigate('/');
          return;
        }
      }
      
      setLoading(false);
    };
    
    handleOrderConfirmation();
  }, [cartLoaded, location.search, user?.id]); // Simplified dependencies

  if (loading || !orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-pink-100 mb-4 sm:mb-6">
        <svg
          className="h-6 w-6 sm:h-8 sm:w-8 text-pink-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 font-chewy">
            Payment Successful!
          </h1>
          
          <p className="text-base sm:text-lg text-gray-600 mb-2 font-spartan">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          
          <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 font-spartan">
            Order ID: <span className="font-mono font-medium break-all">{orderId}</span>
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 font-chewy">
              What happens next?
            </h2>
            
            <div className="space-y-2 sm:space-y-3 text-left">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-pink-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-xs font-medium text-pink-600">1</span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Order Confirmation</p>
                  <p className="text-xs text-gray-600">You'll receive an email confirmation shortly</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-pink-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-xs font-medium text-pink-600">2</span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Processing</p>
                  <p className="text-xs text-gray-600">We'll prepare your products for shipping</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-pink-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-xs font-medium text-pink-600">3</span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Shipping</p>
                  <p className="text-xs text-gray-600">You'll receive tracking information when shipped</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stripe Connect Notice */}
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8">
            <div className="flex items-center justify-center space-x-2 text-pink-800">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs sm:text-sm font-medium">Secure payment processed by Stripe</span>
            </div>
            <p className="text-xs text-pink-600 mt-1 text-center">
                Platform fee (10%) included • Funds distributed to seller
              </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:gap-4 justify-center">
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Link>
            
            <button
              onClick={() => window.print()}
              className="w-full inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-sm sm:text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Print Receipt
            </button>
          </div>

          {/* Support */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-500">
              Need help? Contact us at{' '}
              <a href="mailto:support@heartyhounds.com" className="text-pink-600 hover:text-pink-500">
                  support@heartyhounds.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;