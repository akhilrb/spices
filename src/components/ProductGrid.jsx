import React from 'react';
import { useCart } from '../context/CartContext';

const ProductGrid = ({ products }) => {
  const { addToCart } = useCart();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {products.map((product) => {
        const isOutOfStock = product.stock === 0;

        return (
          <div 
            key={product._id} 
            className={`bg-white rounded-lg shadow-md overflow-hidden ${isOutOfStock ? 'opacity-50' : ''}`}
          >
            <div className="relative">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              {isOutOfStock && (
                <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-50">
                  <span className="text-white font-bold text-xl">Out of Stock</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-gray-600 text-sm">{product.description}</p>
              <div className="mt-2 flex items-center">
                <span className="text-red-500 font-bold">${product.price}</span>
                <div className="ml-2 flex items-center">
                  {[...Array(product.heatLevel)].map((_, i) => (
                    <span key={i} className="text-red-500">🌶️</span>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Origin: {product.origin}
                  {isOutOfStock && <span className="ml-2 text-red-500">(Out of Stock)</span>}
                </span>
                <button
                  onClick={() => !isOutOfStock && addToCart(product)}
                  disabled={isOutOfStock}
                  className={`
                    px-4 py-2 rounded transition
                    ${isOutOfStock 
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                    }
                  `}
                >
                  {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductGrid;