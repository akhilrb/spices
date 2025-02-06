import React from 'react';
import { useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const offices = [
    {
      city: 'New York',
      address: '123 Spice Street, Manhattan',
      phone: '+1 (212) 555-0123',
      email: 'nyc@spicehaven.com'
    },
    {
      city: 'London',
      address: '45 Flavour Lane, Westminster',
      phone: '+44 20 7123 4567',
      email: 'london@spicehaven.com'
    },
    {
      city: 'Mumbai',
      address: '789 Masala Road, Bandra West',
      phone: '+91 22 2345 6789',
      email: 'mumbai@spicehaven.com'
    }
  ];

  return (
    <footer className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {!isHomePage && (
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {offices.map((office, index) => (
              <div key={index} className="text-sm text-gray-600">
                <h4 className="font-semibold text-green-600 mb-1">{office.city}</h4>
                <p>{office.phone}</p>
                <p>{office.email}</p>
              </div>
            ))}
          </div>
        )}
        <div className="text-center text-gray-600 border-t border-gray-200 pt-8">
          <p>&copy; {new Date().getFullYear()} Spice Haven. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
