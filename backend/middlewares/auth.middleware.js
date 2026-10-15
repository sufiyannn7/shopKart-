const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');

const protectRoute = async (req, res, next) => {
  try {
    let token = req.cookies?.jwt;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized - No token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({ success: false, message: 'Unauthorized - Invalid or expired token' });
    }

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token payload' });
    }

    const customer = await Customer.findById(decoded.userId).select('-password');

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    req.user = customer;
    next();
  } catch (error) {
    console.log('Error in protectRoute middleware: ', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = protectRoute;
