import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getMyOrders, updateOrderStatus } from '../services/api';
import api from '../services/api';

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
        year: 'numeric'
    });
};

const getStatusBadge = (status) => {
    switch (status) {
        case 'PLACED':
            return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'CONFIRMED':
            return 'bg-indigo-50 text-indigo-700 border-indigo-200';
        case 'SHIPPED':
            return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        case 'DELIVERED':
            return 'bg-green-50 text-green-700 border-green-200';
        default:
            return 'bg-gray-50 text-gray-700 border-gray-200';
    }
};

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getMyOrders();
            setOrders(data.orders || []);
        } catch (err) {
            console.error('Failed to load orders:', err);
            if (err.response?.status === 401) {
                navigate('/login');
            } else {
                setError(err.response?.data?.message || 'Failed to load your orders.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Orders</h1>
                        <p className="mt-1 text-gray-600 text-sm">
                            {orders.length === 1 ? '1 order placed' : `${orders.length} orders placed`}
                        </p>
                    </div>
                    <Link
                        to="/products"
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                        ← Continue Shopping
                    </Link>
                </div>

                {loading && (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600 text-sm">Loading your orders...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-md mx-auto my-8">
                        <p className="text-red-700 font-semibold text-lg">Unable to load orders</p>
                        <p className="text-red-600 text-sm mt-1">{error}</p>
                        <button
                            type="button"
                            onClick={fetchOrders}
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && orders.length === 0 && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-lg mx-auto my-8 shadow-sm flex flex-col items-center">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-4xl mb-4">
                            📦
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">You have not placed any orders yet.</h2>
                        <p className="text-gray-500 mt-2 max-w-xs text-sm">
                            Your completed purchases and delivery snapshots will appear here.
                        </p>
                        <Link
                            to="/products"
                            className="mt-6 inline-flex bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-sm font-semibold transition-all shadow-sm hover:shadow"
                        >
                            Start Shopping
                        </Link>
                    </div>
                )}

                {!loading && !error && orders.length > 0 && (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-gray-100 gap-3">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="font-mono text-sm font-bold text-gray-900">
                                            Order #{order._id}
                                        </span>
                                        <span className="text-xs text-gray-400">•</span>
                                        <span className="text-xs text-gray-500">
                                            {formatDate(order.createdAt)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[11px] text-gray-400 font-medium">Status:</span>
                                            <select
                                                value={order.status}
                                                onChange={async (e) => {
                                                    const newStatus = e.target.value;
                                                    try {
                                                        await updateOrderStatus(order._id, newStatus);
                                                        setOrders((prev) =>
                                                            prev.map((o) =>
                                                                o._id === order._id ? { ...o, status: newStatus } : o
                                                            )
                                                        );
                                                    } catch (err) {
                                                        console.error('Status update failed:', err);
                                                    }
                                                }}
                                                className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none transition-colors ${getStatusBadge(
                                                    order.status
                                                )}`}
                                                title="Change status (Lab-06 Bonus Challenge)"
                                            >
                                                <option value="PLACED">PLACED</option>
                                                <option value="CONFIRMED">CONFIRMED</option>
                                                <option value="SHIPPED">SHIPPED</option>
                                                <option value="DELIVERED">DELIVERED</option>
                                            </select>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                                order.paymentStatus === 'PAID'
                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}
                                        >
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                </div>

                                <div className="py-4 divide-y divide-gray-50">
                                    {(order.items || []).map((item, idx) => (
                                        <div
                                            key={item._id || idx}
                                            className="py-3 flex items-center justify-between text-sm"
                                        >
                                            <div className="flex items-center gap-3">
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-12 h-12 object-cover rounded-xl border border-gray-100"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-semibold text-gray-900">{item.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Qty: {item.quantity} × {formatPrice(item.price)}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-gray-900">
                                                {formatPrice(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        {order.shippingAddress && (
                                            <p className="text-xs text-gray-500">
                                                Shipped to:{' '}
                                                <span className="font-medium text-gray-700">
                                                    {order.shippingAddress.fullName},{' '}
                                                    {order.shippingAddress.city} (
                                                    {order.shippingAddress.pincode})
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <span className="text-xs text-gray-500 block">Total Amount</span>
                                            <span className="text-xl font-extrabold text-blue-600">
                                                {formatPrice(order.totalAmount)}
                                            </span>
                                        </div>
                                        <Link
                                            to={`/order-success/${order._id}`}
                                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                                        >
                                            View Receipt
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Orders;
