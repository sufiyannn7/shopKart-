import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, ShoppingCart, Tag, CheckCircle2, AlertTriangle, Heart, Loader2 } from 'lucide-react';
import { addToWishlist, removeFromWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, onAddToCart, isWishlisted = false, onWishlistChange, user }) => {
  const navigate = useNavigate();
  const { cart, addToCart: globalAddToCart, actionLoadingId } = useCart();
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const isOutOfStock = product.stock <= 0;
  const cartItem = cart.find(
    (item) => (item.product?._id || item.product) === product._id
  );
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const isAddingThis = addingCart || actionLoadingId === product._id;

  // Sync state if prop changes
  React.useEffect(() => {
    setWishlisted(isWishlisted);
  }, [isWishlisted]);

  // Wishlist Toggle Action
  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (savingWishlist) return;

    if (!user) {
      setErrorMsg('Please login to save items to your wishlist');
      setTimeout(() => setErrorMsg(null), 3500);
      return;
    }

    try {
      setSavingWishlist(true);
      setErrorMsg(null);

      if (!wishlisted) {
        await addToWishlist(product._id);
        setWishlisted(true);
        setToastMsg('♥ Added to Wishlist');
        if (onWishlistChange) onWishlistChange(product._id, true);
      } else {
        await removeFromWishlist(product._id);
        setWishlisted(false);
        setToastMsg('Removed from Wishlist');
        if (onWishlistChange) onWishlistChange(product._id, false);
      }

      setTimeout(() => setToastMsg(null), 2500);
    } catch (err) {
      console.error('Wishlist action failed:', err);
      if (err.response?.status === 409) {
        setWishlisted(true);
        setToastMsg('♥ In your Wishlist');
        setTimeout(() => setToastMsg(null), 2500);
      } else if (err.response?.status === 401) {
        setErrorMsg('Session expired. Please log in again.');
        setTimeout(() => {
          setErrorMsg(null);
          navigate('/login');
        }, 1500);
      } else {
        setErrorMsg(err.response?.data?.message || 'Unable to save product.');
        setTimeout(() => setErrorMsg(null), 3500);
      }
    } finally {
      setSavingWishlist(false);
    }
  };

  // Task 7: Add to Cart Action
  const handleAddToCartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingThis || isOutOfStock) return;

    if (!user) {
      setErrorMsg('Please login to add items to your cart');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    if (inCartQty >= product.stock) {
      setErrorMsg(`Maximum stock reached (${product.stock} units available)`);
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    try {
      setAddingCart(true);
      setErrorMsg(null);
      await globalAddToCart(product._id);
      setToastMsg(`🛒 Added to Cart (${inCartQty + 1})`);
      setTimeout(() => setToastMsg(null), 2500);
      if (onAddToCart) onAddToCart(product);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to add to cart.');
      setTimeout(() => setErrorMsg(null), 3500);
    } finally {
      setAddingCart(false);
    }
  };

  return (
    <div className="product-card-item">
      {/* Product Image and Floating Heart */}
      <div className="product-card-img-wrap">
        <img 
          src={product.image} 
          alt={product.name} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Top-Right Floating Wishlist Heart */}
        <button 
          onClick={handleWishlistClick}
          disabled={savingWishlist}
          className={`card-floating-heart-btn ${wishlisted ? 'active' : ''}`}
          title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          {savingWishlist ? (
            <Loader2 size={16} className="spin-animate" />
          ) : (
            <Heart 
              size={18} 
              fill={wishlisted ? '#e40046' : 'rgba(255,255,255,0.85)'} 
              color={wishlisted ? '#e40046' : '#64748b'} 
            />
          )}
        </button>

        <span className="product-category-badge">
          <Tag size={12} style={{ display: 'inline', marginRight: 4 }} />
          {product.category}
        </span>
      </div>

      {/* Floating feedback notification toast */}
      {toastMsg && (
        <div className="card-micro-toast success">
          {toastMsg}
        </div>
      )}

      {/* Floating error notification */}
      {errorMsg && (
        <div className="card-micro-toast error">
          {errorMsg}
        </div>
      )}

      {/* Product Content */}
      <div className="product-card-content">
        <h3 className="product-card-name" title={product.name}>
          {product.name}
        </h3>

        {/* Stock Status */}
        <div className="product-stock-status">
          {isOutOfStock ? (
            <span className="stock-out">
              <AlertTriangle size={13} style={{ display: 'inline', marginRight: 4 }} />
              Out of stock
            </span>
          ) : (
            <span className="stock-in">
              <CheckCircle2 size={13} style={{ display: 'inline', marginRight: 4 }} />
              {product.stock} units left
            </span>
          )}
        </div>

        {/* Price */}
        <div className="product-card-price">
          ₹{product.price.toLocaleString('en-IN')}
        </div>

        {/* Action Buttons: [ View Details ] [ ♡ Wishlist ] and [ Add to Cart ] */}
        <div className="product-card-bottom">
          <div className="product-card-btns">
            <Link 
              to={`/products/${product._id}`} 
              className="btn-view-details"
              title="View product details"
            >
              <Eye size={14} />
              <span>Details</span>
            </Link>

            {/* Wishlist Button */}
            <button
              onClick={handleWishlistClick}
              disabled={savingWishlist}
              className={`btn-card-wishlist ${wishlisted ? 'wishlisted' : ''}`}
              title={wishlisted ? 'In Wishlist' : 'Add to Wishlist'}
            >
              {savingWishlist ? (
                <Loader2 size={13} className="spin-animate" />
              ) : wishlisted ? (
                <Heart size={13} fill="#e40046" color="#e40046" />
              ) : (
                <Heart size={13} />
              )}
            </button>

            {/* Task 7: Add to Cart Action Button */}
            <button 
              onClick={handleAddToCartClick} 
              disabled={isOutOfStock || isAddingThis || inCartQty >= product.stock}
              className={`btn-card-add-cart ${inCartQty > 0 ? 'in-cart' : ''}`}
              title={
                isOutOfStock 
                  ? 'Out of stock' 
                  : inCartQty >= product.stock 
                  ? 'Maximum stock already in cart' 
                  : inCartQty > 0 
                  ? `In Cart: ${inCartQty} units (Click to add another)` 
                  : 'Add to Cart'
              }
            >
              {isAddingThis ? (
                <>
                  <Loader2 size={13} className="spin-animate" />
                  <span>Adding...</span>
                </>
              ) : inCartQty > 0 ? (
                <>
                  <ShoppingCart size={13} />
                  <span>Add Another ({inCartQty})</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={13} />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
