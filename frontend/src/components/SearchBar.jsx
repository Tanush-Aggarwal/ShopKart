import React from 'react';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Books', 'Home'];

const SearchBar = ({ search, category, sort, onSearchChange, onCategoryChange, onSortChange }) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                </label>
                <input
                    id="search"
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search products..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                </label>
                <select
                    id="category"
                    value={category}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    {CATEGORIES.map((item) => (
                        <option key={item} value={item}>
                            {item === 'All' ? 'All Categories' : item}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                    Sort by price
                </label>
                <select
                    id="sort"
                    value={sort}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    <option value="">Default</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                </select>
            </div>
        </div>
    );
};

export default SearchBar;
