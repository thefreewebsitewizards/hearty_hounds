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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShippoRatesV2 = exports.validateUSAddress = exports.getShippoRates = exports.getOrder = exports.createOrderFromPaymentId = exports.getCheckoutSessionV2 = exports.createCheckoutSessionV2 = exports.testFunction = void 0;
const functions = __importStar(require("firebase-functions/v2/https"));
const v1_1 = require("firebase-functions/v1");
const v2_1 = require("firebase-functions/v2");
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
const stripe_1 = __importDefault(require("stripe"));
const shippo_1 = __importDefault(require("shippo"));
// Initialize Firebase Admin
admin.initializeApp();
// Initialize Stripe with platform's secret key - use Firebase config for emulator compatibility
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ((_a = (0, v1_1.config)().stripe) === null || _a === void 0 ? void 0 : _a.secret_key);
const stripe = new stripe_1.default(stripeSecretKey, {
    apiVersion: '2023-10-16',
});
// Initialize Shippo - use Firebase config for emulator compatibility
const shippoApiKey = process.env.SHIPPO_API_KEY || ((_b = (0, v1_1.config)().shippo) === null || _b === void 0 ? void 0 : _b.api_key);
const shippoClient = (0, shippo_1.default)(shippoApiKey);
// CORS configuration
const corsHandler = (0, cors_1.default)({ origin: true });
// Simple test function for API health check
exports.testFunction = functions.onRequest({ cors: true }, async (req, res) => {
    try {
        v2_1.logger.info('Test function called', { method: req.method, path: req.path });
        res.status(200).json({
            success: true,
            message: 'Firebase Functions are working correctly!',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    }
    catch (error) {
        v2_1.logger.error('Test function error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// Export all functions
var createCheckoutSession_1 = require("./stripe/createCheckoutSession");
Object.defineProperty(exports, "createCheckoutSessionV2", { enumerable: true, get: function () { return createCheckoutSession_1.createCheckoutSessionV2; } });
var getCheckoutSession_1 = require("./stripe/getCheckoutSession");
Object.defineProperty(exports, "getCheckoutSessionV2", { enumerable: true, get: function () { return getCheckoutSession_1.getCheckoutSessionV2; } });
var createOrder_1 = require("./orders/createOrder");
Object.defineProperty(exports, "createOrderFromPaymentId", { enumerable: true, get: function () { return createOrder_1.createOrderFromPaymentId; } });
Object.defineProperty(exports, "getOrder", { enumerable: true, get: function () { return createOrder_1.getOrder; } });
var shippoRates_1 = require("./shipping/shippoRates");
Object.defineProperty(exports, "getShippoRates", { enumerable: true, get: function () { return shippoRates_1.getShippoRates; } });
Object.defineProperty(exports, "validateUSAddress", { enumerable: true, get: function () { return shippoRates_1.validateUSAddress; } });
var getShippoRatesV2_1 = require("./shipping/getShippoRatesV2");
Object.defineProperty(exports, "getShippoRatesV2", { enumerable: true, get: function () { return getShippoRatesV2_1.getShippoRatesV2; } });
//# sourceMappingURL=index.js.map