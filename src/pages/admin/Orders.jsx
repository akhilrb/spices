import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { formatPrice } from '../../utils/currency';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    dateRange: 'all',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [sorting, setSorting] = useState({
    field: 'created_at',
    direction: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [filters, sorting, currentPage, itemsPerPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            price,
            products (
              name,
              image_url
            )
          )
        `)
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Date filtering
      if (filters.dateRange === 'custom' && filters.startDate && filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setDate(endDate.getDate() + 1);
        query = query
          .gte('created_at', new Date(filters.startDate).toISOString())
          .lt('created_at', endDate.toISOString());
      } else if (filters.dateRange !== 'all') {
        const now = new Date();
        let startDate;
        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            break;
        }
        if (startDate) {
          query = query.gte('created_at', startDate.toISOString());
        }
      }

      if (filters.search) {
        query = query.or(`
          shipping_address.ilike.%${filters.search}%,
          city.ilike.%${filters.search}%,
          mobile.ilike.%${filters.search}%,
          id.ilike.%${filters.search}%
        `);
      }

      // Apply sorting
      query = query.order(sorting.field, { ascending: sorting.direction === 'asc' });

      const { data, error } = await query;

      if (error) {
        console.error('Detailed Error:', error);
        throw error;
      }

      // Transform data to ensure consistent structure
      const processedOrders = data.map((order, index) => ({
        ...order,
        serialNo: (currentPage - 1) * itemsPerPage + index + 1,
        order_items: order.order_items.map(item => ({
          ...item,
          products: item.products // Ensure products are directly accessible
        }))
      }));

      setOrders(processedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, cancelReason = null) => {
    try {
      // First, fetch the current order details with its items
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
        .eq('id', orderId)
        .single();

      if (orderFetchError) {
        console.error('Error fetching order details:', orderFetchError);
        toast.error('Failed to update order status');
        return;
      }

      console.log('Order Details for Stock Management:', {
        orderId,
        currentStatus: orderDetails.status,
        newStatus,
        orderItems: orderDetails.order_items
      });

      // Determine stock adjustment based on order status
      const stockAdjustments = [];
      
      // If order is being cancelled (by admin or user)
      if (newStatus === 'cancelled' && 
          ['pending', 'processing'].includes(orderDetails.status)) {
        // Restore stock for each product in the order
        for (const item of orderDetails.order_items) {
          console.log(`Attempting to increment stock for product ${item.product_id}, quantity: ${item.quantity}`);
          
          stockAdjustments.push(
            supabase.rpc('increment_product_stock', { 
              product_id: item.product_id, 
              quantity_to_add: item.quantity 
            }).then(result => ({
              productId: item.product_id,
              productName: item.products?.name || 'Unknown Product',
              quantity: item.quantity,
              result,
              error: null
            })).catch(error => ({
              productId: item.product_id,
              productName: item.products?.name || 'Unknown Product',
              quantity: item.quantity,
              result: null,
              error
            }))
          );
        }
      }
      
      // If order is being processed from a non-processed state
      if (newStatus === 'processing' && orderDetails.status !== 'processing') {
        // Reduce stock for each product in the order
        for (const item of orderDetails.order_items) {
          console.log(`Attempting to decrement stock for product ${item.product_id}, quantity: ${item.quantity}`);
          
          stockAdjustments.push(
            supabase.rpc('decrement_product_stock', { 
              product_id: item.product_id, 
              quantity_to_subtract: item.quantity 
            }).then(result => ({
              productId: item.product_id,
              productName: item.products?.name || 'Unknown Product',
              quantity: item.quantity,
              result,
              error: null
            })).catch(error => ({
              productId: item.product_id,
              productName: item.products?.name || 'Unknown Product',
              quantity: item.quantity,
              result: null,
              error
            }))
          );
        }
      }

      // Wait for all stock adjustments
      if (stockAdjustments.length > 0) {
        const stockResults = await Promise.all(stockAdjustments);
        
        // Log detailed stock adjustment results
        console.log('Stock Adjustment Results:', stockResults);

        const stockErrors = stockResults.filter(result => result.error);
        
        if (stockErrors.length > 0) {
          console.error('Stock adjustment errors:', stockErrors);
          
          // Detailed error logging
          stockErrors.forEach(error => {
            toast.error(`Failed to update stock for ${error.productName}`);
          });

          return;
        }
      }

      // Update order status
      const { error: statusUpdateError } = await supabase
        .from('orders')
        .update({ 
          status: newStatus, 
          cancel_reason: newStatus === 'cancelled' ? (cancelReason || 'Cancelled by admin') : null,
          cancelled_at: newStatus === 'cancelled' ? new Date().toISOString() : null
        })
        .eq('id', orderId);

      if (statusUpdateError) {
        console.error('Error updating order status:', statusUpdateError);
        toast.error('Failed to update order status');
        return;
      }

      // Refresh orders after update
      await fetchOrders();
      
      // Show success toast
      toast.success(`Order ${newStatus} successfully`);
    } catch (error) {
      console.error('Comprehensive order status update error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleSort = (field) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1); // Reset to first page on items per page change
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(orders.length / itemsPerPage);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
              <p className="mt-1 text-sm text-gray-500">
                View and manage all customer orders
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="px-3 py-1 bg-gray-100 rounded-full">
                Total Orders: {orders.length}
              </span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                Pending: {orders.filter(order => order.status === 'pending').length}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                Delivered: {orders.filter(order => order.status === 'delivered').length}
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => {
                    setFilters(prev => ({
                      ...prev,
                      dateRange: e.target.value,
                      // Reset custom dates when changing range type
                      startDate: e.target.value === 'custom' ? prev.startDate : '',
                      endDate: e.target.value === 'custom' ? prev.endDate : ''
                    }))
                  }}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {filters.dateRange === 'custom' && (
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        startDate: e.target.value
                      }))}
                      max={filters.endDate || undefined}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        endDate: e.target.value
                      }))}
                      min={filters.startDate || undefined}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Search orders..."
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rows per page
                </label>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({
                    status: '',
                    dateRange: 'all',
                    startDate: '',
                    endDate: '',
                    search: ''
                  })}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('serialNo')}
                    >
                      SL No
                      {sorting.field === 'serialNo' && (
                        <span className="ml-1">{sorting.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('id')}
                    >
                      Order ID
                      {sorting.field === 'id' && (
                        <span className="ml-1">{sorting.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('created_at')}
                    >
                      Date
                      {sorting.field === 'created_at' && (
                        <span className="ml-1">{sorting.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Details
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('total_amount')}
                    >
                      Amount
                      {sorting.field === 'total_amount' && (
                        <span className="ml-1">{sorting.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      Status
                      {sorting.field === 'status' && (
                        <span className="ml-1">{sorting.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cancellation Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleOrderExpand(order.id)}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.serialNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <p>{order.shipping_address}</p>
                          <p>{order.city} - {order.pincode}</p>
                          <p>Mobile: {order.mobile}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(order.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${order.status === 'processing' ? 'bg-blue-100 text-blue-800' : ''}
                            ${order.status === 'shipped' ? 'bg-green-100 text-green-800' : ''}
                            ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : ''}
                            ${order.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                          `}>
                            {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.cancel_reason ? order.cancel_reason : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <select
                            className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                      {expandedOrder === order.id && (
                        <tr>
                          <td colSpan="8" className="px-6 py-4 bg-gray-50">
                            <div className="rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="text-sm font-semibold text-gray-900">Order Items</h3>
                                <span className="text-sm text-gray-500">
                                  Total Items: {order.order_items.length}
                                </span>
                              </div>
                              <div className="space-y-2">
                                {order.order_items.map((item, index) => (
                                  <div 
                                    key={index} 
                                    className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm"
                                  >
                                    <div className="flex items-center space-x-4">
                                      {item.products.image_url && (
                                        <img 
                                          src={item.products.image_url} 
                                          alt={item.products.name}
                                          className="w-12 h-12 object-cover rounded"
                                        />
                                      )}
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">
                                          {item.products.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          Quantity: {item.quantity}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {formatPrice(item.price)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 text-right">
                                <p className="text-sm font-medium text-gray-900">
                                  Subtotal: {formatPrice(order.total_amount)}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls at the Bottom */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;