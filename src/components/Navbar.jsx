import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CartIcon from './CartIcon';
import AuthModal from './AuthModal';
import ProfileModal from './ProfileModal';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const isAdmin = user?.user_metadata?.is_admin;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <>
      <div>
      <nav 
        className="bg-green-700 text-white shadow-lg sticky top-0 z-50"
        style={{
          backgroundImage: "url('https://source.unsplash.com/1600x900/?spices')",
          backgroundColor: "green", 
          backgroundBlendMode: "overlay"
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold">Spice Heaven</Link>
              <div className="hidden md:block ml-10">
                <Link to="/" className="px-3 py-2 hover:text-green-200">Home</Link>
                <a href="#about" className="px-3 py-2 hover:text-green-200">About</a>
                {!isAdmin && (
                  <Link to="/products" className="px-3 py-2 hover:text-green-200">Products</Link>
                )}
                <a href="#contact" className="px-3 py-2 hover:text-green-200">Contact</a>
              </div>
            </div>
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center">
                  <div className="relative mr-4" ref={profileMenuRef}>
                    <button 
                      className="flex items-center hover:text-green-200 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                      <span className="mr-2">Hello, {user.user_metadata?.name || 'User'}</span>
                      <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        style={{
                          transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0)',
                          transition: 'transform 0.2s'
                        }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div 
                      className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 transition-all duration-200 ${
                        showProfileMenu 
                          ? 'opacity-100 visible transform translate-y-0' 
                          : 'opacity-0 invisible transform -translate-y-2'
                      }`}
                    >
                      <button
                        onClick={() => {
                          setShowProfileModal(true);
                          setShowProfileMenu(false);
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Edit Profile
                      </button>
                      {!isAdmin && (
                        <Link
                          to="/orders"
                          onClick={() => setShowProfileMenu(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          My Orders
                        </Link>
                      )}
                      {user.user_metadata?.is_admin && (
                        <Link
                          to="/admin"
                          onClick={() => setShowProfileMenu(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => {
                          signOut();
                          setShowProfileMenu(false);
                        }}
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <button 
                    onClick={() => handleAuthClick('login')}
                    className="px-4 py-2 hover:text-green-200"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => handleAuthClick('register')}
                    className="bg-green-800 px-4 py-2 rounded hover:bg-green-900 ml-2"
                  >
                    Register
                  </button>
                </div>
              )}
              {!isAdmin && (
                <div className="ml-4">
                  <CartIcon />
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
        </div>
    </>
  );
};

export default Navbar; 
