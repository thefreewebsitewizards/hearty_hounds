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
exports.validateUSAddress = exports.getShippoRates = void 0;
const functions = __importStar(require("firebase-functions/v2/https"));
const v1_1 = require("firebase-functions/v1");
const v2_1 = require("firebase-functions/v2");
const cors_1 = __importDefault(require("cors"));
const shippo_1 = __importDefault(require("shippo"));
// Initialize Shippo - use Firebase config for emulator compatibility
const shippoApiKey = process.env.SHIPPO_API_KEY || ((_a = (0, v1_1.config)().shippo) === null || _a === void 0 ? void 0 : _a.api_key);
const shippoClient = (0, shippo_1.default)(shippoApiKey);
// CORS configuration
const corsHandler = (0, cors_1.default)({ origin: true });
exports.getShippoRates = functions.onRequest(async (req, res) => {
    return corsHandler(req, res, async () => {
        try {
            // Only allow POST requests
            if (req.method !== 'POST') {
                res.status(405).json({ error: 'Method not allowed' });
                return;
            }
            const { fromAddress, toAddress, packages, async = false, carrierAccounts } = req.body;
            // Validate required fields
            if (!fromAddress || !toAddress || !packages || packages.length === 0) {
                res.status(400).json({
                    error: 'Missing required fields',
                    message: 'fromAddress, toAddress, and packages are required'
                });
                return;
            }
            // Validate address fields
            const requiredAddressFields = ['name', 'street1', 'city', 'state', 'zip', 'country'];
            for (const field of requiredAddressFields) {
                if (!fromAddress[field] || !toAddress[field]) {
                    res.status(400).json({
                        error: 'Invalid address',
                        message: `Missing required address field: ${field}`
                    });
                    return;
                }
            }
            // Validate package details
            for (const pkg of packages) {
                if (!pkg.length || !pkg.width || !pkg.height || !pkg.weight) {
                    res.status(400).json({
                        error: 'Invalid package',
                        message: 'All package dimensions (length, width, height, weight) are required'
                    });
                    return;
                }
            }
            v2_1.logger.info('Creating shipment for rate calculation', {
                fromCity: fromAddress.city,
                fromState: fromAddress.state,
                toCity: toAddress.city,
                toState: toAddress.state,
                packageCount: packages.length
            });
            // Create shipment object for Shippo
            const shipmentData = {
                address_from: {
                    name: fromAddress.name,
                    street1: fromAddress.street1,
                    street2: fromAddress.street2 || '',
                    city: fromAddress.city,
                    state: fromAddress.state,
                    zip: fromAddress.zip,
                    country: fromAddress.country,
                    phone: fromAddress.phone || '',
                    email: fromAddress.email || ''
                },
                address_to: {
                    name: toAddress.name,
                    street1: toAddress.street1,
                    street2: toAddress.street2 || '',
                    city: toAddress.city,
                    state: toAddress.state,
                    zip: toAddress.zip,
                    country: toAddress.country,
                    phone: toAddress.phone || '',
                    email: toAddress.email || ''
                },
                parcels: packages.map(pkg => ({
                    length: pkg.length.toString(),
                    width: pkg.width.toString(),
                    height: pkg.height.toString(),
                    weight: pkg.weight.toString(),
                    distance_unit: pkg.distance_unit || 'in',
                    mass_unit: pkg.mass_unit || 'lb'
                })),
                async: async,
                carrier_accounts: carrierAccounts || []
            };
            // Create shipment and get rates
            const shipment = await shippoClient.shipment.create(shipmentData);
            if (!shipment.rates || shipment.rates.length === 0) {
                res.status(404).json({
                    error: 'No rates found',
                    message: 'No shipping rates available for this route'
                });
                return;
            }
            // Format rates for response
            const formattedRates = shipment.rates
                .filter((rate) => rate.amount && parseFloat(rate.amount) > 0)
                .map((rate) => {
                const deliveryEstimate = rate.estimated_days ? {
                    minimum: { unit: 'business_day', value: rate.estimated_days },
                    maximum: { unit: 'business_day', value: rate.estimated_days + 1 }
                } : undefined;
                return {
                    id: rate.object_id,
                    display_name: `${rate.provider} ${rate.servicelevel.name}`,
                    amount: Math.round(parseFloat(rate.amount) * 100),
                    currency: rate.currency,
                    delivery_estimate: deliveryEstimate,
                    carrier: rate.provider,
                    service: rate.servicelevel.name,
                    estimated_days: rate.estimated_days,
                    provider: rate.provider,
                    servicelevel: {
                        name: rate.servicelevel.name,
                        token: rate.servicelevel.token,
                        terms: rate.servicelevel.terms
                    }
                };
            })
                .sort((a, b) => a.amount - b.amount); // Sort by price
            v2_1.logger.info('Shipping rates retrieved successfully', {
                rateCount: formattedRates.length,
                shipmentId: shipment.object_id
            });
            res.status(200).json({
                success: true,
                rates: formattedRates,
                shipment_id: shipment.object_id,
                metadata: {
                    from: `${fromAddress.city}, ${fromAddress.state}`,
                    to: `${toAddress.city}, ${toAddress.state}`,
                    package_count: packages.length
                }
            });
        }
        catch (error) {
            v2_1.logger.error('Error getting shipping rates:', error);
            // Handle Shippo-specific errors
            if (error && typeof error === 'object' && 'detail' in error) {
                res.status(400).json({
                    error: 'Shippo API error',
                    message: error.detail || 'Unknown Shippo error',
                    type: 'shippo_error'
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
// Helper function to validate US addresses
exports.validateUSAddress = functions.onRequest(async (req, res) => {
    return corsHandler(req, res, async () => {
        var _a;
        try {
            if (req.method !== 'POST') {
                res.status(405).json({ error: 'Method not allowed' });
                return;
            }
            const { address } = req.body;
            if (!address) {
                res.status(400).json({ error: 'Address is required' });
                return;
            }
            // Create address validation request
            const addressData = {
                name: address.name,
                street1: address.street1,
                street2: address.street2 || '',
                city: address.city,
                state: address.state,
                zip: address.zip,
                country: address.country
            };
            const validatedAddress = await shippoClient.address.create(addressData);
            res.status(200).json({
                success: true,
                valid: ((_a = validatedAddress.validation_results) === null || _a === void 0 ? void 0 : _a.is_valid) || false,
                address: validatedAddress,
                validation_results: validatedAddress.validation_results
            });
        }
        catch (error) {
            v2_1.logger.error('Error validating address:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    });
});
//# sourceMappingURL=shippoRates.js.map