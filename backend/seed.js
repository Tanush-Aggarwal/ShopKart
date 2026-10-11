import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import Product from "./models/product.model.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
dotenv.config();

const products = [
    {
        name: "Noise Cancelling Headphones",
        description: "Wireless over-ear headphones with active noise cancellation.",
        price: 4999,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        stock: 25
    },
    {
        name: "Mechanical Keyboard",
        description: "RGB mechanical keyboard with blue switches.",
        price: 2999,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80",
        stock: 10
    },
    {
        name: "Smartphone",
        description: "6.5 inch display smartphone with a 50MP camera.",
        price: 18999,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
        stock: 8
    },
    {
        name: "Cotton T-Shirt",
        description: "Soft everyday cotton t-shirt available in multiple sizes.",
        price: 799,
        category: "Fashion",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
        stock: 40
    },
    {
        name: "Running Shoes",
        description: "Lightweight running shoes with cushioned soles.",
        price: 3499,
        category: "Fashion",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
        stock: 15
    },
    {
        name: "JavaScript Guide",
        description: "A beginner-friendly book covering modern JavaScript.",
        price: 599,
        category: "Books",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
        stock: 30
    },
    {
        name: "Desk Lamp",
        description: "Adjustable LED desk lamp for study and work.",
        price: 1299,
        category: "Home",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
        stock: 12
    },
    {
        name: "Ceramic Mug",
        description: "350ml ceramic mug, dishwasher safe.",
        price: 349,
        category: "Home",
        image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80",
        stock: 0
    }
];

const seedProducts = async () => {
    await mongoose.connect(process.env.dbURL);

    const existing = await Product.countDocuments();
    if (existing > 0) {
        console.log(`Products already exist (${existing}). Seed skipped.`);
        await mongoose.disconnect();
        return;
    }

    await Product.insertMany(products);
    console.log(`Inserted ${products.length} products.`);
    await mongoose.disconnect();
};

seedProducts().catch(async (err) => {
    console.log("Seed failed:", err.message);
    await mongoose.disconnect();
    process.exit(1);
});
