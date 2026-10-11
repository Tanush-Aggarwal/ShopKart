import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getOrderById } from '../services/api';

const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(price);

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const OrderSuccess = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await getOrderById(id);
                if (res.success && res.order) {
                    setOrder(res.order);
                } else {
                    setError('Order details could not be retrieved.');
                }
            } catch (err) {
                console.error('Failed to load order:', err);
                setError(err.response?.data?.message || 'Unable to load order details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <main className="flex-grow flex flex-col items-center justify-center py-20 px-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 text-lg">Retrieving confirmed order...</p>
                </main>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <main className="flex-grow max-w-xl mx-auto px-4 py-16 text-center">
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                        <div className="text-4xl mb-3">⚠️</div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                        <p className="text-gray-500 text-sm mb-6">{error || 'The requested order could not be located.'}</p>
                        <div className="flex justify-center gap-4">
                            <Link
                                to="/orders"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
                            >
                                View My Orders
                            </Link>
                            <Link
                                to="/products"
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-sm mb-8 text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-5 shadow-sm">
                        ✓
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Order Placed Successfully!
                    </h1>
                    <p className="mt-2 text-gray-600 text-base">
                        Thank you for your purchase. Your payment has been verified and your order is confirmed.
                    </p>

                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-mono">
                        <span>Order ID:</span>
                        <span className="font-bold select-all">{order._id}</span>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            to="/orders"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-sm font-semibold transition-all shadow-sm hover:shadow"
                        >
                            View My Orders
                        </Link>
                        <Link
                            to="/products"
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-2xl text-sm font-semibold transition-all"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-100 gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Order Information</h2>
                            <p className="text-xs text-gray-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                Payment: {order.paymentStatus}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                Status: {order.status}
                            </span>
                        </div>
                    </div>

                    {order.shippingAddress && (
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                Delivery Address
                            </h3>
                            <p className="font-semibold text-gray-900 text-sm">
                                {order.shippingAddress.fullName}{' '}
                                <span className="text-gray-500 font-normal">({order.shippingAddress.phone})</span>
                            </p>
                            <p className="text-gray-600 text-sm mt-0.5">
                                {order.shippingAddress.addressLine1}, {order.shippingAddress.city},{' '}
                                {order.shippingAddress.state} — {order.shippingAddress.pincode}
                            </p>
                        </div>
                    )}

                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
                            Items Ordered ({order.items?.length || 0})
                        </h3>
                        <div className="divide-y divide-gray-100">
                            {(order.items || []).map((item, idx) => (
                                <div key={item._id || idx} className="py-3.5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {item.image && (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-14 h-14 object-cover rounded-xl border border-gray-100"
                                            />
                                        )}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Qty: {item.quantity} × {formatPrice(item.price)}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-gray-900 text-sm">
                                        {formatPrice(item.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-base font-bold text-gray-900">Total Amount Paid</span>
                        <span className="text-2xl font-black text-blue-600">{formatPrice(order.totalAmount)}</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OrderSuccess;
