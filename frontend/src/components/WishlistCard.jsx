import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(price);

const WishlistCard = ({ product, onRemove }) => {
    const { addToCart, itemLoading: cartBusy } = useCart();
    const [isRemoving, setIsRemoving] = useState(false);
    const [cardError, setCardError] = useState('');
    const [justAddedToCart, setJustAddedToCart] = useState(false);

    const inStock = product.stock > 0;
    const isAddingToCart = cartBusy ? cartBusy[product._id] : false;

    const handleRemove = async () => {
        setCardError('');
        setIsRemoving(true);
        try {
            if (onRemove) {
                const res = await onRemove(product._id);
                if (res && !res.success) {
                    setCardError(res.message || 'Failed to remove from wishlist.');
                }
            }
        } catch (err) {
            setCardError('Failed to remove from wishlist.');
        } finally {
            setIsRemoving(false);
        }
    };

    const handleAddToCart = async () => {
        setCardError('');
        const res = await addToCart(product._id);
        if (!res.success) {
            setCardError(res.message || 'Failed to add product to cart.');
        } else {
            setJustAddedToCart(true);
            setTimeout(() => setJustAddedToCart(false), 1800);
        }
    };

    return (
        <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
            <div className="h-48 bg-gray-100 relative">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                />
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

                <div className="mt-auto pt-3 flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                        <Link
                            to={`/products/${product._id}`}
                            className="inline-flex justify-center items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-center"
                        >
                            View Details
                        </Link>
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={!inStock || isAddingToCart}
                            className={`inline-flex justify-center items-center px-3 py-2 rounded-xl text-xs font-semibold transition-all text-center cursor-pointer ${
                                !inStock
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : justAddedToCart
                                    ? 'bg-green-600 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {isAddingToCart ? 'Adding...' : justAddedToCart ? '✓ In Cart' : 'Add to Cart'}
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleRemove}
                        disabled={isRemoving}
                        className="w-full text-center text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                        {isRemoving ? 'Removing...' : 'Remove ♥'}
                    </button>
                </div>
            </div>
        </article>
    );
};

export default WishlistCard;
