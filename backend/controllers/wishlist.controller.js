import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

export const addToWishlist = async (req, res) => {
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

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Customer not found"
            });
        }

        if (!customer.wishlist) {
            customer.wishlist = [];
        }

        const isAlreadyWishlisted = customer.wishlist.some(
            (id) => id.toString() === productId.toString()
        );

        if (isAlreadyWishlisted) {
            return res.status(409).json({
                success: false,
                message: "Product already in wishlist"
            });
        }

        customer.wishlist.push(productId);
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
};

export const getWishlist = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate({
            path: "wishlist",
            select: "name description price category image stock"
        });

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Customer not found"
            });
        }

        const validWishlist = (customer.wishlist || []).filter((item) => item !== null);

        return res.status(200).json({
            success: true,
            count: validWishlist.length,
            wishlist: validWishlist
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
};

export const removeFromWishlist = async (req, res) => {
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

        if (!customer.wishlist) {
            customer.wishlist = [];
        }

        const index = customer.wishlist.findIndex(
            (id) => id.toString() === productId.toString()
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not in wishlist"
            });
        }

        customer.wishlist.splice(index, 1);
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
};

export const toggleWishlist = async (req, res) => {
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

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Customer not found"
            });
        }

        if (!customer.wishlist) {
            customer.wishlist = [];
        }

        const index = customer.wishlist.findIndex(
            (id) => id.toString() === productId.toString()
        );

        if (index !== -1) {
            customer.wishlist.splice(index, 1);
            await customer.save();
            return res.status(200).json({
                success: true,
                saved: false,
                message: "Product removed from wishlist"
            });
        } else {
            customer.wishlist.push(productId);
            await customer.save();
            return res.status(200).json({
                success: true,
                saved: true,
                message: "Product added to wishlist"
            });
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
};
