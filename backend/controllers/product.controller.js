const mongoose = require('mongoose');
const Product = require('../models/product.model');

// Task 2: Create Product (POST /products)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Check for missing required fields
    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field. name, description, price, category, image, and stock are mandatory.',
      });
    }

    // Validate price > 0
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid price. Price must be a number greater than 0.',
      });
    }

    // Validate stock >= 0
    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stock. Stock must be a non-negative number (0 or more).',
      });
    }

    const newProduct = new Product({
      name: name.trim(),
      description: description.trim(),
      price: numPrice,
      category: category.trim(),
      image: image.trim(),
      stock: numStock,
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: savedProduct,
    });
  } catch (error) {
    console.error('Error in createProduct:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create product',
    });
  }
};

// Task 3 & Task 5 & Bonus: Get All Products with Search, Category Filter, and Sorting (GET /products)
const getAllProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    // Build dynamic query object
    const filter = {};

    // Search by product name (case-insensitive)
    if (search && search.trim() !== '') {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    // Filter by category
    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      filter.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    // Query builder
    let query = Product.find(filter).select('_id name description price category image stock createdAt');

    // Bonus: Sorting by price
    if (sort === 'price_asc') {
      query = query.sort({ price: 1 });
    } else if (sort === 'price_desc') {
      query = query.sort({ price: -1 });
    } else {
      query = query.sort({ createdAt: -1 }); // default newest first
    }

    const products = await query.exec();

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Error in getAllProducts:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error while fetching products',
    });
  }
};

// Task 4: Get Single Product by ID (GET /products/:id)
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error in getProductById:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error while fetching product',
    });
  }
};

// Seed initial products helper
const seedSampleProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      const sampleProducts = [
        {
          name: 'Noise Cancelling Headphones',
          description: 'Wireless over-ear headphones with active noise cancellation, deep bass, and 40-hour battery life.',
          price: 4999,
          category: 'Electronics',
          image: '/images/headphones.jpg',
          stock: 25,
        },
        {
          name: 'Mechanical Keyboard',
          description: 'RGB mechanical gaming keyboard with tactile blue switches, anti-ghosting keys, and aluminum body.',
          price: 2999,
          category: 'Electronics',
          image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
          stock: 10,
        },
        {
          name: 'Velociti OLED Smartwatch',
          description: 'Sleek fitness smartwatch with crisp OLED display, heart rate monitor, SPO2 sensor, and 7-day battery life.',
          price: 2499,
          category: 'Electronics',
          image: '/images/smartwatch.jpg',
          stock: 18,
        },
        {
          name: 'Waterproof Laptop Backpack',
          description: 'Durable anti-theft laptop travel backpack with USB charging port and multi-compartment organizers.',
          price: 1299,
          category: 'Fashion',
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
          stock: 35,
        },
        {
          name: 'Clean Code: A Handbook of Agile Software Craftsmanship',
          description: 'Legendary programming book by Robert C. Martin on software development principles, testing, and refactoring.',
          price: 899,
          category: 'Books',
          image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
          stock: 12,
        },
        {
          name: 'Ergonomic Memory Foam Chair Cushion',
          description: 'Orthopedic comfort seat cushion designed for office chairs, pain relief, and posture support.',
          price: 1499,
          category: 'Home',
          image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80',
          stock: 15,
        },
      ];

      await Product.insertMany(sampleProducts);
      console.log('Seeded initial sample products into MongoDB successfully!');
    }
  } catch (error) {
    console.error('Error seeding products:', error.message);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  seedSampleProducts,
};
