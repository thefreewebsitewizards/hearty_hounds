import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { ShippingRate, ShippingAddress, CartItem, getShippoRates } from '../services/clientShipping';

interface ShippingSelectorProps {
  orderTotal: number;
  connectedAccountId: string;
  onShippingSelect: (rate: ShippingRate | null) => void;
  selectedShippingRate: ShippingRate | null;
  shippingAddress?: ShippingAddress;
  cartItems: CartItem[];
}

export interface ShippingSelectorRef {
  refreshRates: () => void;
}

const ShippingSelector = forwardRef<ShippingSelectorRef, ShippingSelectorProps>(
  ({ orderTotal, connectedAccountId, onShippingSelect, selectedShippingRate, shippingAddress, cartItems }, ref) => {
    const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasCalculated, setHasCalculated] = useState(false);
    const hasAutoSelected = useRef(false);

    const qualifiesForFreeShipping = orderTotal >= 75;

    const formatShippingAmount = (amount: number, currency: string) => {
      return `$${(amount / 100).toFixed(2)}`;
    };

    const formatDeliveryEstimate = (estimate: any) => {
      if (!estimate) return 'Standard delivery';
      
      if (estimate.days) {
        const { min, max } = estimate.days;
        if (min === max) {
          return `${min} business day${min !== 1 ? 's' : ''}`;
        }
        return `${min}-${max} business days`;
      }
      
      return 'Standard delivery';
    };

    const fetchShippingRates = async () => {
      if (!shippingAddress || !cartItems.length) {
        setShippingRates([]);
        setHasCalculated(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const response = await getShippoRates({
          toAddress: shippingAddress,
          items: cartItems,
          connectedAccountId
        });
        
        setShippingRates(response.rates);
        setHasCalculated(true);
        
        // Auto-select cheapest rate only if no rate is currently selected
         if (response.rates.length > 0 && !selectedShippingRate && !hasAutoSelected.current) {
           const cheapestRate = response.rates.reduce((prev: ShippingRate, current: ShippingRate) => 
             prev.amount < current.amount ? prev : current
           );
          onShippingSelect(cheapestRate);
          hasAutoSelected.current = true;
        }
      } catch (err) {
        console.error('Error fetching shipping rates:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch shipping rates');
        setShippingRates([]);
        setHasCalculated(false);
      } finally {
        setLoading(false);
      }
    };

    const refreshRates = () => {
      hasAutoSelected.current = false;
      setHasCalculated(false);
      onShippingSelect(null); // Clear current selection
      fetchShippingRates();
    };

    useImperativeHandle(ref, () => ({
      refreshRates
    }));

    useEffect(() => {
      fetchShippingRates();
    }, [shippingAddress, cartItems, connectedAccountId]);

    const handleRateSelection = (rate: ShippingRate) => {
      onShippingSelect(rate);
    };

    if (loading) {
      return (
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center animate-spin">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="font-patrick-hand-sc text-xl font-bold text-slate-800">
              🚚 Calculating Shipping
            </h3>
          </div>
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="font-patrick-hand text-primary-700 font-medium">
                Finding the best shipping rates for your order...
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (!hasCalculated && !shippingAddress) {
      return (
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-patrick-hand-sc text-xl font-bold text-slate-800">
              📍 Shipping Calculator
            </h3>
          </div>
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="font-patrick-hand text-primary-700 font-medium mb-2">
                Enter your shipping address above to see available shipping options
              </p>
              <p className="font-patrick-hand text-primary-600 text-sm">
                We'll calculate real-time shipping rates from multiple carriers
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-red-200 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-patrick-hand-sc text-xl font-bold text-slate-800">
              ⚠️ Shipping Issue
            </h3>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="font-patrick-hand text-red-700 text-sm font-medium mb-2">Unable to Calculate Shipping</p>
              <p className="font-patrick-hand text-red-600 text-xs leading-relaxed">{error}</p>
              <div className="mt-4">
                <button
                  onClick={refreshRates}
                  className="font-patrick-hand-sc px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm font-medium"
                >
                  🔄 Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (shippingRates.length === 0) {
      return (
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="font-patrick-hand-sc text-xl font-bold text-slate-800">
              📦 Shipping Options
            </h3>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h4 className="font-patrick-hand-sc text-lg font-bold text-slate-700 mb-2">No Shipping Options Found</h4>
              <p className="font-patrick-hand text-slate-600 text-sm leading-relaxed mb-4">
                We couldn't find shipping options for your address. Please check your address details and try again.
              </p>
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                <p className="font-patrick-hand text-primary-700 text-xs">
                  💡 Tip: Make sure your address is complete and accurate for the best shipping rates.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707.293l-2.414 2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <div>
            <h3 className="font-patrick-hand-sc text-xl font-bold text-slate-800">
              📦 Choose Shipping Option
            </h3>
            <p className="font-patrick-hand text-slate-600 text-sm">
              {shippingRates.length} option{shippingRates.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
        
        {qualifiesForFreeShipping && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-patrick-hand-sc text-green-700 font-bold text-sm">
                  🎉 Congratulations! Free Shipping Unlocked
                </p>
                <p className="font-patrick-hand text-green-600 text-xs">
                  Your order qualifies for complimentary shipping
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {shippingRates.map((rate, index) => {
            const isSelected = selectedShippingRate?.id === rate.id;
            
            return (
              <div
                key={rate.id}
                className={`group relative cursor-pointer transition-all duration-300 transform hover:scale-[1.02] rounded-xl p-4 ${
                  isSelected
                    ? 'ring-2 ring-primary-500 bg-gradient-to-r from-primary-50 to-accent-50 shadow-lg border-0'
                    : 'border border-slate-200 hover:border-primary-300 hover:bg-slate-50 hover:shadow-md'
                }`}
                onClick={() => handleRateSelection(rate)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`relative w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500 shadow-lg'
                        : 'border-slate-300 group-hover:border-primary-400'
                    }`}>
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-patrick-hand-sc font-bold text-slate-800 text-base">
                          {rate.display_name}
                        </h4>
                        {rate.amount === 0 && (
                          <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-sm animate-pulse">
                            FREE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-patrick-hand text-slate-600 text-sm">
                          {formatDeliveryEstimate(rate.delivery_estimate)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-patrick-hand-sc font-bold text-lg transition-colors duration-200 ${
                      rate.amount === 0 ? 'text-green-600' : 'text-slate-800'
                    }`}>
                      {rate.amount === 0 ? 'Free' : formatShippingAmount(rate.amount, rate.currency)}
                    </div>
                    {rate.amount > 0 && (
                      <p className="font-patrick-hand text-slate-500 text-xs mt-1">USD</p>
                    )}
                  </div>
                </div>
                
                {/* Selection indicator overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-accent-500/5 rounded-xl pointer-events-none"></div>
                )}
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-accent-500/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-3 p-2 bg-primary-50 border border-primary-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-3 h-3 text-primary-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-patrick-hand text-primary-700 text-xs">
              Shipping rates are calculated in real-time based on your delivery address and package dimensions using Shippo's shipping network.
            </p>
          </div>
        </div>
      </div>
    );
  }
);

export default ShippingSelector;