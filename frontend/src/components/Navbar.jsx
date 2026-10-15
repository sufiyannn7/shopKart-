import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Search, Smartphone, ShoppingBag, Heart, Package } from 'lucide-react';
import { logoutUser } from '../services/api';
import { useCart } from '../context/CartContext';

const Navbar = ({ user, setUser, wishlistCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount = 0 } = useCart();
  const [navSearch, setNavSearch] = useState('');

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      navigate('/login');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(navSearch.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <header className="header-wrapper">
      {/* Top Announcement Strip */}
      <div className="top-strip">
        <div className="top-strip-container">
          <div className="top-tagline">
            Brand Waali Quality, Bazaar Waali Deal!
          </div>
          <div className="top-nav-links">
            <span className="impact-pill">Impact@ShopKart</span>
            <Link to="/products" style={{ color: 'white', textDecoration: 'none' }}>All Products</Link>
            <Link to="/wishlist" style={{ color: 'white', textDecoration: 'none' }}>Wishlist</Link>
            <Link to="/cart" style={{ color: 'white', textDecoration: 'none' }}>Cart</Link>
            {user && (
              <Link to="/orders" style={{ color: 'white', textDecoration: 'none' }}>My Orders</Link>
            )}
            <a href="#help">Help Center</a>
            <span className="download-app-link">
              <Smartphone size={13} />
              Download App
            </span>
          </div>
        </div>
      </div>

      {/* Main Crimson Header */}
      <nav className="main-navbar">
        <div className="main-navbar-container">
          {/* Logo */}
          <Link to={user ? "/home" : "/products"} className="brand-logo">
            <span className="logo-icon">🛍️</span>
            <span className="logo-text">shopkart</span>
          </Link>

          {/* Quick Search Form */}
          <form className="header-search-bar" onSubmit={handleSearchSubmit}>
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search for Products, Brands and More" 
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
            />
            <button type="submit" className="btn-search">Search</button>
          </form>

          {/* Navigation Links: Home | Products | Wishlist | Cart | Orders | Profile */}
          <div className="header-actions">
            <Link 
              to={user ? "/home" : "/login"} 
              className={`header-nav-item ${location.pathname === '/home' ? 'active' : ''}`}
            >
              <span>Home</span>
            </Link>

            <Link 
              to="/products" 
              className={`header-nav-item ${location.pathname === '/products' ? 'active' : ''}`}
            >
              <ShoppingBag size={20} />
              <span>Products</span>
            </Link>

            <Link 
              to="/wishlist" 
              className={`header-nav-item ${location.pathname === '/wishlist' ? 'active' : ''}`}
              title="My Wishlist"
            >
              <Heart size={20} fill={location.pathname === '/wishlist' ? '#ffffff' : 'none'} />
              <span>Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ''}</span>
            </Link>

            <Link 
              to="/cart" 
              className={`header-nav-item ${location.pathname === '/cart' ? 'active' : ''}`}
              title="Shopping Cart"
            >
              <ShoppingCart size={20} />
              <span>Cart {cartCount > 0 ? `(${cartCount})` : ''}</span>
              {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
            </Link>

            {user && (
              <Link 
                to="/orders" 
                className={`header-nav-item ${location.pathname === '/orders' ? 'active' : ''}`}
                title="My Orders"
              >
                <Package size={20} />
                <span>Orders</span>
              </Link>
            )}

            {user ? (
              <div className="user-dropdown-wrapper">
                <div className="header-action-item user-active-item">
                  <User size={18} />
                  <span className="user-name-label">{user.fullName}</span>
                </div>
                <button onClick={handleLogout} className="btn-header-logout" title="Logout">
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="header-action-item">
                <User size={20} />
                <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Sign In</Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
