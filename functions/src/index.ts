import * as functions from 'firebase-functions/v2/https';
import { config } from 'firebase-functions/v1';
import { logger } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import cors from 'cors';
import express from 'express';
import Stripe from 'stripe';
import shippo from 'shippo';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Stripe with platform's secret key - use Firebase config for emulator compatibility
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || config().stripe?.secret_key;
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

// Initialize Shippo - use Firebase config for emulator compatibility
const shippoApiKey = process.env.SHIPPO_API_KEY || config().shippo?.api_key;
const shippoClient = shippo(shippoApiKey);

// CORS configuration
const corsHandler = cors({ origin: true });

// Types
interface CartItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface ShippingRate {
  id: string;
  display_name: string;
  amount: number;
  currency: string;
  delivery_estimate?: {
    minimum: { unit: string; value: number };
    maximum: { unit: string; value: number };
  };
  carrier?: string;
  service?: string;
  estimated_days?: number;
}

interface CheckoutSessionRequest {
  items: CartItem[];
  customerEmail?: string;
  connectedAccountId?: string;
  successUrl: string;
  cancelUrl: string;
  selectedShippingRate?: ShippingRate;
  metadata?: Record<string, string>;
}

// Simple test function for API health check
export const testFunction = functions.onRequest({ cors: true }, async (req, res) => {
  try {
    logger.info('Test function called', { method: req.method, path: req.path });
    
    res.status(200).json({
      success: true,
      message: 'Firebase Functions are working correctly!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    logger.error('Test function error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Export all functions
export { createCheckoutSessionV2 } from './stripe/createCheckoutSession';
export { getCheckoutSessionV2 } from './stripe/getCheckoutSession';
export { createOrderFromPaymentId, getOrder } from './orders/createOrder';
export { getShippoRates, validateUSAddress } from './shipping/shippoRates';
export { getShippoRatesV2 } from './shipping/getShippoRatesV2';