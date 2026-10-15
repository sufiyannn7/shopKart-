import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, RefreshCw, AlertCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import WishlistCard from '../components/WishlistCard';
import { fetchWishlist, removeFromWishlist } from '../services/api';

const Wishlist = ({ onAddToCart, onWishlistCountChange }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWishlist();
      if (data && data.success && Array.isArray(data.wishlist)) {
        setWishlist(data.wishlist);
        if (onWishlistCountChange) {
          onWishlistCountChange(data.wishlist.length);
        }
      } else {
        setWishlist([]);
        if (onWishlistCountChange) {
          onWishlistCountChange(0);
        }
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError("We couldn't load your wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromWishlist(productId);
      const updatedWishlist = wishlist.filter((item) => item._id !== productId);
      setWishlist(updatedWishlist);
      if (onWishlistCountChange) {
        onWishlistCountChange(updatedWishlist.length);
      }
      setNotification('Product removed from your wishlist.');
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed to remove product from wishlist:', err);
      alert('Unable to remove product from wishlist. Please try again.');
    }
  };

  return (
    <div className="wishlist-page-container">
      {/* Page Header */}
      <div className="wishlist-page-header">
        <div className="wishlist-header-left">
          <Link to="/products" className="wishlist-back-link">
            <ArrowLeft size={16} />
            <span>Continue Shopping</span>
          </Link>
          <h1 className="wishlist-page-title">
            <Heart size={26} className="wishlist-title-heart" fill="var(--snapdeal-red)" color="var(--snapdeal-red)" />
            My Wishlist
          </h1>
          <p className="wishlist-page-subtitle">
            Keep track of items you love and buy them whenever you are ready
          </p>
        </div>

        {!loading && !error && wishlist.length > 0 && (
          <div className="wishlist-count-badge">
            {wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved
          </div>
        )}
      </div>

      {/* Action Notification Toast */}
      {notification && (
        <div className="wishlist-toast-notice">
          <span>{notification}</span>
        </div>
      )}

      {/* 1. LOADING STATE */}
      {loading && (
        <div className="state-container loading-state">
          <div className="state-spinner"></div>
          <p className="state-message">Loading your wishlist...</p>
        </div>
      )}

      {/* 2. ERROR STATE */}
      {!loading && error && (
        <div className="state-container error-state">
          <AlertCircle size={46} className="state-icon error-icon" />
          <h3 className="state-title">Something went wrong.</h3>
          <p className="state-message">{error}</p>
          <button onClick={loadWishlist} className="btn-retry">
            <RefreshCw size={15} style={{ display: 'inline', marginRight: 6 }} />
            Try Again
          </button>
        </div>
      )}

      {/* 3. EMPTY STATE */}
      {!loading && !error && wishlist.length === 0 && (
        <div className="state-container empty-wishlist-state">
          <div className="empty-heart-circle">
            <Heart size={44} color="#e40046" strokeWidth={1.75} />
          </div>
          <h3 className="empty-wishlist-title">Your wishlist is empty</h3>
          <p className="empty-wishlist-desc">
            Save products you love and find them here later.
          </p>
          <Link to="/products" className="btn-browse-products">
            <ShoppingBag size={18} style={{ display: 'inline', marginRight: 8 }} />
            Browse Products
          </Link>
        </div>
      )}

      {/* 4. DYNAMIC WISHLIST PRODUCTS GRID */}
      {!loading && !error && wishlist.length > 0 && (
        <div className="wishlist-cards-grid">
          {wishlist.map((product) => (
            <WishlistCard 
              key={product._id} 
              product={product} 
              onRemove={handleRemoveItem}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
