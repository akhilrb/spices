import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { formatPrice } from '../utils/currency';
import { Link } from 'react-router-dom'; // Import Link for navigation

const About = () => {
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4); // Fetch only the latest 4 products

        if (error) throw error;
        setLatestProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchLatestProducts();
  }, []);

  return (
    <section id="about" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Spice Story
          </h2>
          <div className="w-24 h-1 bg-green-600 mx-auto"></div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-gray-600 leading-relaxed">
              At Spice Haven, we believe that every dish tells a story, and every spice plays a crucial role in that narrative. Our journey began with a simple passion for authentic flavors and has evolved into a mission to bring the world's finest spices to your kitchen.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We carefully source our spices from traditional farms and spice gardens around the world, ensuring that each product meets our strict quality standards. Our direct relationships with farmers not only guarantee the finest spices but also support sustainable farming practices.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">50+</div>
                <div className="text-sm text-gray-500">Unique Spices</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">20+</div>
                <div className="text-sm text-gray-500">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">1000+</div>
                <div className="text-sm text-gray-500">Happy Customers</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://source.unsplash.com/800x600/?spices,cooking"
              alt="Various colorful spices"
              className="rounded-lg"
            />
            <div className="absolute -bottom-6 -left-6 bg-green-600 text-white p-6 rounded-lg shadow-lg">
              <p className="text-lg font-semibold">
                "Quality spices are the foundation of exceptional cooking"
              </p>
            </div>
          </div>
        </div>
        <div className="mt-12 py-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Latest Arrivals</h3>
          <div className="product-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {latestProducts.map(product => (
              <div key={product.id} className="product-item bg-white rounded-lg shadow-md p-4">
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="rounded-lg min-h-[270px] object-cover mb-2" 
                />
                <h4 className="text-lg font-bold text-gray-900">{product.name}</h4>
                <p className="text-gray-600">{formatPrice(product.price)}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Link to="/products" className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;