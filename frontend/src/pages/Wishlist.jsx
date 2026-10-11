import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getWishlist, removeFromWishlist } from '../services/api';
import Navbar from '../components/Navbar';
import WishlistCard from '../components/WishlistCard';

const Wishlist = () => {
    const navigate = useNavigate();
    const [authChecked, setAuthChecked] = useState(false);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWishlist = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getWishlist();
            setWishlist(data.wishlist || []);
        } catch (err) {
            console.error("Failed to load wishlist:", err);
            setError(err.response?.data?.message || "We couldn't load your wishlist.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                await api.get('/customers/me');
                setAuthChecked(true);
                await fetchWishlist();
            } catch (err) {
                console.error("User not authenticated:", err);
                navigate('/login');
            }
        };

        verifyAuth();
    }, [navigate]);

    const handleRemoveItem = async (productId) => {
        try {
            await removeFromWishlist(productId);
            setWishlist((prev) => prev.filter((item) => item._id?.toString() !== productId.toString()));
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to remove from wishlist.';
            return { success: false, message };
        }
    };

    if (!authChecked || (loading && wishlist.length === 0)) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <main className="flex-grow flex flex-col items-center justify-center py-20 px-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading your wishlist...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            My Wishlist
                        </h1>
                        <p className="mt-1 text-gray-600">
                            {wishlist.length === 1
                                ? '1 product saved'
                                : `${wishlist.length} products saved`}
                        </p>
                    </div>
                    {wishlist.length > 0 && (
                        <Link
                            to="/products"
                            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                            ← Continue Shopping
                        </Link>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-md mx-auto my-8">
                        <p className="text-red-700 font-semibold text-lg">Something went wrong.</p>
                        <p className="text-red-600 text-sm mt-1">{error || "We couldn't load your wishlist."}</p>
                        <button
                            type="button"
                            onClick={() => fetchWishlist()}
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!error && wishlist.length === 0 && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-lg mx-auto my-8 shadow-sm flex flex-col items-center">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-4xl mb-4">
                            ❤️
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Your wishlist is empty</h2>
                        <p className="text-gray-500 mt-2 max-w-xs">
                            Save products you love and find them here later.
                        </p>
                        <Link
                            to="/products"
                            className="mt-6 inline-flex bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-sm font-semibold transition-all shadow-sm hover:shadow"
                        >
                            Browse Products
                        </Link>
                    </div>
                )}

                {!error && wishlist.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlist.map((product) => (
                            <WishlistCard key={product._id} product={product} onRemove={handleRemoveItem} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Wishlist;
