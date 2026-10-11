import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { addToWishlist, toggleWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(price);

const ProductCard = ({ product }) => {
    const inStock = product.stock > 0;
    const { addToCart, itemLoading: cartBusy } = useCart();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [cardError, setCardError] = useState('');
    const [justAddedToCart, setJustAddedToCart] = useState(false);

    const isCartLoading = cartBusy ? cartBusy[product._id] : false;

    const handleAddToWishlist = async (e) => {
        e.preventDefault();
        if (isWishlistLoading || isWishlisted) return;
        setCardError('');
        setIsWishlistLoading(true);
        try {
            await addToWishlist(product._id);
            setIsWishlisted(true);
        } catch (err) {
            if (err.response?.status === 409) {
                setIsWishlisted(true);
            } else {
                setCardError(err.response?.data?.message || 'Unable to save product. Please try again.');
            }
        } finally {
            setIsWishlistLoading(false);
        }
    };

    const handleHeartToggle = async (e) => {
        e.preventDefault();
        if (isWishlistLoading) return;
        setCardError('');
        setIsWishlistLoading(true);
        try {
            const res = await toggleWishlist(product._id);
            setIsWishlisted(Boolean(res.saved));
        } catch (err) {
            setCardError(err.response?.data?.message || 'Unable to update wishlist.');
        } finally {
            setIsWishlistLoading(false);
        }
    };

    const handleAddToCartClick = async (e) => {
        e.preventDefault();
        setCardError('');
        const res = await addToCart(product._id);
        if (!res.success) {
            setCardError(res.message || 'Unable to add to cart.');
        } else {
            setJustAddedToCart(true);
            setTimeout(() => setJustAddedToCart(false), 1800);
        }
    };

    return (
        <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md relative group">
            <div className="h-48 bg-gray-100 relative overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <button
                    type="button"
                    onClick={handleHeartToggle}
                    disabled={isWishlistLoading}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md shadow-sm transition-all duration-200 cursor-pointer ${
                        isWishlisted
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-white/80 text-gray-600 hover:text-red-500 hover:bg-white'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                    title={isWishlisted ? "♥ In Wishlist" : "♡ Add to Wishlist"}
                >
                    {isWishlistLoading ? (
                        <span className="text-xs font-medium">⏳</span>
                    ) : (
                        <span className="text-lg leading-none">{isWishlisted ? '♥' : '♡'}</span>
                    )}
                </button>
            </div>

            <div className="p-5 flex flex-col flex-grow gap-2">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.category}</p>
                <p className="text-xl font-bold text-blue-600">{formatPrice(product.price)}</p>
                <p className={`text-sm font-medium ${inStock ? 'text-green-600' : 'text-red-500'}`}>
                    {inStock ? `${product.stock} units left` : 'Out of stock'}
                </p>

                {cardError && (
                    <p className="text-xs text-red-600 font-medium bg-red-50 p-1.5 rounded-lg border border-red-100">
                        {cardError}
                    </p>
                )}

                <div className="mt-auto pt-2 grid grid-cols-2 gap-2">
                    <Link
                        to={`/products/${product._id}`}
                        className="inline-flex justify-center items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-center"
                    >
                        View Details
                    </Link>

                    <button
                        type="button"
                        onClick={handleAddToCartClick}
                        disabled={!inStock || isCartLoading}
                        className={`inline-flex justify-center items-center px-3 py-2 rounded-xl text-xs font-semibold transition-all text-center cursor-pointer ${
                            !inStock
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : justAddedToCart
                                ? 'bg-green-600 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } disabled:opacity-70`}
                    >
                        {isCartLoading ? 'Adding...' : justAddedToCart ? '✓ Added' : inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>

                <button
                    type="button"
                    onClick={handleAddToWishlist}
                    disabled={isWishlistLoading}
                    className="w-full text-center text-xs font-medium text-gray-600 hover:text-red-600 py-1 transition-colors cursor-pointer disabled:opacity-50"
                >
                    {isWishlistLoading
                        ? '⏳ Saving...'
                        : isWishlisted
                        ? '♥ Added to Wishlist'
                        : '♡ Add to Wishlist'}
                </button>
            </div>
        </article>
    );
};

export default ProductCard;
