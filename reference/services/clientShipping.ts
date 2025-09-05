// Client shipping management service for Stripe Connect

// Firebase Functions URLs
// Using production Firebase Functions v2 URLs
const FUNCTION_URLS = {
  getShippoRates: 'https://getshipporates-dri6av73tq-uc.a.run.app',
  createCheckoutSessionV2: 'https://createcheckoutsessionv2-dri6av73tq-uc.a.run.app',
  getCheckoutSessionV2: 'https://getcheckoutsessionv2-dri6av73tq-uc.a.run.app',
  testFunction: 'https://testfunction-dri6av73tq-uc.a.run.app'
  // Add other function URLs as needed
};

export interface ShippingRate {
  id: string;
  display_name: string;
  amount: number;
  currency: string;
  delivery_estimate?: {
    minimum: { unit: string; value: number };
    maximum: { unit: string; value: number };
  };
  metadata?: Record<string, string>;
  active?: boolean;
  // Shippo-specific fields
  carrier?: string;
  service?: string;
  estimated_days?: number;
  duration_terms?: string;
  // Additional Shippo fields for backend compatibility
  provider?: string;
  servicelevel?: {
    name: string;
  };
  object_id?: string;
  carrier_account?: string;
  test?: boolean;
  zone?: string;
  attributes?: any[];
}

export interface ShippingAddress {
  name?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  images: string[];
  description?: string;
  imageUrl?: string;
  quantity?: number;
  weight?: number; // Weight in ounces
  dimensions?: {
    length: number; // Length in inches
    width: number;  // Width in inches
    height: number; // Height in inches
  };
}



export interface CheckoutRatesResponse {
  rates: ShippingRate[];
  qualifies_for_free_shipping: boolean;
  free_shipping_threshold: number;
  order_total: number;
  connected_account_id?: string;
  package_info?: {
    weight: number;
    dimensions: string;
  };
}

export interface ShippoRatesRequest {
  toAddress: ShippingAddress;
  items: CartItem[];
  connectedAccountId?: string;
}



// Removed old Stripe shipping rate functions - using Shippo only

// Get real-time shipping rates from Shippo
export const getShippoRates = async ({
  toAddress,
  items,
  connectedAccountId
}: ShippoRatesRequest): Promise<CheckoutRatesResponse> => {
  const response = await fetch(FUNCTION_URLS.getShippoRates, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      toAddress,
      items,
      connectedAccountId
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to get Shippo rates: ${response.statusText}`);
  }
  
  return response.json();
};

// Helper function to format amount for display
export const formatShippingAmount = (amount: number, currency: string = 'usd'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount / 100);
};

// Helper function to format delivery estimate
export const formatDeliveryEstimate = (estimate?: {
  minimum: { unit: string; value: number };
  maximum: { unit: string; value: number };
}): string => {
  if (!estimate) return 'Standard delivery';
  
  const { minimum, maximum } = estimate;
  const unit = minimum.unit === 'business_day' ? 'business day' : minimum.unit;
  const unitPlural = minimum.unit === 'business_day' ? 'business days' : `${minimum.unit}s`;
  
  if (minimum.value === maximum.value) {
    return `${minimum.value} ${minimum.value === 1 ? unit : unitPlural}`;
  }
  
  return `${minimum.value}-${maximum.value} ${unitPlural}`;
};