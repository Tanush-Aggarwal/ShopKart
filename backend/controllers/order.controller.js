import mongoose from "mongoose";
import crypto from "crypto";
import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import razorpay from "../config/razorpay.js";

export const createPaymentOrder = async (req, res) => {
    try {
        const { shippingAddress } = req.body;

        if (!shippingAddress || typeof shippingAddress !== "object") {
            return res.status(400).json({
                success: false,
                message: "Shipping address is required"
            });
        }

        const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress;

        if (
            !fullName?.trim() ||
            !phone?.trim() ||
            !addressLine1?.trim() ||
            !city?.trim() ||
            !state?.trim() ||
            !pincode?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "All shipping address fields are required and cannot be blank"
            });
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone.trim())) {
            return res.status(400).json({
                success: false,
                message: "Phone number must be a valid 10-digit number"
            });
        }

        const pincodeRegex = /^\d{6}$/;
        if (!pincodeRegex.test(pincode.trim())) {
            return res.status(400).json({
                success: false,
                message: "Pincode must contain exactly 6 digits"
            });
        }

        const customer = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name price image stock"
        });

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Customer not found"
            });
        }

        const validCart = (customer.cart || []).filter((item) => item.product !== null);

        if (validCart.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty. Please add items to your cart before checking out."
            });
        }

        let totalAmount = 0;
        const snapshotItems = [];

        for (const item of validCart) {
            const product = await Product.findById(item.product._id);
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Product is no longer available`
                });
            }

            const requestedQuantity = Number(item.quantity) || 1;

            if (product.stock < requestedQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}, requested: ${requestedQuantity}.`
                });
            }

            totalAmount += product.price * requestedQuantity;

            snapshotItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: requestedQuantity,
                image: product.image
            });
        }

        const shopKartOrder = new Order({
            user: customer._id,
            items: snapshotItems,
            shippingAddress: {
                fullName: fullName.trim(),
                phone: phone.trim(),
                addressLine1: addressLine1.trim(),
                city: city.trim(),
                state: state.trim(),
                pincode: pincode.trim()
            },
            totalAmount: Math.round(totalAmount),
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT"
        });

        await shopKartOrder.save();

        const amountInPaise = Math.round(totalAmount * 100);

        try {
            const razorpayOrder = await razorpay.orders.create({
                amount: amountInPaise,
                currency: "INR",
                receipt: shopKartOrder._id.toString()
            });

            shopKartOrder.razorpayOrderId = razorpayOrder.id;
            await shopKartOrder.save();

            return res.status(200).json({
                success: true,
                shopKartOrderId: shopKartOrder._id,
                razorpayOrderId: razorpayOrder.id,
                amount: amountInPaise,
                currency: "INR",
                key: process.env.RAZORPAY_KEY_ID
            });
        } catch (rzpErr) {
            console.error("Razorpay order creation error:", rzpErr?.message || rzpErr);
            await Order.findByIdAndDelete(shopKartOrder._id);
            return res.status(502).json({
                success: false,
                message: "Failed to create payment order with Razorpay",
                error: rzpErr?.message
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


export const verifyPayment = async (req, res) => {
    try {
        const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification parameters"
            });
        }

        if (!mongoose.isValidObjectId(shopKartOrderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ShopKart order ID"
            });
        }

        const order = await Order.findById(shopKartOrderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Forbidden - You do not own this order"
            });
        }

        if (order.paymentStatus === "PAID") {
            return res.status(200).json({
                success: true,
                message: "Order already verified and marked as PAID",
                order
            });
        }

        const body = order.razorpayOrderId + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            order.paymentStatus = "FAILED";
            await order.save();
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        const decrementedItems = [];
        let stockDeductionFailed = false;
        let failedProductName = "";

        for (const item of order.items) {
            const updatedProduct = await Product.findOneAndUpdate(
                { _id: item.product, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { returnDocument: 'after' }
            );

            if (!updatedProduct) {
                stockDeductionFailed = true;
                failedProductName = item.name;
                break;
            }

            decrementedItems.push(item);
        }

        if (stockDeductionFailed) {
            for (const rolledBackItem of decrementedItems) {
                await Product.findByIdAndUpdate(rolledBackItem.product, {
                    $inc: { stock: rolledBackItem.quantity }
                });
            }

            order.paymentStatus = "FAILED";
            await order.save();

            return res.status(400).json({
                success: false,
                message: `Insufficient stock for ${failedProductName}. Order could not be completed.`
            });
        }

        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        const customer = await Customer.findById(req.user._id);
        if (customer) {
            customer.cart = [];
            await customer.save();
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            order
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            orders
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Forbidden - You do not own this order"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}`
            });
        }

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Forbidden - You do not own this order"
            });
        }

        order.status = status;
        await order.save();

        return res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            order
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
};
