import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, loading, error, refreshCart, subtotal, cartCount, itemCount } = useCart();

  // Delivery charge rule (Free over ₹499, else ₹40)
  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 40;
  const grandTotal = subtotal + deliveryFee;

  return (
    <div className="cart-page-container">
      {/* Top Breadcrumb & Header */}
      <div className="cart-page-header">
        <div>
          <Link to="/products" className="cart-back-link">
            <ArrowLeft size={16} />
            <span>Continue Shopping</span>
          </Link>
          <h1 className="cart-page-title">
            <ShoppingCart size={26} color="var(--snapdeal-red)" />
            My Shopping Cart
          </h1>
          <p className="cart-page-subtitle">
            Review your selected products and verify quantities before checkout
          </p>
        </div>

        {!loading && !error && cart.length > 0 && (
          <div className="cart-stats-badge">
            <span>{itemCount} {itemCount === 1 ? 'Item' : 'Items'}</span>
            <span className="badge-separator">•</span>
            <span>{cartCount} Total {cartCount === 1 ? 'Unit' : 'Units'}</span>
          </div>
        )}
      </div>

      {/* 1. LOADING STATE (Task 17) */}
      {loading && (
        <div className="state-container loading-state">
          <div className="state-spinner"></div>
          <p className="state-message">Loading your cart...</p>
        </div>
      )}

      {/* 2. ERROR STATE (Task 17) */}
      {!loading && error && (
        <div className="state-container error-state">
          <AlertCircle size={46} className="state-icon error-icon" />
          <h3 className="state-title">Unable to load your cart.</h3>
          <p className="state-message">{error}</p>
          <button onClick={refreshCart} className="btn-retry">
            <RefreshCw size={15} style={{ display: 'inline', marginRight: 6 }} />
            Try Again
          </button>
        </div>
      )}

      {/* 3. EMPTY STATE (Task 17) */}
      {!loading && !error && cart.length === 0 && (
        <div className="state-container empty-cart-state">
          <div className="empty-cart-circle">
            <ShoppingCart size={46} color="#e40046" strokeWidth={1.8} />
          </div>
          <h3 className="empty-cart-title">Your cart is empty 🛒</h3>
          <p className="empty-cart-desc">
            Looks like you haven't added anything yet. Discover great deals in our catalog!
          </p>
          <Link to="/products" className="btn-browse-products">
            <ShoppingCart size={18} style={{ display: 'inline', marginRight: 8 }} />
            Browse Products
          </Link>
        </div>
      )}

      {/* 4. CART CONTENT & ORDER SUMMARY (Task 8 & 13) */}
      {!loading && !error && cart.length > 0 && (
        <div className="cart-main-grid">
          {/* Left Column: Cart Items List */}
          <div className="cart-items-column">
            <div className="cart-items-card">
              <div className="cart-items-header-bar">
                <span>Products in Cart ({cart.length})</span>
                <span className="cart-price-col-header">Subtotal</span>
              </div>

              <div className="cart-items-list">
                {cart.map((item) => (
                  <CartItem key={item.product?._id || item._id} item={item} />
                ))}
              </div>
            </div>

            {/* Free Shipping Progress Indicator */}
            <div className="free-shipping-card">
              <div className="shipping-icon-wrap">
                <Truck size={20} color="#15803d" />
              </div>
              <div>
                {subtotal >= 499 ? (
                  <p className="free-shipping-text success">
                    🎉 <strong>Congratulations!</strong> You have unlocked <strong>FREE Standard Delivery</strong>!
                  </p>
                ) : (
                  <p className="free-shipping-text">
                    Add <strong>₹{(499 - subtotal).toLocaleString('en-IN')}</strong> more to get <strong>FREE Delivery</strong>!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (Task 13) */}
          <div className="cart-summary-column">
            <div className="order-summary-card">
              <h2 className="summary-title">Order Summary</h2>

              <div className="summary-details-list">
                <div className="summary-line">
                  <span>Total Items</span>
                  <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                </div>

                <div className="summary-line">
                  <span>Total Units</span>
                  <span>{cartCount} {cartCount === 1 ? 'unit' : 'units'}</span>
                </div>

                <div className="summary-line">
                  <span>Price Subtotal</span>
                  <span className="summary-amount">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="summary-line">
                  <span>Delivery Charges</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="free-delivery-badge">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-line total-line">
                  <span>Total Payable Amount</span>
                  <span className="grand-total-amount">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="btn-proceed-checkout"
              >
                <Lock size={17} />
                <span>Proceed to Checkout</span>
              </button>

              {/* Trust Guarantee Badges */}
              <div className="summary-trust-badges">
                <div className="trust-badge-row">
                  <ShieldCheck size={16} color="#15803d" />
                  <span>100% Safe and Secure Checkout</span>
                </div>
                <div className="trust-badge-row">
                  <CreditCard size={16} color="#64748b" />
                  <span>All Major Cards & UPI Supported</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
