import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

const Home = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/customers/me');
                setUser(response.data);
            } catch (err) {
                console.error("Failed to fetch user:", err);
                setError("Please log in to view this page.");
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-12 text-white">
                        <h1 className="text-4xl font-extrabold tracking-tight">
                            Welcome back, {user.fullName.split(' ')[0]}! 👋
                        </h1>
                        <p className="mt-2 text-blue-100 text-lg">
                            We're glad to see you again. Check out what's new today.
                        </p>
                        <Link
                            to="/products"
                            className="mt-6 inline-flex bg-white text-blue-700 px-5 py-2 rounded-full text-sm font-semibold"
                        >
                            Browse products
                        </Link>
                    </div>
                    
                    <div className="p-8 sm:p-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Profile Information</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 transition-all hover:shadow-md">
                                <div className="text-sm font-medium text-gray-500 mb-1">Full Name</div>
                                <div className="text-xl font-semibold text-gray-900">{user.fullName}</div>
                            </div>
                            
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 transition-all hover:shadow-md">
                                <div className="text-sm font-medium text-gray-500 mb-1">Email Address</div>
                                <div className="text-xl font-semibold text-gray-900">{user.email}</div>
                            </div>
                            
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 transition-all hover:shadow-md">
                                <div className="text-sm font-medium text-gray-500 mb-1">Phone Number</div>
                                <div className="text-xl font-semibold text-gray-900">{user.phone}</div>
                            </div>
                            
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 transition-all hover:shadow-md">
                                <div className="text-sm font-medium text-gray-500 mb-1">Member Since</div>
                                <div className="text-xl font-semibold text-gray-900">
                                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;
