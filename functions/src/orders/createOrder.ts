import * as functions from 'firebase-functions/v2/https';
import { config } from 'firebase-functions/v1';
import { logger } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import cors from 'cors';
import Stripe from 'stripe';

// Initialize Stripe - use Firebase config for emulator compatibility
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || config().stripe?.secret_key;
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

// CORS configuration
const corsHandler = cors({ origin: true });

// Firestore instance
const db = admin.firestore();

// Types
interface OrderItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  total: number;
}

interface ShippingDetails {
  name: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  phone?: string;
}

interface Order {
  id: string;
  customerId?: string;
  customerEmail: string;
  customerName?: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  platformFee: number;
  stripeFee: number;
  total: number;
  currency: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentIntentId: string;
  checkoutSessionId: string;
  connectedAccountId?: string;
  shippingDetails?: ShippingDetails;
  billingDetails?: any;
  metadata?: Record<string, any>;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
  paidAt?: admin.firestore.Timestamp;
  shippedAt?: admin.firestore.Timestamp;
  deliveredAt?: admin.firestore.Timestamp;
}

export const createOrderFromPaymentId = functions.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      // Only allow POST requests
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { sessionId, paymentIntentId } = req.body;

      if (!sessionId && !paymentIntentId) {
        res.status(400).json({
          error: 'Missing required parameter',
          message: 'Either sessionId or paymentIntentId is required'
        });
        return;
      }

      logger.info('Creating order from payment', {
        sessionId,
        paymentIntentId
      });

      let session: Stripe.Checkout.Session | null = null;
      let paymentIntent: Stripe.PaymentIntent | null = null;

      // Get session if sessionId provided
      if (sessionId) {
        session = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: [
            'line_items',
            'payment_intent',
            'customer'
          ]
        });
        
        // Get payment intent from session
        if (session.payment_intent) {
          if (typeof session.payment_intent === 'string') {
            paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
          } else {
            paymentIntent = session.payment_intent;
          }
        }
      } else if (paymentIntentId) {
        // Get payment intent directly
        paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      }

      if (!paymentIntent) {
        res.status(404).json({
          error: 'Payment intent not found',
          message: 'Could not retrieve payment intent'
        });
        return;
      }

      // Check if payment is successful
      if (paymentIntent.status !== 'succeeded') {
        res.status(400).json({
          error: 'Payment not completed',
          message: `Payment status is ${paymentIntent.status}`,
          paymentStatus: paymentIntent.status
        });
        return;
      }

      // Check if order already exists
      const existingOrderQuery = await db.collection('orders')
        .where('paymentIntentId', '==', paymentIntent.id)
        .limit(1)
        .get();

      if (!existingOrderQuery.empty) {
        const existingOrder = existingOrderQuery.docs[0];
        logger.info('Order already exists', {
          orderId: existingOrder.id,
          paymentIntentId: paymentIntent.id
        });
        
        res.status(200).json({
          success: true,
          order: { id: existingOrder.id, ...existingOrder.data() },
          message: 'Order already exists'
        });
        return;
      }

      // Extract order information
      const customerEmail = session?.customer_details?.email || 
                           session?.customer_email || 
                           paymentIntent.receipt_email || '';
      
      const customerName = session?.customer_details?.name || '';
      
      // Calculate fees
      const totalAmount = paymentIntent.amount; // in cents
      const applicationFeeAmount = paymentIntent.application_fee_amount || 0;
      const platformFee = applicationFeeAmount;
      
      // Estimate Stripe fee (2.9% + 30¢)
      const stripeFee = Math.round(totalAmount * 0.029 + 30);
      
      // Calculate subtotal and shipping
      let subtotal = 0;
      let shippingCost = 0;
      let items: OrderItem[] = [];

      if (session?.line_items?.data) {
        items = session.line_items.data.map(item => {
          const itemTotal = item.amount_total || 0;
          subtotal += item.amount_subtotal || 0;
          
          return {
            id: item.price?.product as string || item.id,
            name: item.description || 'Product',
            price: (item.price?.unit_amount || 0) / 100, // Convert from cents
            quantity: item.quantity || 1,
            total: itemTotal / 100, // Convert from cents
          };
        });
        
        shippingCost = (session.total_details?.amount_shipping || 0) / 100;
      } else {
        // If no line items, use payment intent amount
        subtotal = (totalAmount - applicationFeeAmount - stripeFee) / 100;
      }

      // Prepare shipping details
      let shippingDetails: ShippingDetails | undefined;
      if (session?.shipping_details) {
        shippingDetails = {
          name: session.shipping_details.name || '',
          address: {
            line1: session.shipping_details.address?.line1 || '',
            line2: session.shipping_details.address?.line2 || undefined,
            city: session.shipping_details.address?.city || '',
            state: session.shipping_details.address?.state || '',
            postal_code: session.shipping_details.address?.postal_code || '',
            country: session.shipping_details.address?.country || '',
          },
          phone: session.customer_details?.phone || undefined
        };
      }

      // Create order object
      const orderId = db.collection('orders').doc().id;
      const now = admin.firestore.Timestamp.now();
      
      const order: Order = {
        id: orderId,
        customerId: session?.customer as string || undefined,
        customerEmail,
        customerName,
        items,
        subtotal: subtotal / 100, // Convert from cents
        shippingCost: shippingCost / 100, // Convert from cents
        platformFee: platformFee / 100, // Convert from cents
        stripeFee: stripeFee / 100, // Convert from cents
        total: totalAmount / 100, // Convert from cents
        currency: paymentIntent.currency,
        status: 'paid',
        paymentStatus: 'paid',
        paymentIntentId: paymentIntent.id,
        checkoutSessionId: session?.id || '',
        connectedAccountId: paymentIntent.transfer_data?.destination as string || undefined,
        shippingDetails,
        billingDetails: session?.customer_details || undefined,
        metadata: {
          ...session?.metadata,
          ...paymentIntent.metadata,
          stripeChargeId: paymentIntent.latest_charge as string,
          receiptUrl: null, // Receipt URL needs to be fetched separately from charge object
        },
        createdAt: now,
        updatedAt: now,
        paidAt: now,
      };

      // Save order to Firestore
      await db.collection('orders').doc(orderId).set(order);

      logger.info('Order created successfully', {
        orderId,
        customerEmail,
        total: order.total,
        paymentIntentId: paymentIntent.id
      });

      // Update inventory (if applicable)
      try {
        await updateInventory(items);
      } catch (inventoryError) {
        logger.warn('Failed to update inventory', {
          orderId,
          error: inventoryError
        });
        // Don't fail the order creation if inventory update fails
      }

      // Send confirmation email (if applicable)
      try {
        await sendOrderConfirmationEmail(order);
      } catch (emailError) {
        logger.warn('Failed to send confirmation email', {
          orderId,
          error: emailError
        });
        // Don't fail the order creation if email fails
      }

      res.status(201).json({
        success: true,
        order,
        message: 'Order created successfully'
      });

    } catch (error) {
      logger.error('Error creating order:', error);
      
      if (error instanceof Stripe.errors.StripeError) {
        res.status(400).json({
          error: 'Stripe error',
          message: error.message,
          type: error.type
        });
      } else {
        res.status(500).json({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }
    }
  });
});

