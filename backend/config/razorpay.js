import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

export const getRazorpayClient = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
};

const razorpay = new Proxy({}, {
    get(target, prop) {
        const client = getRazorpayClient();
        const value = client[prop];
        return typeof value === "function" ? value.bind(client) : value;
    }
});

export default razorpay;
