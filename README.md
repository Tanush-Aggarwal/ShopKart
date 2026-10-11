# 🛍️ ShopKart — Full-Stack MERN E-Commerce Platform

A production-ready, full-stack e-commerce web application built using the **MERN stack** (MongoDB, Express, React, Node.js) with **Razorpay payment integration**, secure JWT authentication, and responsive modern UI.

---

## 🌐 Live Website

🔗 **[Launch ShopKart App](https://your-shopkart-frontend.vercel.app)** *(Replace with your live Vercel URL)*

---

## ✨ Features

### 👤 Authentication & User Management
- Secure user registration and login with **bcrypt** password hashing.
- Token-based session management using **JWT** (via HttpOnly cookies and Bearer tokens).
- Protected customer profile access and password update functionality (`PATCH /customers/change-password`).

### 🔍 Product Catalog & Discovery
- Dynamic product browsing with category filtering (Electronics, Fashion, Home, Beauty, etc.).
- Real-time search by product name and description.
- Price sorting (Low-to-High, High-to-Low).
- Out-of-stock indicators and real-time stock inventory feedback.

### 💖 Wishlist
- One-click wishlist toggle for registered customers.
- Persistent database storage linked to the customer account.
- Quick transfer of saved items from wishlist directly into the shopping cart.

### 🛒 Shopping Cart
- Real-time cart synchronization with backend database.
- Quantity adjustment (increment/decrement) with stock limit validation.
- Item removal and dynamic subtotal / total price calculations.

### 💳 Checkout & Razorpay Payment Gateway
- Structured shipping address input with format validations (10-digit phone, 6-digit postal code).
- Order initialization through **Razorpay Orders API**.
- Secure server-side payment verification using **HMAC SHA256** digital signatures.
- Automatic inventory decrement and cart clearance upon verified payment.

### 📦 Order History & Tracking
- Complete order history dashboard displaying purchased items, quantities, and timestamps.
- Detailed order summary with individual payment and delivery status badges.
- Backend order status update workflow (`PENDING_PAYMENT`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Modern Vanilla CSS (CSS Variables, Flexbox, CSS Grid, Glassmorphism)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express 5](https://expressjs.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [jsonwebtoken (JWT)](https://github.com/auth0/node-jsonwebtoken) + [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- **Payments**: [Razorpay Node SDK](https://razorpay.com/docs/api/)

### DevOps & Deployment
- **Frontend Hosting**: [Vercel](https://vercel.com/) (Single-Page Application with rewrites)
- **Backend Hosting**: [Render](https://render.com/) (Node.js Web Service)
- **Database Hosting**: MongoDB Atlas Cloud Cluster

---

## 📁 Repository Structure

```text
ShopKart/
├── backend/
│   ├── config/
│   │   └── razorpay.js           # Razorpay SDK initialization
│   ├── controllers/
│   │   ├── cart.controller.js     # Cart business logic
│   │   ├── customer.controller.js # Auth, profile, password logic
│   │   ├── order.controller.js    # Order & Razorpay payment verification
│   │   ├── product.controller.js  # Catalog, search, filtering & sorting
│   │   └── wishlist.controller.js # Wishlist management
│   ├── middlewares/
│   │   └── auth.middleware.js     # JWT authentication guard
│   ├── models/
│   │   ├── customer.model.js     # Customer schema with embedded cart & wishlist
│   │   ├── order.model.js        # Order schema with snapshot items
│   │   └── product.model.js      # Product schema
│   ├── routes/
│   │   ├── cart.routes.js
│   │   ├── customer.routes.js
│   │   ├── order.routes.js
│   │   ├── product.routes.js
│   │   └── wishlist.routes.js
│   ├── index.js                  # Express entry point & CORS configuration
│   ├── package.json
│   └── seed.js                   # Initial sample product catalog seeder
├── frontend/
│   ├── public/                   # Static assets & icons
│   ├── src/
│   │   ├── assets/               # Images and branding assets
│   │   ├── components/           # Navbar, ProductCard, CartItem, SearchBar, WishlistCard
│   │   ├── context/              # CartContext for global state management
│   │   ├── pages/                # Home, Products, ProductDetails, Cart, Wishlist, Checkout, Orders, Auth
│   │   ├── services/
│   │   │   └── api.js            # Axios client with environment base URL
│   │   ├── App.jsx               # Route definitions
│   │   ├── index.css             # Design system and global styles
│   │   └── main.jsx
│   ├── vercel.json               # SPA routing rewrite configuration for Vercel
│   └── package.json
├── .gitignore                    # Excludes .env, node_modules, and notes
└── README.md
```

---

## ⚙️ Local Development Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB Atlas Account](https://cloud.mongodb.com/) (or local MongoDB instance)
- [Razorpay Test Account](https://dashboard.razorpay.com/)

### 2. Clone Repository
```bash
git clone https://github.com/Tanush-Aggarwal/ShopKart.git
cd ShopKart
```

### 3. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory:
```env
PORT=8085
dbURL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CLIENT_URL=http://localhost:5173
```

Seed the product catalog with initial items:
```bash
node seed.js
```

Start the backend development server:
```bash
npm run dev
```
Backend will run at: `http://localhost:8085`

---

### 4. Frontend Setup
Open a new terminal tab:
```bash
cd frontend
npm install
```

*(Optional)* Create a `.env` file inside `frontend/`:
```env
VITE_API_BASE_URL=http://localhost:8085
```

Start Vite dev server:
```bash
npm run dev
```
Frontend will run at: `http://localhost:5173`

---

## 📡 REST API Reference

### 🔐 Authentication (`/customers`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/customers/register` | Register a new customer | No |
| `POST` | `/customers/login` | Login and receive auth cookie/token | No |
| `POST` | `/customers/logout` | Clear session cookie | Yes |
| `GET` | `/customers/profile` | Get current customer profile | Yes |
| `PATCH` | `/customers/change-password` | Change customer account password | Yes |

### 📦 Products (`/products`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/products` | List products (supports `?search=`, `?category=`, `?sort=`) | No |
| `GET` | `/products/:id` | Get single product details | No |

### 💖 Wishlist (`/wishlist`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/wishlist` | Get logged-in user's wishlist | Yes |
| `POST` | `/wishlist/:productId` | Add item to wishlist | Yes |
| `DELETE` | `/wishlist/:productId` | Remove item from wishlist | Yes |
| `PATCH` | `/wishlist/:productId/toggle`| Toggle item in wishlist | Yes |

### 🛒 Cart (`/cart`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/cart` | Get current user's shopping cart | Yes |
| `POST` | `/cart/:productId` | Add item to cart | Yes |
| `PATCH` | `/cart/:productId` | Update item quantity (`{ quantity }`) | Yes |
| `DELETE` | `/cart/:productId` | Remove item from cart | Yes |

### 🧾 Orders & Payments (`/orders`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/orders/create-payment-order` | Validate cart & create Razorpay order | Yes |
| `POST` | `/orders/verify-payment` | Verify HMAC SHA256 payment signature | Yes |
| `GET` | `/orders` | List customer's order history | Yes |
| `GET` | `/orders/:id` | Get single order details | Yes |
| `PATCH` | `/orders/:id/status` | Update order fulfillment status | Yes |

---

## 🔒 Security & Best Practices
- **Password Security**: Passwords are encrypted with salt rounds via `bcrypt`.
- **JWT Protection**: Secure cookie delivery with `httpOnly: true`, and dynamic `sameSite: "none"` / `secure: true` in production cross-site environments.
- **Payment Verification**: Payments verified using Razorpay secret and cryptographic SHA256 HMAC digest before updating database order status.
- **Inventory Safety**: Atomic stock deductions verify availability before order completion to prevent negative stock.

---

## 👤 Author
- **Tanush Aggarwal** — [GitHub Profile](https://github.com/Tanush-Aggarwal)
