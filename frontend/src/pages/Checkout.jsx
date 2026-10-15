import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  Truck, 
  CreditCard,
  Building,
  User,
  Phone,
  MapPin,
  Compass,
  FileText
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createPaymentOrder, verifyPayment } from '../services/api';

// Helper to dynamically load Razorpay Checkout script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = ({ user }) => {
  const navigate = useNavigate();
  const { cart, subtotal, cartCount, refreshCart, clearCartState } = useCart();

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Validation Errors
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [offlineModalData, setOfflineModalData] = useState(null);

  // Delivery calculation (matches Cart)
  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 40;
  const grandTotal = subtotal + deliveryFee;

  // Pre-fill user details if available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  // Form Field Change Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error as user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (globalError) setGlobalError(null);
  };

  // Task 3: Client-side Validation Rules
  const validateForm = () => {
    const errors = {};
    const { fullName, phone, addressLine1, city, state, pincode } = formData;

    if (!fullName || !fullName.trim()) {
      errors.fullName = 'Full Name is required';
    }

    if (!phone || !phone.trim()) {
      errors.phone = 'Phone Number is required';
    } else {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 10) {
        errors.phone = 'Phone number must contain at least 10 digits';
      }
    }

    if (!addressLine1 || !addressLine1.trim()) {
      errors.addressLine1 = 'Street Address is required';
    }

    if (!city || !city.trim()) {
      errors.city = 'City is required';
    }

    if (!state || !state.trim()) {
      errors.state = 'State is required';
    }

    if (!pincode || !pincode.trim()) {
      errors.pincode = 'Pincode is required';
    } else {
      const cleanPincode = pincode.replace(/[^0-9]/g, '');
      if (cleanPincode.length !== 6) {
        errors.pincode = 'Pincode must contain exactly 6 digits';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Complete Payment Verification Flow
  const handlePaymentVerification = async (verificationPayload) => {
    try {
      setIsSubmitting(true);
      const verifyRes = await verifyPayment(verificationPayload);

      if (verifyRes && verifyRes.success) {
        // Task 5: Clear cart only after verified payment
        clearCartState();
        await refreshCart();
        navigate(`/order-success/${verifyRes.order?._id || verificationPayload.shopKartOrderId}`);
      } else {
        setGlobalError(verifyRes?.message || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      const msg = err.response?.data?.message || 'Payment verification failed. Your cart was not cleared.';
      setGlobalError(msg);
    } finally {
      setIsSubmitting(false);
      setOfflineModalData(null);
    }
  };

  // Handle Form Submission and Trigger Razorpay Checkout
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setGlobalError(null);

    // 1. Client-side Form Validation
    const isValid = validateForm();
    if (!isValid) {
      setGlobalError('Please resolve the highlighted validation errors before proceeding.');
      return;
    }

    // 2. Validate Cart
    if (!cart || cart.length === 0) {
      setGlobalError('Your cart is empty. Please add items before checking out.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 3. Create ShopKart Pending Order & Razorpay Order
      const orderRes = await createPaymentOrder({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        addressLine1: formData.addressLine1.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim()
      });

      if (!orderRes || !orderRes.success) {
        throw new Error(orderRes?.message || 'Failed to initialize payment order');
      }

      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = orderRes;

      // 4. Check if Razorpay keys are real or placeholder test keys
      const isPlaceholderOrder = razorpayOrderId.startsWith('order_test_') || key === 'rzp_test_shopkart1234';

      if (isPlaceholderOrder) {
        // Open the Test Mode Payment Simulator directly without triggering Razorpay CDN rejection alert
        setOfflineModalData({
          shopKartOrderId,
          razorpayOrderId,
          amount,
          currency,
          key
        });
        setIsSubmitting(false);
        return;
      }

      // 5. Load Razorpay Checkout Script for real Razorpay test accounts
      const isScriptLoaded = await loadRazorpayScript();

      if (!isScriptLoaded || !window.Razorpay) {
        setOfflineModalData({
          shopKartOrderId,
          razorpayOrderId,
          amount,
          currency,
          key
        });
        setIsSubmitting(false);
        return;
      }

      // 6. Open Razorpay Standard Checkout
      const options = {
        key: key || 'rzp_test_shopkart1234',
        amount: amount,
        currency: currency || 'INR',
        name: 'ShopKart',
        description: 'ShopKart Order Payment',
        image: 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png',
        order_id: razorpayOrderId,
        handler: async function (response) {
          // Do NOT mark payment successful here directly.
          // Send signature to backend for HMAC verification.
          await handlePaymentVerification({
            shopKartOrderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
        },
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
          email: user?.email || 'customer@shopkart.com'
        },
        theme: {
          color: '#e40046'
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            console.log('Razorpay checkout dismissed by user');
          }
        }
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on('payment.failed', function (response) {
        console.error('Razorpay payment failed:', response.error);
        setIsSubmitting(false);
        setGlobalError(`Payment failed: ${response.error?.description || 'Transaction declined by bank'}. Your cart has not been cleared. Please try again.`);
      });

      paymentObject.open();

    } catch (err) {
      console.error('Error placing order:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Unable to create order. Please try again.';
      setGlobalError(errorMsg);
      setIsSubmitting(false);
    }
  };

  // If cart is empty, show empty state prompt
  if (!cart || cart.length === 0) {
    return (
      <div className="checkout-page-container">
        <div className="checkout-empty-state">
          <AlertCircle size={48} color="#e40046" />
          <h2>Your Cart is Empty</h2>
          <p>You cannot proceed to checkout without any products in your cart.</p>
          <Link to="/products" className="btn-browse-products">
            Browse Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-container">
      {/* Top Header & Breadcrumb */}
      <div className="checkout-header-bar">
        <Link to="/cart" className="checkout-back-link">
          <ArrowLeft size={16} />
          <span>Return to Cart</span>
        </Link>
        <div className="checkout-title-wrap">
          <h1 className="checkout-page-title">
            <Lock size={22} color="var(--snapdeal-red)" />
            Secure Checkout
          </h1>
          <p className="checkout-subtitle">
            Enter your shipping details and review your order to complete payment
          </p>
        </div>
      </div>

      {/* Global Error Banner */}
      {globalError && (
        <div className="checkout-error-banner">
          <AlertCircle size={20} className="error-banner-icon" />
          <div className="error-banner-content">
            <strong>Order Notice:</strong> {globalError}
          </div>
        </div>
      )}

      {/* Main Checkout Layout: Shipping Details + Order Summary */}
      <div className="checkout-main-grid">
        {/* Left Column: Shipping Details Form */}
        <div className="checkout-form-column">
          <div className="checkout-card">
            <div className="checkout-card-header">
              <MapPin size={20} color="var(--snapdeal-red)" />
              <h2>1. Delivery Address</h2>
            </div>

            <form onSubmit={handlePlaceOrder} id="checkout-form" className="checkout-form">
              {/* Full Name & Phone */}
              <div className="form-row-two-col">
                <div className={`form-field-group ${fieldErrors.fullName ? 'has-error' : ''}`}>
                  <label htmlFor="fullName">
                    Full Name <span className="req-star">*</span>
                  </label>
                  <div className="input-with-icon">
                    <User size={16} className="input-icon" />
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      placeholder="e.g. Aarav Sharma"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>
                  {fieldErrors.fullName && (
                    <span className="field-error-text">{fieldErrors.fullName}</span>
                  )}
                </div>

                <div className={`form-field-group ${fieldErrors.phone ? 'has-error' : ''}`}>
                  <label htmlFor="phone">
                    Phone Number <span className="req-star">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Phone size={16} className="input-icon" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>
                  {fieldErrors.phone && (
                    <span className="field-error-text">{fieldErrors.phone}</span>
                  )}
                </div>
              </div>

              {/* Address Line 1 */}
              <div className={`form-field-group ${fieldErrors.addressLine1 ? 'has-error' : ''}`}>
                <label htmlFor="addressLine1">
                  Street Address / House No. / Building <span className="req-star">*</span>
                </label>
                <div className="input-with-icon">
                  <Building size={16} className="input-icon" />
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    placeholder="e.g. 22 MG Road, Indiranagar"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
                {fieldErrors.addressLine1 && (
                  <span className="field-error-text">{fieldErrors.addressLine1}</span>
                )}
              </div>

              {/* City, State, Pincode */}
              <div className="form-row-three-col">
                <div className={`form-field-group ${fieldErrors.city ? 'has-error' : ''}`}>
                  <label htmlFor="city">
                    City <span className="req-star">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Compass size={16} className="input-icon" />
                    <input
                      type="text"
                      id="city"
                      name="city"
                      placeholder="e.g. Bengaluru"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>
                  {fieldErrors.city && (
                    <span className="field-error-text">{fieldErrors.city}</span>
                  )}
                </div>

                <div className={`form-field-group ${fieldErrors.state ? 'has-error' : ''}`}>
                  <label htmlFor="state">
                    State <span className="req-star">*</span>
                  </label>
                  <div className="input-with-icon">
                    <MapPin size={16} className="input-icon" />
                    <input
                      type="text"
                      id="state"
                      name="state"
                      placeholder="e.g. Karnataka"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>
                  {fieldErrors.state && (
                    <span className="field-error-text">{fieldErrors.state}</span>
                  )}
                </div>

                <div className={`form-field-group ${fieldErrors.pincode ? 'has-error' : ''}`}>
                  <label htmlFor="pincode">
                    Pincode <span className="req-star">*</span>
                  </label>
                  <div className="input-with-icon">
                    <FileText size={16} className="input-icon" />
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      placeholder="6 digits"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>
                  {fieldErrors.pincode && (
                    <span className="field-error-text">{fieldErrors.pincode}</span>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Payment Method Notice Card */}
          <div className="checkout-card payment-method-card">
            <div className="checkout-card-header">
              <CreditCard size={20} color="var(--snapdeal-red)" />
              <h2>2. Payment Gateway</h2>
            </div>
            <div className="payment-gateway-info">
              <div className="razorpay-badge-row">
                <span className="gateway-title">Razorpay Standard Checkout (Test Mode)</span>
                <span className="test-mode-pill">Test Mode Active</span>
              </div>
              <p className="gateway-desc">
                Supports UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and Net Banking. No real money will be charged.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="checkout-summary-column">
          <div className="checkout-card summary-card">
            <h2 className="summary-card-title">Order Summary ({cartCount} units)</h2>

            {/* Items Snapshot List */}
            <div className="summary-items-scroll">
              {cart.map((item) => {
                const prod = item.product || {};
                const itemTotal = (prod.price || 0) * (item.quantity || 1);
                return (
                  <div key={prod._id || item._id} className="checkout-item-row">
                    <div className="checkout-item-img-wrap">
                      <img 
                        src={prod.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'} 
                        alt={prod.name} 
                      />
                      <span className="item-qty-badge">{item.quantity}</span>
                    </div>
                    <div className="checkout-item-info">
                      <p className="checkout-item-name">{prod.name}</p>
                      <p className="checkout-item-pricing">
                        ₹{(prod.price || 0).toLocaleString('en-IN')} × {item.quantity}
                      </p>
                    </div>
                    <div className="checkout-item-total">
                      ₹{itemTotal.toLocaleString('en-IN')}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="summary-divider"></div>

            {/* Price Calculations */}
            <div className="checkout-calc-lines">
              <div className="checkout-line">
                <span>Items Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="checkout-line">
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

              <div className="checkout-line grand-total-line">
                <span>Total Amount</span>
                <span className="grand-total-val">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Submit / Place Order Button */}
            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className={`btn-place-order ${isSubmitting ? 'loading' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <div className="btn-spinner"></div>
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <Lock size={18} />
                  <span>Pay ₹{grandTotal.toLocaleString('en-IN')} with Razorpay</span>
                </>
              )}
            </button>

            {/* Trust Badges */}
            <div className="checkout-trust-box">
              <div className="trust-item">
                <ShieldCheck size={16} color="#15803d" />
                <span>100% Secured by Razorpay & ShopKart</span>
              </div>
              <div className="trust-item">
                <Truck size={16} color="#64748b" />
                <span>Fast & Reliable Tracked Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fallback Simulator Modal (used if external Razorpay script fails or for headless testing) */}
      {offlineModalData && (
        <div className="checkout-modal-backdrop">
          <div className="checkout-modal-content">
            <div className="modal-header-icon">
              <CreditCard size={42} color="#e40046" />
            </div>
            <h2>Razorpay Test Payment Simulation</h2>
            <p>
              ShopKart Pending Order <strong>#{offlineModalData.shopKartOrderId.substring(0, 10)}</strong> created!
            </p>
            <div className="modal-info-box">
              <p><strong>Razorpay Order ID:</strong> {offlineModalData.razorpayOrderId}</p>
              <p><strong>Amount:</strong> ₹{(offlineModalData.amount / 100).toLocaleString('en-IN')}</p>
              <p>Click below to verify the cryptographic payment signature on the backend and confirm the order.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => {
                  const testPaymentId = `pay_test_${Date.now()}`;
                  handlePaymentVerification({
                    shopKartOrderId: offlineModalData.shopKartOrderId,
                    razorpay_order_id: offlineModalData.razorpayOrderId,
                    razorpay_payment_id: testPaymentId,
                    razorpay_signature: 'test_fallback_sim'
                  });
                }}
                disabled={isSubmitting}
                className="btn-modal-close"
                style={{ background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <CheckCircle2 size={18} />
                <span>Pay ₹{(offlineModalData.amount / 100).toLocaleString('en-IN')} (Success)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOfflineModalData(null);
                  setIsSubmitting(false);
                  setGlobalError('Payment failed: Transaction cancelled by user. Your cart has not been cleared. Please try again.');
                }}
                className="btn-modal-close"
                style={{ background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <AlertCircle size={18} />
                <span>Simulate Payment Failure</span>
              </button>

              <button
                type="button"
                onClick={() => setOfflineModalData(null)}
                className="btn-modal-close"
                style={{ background: '#94a3b8' }}
              >
                Cancel & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
