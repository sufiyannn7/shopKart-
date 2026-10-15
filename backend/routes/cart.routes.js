const express = require('express');
const protectRoute = require('../middlewares/auth.middleware');
const {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart
} = require('../controllers/cart.controller');

const router = express.Router();

// All cart endpoints are protected by authentication middleware
router.use(protectRoute);

// Task 3: Get Current User's Cart
router.get('/', getCart);

// Task 2: Add Product to Cart
router.post('/:productId', addToCart);

// Fallback for POST /cart with body { productId }
router.post('/', (req, res, next) => {
  if (req.body && req.body.productId) {
    req.params.productId = req.body.productId;
    return addToCart(req, res);
  }
  return res.status(400).json({ success: false, message: 'Product ID is required in URL path' });
});

// Task 4: Update Product Quantity
router.patch('/:productId', updateQuantity);

// Task 5: Remove Product from Cart
router.delete('/:productId', removeFromCart);

module.exports = router;
