import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getProduct, toggleWishlist } from '../services/api';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';

const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(price);

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ready, setReady] = useState(false);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cartMessage, setCartMessage] = useState('');
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);

    const { addToCart, itemLoading: cartBusy } = useCart();

    const isCartLoading = product && cartBusy ? cartBusy[product._id] : false;

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

        const loadProduct = async () => {
            setLoading(true);
            setError(null);
            setCartMessage('');

            try {
                const data = await getProduct(id);
                setProduct(data.product);
            } catch (err) {
                console.error('Failed to load product:', err);
                setProduct(null);
                setError('Something went wrong while loading products.');
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [ready, id]);

    const handleAddToCart = async () => {
        if (!product) return;
        setCartMessage('');
        const res = await addToCart(product._id);
        if (res.success) {
            setCartMessage('✓ Successfully added to cart!');
        } else {
            setCartMessage(res.message || 'Failed to add product to cart.');
        }
    };

    const handleToggleWishlist = async () => {
        if (!product || isWishlistLoading) return;
        setCartMessage('');
        setIsWishlistLoading(true);
        try {
            const res = await toggleWishlist(product._id);
            setIsWishlisted(Boolean(res.saved));
        } catch (err) {
            setCartMessage(err.response?.data?.message || 'Failed to update wishlist.');
        } finally {
            setIsWishlistLoading(false);
        }
    };

    if (!ready || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-600 text-lg">Loading products...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <Link to="/products" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    ← Back to products
                </Link>

                {error && (
                    <p className="mt-6 text-red-600 text-lg">{error}</p>
                )}

                {!error && !product && (
                    <p className="mt-6 text-gray-600 text-lg">No products found.</p>
                )}

                {!error && product && (
                    <div className="mt-6 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2">
                        <div className="bg-gray-100 min-h-72">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="p-8 flex flex-col gap-4">
                            <p className="text-sm font-medium text-blue-600">{product.category}</p>
                            <h1 className="text-3xl font-extrabold text-gray-900">{product.name}</h1>
                            <p className="text-gray-600">{product.description}</p>
                            <p className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</p>
                            <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {product.stock > 0 ? `${product.stock} units in stock` : 'Out of stock'}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0 || isCartLoading}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow"
                                >
                                    {isCartLoading ? 'Adding...' : product.stock > 0 ? 'Add to Cart' : 'Out of stock'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleToggleWishlist}
                                    disabled={isWishlistLoading}
                                    className={`px-5 py-3 rounded-full text-sm font-semibold border transition-all cursor-pointer ${
                                        isWishlisted
                                            ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                                            : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                    } disabled:opacity-50`}
                                >
                                    {isWishlistLoading ? '⏳ Saving...' : isWishlisted ? '♥ Saved in Wishlist' : '♡ Add to Wishlist'}
                                </button>
                            </div>
                            {cartMessage && (
                                <p className={`text-sm font-medium ${cartMessage.startsWith('✓') ? 'text-green-600' : 'text-gray-600'}`}>
                                    {cartMessage}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProductDetails;
