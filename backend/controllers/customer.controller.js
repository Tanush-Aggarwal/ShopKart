import Customer from "../models/customer.model.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";

const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000
};

export const registerCustomer = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;

        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const emailExists = await Customer.findOne({ email });
        if (emailExists) {
            return res.status(409).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newCustomer = await Customer.create({
            fullName,
            email,
            password: hashedPassword,
            phone
        });

        return res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer: {
                _id: newCustomer._id,
                fullName: newCustomer.fullName,
                email: newCustomer.email,
                phone: newCustomer.phone
            }
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
};

export const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const customer = await Customer.findOne({ email });

        if (!customer) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, customer.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(customer._id);
        res.cookie("token", token, cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Login successful"
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const logoutCustomer = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: false
    });

    return res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const getMe = (req, res) => {
    return res.status(200).json(req.user);
};

export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Old password and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters"
            });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Customer not found"
            });
        }

        const isMatch = await bcrypt.compare(oldPassword, customer.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Incorrect old password"
            });
        }

        customer.password = await bcrypt.hash(newPassword, 10);
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};
