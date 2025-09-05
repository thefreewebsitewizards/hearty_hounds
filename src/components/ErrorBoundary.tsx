import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from 'react-toastify';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Show user-friendly error message
    toast.error('Something went wrong. Please try refreshing the page.');
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center p-8">
            <div 
              className="bg-white p-8 rounded-lg shadow-lg"
              style={{
                borderRadius: '40px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="font-chewy text-2xl font-bold text-gray-900 mb-4">
                Oops! Something went wrong
              </h2>
              <p className="font-spartan text-gray-600 mb-6">
                We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-6 py-3 text-white font-bold rounded-full transition-all duration-300 hover:shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #A6BBA2 0%, #D9A273 100%)'
                  }}
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full px-6 py-3 text-gray-700 font-medium border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                >
                  Go to Homepage
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;