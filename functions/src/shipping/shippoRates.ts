import * as functions from 'firebase-functions/v2/https';
import { config } from 'firebase-functions/v1';
import { logger } from 'firebase-functions/v2';
import cors from 'cors';
import shippo from 'shippo';

// Initialize Shippo - use Firebase config for emulator compatibility
const shippoApiKey = process.env.SHIPPO_API_KEY || config().shippo?.api_key;
const shippoClient = shippo(shippoApiKey);

// CORS configuration
const corsHandler = cors({ origin: true });

// Types
interface ShippingAddress {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
}

interface PackageDetails {
  length: number; // inches
  width: number;  // inches
  height: number; // inches
  weight: number; // pounds
  distance_unit: 'in' | 'cm';
  mass_unit: 'lb' | 'kg';
}

interface ShippingRateRequest {
  fromAddress: ShippingAddress;
  toAddress: ShippingAddress;
  packages: PackageDetails[];
  async?: boolean;
  carrierAccounts?: string[];
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
  carrier: string;
  service: string;
  estimated_days?: number;
  provider?: string;
  servicelevel?: {
    name: string;
    token: string;
    terms?: string;
  };
}

export const getShippoRates = functions.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      // Only allow POST requests
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const {
        fromAddress,
        toAddress,
        packages,
        async = false,
        carrierAccounts
      }: ShippingRateRequest = req.body;

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
        if (!fromAddress[field as keyof ShippingAddress] || !toAddress[field as keyof ShippingAddress]) {
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

      logger.info('Creating shipment for rate calculation', {
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
      const formattedRates: ShippingRate[] = shipment.rates
        .filter((rate: any) => rate.amount && parseFloat(rate.amount) > 0)
        .map((rate: any) => {
          const deliveryEstimate = rate.estimated_days ? {
            minimum: { unit: 'business_day', value: rate.estimated_days },
            maximum: { unit: 'business_day', value: rate.estimated_days + 1 }
          } : undefined;

          return {
            id: rate.object_id,
            display_name: `${rate.provider} ${rate.servicelevel.name}`,
            amount: Math.round(parseFloat(rate.amount) * 100), // Convert to cents
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
        .sort((a: ShippingRate, b: ShippingRate) => a.amount - b.amount); // Sort by price

      logger.info('Shipping rates retrieved successfully', {
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

    } catch (error) {
      logger.error('Error getting shipping rates:', error);
      
      // Handle Shippo-specific errors
      if (error && typeof error === 'object' && 'detail' in error) {
        res.status(400).json({
          error: 'Shippo API error',
          message: error.detail || 'Unknown Shippo error',
          type: 'shippo_error'
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

// Helper function to validate US addresses
export const validateUSAddress = functions.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { address }: { address: ShippingAddress } = req.body;

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
        valid: validatedAddress.validation_results?.is_valid || false,
        address: validatedAddress,
        validation_results: validatedAddress.validation_results
      });

    } catch (error) {
      logger.error('Error validating address:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });
});