import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085';
const baseURL = rawBaseURL.replace(/\/+$/, '');

const api = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

export const getProducts = async ({ search, category, sort } = {}) => {
    const params = {};

    if (search) {
        params.search = search;
    }

    if (category && category !== "All") {
        params.category = category;
    }

    if (sort) {
        params.sort = sort;
    }

    const response = await api.get("/products", { params });
    return response.data;
};

export const getProduct = async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

export const getWishlist = async () => {
    const response = await api.get('/wishlist');
    return response.data;
};

export const addToWishlist = async (productId) => {
    const response = await api.post(`/wishlist/${productId}`);
    return response.data;
};

export const removeFromWishlist = async (productId) => {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
};

export const toggleWishlist = async (productId) => {
    const response = await api.patch(`/wishlist/${productId}/toggle`);
    return response.data;
};

export const getCart = async () => {
    const response = await api.get('/cart');
    return response.data;
};

export const addToCart = async (productId) => {
    const response = await api.post(`/cart/${productId}`);
    return response.data;
};

export const updateCartQuantity = async (productId, quantity) => {
    const response = await api.patch(`/cart/${productId}`, { quantity });
    return response.data;
};

export const removeFromCart = async (productId) => {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
};

export const createPaymentOrder = async (shippingAddress) => {
    const response = await api.post('/orders/create-payment-order', { shippingAddress });
    return response.data;
};

export const verifyPayment = async (paymentData) => {
    const response = await api.post('/orders/verify-payment', paymentData);
    return response.data;
};

export const getMyOrders = async () => {
    const response = await api.get('/orders');
    return response.data;
};

export const getOrderById = async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
};

export const updateOrderStatus = async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
};

export default api;
