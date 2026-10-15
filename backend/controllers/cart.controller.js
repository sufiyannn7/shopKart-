const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// Helper to get sanitized populated cart items
const getPopulatedCart = async (customerId) => {
  const customer = await Customer.findById(customerId).populate({
    path: 'cart.product',
    select: 'name price image stock category description'
  });

  if (!customer) return [];
  return (customer.cart || []).filter((item) => item.product !== null);
};

// Task 2: Add Product to Cart (POST /cart/:productId)
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Verify product exists in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Load authenticated customer
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (!customer.cart) {
      customer.cart = [];
    }

    // Check if product is already in the cart
    const itemIndex = customer.cart.findIndex(
      (item) => item.product && item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Re-adding existing item increments quantity
      const newQuantity = customer.cart[itemIndex].quantity + 1;

      // Validate against stock limit
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity exceeds available stock (Maximum: ${product.stock})`
        });
      }

      customer.cart[itemIndex].quantity = newQuantity;
    } else {
      // New item added with quantity = 1
      if (product.stock < 1) {
        return res.status(400).json({
          success: false,
          message: 'Product is out of stock'
        });
      }

      customer.cart.push({
        product: productId,
        quantity: 1
      });
    }

    await customer.save();
    const updatedCart = await getPopulatedCart(customer._id);

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: updatedCart
    });
  } catch (error) {
    console.error('Error in addToCart controller:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

// Task 3: Get Current User's Cart (GET /cart)
const getCart = async (req, res) => {
  try {
    const populatedCart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      cart: populatedCart
    });
  } catch (error) {
    console.error('Error in getCart controller:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

// Task 4: Update Product Quantity (PATCH /cart/:productId)
const updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate productId format
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Validate quantity is a valid number >= 1
    const qtyNum = Number(quantity);
    if (isNaN(qtyNum) || typeof quantity === 'boolean' || qtyNum < 1 || !Number.isInteger(qtyNum)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be an integer of at least 1'
      });
    }

    // Verify product exists and validate stock limit
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (qtyNum > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (Maximum: ${product.stock})`
      });
    }

    // Load authenticated customer
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (!customer.cart) {
      customer.cart = [];
    }

    // Check if product exists in cart
    const itemIndex = customer.cart.findIndex(
      (item) => item.product && item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart'
      });
    }

    customer.cart[itemIndex].quantity = qtyNum;
    await customer.save();

    const updatedCart = await getPopulatedCart(customer._id);

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: updatedCart
    });
  } catch (error) {
    console.error('Error in updateQuantity controller:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

// Task 5: Remove Product from Cart (DELETE /cart/:productId)
const removeFromCart = async (req, res) => {
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

    if (!customer.cart) {
      customer.cart = [];
    }

    // Check if product is currently in cart
    const itemExists = customer.cart.some(
      (item) => item.product && item.product.toString() === productId
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart'
      });
    }

    // Remove item and persist
    customer.cart = customer.cart.filter(
      (item) => item.product && item.product.toString() !== productId
    );
    await customer.save();

    const updatedCart = await getPopulatedCart(customer._id);

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart: updatedCart
    });
  } catch (error) {
    console.error('Error in removeFromCart controller:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart
};
