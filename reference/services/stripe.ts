// Stripe Connect integration with backend API calls
// This file handles all Stripe-related operations through our backend API

import { CartItem } from './firebase';
import { ShippingRate } from './clientShipping';

// Firebase Functions v2 URLs
const FUNCTION_URLS = {
  createCheckoutSessionV2: 'https://createcheckoutsessionv2-dri6av73tq-uc.a.run.app',
  getCheckoutSessionV2: 'https://getcheckoutsessionv2-dri6av73tq-uc.a.run.app'
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
    const response = await fetch(FUNCTION_URLS.createCheckoutSessionV2, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: data.items.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || 'Original watercolor artwork',
          price: item.price,
          quantity: item.quantity || 1,
          imageUrl: item.images?.[0] || ''
        })),
        customerEmail: data.customerEmail,
        ...(data.connectedAccountId && { connectedAccountId: data.connectedAccountId }),
        ...(data.selectedShippingRate && { selectedShippingRate: data.selectedShippingRate }),
        successUrl: data.successUrl,
        cancelUrl: data.cancelUrl,
        metadata: {
          source: 'moroz-art-frontend',
          timestamp: new Date().toISOString()
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Checkout session creation failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || response.statusText}`);
    }

    const result = await response.json();

    
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
    const totalAmount = data.items.reduce((sum, item) => sum + item.price, 0);
    
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
            name: item.name,
            price: item.price,
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