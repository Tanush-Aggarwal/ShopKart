import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { createPaymentOrder, verifyPayment } from '../services/api';
import api from '../services/api';

const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(price);

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const Checkout = () => {
    const navigate = useNavigate();
    const { cart, cartCount, subtotal, clearCartState } = useCart();

    const [customerEmail, setCustomerEmail] = useState('');
    const [authChecked, setAuthChecked] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        addressLine1: '',
        city: '',
        state: '',
        pincode: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const res = await api.get('/customers/me');
                const cust = res.data?.customer || res.data;
                if (cust) {
                    if (cust.email) {
                        setCustomerEmail(cust.email);
                    }
                    setFormData((prev) => ({
                        ...prev,
                        fullName: prev.fullName || cust.fullName || '',
                        phone: prev.phone || cust.phone || ''
                    }));
                }
                setAuthChecked(true);
            } catch (err) {
                console.error('Not authenticated:', err);
                navigate('/login');
            }
        };

        verifyAuth();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full Name is required';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone.trim())) {
            newErrors.phone = 'Phone number must be a valid 10-digit number';
        }

        if (!formData.addressLine1.trim()) {
            newErrors.addressLine1 = 'Address line is required';
        }

        if (!formData.city.trim()) {
            newErrors.city = 'City is required';
        }

        if (!formData.state.trim()) {
            newErrors.state = 'State is required';
        }

        if (!formData.pincode.trim()) {
            newErrors.pincode = 'Pincode is required';
        } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
            newErrors.pincode = 'Pincode must contain exactly 6 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (cart.length === 0) {
            setErrorMessage('Your cart is empty. Please add items before checking out.');
            return;
        }

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);

        try {
            const orderData = await createPaymentOrder({
                fullName: formData.fullName.trim(),
                phone: formData.phone.trim(),
                addressLine1: formData.addressLine1.trim(),
                city: formData.city.trim(),
                state: formData.state.trim(),
                pincode: formData.pincode.trim()
            });

            if (!orderData.success) {
                throw new Error(orderData.message || 'Failed to initialize order');
            }

            const scriptLoaded = await loadRazorpayScript();

            if (!scriptLoaded || !window.Razorpay) {
                setErrorMessage('Unable to load payment gateway. Please check your internet connection.');
                setSubmitting(false);
                return;
            }

            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency || 'INR',
                name: 'ShopKart',
                description: 'ShopKart Order Checkout',
                order_id: orderData.razorpayOrderId,
                prefill: {
                    name: formData.fullName.trim(),
                    contact: formData.phone.trim(),
                    email: customerEmail || ''
                },
                theme: {
                    color: '#2563eb'
                },
                handler: async function (response) {
                    try {
                        setSubmitting(true);
                        const verifyRes = await verifyPayment({
                            shopKartOrderId: orderData.shopKartOrderId,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verifyRes.success) {
                            clearCartState();
                            navigate(`/order-success/${orderData.shopKartOrderId}`);
                        } else {
                            setErrorMessage(verifyRes.message || 'Payment verification failed');
                            setSubmitting(false);
                        }
                    } catch (verifyErr) {
                        setErrorMessage(
                            verifyErr.response?.data?.message || 'Payment verification failed. Please contact support.'
                        );
                        setSubmitting(false);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setSubmitting(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', function (resp) {
                setErrorMessage(
                    `Payment failed: ${resp.error?.description || 'Transaction declined'}. Your cart has been saved.`
                );
                setSubmitting(false);
            });

            rzp.open();
        } catch (err) {
            console.error('Checkout error:', err);
            setErrorMessage(err.response?.data?.message || err.message || 'Something went wrong during checkout');
            setSubmitting(false);
        }
    };

    if (!authChecked) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <main className="flex-grow flex flex-col items-center justify-center py-20 px-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Verifying session...</p>
                </main>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <main className="flex-grow max-w-3xl mx-auto px-4 py-16 text-center">
                    <div className="bg-white rounded-3xl border border-gray-100 p-12 shadow-sm">
                        <div className="text-5xl mb-4">🛒</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
                        <p className="text-gray-500 mb-6">You must have items in your cart to proceed with checkout.</p>
                        <Link
                            to="/products"
                            className="inline-flex bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-sm font-semibold transition-all"
                        >
                            Browse Products
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Checkout</h1>
                        <p className="mt-1 text-gray-600 text-sm">Provide your shipping address and complete payment</p>
                    </div>
                    <Link to="/cart" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        ← Back to Cart
                    </Link>
                </div>

                {errorMessage && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-start gap-3">
                        <span className="text-lg">⚠️</span>
                        <div>
                            <p className="font-semibold">Checkout Notice</p>
                            <p className="mt-0.5">{errorMessage}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span>📍</span> Shipping Address
                        </h2>

                        <form onSubmit={handlePaymentSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Aarav Sharma"
                                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${
                                            errors.fullName
                                                ? 'border-red-500 bg-red-50/30 focus:border-red-500'
                                                : 'border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                                        }`}
                                    />
                                    {errors.fullName && (
                                        <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                        Phone Number (10 digits) *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        maxLength="10"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 9876543210"
                                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${
                                            errors.phone
                                                ? 'border-red-500 bg-red-50/30 focus:border-red-500'
                                                : 'border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                                        }`}
                                    />
                                    {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                    Address Line 1 *
                                </label>
                                <input
                                    type="text"
                                    name="addressLine1"
                                    value={formData.addressLine1}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Flat 402, Sunshine Heights, MG Road"
                                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${
                                        errors.addressLine1
                                            ? 'border-red-500 bg-red-50/30 focus:border-red-500'
                                            : 'border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                                    }`}
                                />
                                {errors.addressLine1 && (
                                    <p className="mt-1 text-xs text-red-600">{errors.addressLine1}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Bengaluru"
                                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${
                                            errors.city
                                                ? 'border-red-500 bg-red-50/30 focus:border-red-500'
                                                : 'border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                                        }`}
                                    />
                                    {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                        State *
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Karnataka"
                                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${
                                            errors.state
                                                ? 'border-red-500 bg-red-50/30 focus:border-red-500'
                                                : 'border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                                        }`}
                                    />
                                    {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                        Pincode (6 digits) *
                                    </label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        maxLength="6"
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 560001"
                                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${
                                            errors.pincode
                                                ? 'border-red-500 bg-red-50/30 focus:border-red-500'
                                                : 'border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                                        }`}
                                    />
                                    {errors.pincode && (
                                        <p className="mt-1 text-xs text-red-600">{errors.pincode}</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                    🔒 Razorpay Test Mode — No real money charged
                                </span>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm sticky top-24">
                        <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">
                            Order Summary
                        </h2>

                        <div className="py-4 space-y-3 max-h-60 overflow-y-auto">
                            {cart.map((item) => (
                                <div
                                    key={item.product?._id || item._id}
                                    className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50"
                                >
                                    <div className="flex items-center gap-3 pr-2">
                                        {item.product?.image && (
                                            <img
                                                src={item.product.image}
                                                alt={item.product.name}
                                                className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                                            />
                                        )}
                                        <div>
                                            <p className="font-medium text-gray-900 truncate max-w-[140px]">
                                                {item.product?.name}
                                            </p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="text-right font-semibold text-gray-900">
                                        {formatPrice((item.product?.price || 0) * (item.quantity || 1))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2.5 py-4 text-sm border-t border-gray-100">
                            <div className="flex justify-between text-gray-600">
                                <span>Total Items:</span>
                                <span className="font-semibold text-gray-900">{cartCount}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal:</span>
                                <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery Fee:</span>
                                <span className="text-green-600 font-semibold">FREE</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4 flex justify-between items-center mb-6">
                            <span className="text-base font-bold text-gray-900">Final Total:</span>
                            <span className="text-2xl font-extrabold text-blue-600">{formatPrice(subtotal)}</span>
                        </div>

                        <button
                            type="button"
                            onClick={handlePaymentSubmit}
                            disabled={submitting}
                            className={`w-full py-4 px-6 rounded-2xl font-semibold text-base transition-all shadow-md text-white flex items-center justify-center gap-2 cursor-pointer ${
                                submitting
                                    ? 'bg-blue-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
                            }`}
                        >
                            {submitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Processing Payment...</span>
                                </>
                            ) : (
                                <>
                                    <span>💳 Place Order & Pay</span>
                                </>
                            )}
                        </button>

                        <p className="mt-3 text-center text-xs text-gray-400">
                            Payments are securely verified via Razorpay HMAC SHA256.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Checkout;
