const express = require('express');
const {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
  changePassword
} = require('../controllers/customer.controller');
const protectRoute = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.get('/me', protectRoute, getMyProfile);
router.post('/logout', protectRoute, logoutCustomer);
router.patch('/change-password', protectRoute, changePassword); // Bonus Challenge

module.exports = router;
