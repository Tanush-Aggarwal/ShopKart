import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import CartItem from '../components/CartItem';
import { useCart } from '../context/CartContext';

const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(price);

const Cart = () => {
    const navigate = useNavigate();
    const [authChecked, setAuthChecked] = useState(false);
    const [checkoutMessage, setCheckoutMessage] = useState('');
    const { cart, cartCount, subtotal, loading, error, fetchCart } = useCart();

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                await api.get('/customers/me');
                setAuthChecked(true);
            } catch (err) {
                console.error("User not authenticated:", err);
                navigate('/login');
            }
        };

        verifyAuth();
    }, [navigate]);

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (!authChecked || (loading && cart.length === 0)) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <main className="flex-grow flex flex-col items-center justify-center py-20 px-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading your cart...</p>
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
                            My Cart
                        </h1>
                        <p className="mt-1 text-gray-600">
                            {cartCount === 1 ? '1 item in your cart' : `${cartCount} items in your cart`}
                        </p>
                    </div>
                    {cart.length > 0 && (
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
                        <p className="text-red-700 font-semibold text-lg">Unable to load your cart.</p>
                        <p className="text-red-600 text-sm mt-1">{error}</p>
                        <button
                            type="button"
                            onClick={() => fetchCart()}
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!error && cart.length === 0 && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-lg mx-auto my-8 shadow-sm flex flex-col items-center">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-4xl mb-4">
                            🛒
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
                        <p className="text-gray-500 mt-2 max-w-xs">
                            Looks like you haven't added anything to your cart yet.
                        </p>
                        <Link
                            to="/products"
                            className="mt-6 inline-flex bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-sm font-semibold transition-all shadow-sm hover:shadow"
                        >
                            Browse Products
                        </Link>
                    </div>
                )}

                {!error && cart.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2 space-y-4">
                            {cart.map((item) => (
                                <CartItem key={item.product?._id || item._id} item={item} />
                            ))}
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">
                                Order Summary
                            </h2>

                            <div className="space-y-3 py-4 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Total Units:</span>
                                    <span className="font-semibold text-gray-900">{cartCount}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal:</span>
                                    <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping:</span>
                                    <span className="text-green-600 font-semibold">FREE</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                                <span className="text-base font-bold text-gray-900">Estimated Total:</span>
                                <span className="text-2xl font-extrabold text-blue-600">
                                    {formatPrice(subtotal)}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={handleCheckout}
                                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-6 rounded-2xl font-semibold text-base transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer text-center"
                            >
                                Proceed to Checkout
                            </button>

                            {checkoutMessage && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 font-medium">
                                    {checkoutMessage}
                                </div>
                            )}

                            <div className="mt-4 text-center">
                                <Link
                                    to="/products"
                                    className="text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Cart;
