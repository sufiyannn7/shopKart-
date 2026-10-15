import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, AlertCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../services/api';

const Products = ({ onAddToCart, user, wishlistIds = [], onWishlistChange }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and filter state initialized from URL search params if present
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All Categories';
  const initialSort = searchParams.get('sort') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSort, setSelectedSort] = useState(initialSort);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load products whenever search, category, or sort changes
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (searchTerm.trim() !== '') {
        params.search = searchTerm.trim();
      }
      if (selectedCategory && selectedCategory !== 'All Categories') {
        params.category = selectedCategory;
      }
      if (selectedSort) {
        params.sort = selectedSort;
      }

      // Update URL query parameters for bookmarkable search URLs
      const newQuery = {};
      if (params.search) newQuery.search = params.search;
      if (params.category) newQuery.category = params.category;
      if (params.sort) newQuery.sort = params.sort;
      setSearchParams(newQuery, { replace: true });

      const data = await fetchProducts(params);
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Something went wrong while loading products.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced/triggered fetch when inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 250); // slight debounce for smooth typing

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, selectedSort]);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategory('All Categories');
    setSelectedSort('');
  };

  return (
    <div className="products-page-container">
      {/* Page Title & Breadcrumb Header */}
      <div className="products-page-header">
        <div>
          <h1 className="products-page-title">
            <ShoppingBag size={24} style={{ display: 'inline', marginRight: 8, color: 'var(--snapdeal-red)' }} />
            ShopKart Product Catalog
          </h1>
          <p className="products-page-subtitle">
            Explore authentic products directly fetched from MongoDB
          </p>
        </div>
        <div className="product-count-chip">
          {products.length} {products.length === 1 ? 'Product' : 'Products'} available
        </div>
      </div>

      {/* Search and Filters Bar */}
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSort={selectedSort}
        setSelectedSort={setSelectedSort}
        onReset={handleReset}
      />

      {/* 1. LOADING STATE */}
      {loading && (
        <div className="state-container loading-state">
          <div className="state-spinner"></div>
          <p className="state-message">Loading products...</p>
        </div>
      )}

      {/* 2. ERROR STATE */}
      {!loading && error && (
        <div className="state-container error-state">
          <AlertCircle size={44} className="state-icon error-icon" />
          <h3 className="state-title">Unable to Load Products</h3>
          <p className="state-message">{error}</p>
          <button onClick={loadProducts} className="btn-retry">
            <RefreshCw size={15} style={{ display: 'inline', marginRight: 6 }} />
            Retry
          </button>
        </div>
      )}

      {/* 3. EMPTY STATE */}
      {!loading && !error && products.length === 0 && (
        <div className="state-container empty-state">
          <Package size={48} className="state-icon empty-icon" />
          <h3 className="state-title">No products found.</h3>
          <p className="state-message">
            We couldn't find any products matching your search criteria. Try clearing your filters or searching for something else.
          </p>
          <button onClick={handleReset} className="btn-retry">
            View All Products
          </button>
        </div>
      )}

      {/* 4. DYNAMIC PRODUCTS LISTING (rendered using .map()) */}
      {!loading && !error && products.length > 0 && (
        <div className="product-cards-grid">
          {products.map((product) => (
            <ProductCard 
              key={product._id} 
              product={product} 
              onAddToCart={onAddToCart}
              user={user}
              isWishlisted={wishlistIds.includes(product._id)}
              onWishlistChange={onWishlistChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
