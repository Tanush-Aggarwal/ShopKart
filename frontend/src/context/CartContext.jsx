import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getCart, addToCart as apiAddToCart, updateCartQuantity as apiUpdateQty, removeFromCart as apiRemoveFromCart } from '../services/api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [itemLoading, setItemLoading] = useState({});

    const setProductBusy = (productId, isBusy) => {
        setItemLoading(prev => ({ ...prev, [productId]: isBusy }));
    };

    const fetchCart = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getCart();
            setCart(data.cart || []);
        } catch (err) {
            if (err.response?.status !== 401) {
                console.error("Failed to load cart:", err);
                setError(err.response?.data?.message || "Failed to load cart");
            } else {
                setCart([]);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = async (productId) => {
        setProductBusy(productId, true);
        setError(null);
        try {
            const data = await apiAddToCart(productId);
            if (data.cart) {
                setCart(data.cart);
            } else {
                await fetchCart();
            }
            return { success: true, message: data.message || "Added to cart" };
        } catch (err) {
            const message = err.response?.data?.message || "Failed to add product to cart";
            setError(message);
            return { success: false, message };
        } finally {
            setProductBusy(productId, false);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        setProductBusy(productId, true);
        setError(null);
        try {
            const data = await apiUpdateQty(productId, quantity);
            if (data.cart) {
                setCart(data.cart);
            } else {
                await fetchCart();
            }
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Failed to update quantity";
            setError(message);
            return { success: false, message };
        } finally {
            setProductBusy(productId, false);
        }
    };

    const removeFromCart = async (productId) => {
        setProductBusy(productId, true);
        setError(null);
        try {
            const data = await apiRemoveFromCart(productId);
            if (data.cart) {
                setCart(data.cart);
            } else {
                await fetchCart();
            }
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Failed to remove item from cart";
            setError(message);
            return { success: false, message };
        } finally {
            setProductBusy(productId, false);
        }
    };

    const cartCount = useMemo(() => {
        return cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
    }, [cart]);

    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => {
            const price = Number(item.product?.price) || 0;
            const quantity = Number(item.quantity) || 0;
            return sum + (price * quantity);
        }, 0);
    }, [cart]);

    const clearCartState = () => {
        setCart([]);
        setError(null);
    };

    const value = {
        cart,
        loading,
        error,
        itemLoading,
        cartCount,
        subtotal,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCartState,
        setError
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};

export default CartContext;
