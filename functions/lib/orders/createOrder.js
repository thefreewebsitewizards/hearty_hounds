"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrder = exports.createOrderFromPaymentId = void 0;
const functions = __importStar(require("firebase-functions/v2/https"));
const v1_1 = require("firebase-functions/v1");
const v2_1 = require("firebase-functions/v2");
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
const stripe_1 = __importDefault(require("stripe"));
// Initialize Stripe - use Firebase config for emulator compatibility
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ((_a = (0, v1_1.config)().stripe) === null || _a === void 0 ? void 0 : _a.secret_key);
const stripe = new stripe_1.default(stripeSecretKey, {
    apiVersion: '2023-10-16',
});
// CORS configuration
const corsHandler = (0, cors_1.default)({ origin: true });
// Firestore instance
const db = admin.firestore();
exports.createOrderFromPaymentId = functions.onRequest(async (req, res) => {
    return corsHandler(req, res, async () => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
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
            v2_1.logger.info('Creating order from payment', {
                sessionId,
                paymentIntentId
            });
            let session = null;
            let paymentIntent = null;
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
                    }
                    else {
                        paymentIntent = session.payment_intent;
                    }
                }
            }
            else if (paymentIntentId) {
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
                v2_1.logger.info('Order already exists', {
                    orderId: existingOrder.id,
                    paymentIntentId: paymentIntent.id
                });
                res.status(200).json({
                    success: true,
                    order: Object.assign({ id: existingOrder.id }, existingOrder.data()),
                    message: 'Order already exists'
                });
                return;
            }
            // Extract order information
            const customerEmail = ((_a = session === null || session === void 0 ? void 0 : session.customer_details) === null || _a === void 0 ? void 0 : _a.email) ||
                (session === null || session === void 0 ? void 0 : session.customer_email) ||
                paymentIntent.receipt_email || '';
            const customerName = ((_b = session === null || session === void 0 ? void 0 : session.customer_details) === null || _b === void 0 ? void 0 : _b.name) || '';
            // Calculate fees
            const totalAmount = paymentIntent.amount; // in cents
            const applicationFeeAmount = paymentIntent.application_fee_amount || 0;
            const platformFee = applicationFeeAmount;
            // Estimate Stripe fee (2.9% + 30¢)
            const stripeFee = Math.round(totalAmount * 0.029 + 30);
            // Calculate subtotal and shipping
            let subtotal = 0;
            let shippingCost = 0;
            let items = [];
            if ((_c = session === null || session === void 0 ? void 0 : session.line_items) === null || _c === void 0 ? void 0 : _c.data) {
                items = session.line_items.data.map(item => {
                    var _a, _b;
                    const itemTotal = item.amount_total || 0;
                    subtotal += item.amount_subtotal || 0;
                    return {
                        id: ((_a = item.price) === null || _a === void 0 ? void 0 : _a.product) || item.id,
                        name: item.description || 'Product',
                        price: (((_b = item.price) === null || _b === void 0 ? void 0 : _b.unit_amount) || 0) / 100,
                        quantity: item.quantity || 1,
                        total: itemTotal / 100, // Convert from cents
                    };
                });
                shippingCost = (((_d = session.total_details) === null || _d === void 0 ? void 0 : _d.amount_shipping) || 0) / 100;
            }
            else {
                // If no line items, use payment intent amount
                subtotal = (totalAmount - applicationFeeAmount - stripeFee) / 100;
            }
            // Prepare shipping details
            let shippingDetails;
            if (session === null || session === void 0 ? void 0 : session.shipping_details) {
                shippingDetails = {
                    name: session.shipping_details.name || '',
                    address: {
                        line1: ((_e = session.shipping_details.address) === null || _e === void 0 ? void 0 : _e.line1) || '',
                        line2: ((_f = session.shipping_details.address) === null || _f === void 0 ? void 0 : _f.line2) || undefined,
                        city: ((_g = session.shipping_details.address) === null || _g === void 0 ? void 0 : _g.city) || '',
                        state: ((_h = session.shipping_details.address) === null || _h === void 0 ? void 0 : _h.state) || '',
                        postal_code: ((_j = session.shipping_details.address) === null || _j === void 0 ? void 0 : _j.postal_code) || '',
                        country: ((_k = session.shipping_details.address) === null || _k === void 0 ? void 0 : _k.country) || '',
                    },
                    phone: ((_l = session.customer_details) === null || _l === void 0 ? void 0 : _l.phone) || undefined
                };
            }
            // Create order object
            const orderId = db.collection('orders').doc().id;
            const now = admin.firestore.Timestamp.now();
            const order = {
                id: orderId,
                customerId: (session === null || session === void 0 ? void 0 : session.customer) || undefined,
                customerEmail,
                customerName,
                items,
                subtotal: subtotal / 100,
                shippingCost: shippingCost / 100,
                platformFee: platformFee / 100,
                stripeFee: stripeFee / 100,
                total: totalAmount / 100,
                currency: paymentIntent.currency,
                status: 'paid',
                paymentStatus: 'paid',
                paymentIntentId: paymentIntent.id,
                checkoutSessionId: (session === null || session === void 0 ? void 0 : session.id) || '',
                connectedAccountId: ((_m = paymentIntent.transfer_data) === null || _m === void 0 ? void 0 : _m.destination) || undefined,
                shippingDetails,
                billingDetails: (session === null || session === void 0 ? void 0 : session.customer_details) || undefined,
                metadata: Object.assign(Object.assign(Object.assign({}, session === null || session === void 0 ? void 0 : session.metadata), paymentIntent.metadata), { stripeChargeId: paymentIntent.latest_charge, receiptUrl: null }),
                createdAt: now,
                updatedAt: now,
                paidAt: now,
            };
            // Save order to Firestore
            await db.collection('orders').doc(orderId).set(order);
            v2_1.logger.info('Order created successfully', {
                orderId,
                customerEmail,
                total: order.total,
                paymentIntentId: paymentIntent.id
            });
            // Update inventory (if applicable)
            try {
                await updateInventory(items);
            }
            catch (inventoryError) {
                v2_1.logger.warn('Failed to update inventory', {
                    orderId,
                    error: inventoryError
                });
                // Don't fail the order creation if inventory update fails
            }
            // Send confirmation email (if applicable)
            try {
                await sendOrderConfirmationEmail(order);
            }
            catch (emailError) {
                v2_1.logger.warn('Failed to send confirmation email', {
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
        }
        catch (error) {
            v2_1.logger.error('Error creating order:', error);
            if (error instanceof stripe_1.default.errors.StripeError) {
                res.status(400).json({
                    error: 'Stripe error',
                    message: error.message,
                    type: error.type
                });
            }
            else {
                res.status(500).json({
                    error: 'Internal server error',
                    message: error instanceof Error ? error.message : 'Unknown error occurred'
                });
            }
        }
    });
});
// Helper function to update inventory
async function updateInventory(items) {
    const batch = db.batch();
    for (const item of items) {
        const productRef = db.collection('products').doc(item.id);
        const productDoc = await productRef.get();
        if (productDoc.exists) {
            const productData = productDoc.data();
            const currentStock = (productData === null || productData === void 0 ? void 0 : productData.stock) || 0;
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
async function sendOrderConfirmationEmail(order) {
    // This is a placeholder for email functionality
    // You can integrate with SendGrid, Mailgun, or Firebase Extensions
    v2_1.logger.info('Order confirmation email would be sent', {
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
exports.getOrder = functions.onRequest(async (req, res) => {
    return corsHandler(req, res, async () => {
        try {
            if (req.method !== 'GET') {
                res.status(405).json({ error: 'Method not allowed' });
                return;
            }
            const orderId = req.query.orderId;
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
                order: Object.assign({ id: orderDoc.id }, orderDoc.data())
            });
        }
        catch (error) {
            v2_1.logger.error('Error getting order:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    });
});
//# sourceMappingURL=createOrder.js.map