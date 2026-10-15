import React from 'react';
import { Search, Filter, ArrowUpDown, X } from 'lucide-react';

const CATEGORIES = ['All Categories', 'Electronics', 'Fashion', 'Books', 'Home'];

const SearchBar = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedSort,
  setSelectedSort,
  onReset,
}) => {
  return (
    <div className="search-filter-panel">
      {/* Search Input Box */}
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon-svg" />
        <input
          type="text"
          placeholder="Search products by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-field"
        />
        {searchTerm && (
          <button 
            type="button" 
            className="btn-clear-search" 
            onClick={() => setSearchTerm('')}
            title="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="filter-controls-group">
        {/* Category Dropdown Filter */}
        <div className="filter-dropdown-wrap">
          <Filter size={16} className="dropdown-icon" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Bonus Challenge: Price Sort Dropdown */}
        <div className="filter-dropdown-wrap">
          <ArrowUpDown size={16} className="dropdown-icon" />
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="filter-select"
          >
            <option value="">Sort: Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Reset button if filters active */}
        {(searchTerm || selectedCategory !== 'All Categories' || selectedSort) && (
          <button 
            onClick={onReset} 
            className="btn-reset-filters"
            title="Reset all filters"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
