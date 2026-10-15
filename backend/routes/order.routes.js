const express = require('express');
const protectRoute = require('../middlewares/auth.middleware');
const {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/order.controller');

const router = express.Router();

// All order endpoints are protected by authentication middleware
router.use(protectRoute);

// Task 4: Create Order & Razorpay Order
router.post('/create-payment-order', createPaymentOrder);

// Support POST /orders as alias/direct endpoint
router.post('/', createPaymentOrder);

// Task 4 & 5: Verify Payment Signature
router.post('/verify-payment', verifyPayment);

// Task 7: Get Current User's Orders
router.get('/', getMyOrders);

// Task 17: Get Single Order by ID
router.get('/:id', getOrderById);

// Bonus: Update Order Status Progression
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
