import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import Navbar from '../components/Navbar';
import { formatPrice } from '../utils/currency';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const ProductDetailsModal = ({ product, onClose, onAddToCart }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="flex flex-col md:flex-row">
          {/* Product Image */}
          <div className="md:w-1/2 mb-4 md:mr-8">
            <img 
              src={product.image_url || '/default-product.jpg'} 
              alt={product.name} 
              className="w-full h-auto rounded-lg object-cover"
            />
          </div>
          
          {/* Product Details */}
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
            <p className="text-gray-600 mb-4">{product.description}</p>
            
            <div className="mb-4">
              <span className="text-xl font-semibold text-green-700">
                {formatPrice(product.price)}
              </span>
              {product.stock <= 5 && (
                <span className="ml-2 text-red-500 text-sm">
                  Only {product.stock} left in stock!
                </span>
              )}
            </div>
            
            <div className="mb-4">
              <strong>Category:</strong> {product.category}
            </div>
            
            <button 
              onClick={() => onAddToCart(product)}
              disabled={product.stock === 0}
              className={`w-full py-2 rounded-md text-white font-semibold ${
                product.stock > 0 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState({
    category: '',
    stock: true
  });
  const [sortBy, setSortBy] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useCart();

  // Fetch categories from database
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('name');
      
      if (error) throw error;
      setCategories(data.map(cat => cat.name));
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [filter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Base query to fetch products
      let query = supabase
        .from('products')
        .select('*');

      // Apply stock filter
      if (filter.stock) {
        query = query.gt('stock', 0);
      }

      // Apply category filter
      if (filter.category) {
        query = query.eq('category', filter.category);
      }

      const { data, error } = await query;

      if (error) throw error;

      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = (products) => {
    return products.filter(product => {
      const categoryMatch = !filter.category || product.category === filter.category;
      return categoryMatch;
    });
  };

  const sortProducts = (products) => {
    const sortedProducts = [...products];
    switch (sortBy) {
      case 'price-asc':
        return sortedProducts.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sortedProducts.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return sortedProducts;
    }
  };

  const handleReset = () => {
    setFilter({
      category: '',
      stock: true
    });
    setSortBy('name-asc');
  };

  const handleAddToCart = (product) => {
    // Prevent adding out-of-stock products
    if (product.stock > 0) {
      addToCart(product);
      toast.success(
        <div className="flex items-center">
          <span className="font-medium">{product.name}</span>
          <span className="ml-2">added to cart!</span>
        </div>
      );
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseProductDetails = () => {
    setSelectedProduct(null);
  };

  const filteredAndSortedProducts = sortProducts(filterProducts(products));

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Header */}
      <div className="bg-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Our Spice Collection</h1>
          <p className="text-lg">Discover our premium selection of spices from around the world</p>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Filters</h2>
            <button
              onClick={handleReset}
              className="text-green-600 hover:text-green-700"
            >
              Reset All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filter.category}
                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Stock Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
              <select
                value={filter.stock}
                onChange={(e) => setFilter({ ...filter, stock: e.target.value === 'true' })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              >
                <option value="true">In Stock</option>
                <option value="false">All Products</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentProducts.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleProductClick(product)}
              >
                {/* Product Image */}
                <div className="relative h-48 w-full">
                  <img 
                    src={product.image_url || '/default-product.jpg'} 
                    alt={product.name} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 font-bold">{formatPrice(product.price)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent opening modal when adding to cart
                        handleAddToCart(product);
                      }}
                      disabled={product.stock === 0}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        product.stock > 0 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`mx-1 px-4 py-2 rounded-md ${
                  currentPage === pageNumber 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {pageNumber}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal 
          product={selectedProduct}
          onClose={handleCloseProductDetails}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
};
<script async type='module' src='https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js'></script>
<zapier-interfaces-chatbot-embed is-popup='true' chatbot-id='cm6htgghh0016lhc21svhtgs7'></zapier-interfaces-chatbot-embed>
export default Products;
