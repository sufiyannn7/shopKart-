import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingBag, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Calendar, 
  MapPin, 
  CheckCircle,
  Truck,
  Box,
  ChevronRight,
  CreditCard
} from 'lucide-react';
import { fetchOrders, updateOrderStatus } from '../services/api';

const STATUS_PROGRESSION = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchOrders();
      if (data && data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError(err.response?.data?.message || 'Unable to load your orders.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Bonus Challenge: Progress order status
  const handleAdvanceStatus = async (orderId, currentStatus) => {
    const currentIndex = STATUS_PROGRESSION.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex >= STATUS_PROGRESSION.length - 1) return;

    const nextStatus = STATUS_PROGRESSION[currentIndex + 1];
    try {
      setUpdatingId(orderId);
      const res = await updateOrderStatus(orderId, nextStatus);
      if (res && res.success && res.order) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: nextStatus } : o))
        );
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Helper for status badge styling
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'badge-status-delivered';
      case 'SHIPPED':
        return 'badge-status-shipped';
      case 'CONFIRMED':
        return 'badge-status-confirmed';
      case 'PLACED':
      default:
        return 'badge-status-placed';
    }
  };

  return (
    <div className="orders-page-container">
      {/* Header */}
      <div className="orders-header-bar">
        <div>
          <h1 className="orders-page-title">
            <Package size={26} color="var(--snapdeal-red)" />
            My Orders
          </h1>
          <p className="orders-subtitle">
            View your order history, delivery details, and item snapshots
          </p>
        </div>
        {!loading && !error && orders.length > 0 && (
          <div className="orders-count-pill">
            <span>{orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Placed</span>
          </div>
        )}
      </div>

      {/* 1. LOADING STATE */}
      {loading && (
        <div className="state-container loading-state">
          <div className="state-spinner"></div>
          <p className="state-message">Loading your orders...</p>
        </div>
      )}

      {/* 2. ERROR STATE */}
      {!loading && error && (
        <div className="state-container error-state">
          <AlertCircle size={46} className="state-icon error-icon" />
          <h3 className="state-title">Unable to load orders</h3>
          <p className="state-message">{error}</p>
          <button onClick={loadOrders} className="btn-retry">
            <RefreshCw size={15} style={{ display: 'inline', marginRight: 6 }} />
            Try Again
          </button>
        </div>
      )}

      {/* 3. EMPTY STATE */}
      {!loading && !error && orders.length === 0 && (
        <div className="state-container empty-orders-state">
          <div className="empty-orders-circle">
            <Package size={48} color="#e40046" strokeWidth={1.8} />
          </div>
          <h3 className="empty-orders-title">You have not placed any orders yet.</h3>
          <p className="empty-orders-desc">
            When you complete a purchase, your order history and tracking will appear right here.
          </p>
          <Link to="/products" className="btn-start-shopping">
            <ShoppingBag size={18} style={{ display: 'inline', marginRight: 8 }} />
            Start Shopping
          </Link>
        </div>
      )}

      {/* 4. ORDERS LIST (Task 8 & 16) */}
      {!loading && !error && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => {
            const formattedDate = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'Recent Order';

            const statusIdx = STATUS_PROGRESSION.indexOf(order.status);

            return (
              <div key={order._id} className="order-history-card">
                {/* Order Top Bar */}
                <div className="order-card-header">
                  <div className="order-header-left">
                    <span className="order-num-label">Order #{order._id}</span>
                    <span className="order-date-label">
                      <Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />
                      {formattedDate}
                    </span>
                  </div>

                  <div className="order-header-right">
                    <span className={`order-status-badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status || 'PLACED'}
                    </span>
                    <span className="order-payment-badge">
                      <CreditCard size={12} style={{ display: 'inline', marginRight: 4 }} />
                      {order.paymentStatus || 'PAID'}
                    </span>
                  </div>
                </div>

                {/* Bonus Status Progression Visual Stepper */}
                <div className="status-stepper-wrap">
                  {STATUS_PROGRESSION.map((step, idx) => {
                    const isComplete = statusIdx >= idx;
                    const isCurrent = statusIdx === idx;
                    return (
                      <div key={step} className={`step-item ${isComplete ? 'complete' : ''} ${isCurrent ? 'current' : ''}`}>
                        <div className="step-circle">
                          {isComplete ? <CheckCircle size={14} /> : idx + 1}
                        </div>
                        <span className="step-label">{step}</span>
                        {idx < STATUS_PROGRESSION.length - 1 && <div className="step-connector"></div>}
                      </div>
                    );
                  })}
                </div>

                {/* Order Items Snapshot */}
                <div className="order-items-wrapper">
                  <h4 className="order-items-heading">Items in this order:</h4>
                  <div className="order-items-sublist">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="order-item-snapshot-row">
                        <img 
                          src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'} 
                          alt={item.name} 
                          className="order-prod-thumb"
                        />
                        <div className="order-prod-details">
                          <span className="order-prod-name">{item.name}</span>
                          <span className="order-prod-meta">
                            ₹{item.price?.toLocaleString('en-IN')} × {item.quantity}
                          </span>
                        </div>
                        <div className="order-prod-subtotal">
                          ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping & Total Footer Bar */}
                <div className="order-card-footer">
                  <div className="order-shipping-summary">
                    {order.shippingAddress && (
                      <p>
                        <MapPin size={14} style={{ display: 'inline', marginRight: 4, color: '#64748b' }} />
                        Deliver to: <strong>{order.shippingAddress.fullName}</strong>, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                      </p>
                    )}
                  </div>

                  <div className="order-footer-actions">
                    <div className="order-total-block">
                      <span className="total-label">Total Amount:</span>
                      <span className="total-value">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</span>
                    </div>

                    {/* Bonus: Advance Status Button */}
                    {statusIdx < STATUS_PROGRESSION.length - 1 && (
                      <button
                        onClick={() => handleAdvanceStatus(order._id, order.status)}
                        disabled={updatingId === order._id}
                        className="btn-advance-status"
                        title="Bonus Feature: Progress status progression"
                      >
                        {updatingId === order._id ? 'Updating...' : `Advance to ${STATUS_PROGRESSION[statusIdx + 1]}`}
                      </button>
                    )}

                    <Link to={`/order-success/${order._id}`} className="btn-view-order-details">
                      View Details
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
