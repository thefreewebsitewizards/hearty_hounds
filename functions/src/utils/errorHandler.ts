import { logger } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

// Error types
export enum ErrorType {
  VALIDATION_ERROR = 'validation_error',
  STRIPE_ERROR = 'stripe_error',
  SHIPPO_ERROR = 'shippo_error',
  FIRESTORE_ERROR = 'firestore_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  AUTHORIZATION_ERROR = 'authorization_error',
  NOT_FOUND_ERROR = 'not_found_error',
  RATE_LIMIT_ERROR = 'rate_limit_error',
  INTERNAL_ERROR = 'internal_error'
}

// Error response interface
export interface ErrorResponse {
  error: string;
  message: string;
  type: ErrorType;
  code?: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

// Custom error class
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly code?: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(
    message: string,
    type: ErrorType,
    statusCode: number = 500,
    code?: string,
    details?: any
  ) {
    super(message);
    this.type = type;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
  }
}

// Error handler class
export class ErrorHandler {
  private static instance: ErrorHandler;
  private db = admin.firestore();

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Main error handling method
  public handleError(error: any, context: string, requestId?: string): ErrorResponse {
    const timestamp = new Date().toISOString();
    let errorResponse: ErrorResponse;

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
    } else if (error instanceof Stripe.errors.StripeError) {
      errorResponse = this.handleStripeError(error, timestamp, requestId);
    } else if (this.isFirestoreError(error)) {
      errorResponse = this.handleFirestoreError(error, timestamp, requestId);
    } else {
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
      logger.error('Failed to store error in Firestore:', storeError);
    });

    return errorResponse;
  }

  // Handle Stripe-specific errors
  private handleStripeError(error: Stripe.errors.StripeError, timestamp: string, requestId?: string): ErrorResponse {
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
        declineCode: (error as any).decline_code
      },
      timestamp,
      requestId
    };
  }

  // Handle Firestore errors
  private handleFirestoreError(error: any, timestamp: string, requestId?: string): ErrorResponse {
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
  private isFirestoreError(error: any): boolean {
    return error && error.code && typeof error.code === 'string' && 
           ['permission-denied', 'not-found', 'already-exists', 'resource-exhausted', 
            'failed-precondition', 'aborted', 'unavailable', 'data-loss'].includes(error.code);
  }

  // Log error with appropriate level
  private logError(error: any, context: string, errorResponse: ErrorResponse): void {
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
        logger.warn('Validation/Not Found Error:', logData);
        break;
      case ErrorType.AUTHENTICATION_ERROR:
      case ErrorType.AUTHORIZATION_ERROR:
        logger.warn('Auth Error:', logData);
        break;
      case ErrorType.RATE_LIMIT_ERROR:
        logger.warn('Rate Limit Error:', logData);
        break;
      case ErrorType.STRIPE_ERROR:
      case ErrorType.SHIPPO_ERROR:
      case ErrorType.FIRESTORE_ERROR:
        logger.error('External Service Error:', logData);
        break;
      default:
        logger.error('Internal Error:', logData);
    }
  }

  // Store error in Firestore for monitoring and analytics
  private async storeError(error: any, context: string, errorResponse: ErrorResponse): Promise<void> {
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
    } catch (storeError) {
      // Don't throw here to avoid infinite loops
      logger.error('Failed to store error log:', storeError);
    }
  }

  // Validation helper methods
  public validateRequired(fields: Record<string, any>, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => 
      fields[field] === undefined || fields[field] === null || fields[field] === ''
    );

    if (missingFields.length > 0) {
      throw new AppError(
        `Missing required fields: ${missingFields.join(', ')}`,
        ErrorType.VALIDATION_ERROR,
        400,
        'MISSING_REQUIRED_FIELDS',
        { missingFields }
      );
    }
  }

  public validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError(
        'Invalid email format',
        ErrorType.VALIDATION_ERROR,
        400,
        'INVALID_EMAIL_FORMAT'
      );
    }
  }

  public validateAmount(amount: number, min: number = 0): void {
    if (typeof amount !== 'number' || amount < min) {
      throw new AppError(
        `Amount must be a number greater than or equal to ${min}`,
        ErrorType.VALIDATION_ERROR,
        400,
        'INVALID_AMOUNT'
      );
    }
  }

  public validateCurrency(currency: string): void {
    const validCurrencies = ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy'];
    if (!validCurrencies.includes(currency.toLowerCase())) {
      throw new AppError(
        `Invalid currency. Supported currencies: ${validCurrencies.join(', ')}`,
        ErrorType.VALIDATION_ERROR,
        400,
        'INVALID_CURRENCY'
      );
    }
  }
}

// Utility function to generate request ID
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Middleware for error handling
export function withErrorHandling(handler: (req: any, res: any) => Promise<void>) {
  return async (req: any, res: any) => {
    const requestId = generateRequestId();
    const errorHandler = ErrorHandler.getInstance();
    
    try {
      await handler(req, res);
    } catch (error) {
      const errorResponse = errorHandler.handleError(error, req.url || 'unknown', requestId);
      
      // Determine status code
      let statusCode = 500;
      if (error instanceof AppError) {
        statusCode = error.statusCode;
      } else if (error instanceof Stripe.errors.StripeError) {
        statusCode = error.statusCode || 400;
      }
      
      res.status(statusCode).json(errorResponse);
    }
  };
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();