// Helper function to update inventory
async function updateInventory(items: OrderItem[]): Promise<void> {
  const batch = db.batch();
  
  for (const item of items) {
    const productRef = db.collection('products').doc(item.id);
    const productDoc = await productRef.get();
    
    if (productDoc.exists) {
      const productData = productDoc.data();
      const currentStock = productData?.stock || 0;
      const newStock = Math.max(0, currentStock - item.quantity);
      
      batch.update(productRef, {
        stock: newStock,
        updatedAt: admin.firestore.Timestamp.now()
      });
    }
  }
  
  await batch.commit();
}

// Helper function to send order confirmation email
async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  // This is a placeholder for email functionality
  // You can integrate with SendGrid, Mailgun, or Firebase Extensions
  logger.info('Order confirmation email would be sent', {
    orderId: order.id,
    customerEmail: order.customerEmail
  });
  
  // Example: Add to email queue
  await db.collection('emailQueue').add({
    type: 'order_confirmation',
    to: order.customerEmail,
    orderId: order.id,
    orderData: order,
    createdAt: admin.firestore.Timestamp.now(),
    status: 'pending'
  });
}

// Function to get order by ID
export const getOrder = functions.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const orderId = req.query.orderId as string;
      
      if (!orderId) {
        res.status(400).json({ error: 'Order ID is required' });
        return;
      }

      const orderDoc = await db.collection('orders').doc(orderId).get();
      
      if (!orderDoc.exists) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      res.status(200).json({
        success: true,
        order: { id: orderDoc.id, ...orderDoc.data() }
      });

    } catch (error) {
      logger.error('Error getting order:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });
});