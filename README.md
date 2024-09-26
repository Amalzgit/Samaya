
# Samaya

A comprehensive e-commerce application featuring both an admin and user interface, offering robust capabilities like user management, product management, order tracking, payment integration, and more.

## Features

<details>
  <summary><strong>🚀 Admin Side Features</strong></summary>
  <ul>
    <li>Admin sign in</li>
    <li>User management (list users, block/unblock)</li>
    <li>Category management (add, edit, soft delete)</li>
    <li>Product management (add, edit, soft delete)</li>
    <li>Multiple images for products (minimum 3, cropped, resized before upload)</li>
    <li>Order management (list orders, change order status, cancel orders)</li>
    <li>Inventory/Stock management</li>
    <li>Offer module (product and category offers)</li>
    <li>Sales report (daily, weekly, yearly, custom date)</li>
    <li>Admin dashboard with charts (filter by yearly, monthly, etc.)</li>
    <li>Coupon management (create, delete)</li>
    <li>Best-selling products (top 10)</li>
  </ul>
</details>

<details>
  <summary><strong>🌟 User Side Features</strong></summary>
  <ul>
    <li>Home page</li>
    <li>User sign up & login with validation (OTP, Google, Facebook, etc.)</li>
    <li>Product listing and details (image zoom, ratings, price, stock, etc.)</li>
    <li>User profile management (details, addresses, orders, cancel orders)</li>
    <li>Cart management (add to cart, remove items, control quantity based on stock)</li>
    <li>Advanced search with sorting (popularity, price, ratings, etc.)</li>
    <li>Checkout page (multiple addresses, order with COD)</li>
    <li>Order management (history, status, cancellation, returns)</li>
    <li>Coupon management (apply, remove coupons)</li>
    <li>Wishlist management (add/remove products)</li>
    <li>Wallet for canceled orders</li>
    <li>Invoice download (PDF)</li>
    <li>Error handling for failed payments, retry option</li>
  </ul>
</details>

## Installation

Follow these steps to set up the project locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Amalzgit/Samaya.git
   cd Samaya
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Copy the contents of `.backend-env-example` to a new `.env` file and fill in the necessary values.
   ```bash
   cp backend/.backend-env-example backend/.env
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

## Environment Variables

Ensure that you create the `.env` files for both the frontend and backend based on the provided examples.

- **Backend `.backend-env-example`**: Copy the content from the corresponding `.env-example` files and create `.env` files in the same directory, replacing placeholder values with your actual credentials and configuration.

## License

This project is licensed under the MIT License.
```

