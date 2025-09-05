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
exports.getCheckoutSessionV2 = void 0;
const functions = __importStar(require("firebase-functions/v2/https"));
const v1_1 = require("firebase-functions/v1");
const v2_1 = require("firebase-functions/v2");
const cors_1 = __importDefault(require("cors"));
const stripe_1 = __importDefault(require("stripe"));
// Initialize Stripe - use Firebase config for emulator compatibility
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ((_a = (0, v1_1.config)().stripe) === null || _a === void 0 ? void 0 : _a.secret_key);
const stripe = new stripe_1.default(stripeSecretKey, {
    apiVersion: '2023-10-16',
});
// CORS configuration
const corsHandler = (0, cors_1.default)({ origin: true });
exports.getCheckoutSessionV2 = functions.onRequest(async (req, res) => {
    return corsHandler(req, res, async () => {
        var _a, _b, _c, _d, _e, _f, _g;
        try {
            // Only allow GET requests
            if (req.method !== 'GET') {
                res.status(405).json({ error: 'Method not allowed' });
                return;
            }
            // Get session ID from query parameters
            const sessionId = req.query.sessionId;
            if (!sessionId) {
                res.status(400).json({ error: 'Session ID is required' });
                return;
            }
            // Validate session ID format
            if (!sessionId.startsWith('cs_')) {
                res.status(400).json({ error: 'Invalid session ID format' });
                return;
            }
            v2_1.logger.info('Retrieving checkout session', { sessionId });
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
            }
            else if (session.payment_intent && typeof session.payment_intent === 'string') {
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
                customer_email: ((_a = session.customer_details) === null || _a === void 0 ? void 0 : _a.email) || session.customer_email,
                customer_name: (_b = session.customer_details) === null || _b === void 0 ? void 0 : _b.name,
                customer_phone: (_c = session.customer_details) === null || _c === void 0 ? void 0 : _c.phone,
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
                line_items: ((_e = (_d = session.line_items) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.map(item => ({
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
                }))) || [],
                // Payment intent information
                payment_intent: paymentIntent ? {
                    id: paymentIntent.id,
                    status: paymentIntent.status,
                    amount: paymentIntent.amount,
                    currency: paymentIntent.currency,
                    payment_method: paymentIntent.payment_method,
                    application_fee_amount: paymentIntent.application_fee_amount,
                    transfer_data: paymentIntent.transfer_data,
                    charges: ((_g = (_f = paymentIntent.charges) === null || _f === void 0 ? void 0 : _f.data) === null || _g === void 0 ? void 0 : _g.map(charge => ({
                        id: charge.id,
                        status: charge.status,
                        amount: charge.amount,
                        currency: charge.currency,
                        paid: charge.paid,
                        refunded: charge.refunded,
                        application_fee_amount: charge.application_fee_amount,
                        transfer_data: charge.transfer_data,
                        receipt_url: charge.receipt_url,
                    }))) || [],
                } : null,
            };
            v2_1.logger.info('Checkout session retrieved successfully', {
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
        }
        catch (error) {
            v2_1.logger.error('Error retrieving checkout session:', error);
            if (error instanceof stripe_1.default.errors.StripeError) {
                // Handle specific Stripe errors
                if (error.type === 'StripeInvalidRequestError') {
                    res.status(404).json({
                        error: 'Session not found',
                        message: 'The requested checkout session does not exist',
                        type: error.type,
                    });
                }
                else {
                    res.status(400).json({
                        error: 'Stripe error',
                        message: error.message,
                        type: error.type,
                    });
                }
            }
            else {
                res.status(500).json({
                    error: 'Internal server error',
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                });
            }
        }
    });
});
//# sourceMappingURL=getCheckoutSession.js.map