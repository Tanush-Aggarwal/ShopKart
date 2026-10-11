import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (product.stock <= 0) {
            return res.status(400).json({
                success: false,
                message: "Product is out of stock"
            });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Customer not found"
            });
        }

        if (!customer.cart) {
            customer.cart = [];
        }

        const cartItemIndex = customer.cart.findIndex(
            (item) => item.product && item.product.toString() === productId.toString()
        );

        if (cartItemIndex > -1) {
            const nextQuantity = customer.cart[cartItemIndex].quantity + 1;
            if (nextQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: "Quantity exceeds available stock"
                });
            }
            customer.cart[cartItemIndex].quantity = nextQuantity;
        } else {
            if (1 > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: "Quantity exceeds available stock"
                });
            }
            customer.cart.push({
                product: productId,
                quantity: 1
            });
        }

        await customer.save();

        const updatedCustomer = await Customer.findById(customer._id).populate({
            path: "cart.product",
            select: "name price image stock category"
        });

        const validCart = (updatedCustomer.cart || []).filter((item) => item.product !== null);

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: validCart
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
};

export const getCart = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name price image stock category"
        });

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Customer not found"
            });
        }

        const validCart = (customer.cart || []).filter((item) => item.product !== null);

        return res.status(200).json({
            success: true,
            cart: validCart
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
};

export const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const numericQuantity = Number(quantity);
        if (Number.isNaN(numericQuantity) || numericQuantity < 1 || !Number.isInteger(numericQuantity)) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be an integer of at least 1"
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (numericQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Quantity exceeds available stock"
            });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Customer not found"
            });
        }

        if (!customer.cart) {
            customer.cart = [];
        }

        const cartItemIndex = customer.cart.findIndex(
            (item) => item.product && item.product.toString() === productId.toString()
        );

        if (cartItemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not in cart"
            });
        }

        customer.cart[cartItemIndex].quantity = numericQuantity;
        await customer.save();

        const updatedCustomer = await Customer.findById(customer._id).populate({
            path: "cart.product",
            select: "name price image stock category"
        });

        const validCart = (updatedCustomer.cart || []).filter((item) => item.product !== null);

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: validCart
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Customer not found"
            });
        }

        if (!customer.cart) {
            customer.cart = [];
        }

        const cartItemIndex = customer.cart.findIndex(
            (item) => item.product && item.product.toString() === productId.toString()
        );

        if (cartItemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not in cart"
            });
        }

        customer.cart.splice(cartItemIndex, 1);
        await customer.save();

        const updatedCustomer = await Customer.findById(customer._id).populate({
            path: "cart.product",
            select: "name price image stock category"
        });

        const validCart = (updatedCustomer.cart || []).filter((item) => item.product !== null);

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart: validCart
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
};
