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

dns.setServers(["8.8.8.8","8.8.4.4"]);

const app = express();
const port = 8085;

mongoose.connect(process.env.dbURL)
    .then(() => {
        console.log("DB Connected to ShopKart");
    })
    .catch((err) => {
        console.log("Database connection error:", err);
    });

app.use(cors({
    origin: "http://localhost:5173",
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
