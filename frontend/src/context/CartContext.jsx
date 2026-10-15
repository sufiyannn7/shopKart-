import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { fetchCart, addToCart as apiAddToCart, updateCartQuantity as apiUpdateQty, removeFromCart as apiRemoveFromCart } from '../services/api';

const CartContext = createContext(null);

export const CartProvider = ({ children, user }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null); // Tracks item being updated/removed

  // Refresh cart from backend
  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchCart();
      if (data && data.success && Array.isArray(data.cart)) {
        setCart(data.cart);
      } else {
        setCart([]);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
      // Don't show critical error on 401 unauthenticated
      if (err.response?.status !== 401) {
        setError(err.response?.data?.message || 'Unable to load your cart.');
      }
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load cart on authentication state change
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Task 2: Add product to cart
  const addToCart = async (productId) => {
    if (!user) {
      throw new Error('Please login to add items to your cart');
    }

    try {
      setActionLoadingId(productId);
      setError(null);
      const data = await apiAddToCart(productId);
      if (data && data.success && Array.isArray(data.cart)) {
        setCart(data.cart);
      } else {
        await refreshCart();
      }
      return data;
    } catch (err) {
      console.error('Error adding to cart:', err);
      const errorMsg = err.response?.data?.message || 'Unable to add product to cart.';
      throw new Error(errorMsg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Task 4: Update product quantity in cart
  const updateQuantity = async (productId, quantity) => {
    try {
      setActionLoadingId(productId);
      setError(null);
      const data = await apiUpdateQty(productId, quantity);
      if (data && data.success && Array.isArray(data.cart)) {
        setCart(data.cart);
      } else {
        await refreshCart();
      }
      return data;
    } catch (err) {
      console.error('Error updating quantity:', err);
      const errorMsg = err.response?.data?.message || 'Unable to update item quantity.';
      throw new Error(errorMsg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Task 5: Remove product from cart
  const removeFromCart = async (productId) => {
    try {
      setActionLoadingId(productId);
      setError(null);
      const data = await apiRemoveFromCart(productId);
      if (data && data.success && Array.isArray(data.cart)) {
        setCart(data.cart);
      } else {
        await refreshCart();
      }
      return data;
    } catch (err) {
      console.error('Error removing from cart:', err);
      const errorMsg = err.response?.data?.message || 'Unable to remove item from cart.';
      throw new Error(errorMsg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Task 15 Derived Values (Computed directly from state without storing in MongoDB)
  // 1. Total cart units (e.g. Keyboard x 2 + Mouse x 1 = 3)
  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  }, [cart]);

  // 2. Subtotal in Rupees (price * quantity)
  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = Number(item.product?.price) || 0;
      const qty = Number(item.quantity) || 0;
      return total + (price * qty);
    }, 0);
  }, [cart]);

  // 3. Unique items count
  const itemCount = useMemo(() => cart.length, [cart]);

  // Task 5: Clear frontend cart state directly after verified payment
  const clearCartState = useCallback(() => {
    setCart([]);
  }, []);

  const value = {
    cart,
    cartItems: cart, // alias for spec compliance
    cartLoading: loading,
    loading,
    cartError: error,
    error,
    actionLoadingId,
    cartCount,
    subtotal,
    itemCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart,
    clearCartState,
  };

  return (
    <CartContext.Provider value={value}>
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

export default CartContext;
