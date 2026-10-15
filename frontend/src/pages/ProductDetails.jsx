import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Tag, 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  ShieldCheck, 
  RotateCcw,
  AlertCircle,
  Heart,
  Loader2
} from 'lucide-react';
import { fetchProductById, addToWishlist, removeFromWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetails = ({ onAddToCart, user, wishlistIds = [], onWishlistChange }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart: globalAddToCart, actionLoadingId } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedNotice, setAddedNotice] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(wishlistIds.includes(id));
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [wishlistFeedback, setWishlistFeedback] = useState(null);

  const cartItem = cart.find((item) => (item.product?._id || item.product) === id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const isAddingThis = addingToCart || actionLoadingId === id;

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchProductById(id);
        if (data.success && data.product) {
          setProduct(data.product);
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        const msg = err.response?.data?.message || 'Something went wrong while loading product details.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0 || isAddingThis) return;
    if (!user) {
      setWishlistFeedback({ type: 'error', message: 'Please login to add items to your cart' });
      setTimeout(() => setWishlistFeedback(null), 3000);
      return;
    }
    if (inCartQty >= product.stock) {
      setWishlistFeedback({ type: 'error', message: `Maximum available stock reached (${product.stock} units)` });
      setTimeout(() => setWishlistFeedback(null), 3000);
      return;
    }

    try {
      setAddingToCart(true);
      await globalAddToCart(product._id);
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 2500);
      if (onAddToCart) onAddToCart(product);
    } catch (err) {
      setWishlistFeedback({ type: 'error', message: err.message || 'Unable to add to cart' });
      setTimeout(() => setWishlistFeedback(null), 3000);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="product-details-container">
        <div className="state-container loading-state">
          <div className="state-spinner"></div>
          <p className="state-message">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-container">
        <div className="state-container error-state">
          <AlertCircle size={44} className="state-icon error-icon" />
          <h3 className="state-title">Product Not Found</h3>
          <p className="state-message">{error || 'The requested product could not be located.'}</p>
          <Link to="/products" className="btn-retry">
            <ArrowLeft size={16} style={{ display: 'inline', marginRight: 6 }} />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const handleWishlistToggle = async () => {
    if (savingWishlist) return;

    if (!user) {
      setWishlistFeedback({ type: 'error', message: 'Please login to save items to your wishlist' });
      setTimeout(() => setWishlistFeedback(null), 3000);
      return;
    }

    try {
      setSavingWishlist(true);
      if (!wishlisted) {
        await addToWishlist(product._id);
        setWishlisted(true);
        setWishlistFeedback({ type: 'success', message: '♥ Product added to your wishlist!' });
        if (onWishlistChange) onWishlistChange(product._id, true);
      } else {
        await removeFromWishlist(product._id);
        setWishlisted(false);
        setWishlistFeedback({ type: 'success', message: 'Product removed from your wishlist.' });
        if (onWishlistChange) onWishlistChange(product._id, false);
      }
      setTimeout(() => setWishlistFeedback(null), 3000);
    } catch (err) {
      console.error('Wishlist action failed:', err);
      const msg = err.response?.data?.message || 'Unable to update wishlist. Please try again.';
      setWishlistFeedback({ type: 'error', message: msg });
      setTimeout(() => setWishlistFeedback(null), 3500);
    } finally {
      setSavingWishlist(false);
    }
  };

  // Sync wishlisted state when prop changes
  useEffect(() => {
    if (id && wishlistIds) {
      setWishlisted(wishlistIds.includes(id));
    }
  }, [id, wishlistIds]);

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="product-details-container">
      {/* Navigation Breadcrumb */}
      <div className="details-top-nav">
        <Link to="/products" className="btn-back-link">
          <ArrowLeft size={18} />
          Back to Product Catalog
        </Link>
        <span className="details-breadcrumb">
          ShopKart / {product.category} / <span className="current-item">{product.name}</span>
        </span>
      </div>

      {/* Main Product Details Card */}
      <div className="details-card-layout">
        {/* Left: Large Product Image */}
        <div className="details-image-section">
          <img 
            src={product.image} 
            alt={product.name}
            className="details-large-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';
            }}
          />
        </div>

        {/* Right: Product Information */}
        <div className="details-info-section">
          <div className="details-category-tag">
            <Tag size={14} style={{ display: 'inline', marginRight: 5 }} />
            {product.category}
          </div>

          <h1 className="details-product-name">{product.name}</h1>

          {/* Price */}
          <div className="details-price-box">
            <span className="details-price-label">Special Price</span>
            <div className="details-price-amount">
              ₹{product.price.toLocaleString('en-IN')}
            </div>
            <span className="details-taxes-note">Inclusive of all taxes</span>
          </div>

          {/* Stock Status Indicator */}
          <div className="details-stock-row">
            {isOutOfStock ? (
              <span className="stock-pill stock-out">
                <AlertTriangle size={15} style={{ display: 'inline', marginRight: 5 }} />
                Currently Out of Stock
              </span>
            ) : (
              <span className="stock-pill stock-in">
                <CheckCircle2 size={15} style={{ display: 'inline', marginRight: 5 }} />
                In Stock ({product.stock} units available)
              </span>
            )}
          </div>

          {/* Description */}
          <div className="details-description-box">
            <h3 className="section-label">Product Description</h3>
            <p className="details-description-text">{product.description}</p>
          </div>

          {/* Action Buttons: Add to Cart & Wishlist */}
          <div className="details-action-buttons" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAddingThis || inCartQty >= product.stock}
              className="btn-large-add-cart"
              style={{ flex: 1, minWidth: '180px' }}
            >
              {isAddingThis ? (
                <>
                  <Loader2 size={20} className="spin-animate" />
                  <span>Adding...</span>
                </>
              ) : inCartQty > 0 ? (
                <>
                  <ShoppingCart size={20} />
                  <span>Add Another ({inCartQty} in cart)</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            <button
              onClick={handleWishlistToggle}
              disabled={savingWishlist}
              className={`btn-large-wishlist ${wishlisted ? 'active' : ''}`}
              style={{
                flex: 1,
                minWidth: '180px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                padding: '0.95rem',
                borderRadius: '8px',
                fontSize: '1.05rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: wishlisted ? '2px solid #e40046' : '2px solid #cbd5e1',
                background: wishlisted ? '#fff1f2' : '#ffffff',
                color: wishlisted ? '#e40046' : '#334155',
                transition: 'all 0.2s'
              }}
            >
              {savingWishlist ? (
                <>
                  <Loader2 size={20} className="spin-animate" />
                  <span>⏳ Saving...</span>
                </>
              ) : wishlisted ? (
                <>
                  <Heart size={20} fill="#e40046" color="#e40046" />
                  <span>♥ In Wishlist</span>
                </>
              ) : (
                <>
                  <Heart size={20} />
                  <span>♡ Add to Wishlist</span>
                </>
              )}
            </button>
          </div>

          {/* Feedback notification toast */}
          {wishlistFeedback && (
            <div className={`add-cart-toast ${wishlistFeedback.type === 'error' ? 'toast-error' : ''}`} style={wishlistFeedback.type === 'error' ? { background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' } : {}}>
              {wishlistFeedback.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
              <span>{wishlistFeedback.message}</span>
            </div>
          )}

          {/* Quick confirmation alert */}
          {addedNotice && (
            <div className="add-cart-toast">
              <CheckCircle2 size={18} />
              <span>Item added to your shopping cart!</span>
            </div>
          )}

          {/* Trust badges */}
          <div className="trust-features-grid">
            <div className="trust-feature-item">
              <Truck size={18} className="trust-icon" />
              <span>Free Delivery on orders over ₹499</span>
            </div>
            <div className="trust-feature-item">
              <RotateCcw size={18} className="trust-icon" />
              <span>7 Days Easy Return Policy</span>
            </div>
            <div className="trust-feature-item">
              <ShieldCheck size={18} className="trust-icon" />
              <span>100% Genuine Verified Product</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
