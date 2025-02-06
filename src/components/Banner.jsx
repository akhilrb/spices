import React from 'react';
import { Link } from 'react-router-dom';

const Banner = () => {
  return (
    <div className="relative h-[500px] w-full">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://redbaron.co.in/akhil/ai/ausp/hero.jpg')",
          backgroundColor: "rgba(0, 0, 0, 0.5)", // Fallback color
          backgroundBlendMode: "overlay"
        }}
      />
      <div className="relative h-full flex items-center justify-center text-center">
        <div className="text-white max-w-3xl px-4">
          <h1 className="text-5xl font-bold mb-4">
            Discover the Garden of Spices 
          </h1>
          <p className="text-xl mb-8">
            Elevate your culinary experience with our carefully curated selection of authentic spices from around the globe. Gift your loved ones the aroma of nature.
          </p>
          <Link to="/products">
            <button className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition duration-300">
              Shop Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Banner; 
