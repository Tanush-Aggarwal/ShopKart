import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getProducts } from '../services/api';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';

const Products = () => {
    const navigate = useNavigate();
    const [ready, setReady] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sort, setSort] = useState('');

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await api.get('/customers/me');
                setReady(true);
            } catch (err) {
                console.error('Failed to fetch user:', err);
                navigate('/login');
            }
        };

        checkAuth();
    }, [navigate]);

    useEffect(() => {
        if (!ready) {
            return;
        }

        const loadProducts = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await getProducts({ search, category, sort });
                setProducts(data.products || []);
            } catch (err) {
                console.error('Failed to load products:', err);
                setError('Something went wrong while loading products.');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [ready, search, category, sort]);

    if (!ready) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-600 text-lg">Loading products...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <div className="mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-900">Products</h1>
                    <p className="mt-1 text-gray-600">Browse the ShopKart catalogue.</p>
                </div>

                <SearchBar
                    search={search}
                    category={category}
                    sort={sort}
                    onSearchChange={setSearch}
                    onCategoryChange={setCategory}
                    onSortChange={setSort}
                />

                <div className="mt-8">
                    {loading && (
                        <p className="text-gray-600 text-lg">Loading products...</p>
                    )}

                    {!loading && error && (
                        <p className="text-red-600 text-lg">{error}</p>
                    )}

                    {!loading && !error && products.length === 0 && (
                        <p className="text-gray-600 text-lg">No products found.</p>
                    )}

                    {!loading && !error && products.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Products;
