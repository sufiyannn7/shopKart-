const Customer = require('../models/customer.model');
const bcrypt = require('bcrypt');
const generateTokenAndSetCookie = require('../utils/generateToken');

const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are mandatory' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must contain at least 6 characters' });
    }

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newCustomer = new Customer({
      fullName,
      email,
      password: hashedPassword,
      phone
    });

    await newCustomer.save();

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        _id: newCustomer._id,
        fullName: newCustomer.fullName,
        email: newCustomer.email,
        phone: newCustomer.phone
      }
    });

  } catch (error) {
    console.log('Error in registerCustomer controller', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });
    const isPasswordCorrect = await bcrypt.compare(password, customer?.password || '');

    if (!customer || !isPasswordCorrect) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateTokenAndSetCookie(customer._id, res);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        wishlist: customer.wishlist || []
      }
    });

  } catch (error) {
    console.log('Error in loginCustomer controller', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const getMyProfile = async (req, res) => {
  try {
    // req.user is attached by the protectRoute middleware
    res.status(200).json(req.user);
  } catch (error) {
    console.log('Error in getMyProfile controller', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const logoutCustomer = async (req, res) => {
  try {
    res.cookie('jwt', '', { maxAge: 0 });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.log('Error in logoutCustomer controller', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const customerId = req.user._id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both old and new passwords are required' });
    }

    const customer = await Customer.findById(customerId);
    
    const isPasswordCorrect = await bcrypt.compare(oldPassword, customer.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ success: false, message: 'Incorrect old password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must contain at least 6 characters' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    customer.password = hashedNewPassword;
    await customer.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.log('Error in changePassword controller', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
  changePassword
};
