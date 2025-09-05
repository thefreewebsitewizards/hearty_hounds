import React, { useState, useEffect } from 'react';
import {
  formatShippingAmount,
  formatDeliveryEstimate,
  getShippoRates,
  ShippingRate,
  ShippingAddress,
  CartItem
} from '../services/clientShipping';
import { toast } from 'react-toastify';

interface ShippingRateManagerProps {
  connectedAccountId: string;
  onRatesUpdated?: () => void;
  shippingAddress?: ShippingAddress;
  cartItems?: CartItem[];
}

const ShippingRateManager: React.FC<ShippingRateManagerProps> = ({
  connectedAccountId,
  onRatesUpdated,
  shippingAddress,
  cartItems
}) => {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShippingRates();
  }, [connectedAccountId, shippingAddress, cartItems]);

  const loadShippingRates = async () => {
    try {
      setLoading(true);
      
      if (shippingAddress && cartItems) {
        // Always use Shippo rates
        const response = await getShippoRates({
          toAddress: shippingAddress,
          items: cartItems,
          connectedAccountId
        });
        setRates(response.rates || []);
      } else {
        setRates([]);
      }
    } catch (error) {
      console.error('Error loading shipping rates:', error);
      toast.error('Failed to load shipping rates');
    } finally {
      setLoading(false);
    }
  };



  const handleToggleActive = async (rateId: string, currentActive: boolean) => {
    // Shippo rates cannot be modified from this interface
    toast.info('Shippo rates are read-only and cannot be modified from this interface');
    return;
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading shipping rates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Shippo Shipping Rates</h3>
        <div className="text-sm text-gray-600">
          Rates calculated via Shippo API
        </div>
      </div>

      {/* Existing Rates */}
      {rates.length > 0 ? (
        <div className="grid gap-4">
          {rates.map((rate) => (
            <div
              key={rate.id}
              className={`p-4 border rounded-lg ${
                rate.active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{rate.display_name}</h4>
                  <p className="text-sm text-gray-600">
                    {formatShippingAmount(rate.amount, rate.currency)} • 
                    {formatDeliveryEstimate(rate.delivery_estimate)}
                  </p>
                  {rate.metadata?.description && (
                    <p className="text-xs text-gray-500 mt-1">{rate.metadata.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      rate.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {rate.active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-3 py-1 text-xs rounded bg-blue-100 text-blue-700">
                    Shippo Rate (Read-only)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No shipping rates available
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Add shipping address and cart items to calculate Shippo rates.
          </p>
        </div>
      )}


    </div>
  );
};

export default ShippingRateManager;