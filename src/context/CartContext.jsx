import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Handle user login/logout transitions
  useEffect(() => {
    if (user) {
      // When user logs in, merge local cart with server cart
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (localCart.length > 0) {
        // First load server cart
        loadUserCart().then(() => {
          // Then merge local items
          localCart.forEach(item => {
            addToCart(item, item.quantity);
          });
          // Clear local storage
          localStorage.removeItem('cart');
        });
      } else {
        loadUserCart();
      }
    } else {
      // When user logs out, keep the current cart in localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
      setCart([]);
    }
  }, [user?.id]); // Only run when user ID changes (login/logout)

  // Load cart from Supabase or localStorage
  useEffect(() => {
    if (user) {
      loadUserCart();
    } else {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    }
  }, [user]);

  // Save cart to localStorage (for non-authenticated users)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  const loadUserCart = async () => {
    try {
      setLoading(true);
      const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select(`
          quantity,
          products (
            id,
            name,
            price,
            description,
            image_url,
            origin
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      if (!cartItems) return;

      const formattedCart = cartItems.map(item => ({
        ...item.products,
        quantity: item.quantity
      }));

      setCart(formattedCart);
      return formattedCart;
    } catch (error) {
      console.error('Error loading cart:', error);
      // Silent fail for initial load
      return [];
    } finally {
      setLoading(false);
    }
  };

  const syncCartItem = async (productId, quantity) => {
    if (!user?.id) return;
    try {
      if (quantity > 0) {
        const { error } = await supabase
          .from('cart_items')
          .upsert(
            {
              user_id: user.id,
              product_id: productId,
              quantity,
            },
            {
              onConflict: 'user_id,product_id'
            }
          );
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
      throw error;
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!product?.id) return;
    try {
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === product.id);
        
        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          if (user?.id) {
            syncCartItem(product.id, newQuantity).catch(console.error);
          }
          return prevCart.map(item =>
            item.id === product.id
              ? { ...item, quantity: newQuantity }
              : item
          );
        }
        
        if (user?.id) {
          syncCartItem(product.id, quantity).catch(console.error);
        }
        return [...prevCart, { ...product, quantity }];
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to update cart');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      if (user?.id) {
        await syncCartItem(productId, 0);
      }
      setCart(prevCart => prevCart.filter(item => item.id !== productId));
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    
    try {
      if (user) {
        await syncCartItem(productId, quantity);
      }
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId
            ? { ...item, quantity }
            : item
        )
      );
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    try {
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
        if (error) throw error;
      }
      setCart([]);
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 