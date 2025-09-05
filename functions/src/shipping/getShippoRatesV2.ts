import * as functions from 'firebase-functions/v2/https';
import { config } from 'firebase-functions/v1';
import { logger } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import cors from 'cors';
import shippo from 'shippo';

// Initialize Shippo - use Firebase config for emulator compatibility
const shippoApiKey = process.env.SHIPPO_API_KEY || config().shippo?.api_key;
const shippoClient = shippo(shippoApiKey);

// CORS configuration
const corsHandler = cors({ origin: true });

// Firestore instance
const db = admin.firestore();

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

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  weight?: number; // Weight in ounces
  dimensions?: {
    length: number; // Length in inches
    width: number;  // Width in inches
    height: number; // Height in inches
  };
}

interface PackageDetails {
  length: number; // inches
  width: number;  // inches
  height: number; // inches
  weight: number; // pounds
  distance_unit: 'in' | 'cm';
  mass_unit: 'lb' | 'kg';
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

interface ShippoRatesRequestV2 {
  toAddress: ShippingAddress;
  items: CartItem[];
  connectedAccountId?: string;
}

// Default seller address - this will be overridden by Firestore data
const DEFAULT_SELLER_ADDRESS: ShippingAddress = {
  name: "Hearty Hounds",
  street1: "123 Main Street",
  city: "San Francisco",
  state: "CA",
  zip: "94102",
  country: "US",
  phone: "+1-555-123-4567",
  email: "shipping@heartyhounds.com"
};

// Helper function to get seller address from Firestore
async function getSellerAddress(connectedAccountId?: string): Promise<ShippingAddress> {
  try {
    // Try to get seller address from Firestore
    const sellerDoc = await db.collection('sellerAddresses').doc('default').get();
    
    if (sellerDoc.exists) {
      const data = sellerDoc.data();
      logger.info('Using seller address from Firestore', { address: data });
      return data as ShippingAddress;
    } else {
      logger.warn('No seller address found in Firestore, using default');
      return DEFAULT_SELLER_ADDRESS;
    }
  } catch (error) {
    logger.error('Error fetching seller address from Firestore:', error);
    logger.info('Falling back to default seller address');
    return DEFAULT_SELLER_ADDRESS;
  }
}

// Helper function to calculate package details from cart items
function calculatePackageDetails(items: CartItem[]): PackageDetails {
  let totalWeight = 0;
  let maxLength = 0;
  let maxWidth = 0;
  let totalHeight = 0;

  items.forEach(item => {
    const quantity = item.quantity || 1;
    
    // Default weight if not specified (8 oz per item)
    const itemWeight = (item.weight || 8) * quantity;
    totalWeight += itemWeight;
    
    // Default dimensions if not specified
    const dimensions = item.dimensions || { length: 6, width: 6, height: 2 };
    
    maxLength = Math.max(maxLength, dimensions.length);
    maxWidth = Math.max(maxWidth, dimensions.width);
    totalHeight += dimensions.height * quantity;
  });

  // Convert ounces to pounds
  const weightInPounds = totalWeight / 16;
  
  // Ensure minimum package size
  const packageDetails: PackageDetails = {
    length: Math.max(maxLength, 6),
    width: Math.max(maxWidth, 6),
    height: Math.max(totalHeight, 2),
    weight: Math.max(weightInPounds, 0.1), // Minimum 0.1 lb
    distance_unit: 'in',
    mass_unit: 'lb'
  };

  logger.info('Calculated package details', {
    items: items.length,
    totalWeight: `${totalWeight} oz (${weightInPounds.toFixed(2)} lb)`,
    dimensions: `${packageDetails.length}x${packageDetails.width}x${packageDetails.height} in`
  });

  return packageDetails;
}

export const getShippoRatesV2 = functions.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      // Only allow POST requests
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const {
        toAddress,
        items,
        connectedAccountId
      }: ShippoRatesRequestV2 = req.body;

      // Validate required fields
      if (!toAddress || !items || items.length === 0) {
        res.status(400).json({
          error: 'Missing required fields',
          message: 'toAddress and items are required'
        });
        return;
      }

      // Validate toAddress fields
      const requiredAddressFields = ['street1', 'city', 'state', 'zip', 'country'];
      for (const field of requiredAddressFields) {
        if (!toAddress[field as keyof ShippingAddress]) {
          res.status(400).json({
            error: 'Invalid address',
            message: `Missing required address field: ${field}`
          });
          return;
        }
      }

      // Get seller address (origin)
      const fromAddress = await getSellerAddress(connectedAccountId);
      
      // Calculate package details from cart items
      const packageDetails = calculatePackageDetails(items);
      const packages = [packageDetails];

      logger.info('Creating shipment for rate calculation', {
        fromCity: fromAddress.city,
        fromState: fromAddress.state,
        toCity: toAddress.city,
        toState: toAddress.state,
        packageCount: packages.length,
        connectedAccountId
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
          name: toAddress.name || 'Customer',
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
          distance_unit: pkg.distance_unit,
          mass_unit: pkg.mass_unit
        })),
        async: false
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

      // Format rates for frontend
      const formattedRates: ShippingRate[] = shipment.rates
        .filter((rate: any) => rate.amount && rate.currency)
        .map((rate: any) => {
          const amount = Math.round(parseFloat(rate.amount) * 100); // Convert to cents
          
          return {
            id: rate.object_id,
            display_name: `${rate.provider} ${rate.servicelevel.name}`,
            amount,
            currency: rate.currency.toUpperCase(),
            delivery_estimate: rate.estimated_days ? {
              minimum: { unit: 'business_day', value: rate.estimated_days },
              maximum: { unit: 'business_day', value: rate.estimated_days + 1 }
            } : undefined,
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

      // Calculate order total for free shipping logic
      const orderTotal = items.reduce((total, item) => {
        return total + (item.price * (item.quantity || 1));
      }, 0);

      const freeShippingThreshold = 50; // $50 free shipping threshold
      const qualifiesForFreeShipping = orderTotal >= freeShippingThreshold;

      logger.info('Shipping rates retrieved successfully', {
        rateCount: formattedRates.length,
        shipmentId: shipment.object_id,
        orderTotal,
        qualifiesForFreeShipping
      });

      res.status(200).json({
        success: true,
        rates: formattedRates,
        qualifies_for_free_shipping: qualifiesForFreeShipping,
        free_shipping_threshold: freeShippingThreshold,
        order_total: orderTotal,
        connected_account_id: connectedAccountId,
        package_info: {
          weight: packageDetails.weight,
          dimensions: `${packageDetails.length}x${packageDetails.width}x${packageDetails.height} ${packageDetails.distance_unit}`
        },
        metadata: {
          from: `${fromAddress.city}, ${fromAddress.state}`,
          to: `${toAddress.city}, ${toAddress.state}`,
          package_count: packages.length,
          shipment_id: shipment.object_id
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