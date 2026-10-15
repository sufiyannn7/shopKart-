import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Package, 
  ArrowRight, 
  ShoppingBag, 
  MapPin, 
  Clock, 
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { fetchOrderById } from '../services/api';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        const data = await fetchOrderById(id);
        if (data && data.success && data.order) {
          setOrder(data.order);
        } else {
          setError('Order details could not be found.');
        }
      } catch (err) {
        console.error('Failed to load confirmed order:', err);
        setError(err.response?.data?.message || 'Unable to retrieve order details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="order-success-container">
        <div className="state-container loading-state">
          <div className="state-spinner"></div>
          <p className="state-message">Confirming your order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-container">
      <div className="order-success-card">
        {/* Success Header Icon & Title */}
        <div className="success-icon-banner">
          <div className="success-icon-pulse">
            <CheckCircle2 size={54} color="#ffffff" />
          </div>
          <h1 className="success-title">Order Placed Successfully!</h1>
          <p className="success-subtitle">
            Thank you for shopping with ShopKart. Your payment has been verified and your order has been saved.
          </p>
        </div>

        {/* Order Meta Badges */}
        <div className="order-meta-strip">
          <div className="meta-box">
            <span className="meta-label">Order ID</span>
            <span className="meta-value order-id-code">#{order?._id || id}</span>
          </div>
          <div className="meta-box">
            <span className="meta-label">Payment Status</span>
            <span className="meta-badge-paid">
              <CreditCard size={13} style={{ display: 'inline', marginRight: 4 }} />
              {order?.paymentStatus || 'PAID'}
            </span>
          </div>
          <div className="meta-box">
            <span className="meta-label">Order Status</span>
            <span className="meta-badge-placed">{order?.status || 'PLACED'}</span>
          </div>
          <div className="meta-box">
            <span className="meta-label">Total Amount</span>
            <span className="meta-value-total">₹{(order?.totalAmount || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Order Details Body */}
        {order && (
          <div className="order-summary-breakdown">
            {/* Items Snapshot */}
            <div className="success-section">
              <h3 className="section-heading">
                <Package size={18} color="var(--snapdeal-red)" />
                Purchased Items ({order.items?.length || 0})
              </h3>
              <div className="success-items-list">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="success-item-card">
                    <img 
                      src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'} 
                      alt={item.name} 
                      className="item-snapshot-img"
                    />
                    <div className="item-snapshot-details">
                      <span className="item-snapshot-name">{item.name}</span>
                      <span className="item-snapshot-qty">
                        Quantity: <strong>{item.quantity}</strong> × ₹{item.price?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="item-snapshot-subtotal">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address Snapshot */}
            {order.shippingAddress && (
              <div className="success-section">
                <h3 className="section-heading">
                  <MapPin size={18} color="var(--snapdeal-red)" />
                  Delivery Address
                </h3>
                <div className="shipping-address-box">
                  <p className="shipping-recipient">
                    <strong>{order.shippingAddress.fullName}</strong> • {order.shippingAddress.phone}
                  </p>
                  <p className="shipping-street">{order.shippingAddress.addressLine1}</p>
                  <p className="shipping-locality">
                    {order.shippingAddress.city}, {order.shippingAddress.state} - <strong>{order.shippingAddress.pincode}</strong>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="success-actions-bar">
          <Link to="/orders" className="btn-success-view-orders">
            <Package size={18} />
            <span>View My Orders</span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/products" className="btn-success-continue-shopping">
            <ShoppingBag size={18} />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
