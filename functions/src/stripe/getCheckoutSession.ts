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

export const getCheckoutSessionV2 = functions.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      // Only allow GET requests
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      // Get session ID from query parameters
      const sessionId = req.query.sessionId as string;

      if (!sessionId) {
        res.status(400).json({ error: 'Session ID is required' });
        return;
      }

      // Validate session ID format
      if (!sessionId.startsWith('cs_')) {
        res.status(400).json({ error: 'Invalid session ID format' });
        return;
      }

      logger.info('Retrieving checkout session', { sessionId });

      // Retrieve the checkout session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: [
          'line_items',
          'payment_intent',
          'customer',
        ],
      });

      // Get payment intent details if available
      let paymentIntent = null;
      if (session.payment_intent && typeof session.payment_intent === 'object') {
        paymentIntent = session.payment_intent;
      } else if (session.payment_intent && typeof session.payment_intent === 'string') {
        paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
      }

      // Extract relevant session information
      const sessionData = {
        id: session.id,
        payment_status: session.payment_status,
        status: session.status,
        amount_total: session.amount_total,
        amount_subtotal: session.amount_subtotal,
        currency: session.currency,
        customer_email: session.customer_details?.email || session.customer_email,
        customer_name: session.customer_details?.name,
        customer_phone: session.customer_details?.phone,
        payment_method_types: session.payment_method_types,
        created: session.created,
        expires_at: session.expires_at,
        metadata: session.metadata,
        
        // Shipping information
        shipping_details: session.shipping_details ? {
          address: session.shipping_details.address,
          name: session.shipping_details.name,
        } : null,
        
        // Billing information
        billing_details: session.customer_details ? {
          address: session.customer_details.address,
          email: session.customer_details.email,
          name: session.customer_details.name,
          phone: session.customer_details.phone,
        } : null,
        
        // Line items
        line_items: session.line_items?.data?.map(item => ({
          id: item.id,
          amount_total: item.amount_total,
          amount_subtotal: item.amount_subtotal,
          currency: item.currency,
          description: item.description,
          quantity: item.quantity,
          price: item.price ? {
            id: item.price.id,
            unit_amount: item.price.unit_amount,
            currency: item.price.currency,
            product: item.price.product,
          } : null,
        })) || [],
        
        // Payment intent information
        payment_intent: paymentIntent ? {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          payment_method: paymentIntent.payment_method,
          application_fee_amount: paymentIntent.application_fee_amount,
          transfer_data: paymentIntent.transfer_data,
          charges: paymentIntent.charges?.data?.map(charge => ({
            id: charge.id,
            status: charge.status,
            amount: charge.amount,
            currency: charge.currency,
            paid: charge.paid,
            refunded: charge.refunded,
            application_fee_amount: charge.application_fee_amount,
            transfer_data: charge.transfer_data,
            receipt_url: charge.receipt_url,
          })) || [],
        } : null,
      };

      logger.info('Checkout session retrieved successfully', {
        sessionId: session.id,
        paymentStatus: session.payment_status,
        status: session.status,
        amountTotal: session.amount_total,
      });

      // Return session data
      res.status(200).json({
        success: true,
        session: sessionData,
      });

    } catch (error) {
      logger.error('Error retrieving checkout session:', error);
      
      if (error instanceof Stripe.errors.StripeError) {
        // Handle specific Stripe errors
        if (error.type === 'StripeInvalidRequestError') {
          res.status(404).json({
            error: 'Session not found',
            message: 'The requested checkout session does not exist',
            type: error.type,
          });
        } else {
          res.status(400).json({
            error: 'Stripe error',
            message: error.message,
            type: error.type,
          });
        }
      } else {
        res.status(500).json({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        });
      }
    }
  });
});