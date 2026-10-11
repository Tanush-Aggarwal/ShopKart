import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import dns from "dns";

import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";

try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {}

const app = express();
const port = process.env.PORT || 8085;

const mongoUri = (process.env.dbURL || process.env.MONGO_URI || "").trim().replace(/^["']|["']$/g, '');

mongoose.connect(mongoUri)
    .then(() => {
        console.log("DB Connected to ShopKart");
    })
    .catch((err) => {
        console.log("Database connection error:", err);
    });

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

app.listen(port, () => {
    console.log(`ShopKart Server Started at ${port}`);
});
