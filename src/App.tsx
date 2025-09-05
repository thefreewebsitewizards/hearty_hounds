import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Gallery = React.lazy(() => import('./pages/Gallery'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Policies = React.lazy(() => import('./pages/Policies'));
const OrderConfirmation = React.lazy(() => import('./pages/OrderConfirmation'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Admin = React.lazy(() => import('./pages/Admin'));
const OrderHistory = React.lazy(() => import('./pages/OrderHistory'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
          <div className="min-h-screen bg-neutral-50 flex flex-col">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/admin/*" element={
                  <ProtectedRoute requireAdmin={true}>
                    <Admin />
                  </ProtectedRoute>
                } />
                <Route path="/*" element={
                  <>
                    <Header />
                    <main className="flex-grow">
                      <Suspense fallback={<LoadingSpinner />}>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/gallery" element={<Gallery />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/product/:id" element={<ProductDetail />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/policies" element={<Policies />} />
                          <Route path="/order-confirmation" element={<OrderConfirmation />} />
                          <Route path="/orders" element={
                            <ProtectedRoute>
                              <OrderHistory />
                            </ProtectedRoute>
                          } />
                          <Route path="/login" element={<Login />} />
                          <Route path="/register" element={<Register />} />
                        </Routes>
                      </Suspense>
                    </main>
                    <Footer />
                  </>
                } />
              </Routes>
            </Suspense>
          </div>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            className="mt-16"
          />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
