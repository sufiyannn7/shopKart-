const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// Task 2: Add Product to Wishlist (POST /wishlist/:productId)
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Verify product exists in MongoDB
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Load authenticated user
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (!customer.wishlist) {
      customer.wishlist = [];
    }

    // Check for duplicate in wishlist
    const isAlreadyWishlisted = customer.wishlist.some(
      (id) => id && id.toString() === productId
    );

    if (isAlreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add product reference and persist
    customer.wishlist.push(productId);
    await customer.save();

    return res.status(201).json({
      success: true,
      message: 'Product added to wishlist'
    });
  } catch (error) {
    console.error('Error in addToWishlist controller:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

// Task 3: Get Current User's Wishlist (GET /wishlist)
const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name price category image stock description'
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Filter out null values in case a referenced product was removed
    const validWishlist = (customer.wishlist || []).filter((item) => item !== null);

    return res.status(200).json({
      success: true,
      count: validWishlist.length,
      wishlist: validWishlist
    });
  } catch (error) {
    console.error('Error in getWishlist controller:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

// Task 4: Remove Product from Wishlist (DELETE /wishlist/:productId)
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (!customer.wishlist) {
      customer.wishlist = [];
    }

    // Check if product is currently in user's wishlist
    const exists = customer.wishlist.some(
      (id) => id && id.toString() === productId
    );

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist'
      });
    }

    // Remove product reference and persist
    customer.wishlist = customer.wishlist.filter(
      (id) => id && id.toString() !== productId
    );
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    console.error('Error in removeFromWishlist controller:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

// Bonus: Toggle Wishlist (PATCH or POST /wishlist/:productId/toggle)
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (!customer.wishlist) {
      customer.wishlist = [];
    }

    const exists = customer.wishlist.some(
      (id) => id && id.toString() === productId
    );

    if (exists) {
      // Remove from wishlist
      customer.wishlist = customer.wishlist.filter(
        (id) => id && id.toString() !== productId
      );
      await customer.save();

      return res.status(200).json({
        success: true,
        saved: false,
        message: 'Product removed from wishlist'
      });
    } else {
      // Add to wishlist
      customer.wishlist.push(productId);
      await customer.save();

      return res.status(200).json({
        success: true,
        saved: true,
        message: 'Product added to wishlist'
      });
    }
  } catch (error) {
    console.error('Error in toggleWishlist controller:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist
};
