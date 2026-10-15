import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderSuccess from './pages/OrderSuccess';
import { CartProvider } from './context/CartContext';
import { getMyProfile, fetchWishlist } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistIds, setWishlistIds] = useState([]);

  // Synchronize Wishlist count and IDs from backend
  const refreshWishlist = async () => {
    try {
      const data = await fetchWishlist();
      if (data && data.success && Array.isArray(data.wishlist)) {
        setWishlistCount(data.wishlist.length);
        setWishlistIds(data.wishlist.map((item) => (typeof item === 'object' ? item._id : item)));
      }
    } catch (err) {
      // If unauthenticated or failed, reset
      setWishlistCount(0);
      setWishlistIds([]);
    }
  };

  // Check initial session status when application loads
  const checkAuth = async () => {
    try {
      const customerData = await getMyProfile();
      setUser(customerData);
      await refreshWishlist();
    } catch (err) {
      setUser(null);
      setWishlistCount(0);
      setWishlistIds([]);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Update wishlist IDs & count when items are toggled
  const handleWishlistChange = (productId, isAdded) => {
    if (isAdded) {
      setWishlistIds((prev) => [...new Set([...prev, productId])]);
      setWishlistCount((prev) => prev + 1);
    } else {
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
      setWishlistCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleWishlistCountChange = (newCount) => {
    setWishlistCount(newCount);
  };

  if (checkingAuth) {
    return (
      <div className="app-container">
        <div className="loading-spinner" style={{ marginTop: '20vh' }}>
          <div className="spinner"></div>
          <p>Loading ShopKart...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <CartProvider user={user}>
        <div className="app-container">
          {/* Global Navigation Bar with Synchronized Wishlist & Cart Counters */}
          <Navbar 
            user={user} 
            setUser={(newUser) => {
              setUser(newUser);
              if (!newUser) {
                setWishlistCount(0);
                setWishlistIds([]);
              }
            }} 
            wishlistCount={wishlistCount}
          />

          {/* Application Routes */}
          <Routes>
            {/* Default Route: Redirect based on auth state */}
            <Route 
              path="/" 
              element={user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} 
            />

            {/* Registration Route */}
            <Route 
              path="/register" 
              element={user ? <Navigate to="/home" replace /> : <Register />} 
            />

            {/* Login Route */}
            <Route 
              path="/login" 
              element={
                user ? (
                  <Navigate to="/home" replace />
                ) : (
                  <Login onLoginSuccess={checkAuth} />
                )
              } 
            />

            {/* Protected Home Route */}
            <Route 
              path="/home" 
              element={
                <Home 
                  user={user} 
                  setUser={setUser} 
                />
              } 
            />

            {/* Product Listing Route */}
            <Route 
              path="/products" 
              element={
                <Products 
                  user={user}
                  wishlistIds={wishlistIds}
                  onWishlistChange={handleWishlistChange}
                />
              } 
            />

            {/* Dynamic Product Details Route */}
            <Route 
              path="/products/:id" 
              element={
                <ProductDetails 
                  user={user}
                  wishlistIds={wishlistIds}
                  onWishlistChange={handleWishlistChange}
                />
              } 
            />

            {/* Wishlist Route */}
            <Route 
              path="/wishlist" 
              element={
                user ? (
                  <Wishlist 
                    onWishlistCountChange={handleWishlistCountChange}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            {/* Shopping Cart Route */}
            <Route 
              path="/cart" 
              element={
                user ? (
                  <Cart />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            {/* Task 2: Checkout Route */}
            <Route 
              path="/checkout" 
              element={
                user ? (
                  <Checkout user={user} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            {/* Task 6: Order Confirmation Route */}
            <Route 
              path="/order-success/:id" 
              element={
                user ? (
                  <OrderSuccess />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            {/* Task 8: My Orders Route */}
            <Route 
              path="/orders" 
              element={
                user ? (
                  <Orders />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            {/* Single Order Details Route */}
            <Route 
              path="/orders/:id" 
              element={
                user ? (
                  <OrderSuccess />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            {/* Fallback Catch-all Route */}
            <Route 
              path="*" 
              element={<Navigate to="/" replace />} 
            />
          </Routes>
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
