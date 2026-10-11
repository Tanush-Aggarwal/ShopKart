import mongoose from "mongoose";
import Product from "../models/product.model.js";

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        if (!name || !description || price === undefined || price === "" || !category || !image || stock === undefined || stock === "") {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const numericPrice = Number(price);
        const numericStock = Number(stock);

        if (Number.isNaN(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be greater than 0"
            });
        }

        if (Number.isNaN(numericStock) || numericStock < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock cannot be negative"
            });
        }

        const product = await Product.create({
            name,
            description,
            price: numericPrice,
            category,
            image,
            stock: numericStock
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const getProducts = async (req, res) => {
    try {
        const { search, category, sort } = req.query;
        const filter = {};

        if (search && search.trim()) {
            filter.name = { $regex: escapeRegex(search.trim()), $options: "i" };
        }

        if (category && category !== "All" && category !== "All Categories") {
            filter.category = category;
        }

        let sortOption = { createdAt: -1 };

        if (sort === "price_asc") {
            sortOption = { price: 1 };
        } else if (sort === "price_desc") {
            sortOption = { price: -1 };
        }

        const products = await Product.find(filter)
            .select("name price category image stock")
            .sort(sortOption);

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            product
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};
