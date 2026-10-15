import axios from 'axios';

// Customer Authentication API instance
const authAPI = axios.create({
  baseURL: '/customers',
  withCredentials: true,
});

// Product Catalog API instance
const productAPI = axios.create({
  baseURL: '/products',
  withCredentials: true,
});

// Wishlist API instance
const wishlistAPI = axios.create({
  baseURL: '/wishlist',
  withCredentials: true,
});

// Cart API instance
const cartAPI = axios.create({
  baseURL: '/cart',
  withCredentials: true,
});

// Order API instance
const orderAPI = axios.create({
  baseURL: '/orders',
  withCredentials: true,
});

// --- Customer Authentication & Profile Services ---
export const registerUser = async (formData) => {
  const response = await authAPI.post('/register', formData);
  return response.data;
};

export const loginUser = async (formData) => {
  const response = await authAPI.post('/login', formData);
  return response.data;
};

export const getMyProfile = async () => {
  const response = await authAPI.get('/me');
  return response.data;
};

export const logoutUser = async () => {
  const response = await authAPI.post('/logout');
  return response.data;
};

// --- Product Catalog & Discovery Services ---
export const fetchProducts = async (params = {}) => {
  // params can contain { search, category, sort }
  const response = await productAPI.get('/', { params });
  return response.data;
};

export const fetchProductById = async (id) => {
  const response = await productAPI.get(`/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await productAPI.post('/', productData);
  return response.data;
};

// --- Wishlist Services ---
export const addToWishlist = async (productId) => {
  const response = await wishlistAPI.post(`/${productId}`);
  return response.data;
};

export const fetchWishlist = async () => {
  const response = await wishlistAPI.get('/');
  return response.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await wishlistAPI.delete(`/${productId}`);
  return response.data;
};

export const toggleWishlist = async (productId) => {
  const response = await wishlistAPI.patch(`/${productId}/toggle`);
  return response.data;
};

// --- Shopping Cart Services ---
export const addToCart = async (productId) => {
  const response = await cartAPI.post(`/${productId}`);
  return response.data;
};

export const fetchCart = async () => {
  const response = await cartAPI.get('/');
  return response.data;
};

export const updateCartQuantity = async (productId, quantity) => {
  const response = await cartAPI.patch(`/${productId}`, { quantity });
  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await cartAPI.delete(`/${productId}`);
  return response.data;
};

// --- Order & Checkout Services ---
export const createPaymentOrder = async (shippingAddress) => {
  const response = await orderAPI.post('/create-payment-order', { shippingAddress });
  return response.data;
};

export const verifyPayment = async (verificationData) => {
  const response = await orderAPI.post('/verify-payment', verificationData);
  return response.data;
};

export const fetchOrders = async () => {
  const response = await orderAPI.get('/');
  return response.data;
};

export const fetchOrderById = async (id) => {
  const response = await orderAPI.get(`/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await orderAPI.patch(`/${id}/status`, { status });
  return response.data;
};

export default {
  registerUser,
  loginUser,
  getMyProfile,
  logoutUser,
  fetchProducts,
  fetchProductById,
  createProduct,
  addToWishlist,
  fetchWishlist,
  removeFromWishlist,
  toggleWishlist,
  addToCart,
  fetchCart,
  updateCartQuantity,
  removeFromCart,
  createPaymentOrder,
  verifyPayment,
  fetchOrders,
  fetchOrderById,
  updateOrderStatus,
};
