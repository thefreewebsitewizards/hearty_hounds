// Stripe Connect integration with backend API calls
// This file handles all Stripe-related operations through our backend API

import { CartItem } from '../utils/types';
import { ShippingRate } from './clientShipping';

// Firebase Functions URLs - Using production Firebase Functions
// Emulator disabled - using live Firebase services
const isDevelopment = false; // Force production mode

const FUNCTION_URLS = {
  createCheckoutSessionV2: 'https://createcheckoutsessionv2-lgfojg3hva-uc.a.run.app',
  getCheckoutSessionV2: 'https://getcheckoutsessionv2-lgfojg3hva-uc.a.run.app'
};

// Types for Stripe integration
export interface CheckoutSessionData {
  items: CartItem[];
  customerEmail?: string;
  connectedAccountId?: string; // Made optional to support direct payments
  successUrl: string;
  cancelUrl: string;
  selectedShippingRate?: ShippingRate;
}

export interface StripeCheckoutSession {
  id: string;
  url?: string;
  client_secret?: string;
}

// Create a Stripe Checkout Session through our backend API
export const createCheckoutSession = async (data: CheckoutSessionData): Promise<StripeCheckoutSession> => {

  
  try {
    console.log('🚀 Starting checkout session creation...');
    console.log('📦 Payload being sent:', {
      items: data.items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        description: item.product.description || 'Premium pet product',
        price: Math.round(item.product.price * 100), // Convert dollars to cents
        quantity: item.quantity || 1,
        imageUrl: item.product.images?.[0] || ''
      })),
      customerEmail: data.customerEmail,
      ...(data.connectedAccountId && { connectedAccountId: data.connectedAccountId }),
      ...(data.selectedShippingRate && { selectedShippingRate: data.selectedShippingRate }),
      successUrl: data.successUrl,
      cancelUrl: data.cancelUrl,
      metadata: {
        source: 'hearty-hounds-frontend',
        timestamp: new Date().toISOString()
      }
    });
    
    const response = await fetch(FUNCTION_URLS.createCheckoutSessionV2, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: data.items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          description: item.product.description || 'Premium pet product',
          price: item.product.price, // Keep in dollars, Firebase function will convert to cents
          quantity: item.quantity || 1,
          imageUrl: item.product.images?.[0] || ''
        })),
        customerEmail: data.customerEmail,
        ...(data.connectedAccountId && { connectedAccountId: data.connectedAccountId }),
        ...(data.selectedShippingRate && { selectedShippingRate: data.selectedShippingRate }),
        successUrl: data.successUrl,
        cancelUrl: data.cancelUrl,
        metadata: {
          source: 'hearty-hounds-frontend',
          timestamp: new Date().toISOString()
        }
      }),
    });

    console.log('✅ Response received - Status:', response.status);
    console.log('✅ Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Try to get response text first to see raw response
    const responseText = await response.text();
    console.log('📄 Raw response text:', responseText);
    
    if (!response.ok) {
       let errorData: any = {};
       try {
         errorData = JSON.parse(responseText);
       } catch (e) {
         console.error('❌ Failed to parse error response as JSON:', e);
       }
       console.error('❌ Checkout session creation failed:', {
         status: response.status,
         statusText: response.statusText,
         error: errorData,
         rawResponse: responseText
       });
       throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || response.statusText}`);
     }

    let result;
    try {
      result = JSON.parse(responseText);
      console.log('✅ Parsed Firebase function response:', result);
    } catch (e) {
      console.error('❌ Failed to parse success response as JSON:', e);
      throw new Error('Invalid JSON response from server');
    }

    
    return {
      id: result.id,
      client_secret: result.client_secret,
      url: result.url
    };
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    throw error;
  }
};

// Function to retrieve checkout session status
export const getCheckoutSession = async (sessionId: string): Promise<any> => {
  try {
    const response = await fetch(`${FUNCTION_URLS.getCheckoutSessionV2}?sessionId=${encodeURIComponent(sessionId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to retrieve checkout session');
    }

    const result = await response.json();
    return result.session;
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw error;
  }
};

// Helper function to create a payment intent for custom payment flows
// Note: This function is not yet deployed as a v2 function
export const createPaymentIntent = async (data: CheckoutSessionData): Promise<any> => {
  try {
    const totalAmount = data.items.reduce((sum, item) => sum + item.product.price, 0);
    
    // TODO: Update with actual v2 function URL when deployed
    const response = await fetch(`https://placeholder-payment-intent-url.com`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: totalAmount,
        currency: 'usd',
        customerEmail: data.customerEmail,
        connectedAccountId: data.connectedAccountId,
        metadata: {
          orderItems: JSON.stringify(data.items.map(item => ({
            id: item.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity || 1
          }))),
          customerEmail: data.customerEmail,
          source: 'moroz-art-frontend'
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create payment intent');
    }

    const result = await response.json();
    return {
      id: result.paymentIntentId,
      client_secret: result.clientSecret,
      amount: result.amount,
      application_fee_amount: result.applicationFee
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Function to get payment intent status
// Note: This function is not yet deployed as a v2 function
export const getPaymentIntent = async (paymentIntentId: string): Promise<any> => {
  try {
    // TODO: Update with actual v2 function URL when deployed
    const response = await fetch(`https://placeholder-get-payment-intent-url.com/${paymentIntentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to retrieve payment intent');
    }

    const result = await response.json();
    return result.paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
};

// Function to create a refund
// Note: This function is not yet deployed as a v2 function
export const createRefund = async (paymentIntentId: string, amount?: number, reason?: string): Promise<any> => {
  try {
    // TODO: Update with actual v2 function URL when deployed
    const response = await fetch(`https://placeholder-refund-url.com`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId,
        amount,
        reason: reason || 'requested_by_customer'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create refund');
    }

    const result = await response.json();
    return result.refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw error;
  }
};