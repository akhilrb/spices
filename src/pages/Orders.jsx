import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

// Utility function for INR formatting
const formatInrPrice = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Pagination and Filtering States
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 5,
    totalItems: 0
  });

  // Items per page options
  const itemsPerPageOptions = [5, 10, 20, 50];

  const [filters, setFilters] = useState({
    status: '',
    dateRange: {
      from: null,
      to: null
    }
  });

  const [sorting, setSorting] = useState({
    field: 'created_at',
    direction: 'desc'
  });

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [
    user, 
    pagination.currentPage, 
    pagination.itemsPerPage, 
    filters.status, 
    filters.dateRange,
    sorting
  ]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Calculate pagination range
      const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
      const end = start + pagination.itemsPerPage - 1;

      // Base query
      let query = supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          shipping_address,
          city,
          pincode,
          mobile,
          created_at,
          cancel_reason,
          cancelled_at,
          order_items (
            quantity,
            price,
            products (
              name,
              image_url
            )
          )
        `, { count: 'exact' })
        .eq('user_id', user.id)
        .order(sorting.field, { ascending: sorting.direction === 'asc' });

      // Apply status filter
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Apply date range filter
      if (filters.dateRange.from) {
        query = query.gte('created_at', filters.dateRange.from);
      }
      if (filters.dateRange.to) {
        query = query.lte('created_at', filters.dateRange.to);
      }

      // Apply pagination
      const { data: ordersData, error, count } = await query.range(start, end);

      if (error) throw error;

      // Add serial number to orders
      const ordersWithSerialNo = ordersData.map((order, index) => ({
        ...order,
        serialNo: start + index + 1
      }));

      setOrders(ordersWithSerialNo);
      setPagination(prev => ({
        ...prev,
        totalItems: count || 0
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  const getOrderStatus = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openCancelModal = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    try {
      setCancellingOrder(selectedOrder.id);

      // Fetch order details to validate cancellation
      const { data: orderDetails, error: orderFetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_id,
            quantity,
            products (name)
          )
        `)
        .eq('id', selectedOrder.id)
        .single();

      if (orderFetchError) {
        console.error('Error fetching order details:', orderFetchError);
        toast.error('Failed to cancel order');
        return;
      }

      // Validate order status for cancellation
      if (!['pending', 'processing'].includes(orderDetails.status)) {
        toast.error('This order cannot be cancelled');
        return;
      }

      // Prepare stock restoration
      const stockRestorePromises = orderDetails.order_items.map(item => 
        supabase.rpc('increment_product_stock', {
          product_id: item.product_id,
          quantity_to_add: item.quantity
        })
      );

      // Restore stock
      await Promise.all(stockRestorePromises);

      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled', 
          cancel_reason: cancelReason || 'Cancelled by customer',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', selectedOrder.id);

      if (updateError) throw updateError;

      // Refresh orders and close modal
      await fetchOrders();
      setShowCancelModal(false);
      setCancelReason('');
      toast.success('Order cancelled successfully');
    } catch (error) {
      console.error('Order cancellation error:', error);
      toast.error('Failed to cancel order');
    } finally {
      setCancellingOrder(null);
    }
  };

  const handleSort = (field) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          
          {/* Filters and Sorting */}
          <div className="flex space-x-4 items-center">
            {/* Items per Page Selector */}
            <div className="flex items-center space-x-2">
              <label htmlFor="itemsPerPage" className="text-sm text-gray-700">
                Items per page:
              </label>
              <select
                id="itemsPerPage"
                value={pagination.itemsPerPage}
                onChange={(e) => setPagination(prev => ({
                  ...prev, 
                  itemsPerPage: parseInt(e.target.value),
                  currentPage: 1 // Reset to first page when changing items per page
                }))}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {itemsPerPageOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Date Range Filters */}
            <div className="flex space-x-2">
              <input
                type="date"
                value={filters.dateRange.from || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  dateRange: { ...prev.dateRange, from: e.target.value }
                }))}
                className="px-3 py-2 border rounded-md"
              />
              <input
                type="date"
                value={filters.dateRange.to || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  dateRange: { ...prev.dateRange, to: e.target.value }
                }))}
                className="px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">
              {filters.status || filters.dateRange.from || filters.dateRange.to 
                ? 'No orders match your current filters.' 
                : 'You haven\'t placed any orders yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="bg-white shadow rounded-lg overflow-hidden"
              >
                {/* Order Summary Row */}
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleOrderExpand(order.id)}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-500">
                      SL No: {order.serialNo}
                    </span>
                    <span className="font-medium text-gray-900">
                      Order #{order.id.slice(0, 8)}
                    </span>
                    <span className={getOrderStatus(order.status)}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </span>
                    <span className="font-bold text-gray-900">
                      {formatInrPrice(order.total_amount)}
                    </span>
                    <svg 
                      className={`w-5 h-5 transform transition-transform duration-200 ${
                        expandedOrderId === order.id ? 'rotate-180' : ''
                      }`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 9l-7 7-7-7" 
                      />
                    </svg>
                  </div>
                </div>

                {/* Expandable Order Details */}
                {expandedOrderId === order.id && (
                  <div className="p-4 border-t">
                    {/* Order Items */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-semibold">Order Items</h4>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => openCancelModal(order)}
                            disabled={cancellingOrder === order.id}
                            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 text-sm"
                          >
                            {cancellingOrder === order.id ? 'Cancelling...' : 'Cancel Order'}
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {order.order_items.map((item, index) => (
                          <div 
                            key={index} 
                            className="flex items-center justify-between border-b pb-2 last:border-b-0"
                          >
                            <div className="flex items-center space-x-4">
                              <img 
                                src={item.products.image_url} 
                                alt={item.products.name} 
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div>
                                <p className="font-medium">{item.products.name}</p>
                                <p className="text-sm text-gray-500">
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <span className="font-medium">
                              {formatInrPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Details */}
                    <div className="bg-gray-50 p-4 rounded">
                      <h4 className="text-lg font-semibold mb-2">Shipping Details</h4>
                      <p>{order.shipping_address}</p>
                      <p>{order.city} - {order.pincode}</p>
                      <p>Mobile: {order.mobile}</p>
                    </div>

                    {/* Cancellation Details (if applicable) */}
                    {order.status === 'cancelled' && order.cancel_reason && (
                      <div className="mt-4 bg-red-50 p-4 rounded">
                        <h4 className="text-lg font-semibold text-red-800 mb-2">
                          Cancellation Details
                        </h4>
                        <p className="text-red-700">
                          Reason: {order.cancel_reason}
                        </p>
                        {order.cancelled_at && (
                          <p className="text-red-700 text-sm">
                            Cancelled on: {formatDate(order.cancelled_at)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-700">
            Showing{' '}
            <span className="font-medium">
              {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(
                pagination.currentPage * pagination.itemsPerPage, 
                pagination.totalItems
              )}
            </span>{' '}
            of{' '}
            <span className="font-medium">{pagination.totalItems}</span>{' '}
            orders
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              disabled={pagination.currentPage >= Math.ceil(pagination.totalItems / pagination.itemsPerPage)}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Cancel Order Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Cancel Order</h2>
              <p className="mb-4">Are you sure you want to cancel this order?</p>
              
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Optional: Reason for cancellation"
                className="w-full p-2 border rounded mb-4"
                rows="3"
              />
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
                >
                  No, Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancellingOrder === selectedOrder.id}
                  className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
                >
                  {cancellingOrder === selectedOrder.id ? 'Cancelling...' : 'Yes, Cancel Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;