import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { cartCount } = useCart();
    const [wishlistCount, setWishlistCount] = useState(0);

    useEffect(() => {
        let isMounted = true;
        const fetchCount = async () => {
            try {
                const data = await getWishlist();
                if (isMounted) {
                    setWishlistCount(data.count ?? data.wishlist?.length ?? 0);
                }
            } catch (err) {
                if (isMounted) {
                    setWishlistCount(0);
                }
            }
        };

        fetchCount();
        return () => {
            isMounted = false;
        };
    }, []);

    const handleLogout = async () => {
        try {
            const response = await api.post('/customers/logout');
            if (response.data.success) {
                navigate('/login');
            }
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <nav className="bg-white/70 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="font-bold text-2xl tracking-tight text-blue-600">ShopKart<span className="text-yellow-500">.</span></span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-5">
                        <Link to="/home" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                            Home
                        </Link>
                        <Link to="/products" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                            Products
                        </Link>
                        <Link to="/wishlist" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors inline-flex items-center gap-1.5">
                            <span>Wishlist</span>
                            {wishlistCount > 0 && (
                                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>
                        <Link to="/cart" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors inline-flex items-center gap-1.5">
                            <span>Cart</span>
                            {cartCount > 0 ? (
                                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-blue-100 bg-blue-600 rounded-full">
                                    {cartCount}
                                </span>
                            ) : (
                                <span className="text-gray-400 text-xs">(0)</span>
                            )}
                        </Link>
                        <Link to="/orders" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                            Orders
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
