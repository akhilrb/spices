import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { CSVLink } from 'react-csv';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import AdminLayout from '../../components/admin/AdminLayout';

const SalesDashboard = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'Delivered');

      if (error) throw error;
      setSalesData(data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalSales = () => {
    return salesData.reduce((total, sale) => total + sale.amount, 0);
  };

  const calculateTotalOrders = () => {
    return salesData.length;
  };

  const bestSellingProducts = () => {
    const productSales = {};
    salesData.forEach(sale => {
      if (!productSales[sale.product_id]) {
        productSales[sale.product_id] = 0;
      }
      productSales[sale.product_id] += sale.amount;
    });
    const sortedProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]);
    return sortedProducts.slice(0, 5);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(salesData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
    XLSX.writeFile(workbook, "sales_report.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Sales Report", 20, 10);
    doc.autoTable({
      head: [['ID', 'Product ID', 'Amount', 'Date']],
      body: salesData.map(sale => [sale.id, sale.product_id, sale.amount, sale.date]),
    });
    doc.save("sales_report.pdf");
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold mb-6">Sales Dashboard</h1>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Total Sales: ₹{calculateTotalSales()}</h2>
              <h2 className="text-xl font-semibold">Total Orders: {calculateTotalOrders()}</h2>
            </div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Best Selling Products</h2>
              <ul>
                {bestSellingProducts().map((product, index) => (
                  <li key={index}>Product ID: {product[0]}, Sales: ₹{product[1]}</li>
                ))}
              </ul>
            </div>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2">ID</th>
                  <th className="py-2">Product ID</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((sale, index) => (
                  <tr key={index} className="text-center">
                    <td className="py-2">{sale.id}</td>
                    <td className="py-2">{sale.product_id}</td>
                    <td className="py-2">₹{sale.amount}</td>
                    <td className="py-2">{new Date(sale.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4">
              <CSVLink data={salesData} filename={"sales_report.csv"} className="bg-green-600 text-white py-2 px-4 rounded mr-2">
                Export as CSV
              </CSVLink>
              <button onClick={exportToExcel} className="bg-blue-600 text-white py-2 px-4 rounded mr-2">
                Export as Excel
              </button>
              <button onClick={exportToPDF} className="bg-red-600 text-white py-2 px-4 rounded">
                Export as PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SalesDashboard;
