const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const customerRoutes = require('./routes/customer.routes');
const productRoutes = require('./routes/product.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const { seedSampleProducts } = require('./controllers/product.controller');

const app = express();

// Middlewares
app.use(cors({
  origin: (origin, callback) => callback(null, true), // Allow all origins dynamically with credentials
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Root route for backend health check
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h1 style="color: #4f46e5;">🚀 ShopKart Backend API is Running!</h1>
      <p style="color: #64748b; font-size: 1.1rem;">Customer APIs active at <code>/customers</code></p>
      <p style="color: #64748b; font-size: 1.1rem;">Product APIs active at <code>/products</code></p>
      <p style="color: #64748b; font-size: 1.1rem;">Wishlist APIs active at <code>/wishlist</code></p>
      <p style="color: #64748b; font-size: 1.1rem;">Cart APIs active at <code>/cart</code></p>
      <p style="color: #64748b; font-size: 1.1rem;">Order APIs active at <code>/orders</code></p>
      <div style="margin-top: 20px;">
        <span style="background: #dcfce7; color: #15803d; padding: 6px 14px; border-radius: 20px; font-weight: bold;">
          Status: Operational
        </span>
      </div>
    </div>
  `);
});

// Routes
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

// Database connection helper with fallback to MongoDB Memory Server
const connectDatabase = async () => {
  const PORT = process.env.PORT || 5000;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
    console.log('Connected to local MongoDB instance');
  } catch (err) {
    console.log('Local MongoDB instance not active. Launching Mongo Memory Server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB Memory Server successfully!');
    } catch (memErr) {
      console.error('Failed to start MongoDB connection:', memErr);
      process.exit(1);
    }
  }

  // Seed initial products if collection is empty
  await seedSampleProducts();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

connectDatabase();
