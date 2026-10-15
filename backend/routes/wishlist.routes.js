const express = require('express');
const protectRoute = require('../middlewares/auth.middleware');
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist
} = require('../controllers/wishlist.controller');

const router = express.Router();

// All wishlist routes are protected by authentication middleware
router.use(protectRoute);

// Task 3: Get Current User's Wishlist
router.get('/', getWishlist);

// Task 2: Add Product to Wishlist
router.post('/:productId', addToWishlist);

// Fallback in case client sends POST /wishlist with body { productId }
router.post('/', (req, res, next) => {
  if (req.body && req.body.productId) {
    req.params.productId = req.body.productId;
    return addToWishlist(req, res);
  }
  return res.status(400).json({ success: false, message: 'Product ID is required in URL path' });
});

// Task 4: Remove Product from Wishlist
router.delete('/:productId', removeFromWishlist);

// Bonus: Toggle Wishlist
router.patch('/:productId/toggle', toggleWishlist);
router.post('/:productId/toggle', toggleWishlist);

module.exports = router;
