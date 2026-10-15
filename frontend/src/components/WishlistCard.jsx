import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Trash2, Tag, CheckCircle2, AlertTriangle, ShoppingCart, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const WishlistCard = ({ product, onRemove }) => {
  const { addToCart, actionLoadingId } = useCart();
  const [removing, setRemoving] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);
  const isOutOfStock = product.stock <= 0;
  const isAddingToCart = actionLoadingId === product._id;

  const handleRemoveClick = async () => {
    if (removing) return;
    try {
      setRemoving(true);
      await onRemove(product._id);
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      setRemoving(false);
    }
  };

  const handleAddToCart = async () => {
    if (isAddingToCart || isOutOfStock) return;
    try {
      await addToCart(product._id);
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 2000);
    } catch (err) {
      alert(err.message || 'Unable to add to cart');
    }
  };

  return (
    <div className={`wishlist-card-item ${removing ? 'card-removing' : ''}`}>
      {/* Product Image */}
      <div className="wishlist-card-img-wrap">
        <img 
          src={product.image} 
          alt={product.name} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
          }}
        />
        <span className="product-category-badge">
          <Tag size={12} style={{ display: 'inline', marginRight: 4 }} />
          {product.category}
        </span>
      </div>

      {/* Product Content */}
      <div className="wishlist-card-content">
        <h3 className="wishlist-card-name" title={product.name}>
          {product.name}
        </h3>

        {/* Stock Status Indicator */}
        <div className="wishlist-stock-status">
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
        <div className="wishlist-card-price">
          ₹{product.price?.toLocaleString('en-IN')}
        </div>

        {/* Action Buttons: View Details, Add to Cart (optional), Remove */}
        <div className="wishlist-card-actions">
          <Link 
            to={`/products/${product._id}`} 
            className="btn-wishlist-view"
            title="View Product Details"
          >
            <Eye size={15} />
            View Details
          </Link>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAddingToCart}
            className={`btn-wishlist-cart ${addedNotice ? 'added' : ''}`}
            title={isOutOfStock ? 'Out of stock' : addedNotice ? 'Added to Cart!' : 'Add to Cart'}
          >
            {isAddingToCart ? (
              <Loader2 size={15} className="spin-animate" />
            ) : addedNotice ? (
              <CheckCircle2 size={15} color="#15803d" />
            ) : (
              <ShoppingCart size={15} />
            )}
          </button>

          <button 
            onClick={handleRemoveClick}
            disabled={removing}
            className="btn-wishlist-remove"
            title="Remove from Wishlist"
          >
            <Trash2 size={15} />
            {removing ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
