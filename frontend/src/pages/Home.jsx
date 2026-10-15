import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ShoppingBag, 
  ShoppingCart, 
  User, 
  Star, 
  ChevronLeft,
  ChevronRight,
  Flame,
  ArrowRight,
  Eye
} from 'lucide-react';
import { getMyProfile, fetchProducts } from '../services/api';
import { useCart } from '../context/CartContext';

// Circular Snapdeal Category Data with mapped backend category names
const CATEGORY_CIRCLES = [
  { name: 'Top Offers', icon: '%', color: '#ff9800', category: 'All' },
  { name: 'Electronics', icon: '💻', color: '#4caf50', category: 'Electronics' },
  { name: 'Fashion', icon: '👗', color: '#e91e63', category: 'Fashion' },
  { name: 'Books', icon: '📚', color: '#2196f3', category: 'Books' },
  { name: 'Home', icon: '🏠', color: '#795548', category: 'Home' },
  { name: 'Mobiles', icon: '📱', color: '#00bcd4', category: 'Electronics' },
  { name: 'Appliances', icon: '📺', color: '#9c27b0', category: 'Electronics' },
  { name: 'Beauty', icon: '💄', color: '#ff4081', category: 'Fashion' },
  { name: 'Furniture', icon: '🛋️', color: '#ff5722', category: 'Home' },
  { name: 'Grocery', icon: '🛒', color: '#8bc34a', category: 'All' }
];

const Home = ({ user, setUser }) => {
  const navigate = useNavigate();
  const { addToCart, actionLoadingId } = useCart();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('deals'); // 'deals' or 'account'
  const [liveProducts, setLiveProducts] = useState([]);

  useEffect(() => {
    const fetchUserDataAndProducts = async () => {
      try {
        setLoading(true);
        // Task 3: Fetch logged in customer using GET /customers/me
        const customerData = await getMyProfile();
        setUser(customerData);

        // Fetch real data-driven products from MongoDB API
        const prodData = await fetchProducts();
        if (prodData && prodData.products) {
          setLiveProducts(prodData.products);
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch user or products:', err);
        setUser(null);
        navigate('/login');
      }
    };

    fetchUserDataAndProducts();
  }, [navigate, setUser]);

  const handleCategoryClick = (catObj) => {
    if (catObj.category && catObj.category !== 'All') {
      navigate(`/products?category=${encodeURIComponent(catObj.category)}`);
    } else {
      navigate('/products');
    }
  };

  if (loading) {
    return (
      <div className="snapdeal-home-wrapper">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Verifying secure authentication session...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="snapdeal-home-wrapper">
      {/* Category Circles Row */}
      <div className="categories-circles-bar">
        {CATEGORY_CIRCLES.map((cat, idx) => (
          <div 
            key={idx} 
            className="category-circle-item"
            onClick={() => handleCategoryClick(cat)}
            title={`Browse ${cat.name}`}
          >
            <div className="icon-ring" style={{ borderColor: cat.color }}>
              {cat.icon}
            </div>
            <span>{cat.name}</span>
          </div>
        ))}
      </div>

      {/* Snapdeal Hero Promotional Banner */}
      <div className="banner-carousel-container" onClick={() => navigate('/products')}>
        <img src="/images/banner.jpg" alt="Festive Sale Banner" className="banner-img" style={{ cursor: 'pointer' }} />
        <div className="banner-arrow left"><ChevronLeft size={24} /></div>
        <div className="banner-arrow right"><ChevronRight size={24} /></div>
      </div>

      {/* Authenticated Customer Banner Bar */}
      <div className="user-verification-bar">
        <div className="user-welcome-info">
          <h2>Welcome back, {user.fullName}! 👋</h2>
          <p>Logged in customer account session active</p>
        </div>

        <div className="cookie-auth-badge">
          <ShieldCheck size={16} />
          <span>Authenticated via HttpOnly Cookie</span>
        </div>
      </div>

      {/* Snapdeal Navigation Tabs */}
      <div className="snapdeal-tabs">
        <button 
          className={`snapdeal-tab-btn ${activeTab === 'deals' ? 'active' : ''}`}
          onClick={() => setActiveTab('deals')}
        >
          <Flame size={18} color="#e40046" />
          Bazaar Waali Deals (Live from MongoDB)
        </button>
        <button 
          className={`snapdeal-tab-btn ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          <User size={18} />
          My Customer Account
        </button>
      </div>

      {/* TAB 1: BAZAAR WAALI DEALS GRID (Real Products from Backend) */}
      {activeTab === 'deals' && (
        <div>
          <div className="home-deals-header">
            <h3>Trending Products in Store</h3>
            <Link to="/products" className="link-view-all">
              View All Products
              <ArrowRight size={15} style={{ display: 'inline', marginLeft: 4 }} />
            </Link>
          </div>

          <div className="deal-products-grid">
            {liveProducts.slice(0, 4).map((product) => (
              <div key={product._id} className="deal-card">
                <div className="deal-img-container">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <span className="discount-tag">DEAL</span>
                </div>
                <div className="deal-info">
                  <h3 className="deal-title">{product.name}</h3>
                  <div className="deal-category-sub">{product.category} • {product.stock} in stock</div>
                  
                  <div className="deal-price-row">
                    <div>
                      <span className="deal-price">₹{product.price.toLocaleString('en-IN')}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link 
                        to={`/products/${product._id}`} 
                        className="btn-snapdeal-cart"
                        style={{ textDecoration: 'none', background: '#334155' }}
                        title="View details"
                      >
                        <Eye size={13} />
                        Details
                      </Link>

                      <button 
                        className="btn-snapdeal-cart"
                        onClick={() => addToCart(product._id)}
                        disabled={actionLoadingId === product._id || product.stock <= 0}
                        title={product.stock <= 0 ? 'Out of stock' : 'Add to cart'}
                      >
                        <ShoppingCart size={13} />
                        {actionLoadingId === product._id ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MANDATORY TASK 3 CUSTOMER PROFILE DETAILS */}
      {activeTab === 'account' && (
        <div className="customer-profile-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #eaeaec' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#ffebee', color: '#e40046', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                {user.fullName}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                ShopKart Verified Customer
              </p>
            </div>
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '1rem' }}>
            Customer Account Credentials (GET /customers/me)
          </h3>

          <div className="profile-details-grid">
            <div className="detail-card">
              <label>Customer Name</label>
              <p>{user.fullName}</p>
            </div>

            <div className="detail-card">
              <label>Email Address</label>
              <p>{user.email}</p>
            </div>

            <div className="detail-card">
              <label>Phone Number</label>
              <p>{user.phone || 'N/A'}</p>
            </div>

            <div className="detail-card">
              <label>Database Account ID</label>
              <p style={{ fontSize: '0.85rem', color: '#686b78' }}>{user._id}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
