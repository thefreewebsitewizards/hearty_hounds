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
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.withErrorHandling = exports.generateRequestId = exports.ErrorHandler = exports.AppError = exports.ErrorType = void 0;
const v2_1 = require("firebase-functions/v2");
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
// Error types
var ErrorType;
(function (ErrorType) {
    ErrorType["VALIDATION_ERROR"] = "validation_error";
    ErrorType["STRIPE_ERROR"] = "stripe_error";
    ErrorType["SHIPPO_ERROR"] = "shippo_error";
    ErrorType["FIRESTORE_ERROR"] = "firestore_error";
    ErrorType["AUTHENTICATION_ERROR"] = "authentication_error";
    ErrorType["AUTHORIZATION_ERROR"] = "authorization_error";
    ErrorType["NOT_FOUND_ERROR"] = "not_found_error";
    ErrorType["RATE_LIMIT_ERROR"] = "rate_limit_error";
    ErrorType["INTERNAL_ERROR"] = "internal_error";
})(ErrorType = exports.ErrorType || (exports.ErrorType = {}));
// Custom error class
class AppError extends Error {
    constructor(message, type, statusCode = 500, code, details) {
        super(message);
        this.type = type;
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
// Error handler class
class ErrorHandler {
    constructor() {
        this.db = admin.firestore();
    }
    static getInstance() {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }
    // Main error handling method
    handleError(error, context, requestId) {
        const timestamp = new Date().toISOString();
        let errorResponse;
        if (error instanceof AppError) {
            errorResponse = {
                error: error.type,
                message: error.message,
                type: error.type,
                code: error.code,
                details: error.details,
                timestamp,
                requestId
            };
        }
        else if (error instanceof stripe_1.default.errors.StripeError) {
            errorResponse = this.handleStripeError(error, timestamp, requestId);
        }
        else if (this.isFirestoreError(error)) {
            errorResponse = this.handleFirestoreError(error, timestamp, requestId);
        }
        else {
            errorResponse = {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error occurred',
                type: ErrorType.INTERNAL_ERROR,
                timestamp,
                requestId
            };
        }
        // Log error
        this.logError(error, context, errorResponse);
        // Store error in Firestore for monitoring
        this.storeError(error, context, errorResponse).catch(storeError => {
            v2_1.logger.error('Failed to store error in Firestore:', storeError);
        });
        return errorResponse;
    }
    // Handle Stripe-specific errors
    handleStripeError(error, timestamp, requestId) {
        let statusCode = 400;
        let message = error.message;
        let type = ErrorType.STRIPE_ERROR;
        switch (error.type) {
            case 'StripeCardError':
                statusCode = 402;
                message = 'Your card was declined.';
                break;
            case 'StripeRateLimitError':
                statusCode = 429;
                type = ErrorType.RATE_LIMIT_ERROR;
                message = 'Too many requests made to the API too quickly.';
                break;
            case 'StripeInvalidRequestError':
                statusCode = 400;
                message = 'Invalid parameters were supplied to Stripe.';
                break;
            case 'StripeAPIError':
                statusCode = 500;
                message = 'An error occurred internally with Stripe.';
                break;
            case 'StripeConnectionError':
                statusCode = 502;
                message = 'Some kind of error occurred during the HTTPS communication.';
                break;
            case 'StripeAuthenticationError':
                statusCode = 401;
                type = ErrorType.AUTHENTICATION_ERROR;
                message = 'You did not provide valid API credentials.';
                break;
        }
        return {
            error: 'Stripe error',
            message,
            type,
            code: error.code,
            details: {
                stripeType: error.type,
                param: error.param,
                declineCode: error.decline_code
            },
            timestamp,
            requestId
        };
    }
    // Handle Firestore errors
    handleFirestoreError(error, timestamp, requestId) {
        let message = 'Database operation failed';
        let statusCode = 500;
        if (error.code) {
            switch (error.code) {
                case 'permission-denied':
                    statusCode = 403;
                    message = 'Insufficient permissions to access the resource';
                    break;
                case 'not-found':
                    statusCode = 404;
                    message = 'The requested document was not found';
                    break;
                case 'already-exists':
                    statusCode = 409;
                    message = 'The document already exists';
                    break;
                case 'resource-exhausted':
                    statusCode = 429;
                    message = 'Quota exceeded or rate limit reached';
                    break;
                case 'failed-precondition':
                    statusCode = 400;
                    message = 'Operation was rejected because the system is not in a state required for the operation';
                    break;
                case 'aborted':
                    statusCode = 409;
                    message = 'The operation was aborted due to a concurrency issue';
                    break;
                case 'unavailable':
                    statusCode = 503;
                    message = 'The service is currently unavailable';
                    break;
                default:
                    message = error.message || 'Unknown database error';
            }
        }
        return {
            error: 'Database error',
            message,
            type: ErrorType.FIRESTORE_ERROR,
            code: error.code,
            timestamp,
            requestId
        };
    }
    // Check if error is from Firestore
    isFirestoreError(error) {
        return error && error.code && typeof error.code === 'string' &&
            ['permission-denied', 'not-found', 'already-exists', 'resource-exhausted',
                'failed-precondition', 'aborted', 'unavailable', 'data-loss'].includes(error.code);
    }
    // Log error with appropriate level
    logError(error, context, errorResponse) {
        const logData = {
            context,
            errorType: errorResponse.type,
            message: errorResponse.message,
            code: errorResponse.code,
            requestId: errorResponse.requestId,
            stack: error instanceof Error ? error.stack : undefined,
            details: errorResponse.details
        };
        // Log with appropriate level based on error type
        switch (errorResponse.type) {
            case ErrorType.VALIDATION_ERROR:
            case ErrorType.NOT_FOUND_ERROR:
                v2_1.logger.warn('Validation/Not Found Error:', logData);
                break;
            case ErrorType.AUTHENTICATION_ERROR:
            case ErrorType.AUTHORIZATION_ERROR:
                v2_1.logger.warn('Auth Error:', logData);
                break;
            case ErrorType.RATE_LIMIT_ERROR:
                v2_1.logger.warn('Rate Limit Error:', logData);
                break;
            case ErrorType.STRIPE_ERROR:
            case ErrorType.SHIPPO_ERROR:
            case ErrorType.FIRESTORE_ERROR:
                v2_1.logger.error('External Service Error:', logData);
                break;
            default:
                v2_1.logger.error('Internal Error:', logData);
        }
    }
    // Store error in Firestore for monitoring and analytics
    async storeError(error, context, errorResponse) {
        try {
            await this.db.collection('errorLogs').add({
                context,
                errorType: errorResponse.type,
                message: errorResponse.message,
                code: errorResponse.code,
                requestId: errorResponse.requestId,
                stack: error instanceof Error ? error.stack : null,
                details: errorResponse.details,
                timestamp: admin.firestore.Timestamp.now(),
                environment: process.env.NODE_ENV || 'development'
            });
        }
        catch (storeError) {
            // Don't throw here to avoid infinite loops
            v2_1.logger.error('Failed to store error log:', storeError);
        }
    }
    // Validation helper methods
    validateRequired(fields, requiredFields) {
        const missingFields = requiredFields.filter(field => fields[field] === undefined || fields[field] === null || fields[field] === '');
        if (missingFields.length > 0) {
            throw new AppError(`Missing required fields: ${missingFields.join(', ')}`, ErrorType.VALIDATION_ERROR, 400, 'MISSING_REQUIRED_FIELDS', { missingFields });
        }
    }
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new AppError('Invalid email format', ErrorType.VALIDATION_ERROR, 400, 'INVALID_EMAIL_FORMAT');
        }
    }
    validateAmount(amount, min = 0) {
        if (typeof amount !== 'number' || amount < min) {
            throw new AppError(`Amount must be a number greater than or equal to ${min}`, ErrorType.VALIDATION_ERROR, 400, 'INVALID_AMOUNT');
        }
    }
    validateCurrency(currency) {
        const validCurrencies = ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy'];
        if (!validCurrencies.includes(currency.toLowerCase())) {
            throw new AppError(`Invalid currency. Supported currencies: ${validCurrencies.join(', ')}`, ErrorType.VALIDATION_ERROR, 400, 'INVALID_CURRENCY');
        }
    }
}
exports.ErrorHandler = ErrorHandler;
// Utility function to generate request ID
function generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
exports.generateRequestId = generateRequestId;
// Middleware for error handling
function withErrorHandling(handler) {
    return async (req, res) => {
        const requestId = generateRequestId();
        const errorHandler = ErrorHandler.getInstance();
        try {
            await handler(req, res);
        }
        catch (error) {
            const errorResponse = errorHandler.handleError(error, req.url || 'unknown', requestId);
            // Determine status code
            let statusCode = 500;
            if (error instanceof AppError) {
                statusCode = error.statusCode;
            }
            else if (error instanceof stripe_1.default.errors.StripeError) {
                statusCode = error.statusCode || 400;
            }
            res.status(statusCode).json(errorResponse);
        }
    };
}
exports.withErrorHandling = withErrorHandling;
// Export singleton instance
exports.errorHandler = ErrorHandler.getInstance();
//# sourceMappingURL=errorHandler.js.map