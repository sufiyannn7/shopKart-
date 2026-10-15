const Razorpay = require('razorpay');

let razorpayInstance = null;

try {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_shopkart1234',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'shopkart_test_secret_key_5678',
  });
} catch (error) {
  console.warn('Warning initializing Razorpay instance:', error.message);
}

module.exports = razorpayInstance;
