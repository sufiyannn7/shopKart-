# 🛍️ ShopKart — Full-Stack E-Commerce Application

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment_Gateway-02042B?logo=razorpay&logoColor=white)](https://razorpay.com/)

> **ShopKart** is a modern, responsive full-stack e-commerce web application. It delivers a complete end-to-end purchasing journey: user authentication, dynamic product catalog, real-time wishlist, shopping cart, server-side stock validation, Razorpay payment gateway integration with cryptographic signature verification, and immutable order history tracking.

🌐 **Live Demo (GitHub Pages):** [https://sufiyannn7.github.io/shopKart-/](https://sufiyannn7.github.io/shopKart-/)  
📁 **Repository:** [https://github.com/sufiyannn7/shopKart-](https://github.com/sufiyannn7/shopKart-)

---

## 🚀 Key Features

- **🔐 Customer Authentication & Security**
  - Registration and login with bcrypt password hashing.
  - JWT (JSON Web Token) cookie and Bearer token authentication.
  - Protected API routes and client-side route guards.

- **📦 Product Discovery & Catalog**
  - Search products dynamically by keyword or title.
  - Filter products by category (Electronics, Fashion, Home, Sports, etc.).
  - Sort products by price (low-to-high, high-to-low) and popularity.
  - Detailed product view with stock indicators and image galleries.

- **❤️ Persistent Wishlist**
  - One-click heart toggle to save favorite items.
  - Real-time synchronization between MongoDB and UI counters.

- **🛒 Shopping Cart & Derived Calculations**
  - Real-time quantity adjustments (`+` / `-`) and item removal.
  - Client and server-side stock boundary enforcement.
  - Dynamic derived calculations for items count, total units, and delivery charges.

- **💳 Checkout & Razorpay Test Payment**
  - Multi-step checkout with comprehensive client-side form validation.
  - Server re-validates current product prices and latest stock to avoid race conditions.
  - Server calculates and owns `totalAmount` in INR and converts to paise for Razorpay.
  - Integration with Razorpay Standard Checkout in Test Mode.
  - **Cryptographic HMAC SHA-256 signature verification** on the backend before order confirmation.

- **🧾 Order History & Status Progression**
  - Purchase-time snapshotting of product names, prices, and images.
  - Order confirmation screen with delivery address breakdown.
  - "My Orders" screen with historical timestamps and status progression stepper (`PLACED` → `CONFIRMED` → `SHIPPED` → `DELIVERED`).

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Routing:** React Router v7
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Styling:** Custom Vanilla CSS Design System with responsive grid layout

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM (with automatic fallback to `mongodb-memory-server` for local zero-config testing)
- **Authentication:** JWT (`jsonwebtoken`) & `bcrypt`
- **Payments:** Razorpay Node.js SDK & built-in `crypto` (HMAC SHA-256)

---

## 📁 Project Directory Structure

```text
shopkart/
├── .github/
│   └── workflows/
│       └── deploy.yml            # Automated GitHub Pages CI/CD workflow
├── backend/
│   ├── config/
│   │   └── razorpay.js           # Razorpay SDK configuration
│   ├── controllers/
│   │   ├── cart.controller.js     # Cart logic & stock management
│   │   ├── customer.controller.js # Auth, register & login logic
│   │   ├── order.controller.js    # Order creation & signature verification
│   │   ├── product.controller.js  # Product catalog & seeding
│   │   └── wishlist.controller.js # Wishlist toggling
│   ├── middlewares/
│   │   └── auth.middleware.js    # JWT verification middleware
│   ├── models/
│   │   ├── customer.model.js     # Customer schema
│   │   ├── order.model.js        # Order snapshot schema
│   │   └── product.model.js      # Product catalog schema
│   ├── routes/                   # Express route definitions
│   ├── utils/                    # JWT generator & token helpers
│   ├── .env.example              # Sample environment template (no secrets)
│   ├── index.js                  # Backend entry point
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/           # Navbar, ProductCard, CartItem, etc.
│   │   ├── context/              # CartContext for global cart state
│   │   ├── pages/                # Home, Products, Cart, Checkout, Orders
│   │   ├── services/             # Axios API client services
│   │   ├── App.jsx               # Routes & application layout
│   │   ├── index.css             # Main stylesheet & design system
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore                    # Protects .env, node_modules, and secrets
└── README.md
```

---

## ⚙️ Local Setup & Installation

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **Git**
- *(Optional)* Local **MongoDB** instance (if not installed, the backend will automatically spin up an in-memory MongoDB server)

---

### 2. Clone the Repository
```bash
git clone https://github.com/sufiyannn7/shopKart-.git
cd shopKart-
```

---

### 3. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Configure your keys in `backend/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/shopkart
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   RAZORPAY_KEY_ID=your_razorpay_key_id_here
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
   ```
4. Start the backend server:
   ```bash
   node index.js
   ```
   *The server will start on `http://localhost:5000` and automatically seed initial sample products.*

---

### 4. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```text
   http://localhost:5173
   ```

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Protection | Description |
|---|---|:---:|---|
| `POST` | `/customers/register` | Public | Register new customer account |
| `POST` | `/customers/login` | Public | Authenticate and issue JWT cookie/token |
| `GET` | `/customers/me` | 🔒 Private | Retrieve profile of authenticated user |
| `POST` | `/customers/logout` | 🔒 Private | Clear authentication session |
| `GET` | `/products` | Public | Fetch product list with search/filter/sort |
| `GET` | `/products/:id` | Public | Fetch individual product details |
| `GET` | `/wishlist` | 🔒 Private | Get current user's wishlist items |
| `PATCH` | `/wishlist/:productId/toggle` | 🔒 Private | Toggle product in/out of wishlist |
| `GET` | `/cart` | 🔒 Private | Get current user's cart |
| `POST` | `/cart/:productId` | 🔒 Private | Add product to cart |
| `PATCH` | `/cart/:productId` | 🔒 Private | Update product quantity |
| `DELETE` | `/cart/:productId` | 🔒 Private | Remove item from cart |
| `POST` | `/orders/create-payment-order` | 🔒 Private | Validate stock, compute total, create Razorpay order |
| `POST` | `/orders/verify-payment` | 🔒 Private | Verify HMAC SHA-256 signature, mark PAID, clear cart |
| `GET` | `/orders` | 🔒 Private | Retrieve current user's past orders |
| `GET` | `/orders/:id` | 🔒 Private | Get single order details (ownership protected) |
| `PATCH` | `/orders/:id/status` | 🔒 Private | Advance order progression status |

---

## 🔒 Security & Best Practices

- **Zero Secret Leakage:** `RAZORPAY_KEY_SECRET` and `JWT_SECRET` are never exposed to the client or checked into version control.
- **Server-Side Pricing Ownership:** Client-supplied totals are discarded. The server computes item totals directly from verified database records.
- **Race Condition Prevention:** Stock is checked during both cart update and final order initialization.
- **Cryptographic Verification:** HMAC SHA-256 ensures payment success messages originate strictly from Razorpay.
- **Atomic Cart Clearing:** Cart is only cleared after verified payment confirmation.

---

## 📜 License

This project is created for educational and demonstration purposes. Feel free to use and adapt it for learning full-stack development.
