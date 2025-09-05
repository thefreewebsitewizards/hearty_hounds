import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserOrders, Order } from '../services/firebase';
import { toast } from 'react-toastify';

const OrderHistory: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (currentUser) {
    
        setLoading(true);
        setError(null);
        try {
          const userOrders = await getUserOrders(currentUser.uid);
    
          setOrders(userOrders);
        } catch (error) {
          console.error('❌ Error fetching orders:', error);
          setError('Failed to load orders');
          toast.error('Failed to load orders');
        } finally {
          setLoading(false);
        }
      } else {
    
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-accent-100 text-accent-800';
      case 'paid':
        return 'bg-primary-100 text-primary-800';
      case 'processing':
        return 'bg-primary-100 text-primary-800';
      case 'shipped':
        return 'bg-primary-100 text-primary-800';
      case 'delivered':
        return 'bg-accent-100 text-accent-800';
      case 'cancelled':
        return 'bg-neutral-200 text-neutral-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending Payment';
      case 'paid':
        return 'Payment Received';
      case 'processing':
        return 'Preparing Order';
      case 'shipped':
        return 'Shipped Out';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-neutral-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">Order History</h1>
            <p className="text-neutral-600 mb-8">Please log in to view your order history.</p>
            <a
              href="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Order History</h1>
          <p className="text-neutral-600">Track your orders and view purchase history</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-accent-50 border border-accent-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-accent-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-accent-800">Error loading orders</h3>
                <div className="mt-2 text-sm text-accent-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {orders.length === 0 && !error ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-neutral-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No Orders Yet</h3>
            <p className="text-neutral-600 mb-6">You haven't placed any orders yet. Start shopping to see your order history here.</p>
            <a
              href="/gallery"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
                {/* Order Header */}
                <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900">Order #{order.id?.slice(-8).toUpperCase()}</h3>
                        <p className="text-sm text-neutral-600">
                          Placed on {order.createdAt ? (() => {
                            // Handle both Firestore Timestamp and serialized date
                            let date: Date;
                            if (order.createdAt && typeof order.createdAt.toDate === 'function') {
                              // Firestore Timestamp object
                              date = order.createdAt.toDate();
                            } else if (order.createdAt && typeof order.createdAt === 'object' && 'seconds' in order.createdAt) {
                              // Serialized Firestore Timestamp
                              date = new Date((order.createdAt as any).seconds * 1000);
                            } else {
                              // Regular date string or Date object
                              date = new Date(order.createdAt as any);
                            }
                            return date.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            });
                          })() : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <img
                            src={item.images?.[0] || '/placeholder-image.jpg'}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-neutral-900 truncate">{item.name}</h4>
                          <p className="text-sm text-neutral-600">Quantity: {item.quantity || 1}</p>
                        </div>
                        <div className="text-sm font-medium text-neutral-900">
                          ${item.price.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-neutral-600">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-lg font-semibold text-neutral-900">
                      Total: ${order.total.toFixed(2)}
                    </div>
                  </div>
                  {order.shippingAddress && (
                    <div className="mt-3 pt-3 border-t border-neutral-200">
                      <p className="text-sm text-neutral-600 font-medium">Shipping Address:</p>
                      <p className="text-sm text-neutral-600">
                        {order.shippingAddress.name}<br />
                        {order.shippingAddress.address}<br />
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;