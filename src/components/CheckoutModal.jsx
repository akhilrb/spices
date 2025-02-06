import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../config/supabase';
import { formatPrice } from '../utils/currency';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CheckoutModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { cart, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    address: user?.user_metadata?.address || '',
    city: user?.user_metadata?.city || '',
    pincode: user?.user_metadata?.pincode || '',
    mobile: user?.user_metadata?.mobile || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.address.trim()) {
      toast.error('Please enter your shipping address');
      return false;
    }
    if (!formData.city.trim()) {
      toast.error('Please enter your city');
      return false;
    }
    if (!/^\d{6}$/.test(formData.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return false;
    }
    return true;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      // Comprehensive stock validation
      const stockValidationResults = await Promise.all(
        cart.map(async (item) => {
          // Fetch product with detailed error logging
          const { data: product, error: productError } = await supabase
            .from('products')
            .select('id, name, stock, price')
            .eq('id', item.id)
            .single();

          console.log('Product Fetch Result:', { 
            productId: item.id, 
            product, 
            requestedQuantity: item.quantity,
            productError 
          });

          if (productError) {
            console.error(`Error fetching product ${item.id}:`, productError);
            toast.error(`Error checking product ${item.name}`);
            return { valid: false, item, error: productError };
          }

          if (!product) {
            toast.error(`Product ${item.name} not found`);
            return { valid: false, item, error: 'Product not found' };
          }

          if (product.stock < item.quantity) {
            toast.error(`Insufficient stock for ${product.name}. Only ${product.stock} available.`);
            return { 
              valid: false, 
              item, 
              error: `Insufficient stock. Only ${product.stock} available.` 
            };
          }

          return { valid: true, item, product };
        })
      );

      // Check validation results
      const invalidItems = stockValidationResults.filter(result => !result.valid);
      if (invalidItems.length > 0) {
        setLoading(false);
        return;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: getCartTotal(),
          shipping_address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          mobile: formData.mobile,
          status: 'processing'
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        toast.error('Failed to create order');
        setLoading(false);
        return;
      }

      // Prepare order items and stock updates
      const orderItemsToInsert = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      // Batch stock update with detailed logging
      const stockUpdateResults = await Promise.all(
        cart.map(async (item) => {
          console.log(`Attempting to decrement stock for product ${item.id}, quantity: ${item.quantity}`);
          
          const { data, error } = await supabase.rpc('decrement_product_stock', {
            product_id: item.id,
            quantity_to_subtract: item.quantity
          });

          console.log('Stock Update Result:', { 
            productId: item.id, 
            productName: item.name,
            stockUpdateSuccessful: data === true,
            error 
          });

          return {
            productId: item.id,
            productName: item.name,
            stockUpdateSuccessful: data === true,
            error
          };
        })
      );

      // Check for stock update failures
      const failedStockUpdates = stockUpdateResults.filter(result => !result.stockUpdateSuccessful);
      
      if (failedStockUpdates.length > 0) {
        // Rollback order creation
        await supabase.from('orders').delete().eq('id', order.id);

        // Detailed error message
        const failedProductNames = failedStockUpdates.map(result => result.productName).join(', ');
        console.error('Stock Update Failures:', failedStockUpdates);
        toast.error(`Stock update failed for: ${failedProductNames}`);
        
        setLoading(false);
        return;
      }

      // Insert order items
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (orderItemsError) {
        console.error('Order items creation error:', orderItemsError);
        toast.error('Failed to create order items');
        setLoading(false);
        return;
      }

      // Clear cart and close modal
      clearCart();
      onClose();
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Comprehensive checkout error:', error);
      toast.error('An unexpected error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (orderSuccess && orderDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-600">Order ID: #{orderDetails.orderId}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Order Summary</h3>
            <div className="space-y-2">
              {orderDetails.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t pt-2 font-bold">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>{formatPrice(orderDetails.total)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Shipping Details</h3>
            <div className="text-sm text-gray-600">
              <p>{orderDetails.shipping.address}</p>
              <p>{orderDetails.shipping.city} - {orderDetails.shipping.pincode}</p>
              <p>Mobile: {orderDetails.shipping.mobile}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/products')}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-300"
            >
              Continue Shopping
            </button>
            <button
              onClick={onClose}
              className="w-full border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Checkout</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Order Summary</h3>
          <div className="space-y-2">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name} × {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t pt-2 font-bold">
              <div className="flex justify-between">
                <span>Total:</span>
                <span>{formatPrice(getCartTotal())}</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleCheckout} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Mobile Number
            </label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              pattern="[0-9]{10}"
              placeholder="Enter 10-digit mobile number"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Shipping Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="3"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Pincode
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              pattern="[0-9]{6}"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-300 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : `Place Order (${formatPrice(getCartTotal())})`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal; 