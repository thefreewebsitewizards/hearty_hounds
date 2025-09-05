import * as functions from 'firebase-functions/v2/https';
import { config } from 'firebase-functions/v1';
import { logger } from 'firebase-functions/v2';
import cors from 'cors';
import Stripe from 'stripe';

// Initialize Stripe - use Firebase config for emulator compatibility
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || config().stripe?.secret_key;
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

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

export const createCheckoutSessionV2 = functions.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      // Only allow POST requests
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const {
        items,
        customerEmail,
        connectedAccountId,
        successUrl,
        cancelUrl,
        selectedShippingRate,
        metadata = {}
      }: CheckoutSessionRequest = req.body;

      // Validate required fields
      if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ error: 'Items are required and must be a non-empty array' });
        return;
      }

      if (!successUrl || !cancelUrl) {
        res.status(400).json({ error: 'Success URL and Cancel URL are required' });
        return;
      }

      // Calculate subtotal from items (convert dollars to cents)
      const subtotal = items.reduce((sum, item) => {
        return sum + (Math.round(item.price * 100) * (item.quantity || 1));
      }, 0);

      // Add shipping cost if provided (already in cents from Shippo)
      const shippingCost = selectedShippingRate ? selectedShippingRate.amount : 0;
      const totalAmount = subtotal + shippingCost;

      // Calculate platform fee (10% of total)
      const platformFeeAmount = Math.round(totalAmount * 0.10);

      // Create line items for Stripe
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => {
        // Validate and filter image URLs
        const validImageUrls = item.imageUrl ? 
          [item.imageUrl].filter(url => {
            try {
              new URL(url);
              return url.startsWith('http://') || url.startsWith('https://');
            } catch {
              logger.warn('Invalid image URL detected and filtered:', { url, productId: item.id });
              return false;
            }
          }) : [];
        
        logger.info('Processing line item:', {
          productId: item.id,
          name: item.name,
          imageUrl: item.imageUrl,
          validImageUrls,
          hasValidImages: validImageUrls.length > 0
        });
        
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              description: item.description || 'Premium pet product',
              images: validImageUrls,
              metadata: {
                productId: item.id,
              },
            },
            unit_amount: Math.round(item.price * 100), // Convert dollars to cents
          },
          quantity: item.quantity || 1,
        };
      });

      // Add shipping as a line item if provided
      if (selectedShippingRate && shippingCost > 0) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Shipping - ${selectedShippingRate.display_name}`,
              description: selectedShippingRate.carrier ? 
                `${selectedShippingRate.carrier} ${selectedShippingRate.service || ''}`.trim() : 
                'Shipping and handling',
            },
            unit_amount: shippingCost,
          },
          quantity: 1,
        });
      }

      // Prepare session parameters
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: customerEmail,
        billing_address_collection: 'required',
        shipping_address_collection: {
          allowed_countries: ['US', 'CA'],
        },
        metadata: {
          ...metadata,
          source: 'hearty-hounds-frontend',
          timestamp: new Date().toISOString(),
          subtotal: subtotal.toString(),
          shippingCost: shippingCost.toString(),
          totalAmount: totalAmount.toString(),
          platformFee: platformFeeAmount.toString(),
        },
        payment_intent_data: {
          metadata: {
            ...metadata,
            source: 'hearty-hounds-frontend',
            subtotal: subtotal.toString(),
            shippingCost: shippingCost.toString(),
            totalAmount: totalAmount.toString(),
            platformFee: platformFeeAmount.toString(),
          },
        },
      };

      // Add Stripe Connect configuration if connected account is provided
      // Only add transfer configuration if the connected account is different from platform account
      if (connectedAccountId && connectedAccountId !== 'acct_1RrxjBJHHLWU5Kg3') {
        sessionParams.payment_intent_data = {
          ...sessionParams.payment_intent_data,
          application_fee_amount: platformFeeAmount,
          transfer_data: {
            destination: connectedAccountId,
          },
        };
        
        logger.info('Stripe Connect transfer configured', {
          connectedAccountId,
          platformFeeAmount,
          transferAmount: totalAmount - platformFeeAmount,
        });
      } else if (connectedAccountId) {
        logger.warn('Connected account ID matches platform account, skipping transfer configuration', {
          connectedAccountId,
          platformAccount: 'acct_1RrxjBJHHLWU5Kg3',
        });
        
        // Remove platform fee if we're not transferring to a different account
        sessionParams.metadata.platformFee = '0';
        sessionParams.payment_intent_data.metadata.platformFee = '0';
      }

      // Create the checkout session
      const session = await stripe.checkout.sessions.create(sessionParams);

      logger.info('Checkout session created successfully', {
        sessionId: session.id,
        customerEmail,
        connectedAccountId,
        totalAmount,
        platformFee: platformFeeAmount,
        itemCount: items.length,
      });

      // Return session details
      res.status(200).json({
        id: session.id,
        url: session.url,
        client_secret: session.client_secret,
        amount_total: session.amount_total,
        currency: session.currency,
        payment_status: session.payment_status,
        metadata: session.metadata,
      });

    } catch (error) {
      logger.error('Error creating checkout session:', error);
      
      if (error instanceof Stripe.errors.StripeError) {
        res.status(400).json({
          error: 'Stripe error',
          message: error.message,
          type: error.type,
        });
      } else {
        res.status(500).json({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        });
      }
    }
  });
});