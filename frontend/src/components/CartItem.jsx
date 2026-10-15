import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2, Loader2, AlertTriangle, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart, actionLoadingId } = useCart();
  const [localError, setLocalError] = useState(null);

  const product = item.product || {};
  const quantity = item.quantity || 1;
  const isUpdating = actionLoadingId === product._id;
  const isMaxStock = quantity >= (product.stock || 0);
  const isMinQuantity = quantity <= 1;

  const handleIncrease = async () => {
    if (isUpdating || isMaxStock) return;
    try {
      setLocalError(null);
      await updateQuantity(product._id, quantity + 1);
    } catch (err) {
      setLocalError(err.message);
      setTimeout(() => setLocalError(null), 3000);
    }
  };

  const handleDecrease = async () => {
    if (isUpdating || isMinQuantity) return;
    try {
      setLocalError(null);
      await updateQuantity(product._id, quantity - 1);
    } catch (err) {
      setLocalError(err.message);
      setTimeout(() => setLocalError(null), 3000);
    }
  };

  const handleRemove = async () => {
    if (isUpdating) return;
    try {
      await removeFromCart(product._id);
    } catch (err) {
      setLocalError(err.message);
      setTimeout(() => setLocalError(null), 3000);
    }
  };

  const itemTotal = (product.price || 0) * quantity;

  return (
    <div className={`cart-item-row ${isUpdating ? 'row-updating' : ''}`}>
      {/* Product Image */}
      <div className="cart-item-img-wrap">
        <img 
          src={product.image} 
          alt={product.name} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
          }}
        />
      </div>

      {/* Product Info */}
      <div className="cart-item-details">
        <div className="cart-item-header">
          <Link to={`/products/${product._id}`} className="cart-item-title" title={product.name}>
            {product.name}
          </Link>
          <span className="cart-item-category">{product.category}</span>
        </div>

        <div className="cart-item-unit-price">
          Unit Price: <strong>₹{product.price?.toLocaleString('en-IN')}</strong>
        </div>

        {/* Stock warning if low stock */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="cart-low-stock-warning">
            <AlertTriangle size={13} style={{ display: 'inline', marginRight: 4 }} />
            Only {product.stock} units left in stock!
          </div>
        )}

        {/* Local Error feedback if stock limit reached */}
        {localError && (
          <div className="cart-item-error-toast">
            {localError}
          </div>
        )}

        {/* Actions Row: Quantity Controls & Remove */}
        <div className="cart-item-actions-bar">
          {/* Quantity Controls [-] Qty [+] */}
          <div className="cart-qty-controller">
            <button
              onClick={handleDecrease}
              disabled={isUpdating || isMinQuantity}
              className="btn-qty-control btn-minus"
              title={isMinQuantity ? 'Quantity cannot be below 1 (use Remove)' : 'Decrease quantity'}
            >
              <Minus size={14} />
            </button>

            <span className="qty-display-box">
              {isUpdating ? <Loader2 size={13} className="spin-animate" /> : quantity}
            </span>

            <button
              onClick={handleIncrease}
              disabled={isUpdating || isMaxStock}
              className="btn-qty-control btn-plus"
              title={isMaxStock ? `Maximum available stock is ${product.stock}` : 'Increase quantity'}
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={isUpdating}
            className="btn-cart-remove"
            title="Remove from Cart"
          >
            <Trash2 size={14} />
            <span>Remove</span>
          </button>

          <Link to={`/products/${product._id}`} className="btn-cart-view-link" title="View details">
            <Eye size={14} />
            <span>Details</span>
          </Link>
        </div>
      </div>

      {/* Item Total (Price * Quantity) */}
      <div className="cart-item-price-col">
        <span className="item-price-label">Item Total</span>
        <div className="item-total-amount">
          ₹{itemTotal.toLocaleString('en-IN')}
        </div>
        <span className="item-qty-calc">
          ₹{product.price?.toLocaleString('en-IN')} × {quantity}
        </span>
      </div>
    </div>
  );
};

export default CartItem;
