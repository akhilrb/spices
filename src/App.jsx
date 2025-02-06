import React, { lazy, Suspense } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import SupabaseTest from './components/SupabaseTest';
import AdminRoute from './components/AdminRoute';

// Lazy load components
const Products = lazy(() => import('./pages/Products'));
const Cart = lazy(() => import('./pages/Cart'));
const Orders = lazy(() => import('./pages/Orders'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const SalesDashboard = lazy(() => import('./pages/admin/SalesDashboard'));

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <div className="min-h-screen bg-white">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 2000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 2000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            <Route path="/cart" element={
              <>
                <Cart />
                <Footer />
              </>
            } />
            <Route path="/products" element={
              <>
                <Products />
                <Footer />
              </>
            } />
            <Route path="/orders" element={
              <>
                <Orders />
                <Footer />
              </>
            } />
            <Route path="/" element={
              <>
                <Navbar />
                <Banner />
                <About />
                <Contact />
                <Footer />
                <SupabaseTest />
              </>
            } />
            <Route path="/reset-password" element={
              <>
                <ResetPassword />
                <Footer />
              </>
            } />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminOrders />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/sales-dashboard"
              element={
                <AdminRoute>
                  <SalesDashboard />
                </AdminRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Suspense>
    </Router>
  );
}

export default App;