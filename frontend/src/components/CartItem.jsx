import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(price);

const CartItem = ({ item }) => {
    const { updateQuantity, removeFromCart, itemLoading } = useCart();
    const product = item.product || {};
    const quantity = item.quantity || 1;
    const stock = product.stock || 0;
    const isBusy = itemLoading[product._id];

    const canIncrease = quantity < stock;
    const canDecrease = quantity > 1;
    const lineTotal = (product.price || 0) * quantity;

    const handleIncrement = () => {
        if (canIncrease && !isBusy) {
            updateQuantity(product._id, quantity + 1);
        }
    };

    const handleDecrement = () => {
        if (canDecrease && !isBusy) {
            updateQuantity(product._id, quantity - 1);
        }
    };

    const handleRemove = () => {
        if (!isBusy) {
            removeFromCart(product._id);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 transition-all hover:shadow-sm">
            <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="flex-grow flex flex-col justify-between w-full sm:w-auto">
                <div>
                    <div className="flex justify-between items-start">
                        <Link
                            to={`/products/${product._id}`}
                            className="text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                            {product.name}
                        </Link>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
                    <p className="text-sm font-bold text-gray-700 mt-1">
                        {formatPrice(product.price)} each
                    </p>
                    {quantity >= stock && stock > 0 && (
                        <p className="text-xs text-amber-600 font-medium mt-1">
                            Max stock reached ({stock} available)
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                        <button
                            type="button"
                            onClick={handleDecrement}
                            disabled={!canDecrease || isBusy}
                            aria-label="Decrease quantity"
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer font-bold text-base transition-colors"
                        >
                            -
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-gray-900 select-none">
                            {quantity}
                        </span>
                        <button
                            type="button"
                            onClick={handleIncrement}
                            disabled={!canIncrease || isBusy}
                            aria-label="Increase quantity"
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer font-bold text-base transition-colors"
                        >
                            +
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <span className="text-xs text-gray-400 block">Total</span>
                            <span className="text-base sm:text-lg font-bold text-blue-600">
                                {formatPrice(lineTotal)}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={handleRemove}
                            disabled={isBusy}
                            className="text-xs font-medium text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItem;
