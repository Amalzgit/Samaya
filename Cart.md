const Cart = require('../models/Cart'); // Adjust path as necessary
const Product = require('../models/Product'); // Adjust path as necessary

// Get cart for a user
exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product').exec();
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Add item to cart
exports.addItemToCart = async (req, res) => {
    try {
        const { productId, quantity, price } = req.body;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find or create cart for user
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        // Check if item already exists in the cart
        const existingItem = cart.items.find(item => item.product.toString() === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity, price });
        }

        // Save cart
        await cart.save();

        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Update item quantity in cart
exports.updateItemQuantity = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (quantity <= 0) {
            return res.status(400).json({ message: 'Quantity must be greater than zero' });
        }

        // Find cart
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Find item in cart
        const item = cart.items.find(item => item.product.toString() === productId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        item.quantity = quantity;

        // Remove item if quantity is zero
        if (quantity === 0) {
            cart.items = cart.items.filter(item => item.product.toString() !== productId);
        }

        // Save cart
        await cart.save();

        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Remove item from cart
exports.removeItemFromCart = async (req, res) => {
    try {
        const { productId } = req.body;

        // Find cart
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Remove item from cart
        cart.items = cart.items.filter(item => item.product.toString() !== productId);

        // Save cart
        await cart.save();

        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Clear cart
exports.clearCart = async (req, res) => {
    try {
        // Find and clear cart
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }

        res.status(200).json({ message: 'Cart cleared' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
<!--  -->

<section class="mt-5 mb-5">
    <div class="container">
        <div class="row">
            <!-- Order Summary Section (Left Side) -->
            <div class="col-lg-8 col-md-12 mb-4">
                <div class="border p-4 border-radius cart-totals">
                    <h4>Order Summary</h4>
                    <table class="table">
                        <% if (cart && cart.items.length > 0) { %>
                        <tbody>
                            <% cart.items.forEach(item => { %>
                            <tr>
                                <td class="cart_total_label">
                                    <img src="<%= item.product.image %>" alt="<%= item.product.name %>" class="product-img">
                                    <%= item.product.name %>
                                </td>
                                <td class="cart_total_amount">
                                    <span class="font-lg fw-900 text-brand">₹<%= (item.quantity * item.price).toFixed(2) %></span>
                                </td>
                            </tr>
                            <% }); %>
                            <tr>
                                <td class="cart_total_label">Cart Subtotal</td>
                                <td class="cart_total_amount">
                                    <span class="font-lg fw-900 text-brand"><%= cart.formattedPrice %></span>
                                </td>
                            </tr>
                            <tr>
                                <td class="cart_total_label">Shipping</td>
                                <td class="cart_total_amount"> <i class="fa fa-gift mr-1"></i> Free Shipping</td>
                            </tr>
                            <tr>
                                <td class="cart_total_label">Total</td>
                                <td class="cart_total_amount">
                                    <strong>
                                        <span class="font-xl fw-900 text-brand"><%= cart.formattedPrice %></span>
                                    </strong>
                                </td>
                            </tr>
                        </tbody>
                        <% } else { %>
                            <tr>
                                <td colspan="2">Your cart is empty.</td>
                            </tr>
                        <% } %>
                    </table>
                    <a href="/checkout/confirm" class="btn btn-dark btn-sm"><i class="fa fa-credit-card mr-1"></i> Proceed to Payment</a>
                </div>
            </div>

            <!-- Address Section (Right Side) -->
            <div class="col-lg-4 col-md-12">
                <div class="border p-3 border-radius mb-4">
                    <h4>Shipping Address</h4>
                    <div class="address-list">
                        <% if (addresses && addresses.length > 0) { %>
                            <div class="scrollable-address-list">
                                <% addresses.forEach(address => { %>
                                    <div class="card mb-2">
                                        <div class="card-body">
                                            <div class="d-flex align-items-center">
                                                <input type="radio" id="address_<%= address._id %>" name="selectedAddress" value="<%= address._id %>" class="mr-2 small-radio"
                                                <% if (address.isDefault) { %> checked <% } %>
                                                >
                                                <div class="address-details">
                                                    <p class="mb-1"><strong><%= address.fullName %></strong></p>
                                                    <p class="mb-1"><%= address.addressLine1 %> <% if (address.addressLine2) { %>, <%= address.addressLine2 %> <% } %></p>
                                                    <p class="mb-1"><%= address.townCity %>, <%= address.state %> <%= address.pincode %></p>
                                                    <p class="mb-1"><%= address.country %></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                <% }); %>
                            </div>
                        <% } else { %>
                            <p>No addresses available.</p>
                        <% } %>
                        <a href="/add-address" class="btn btn-outline-primary btn-sm mt-3">
                            <i class="fa fa-plus mr-1"></i> Add Address
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<script>
    // JavaScript to handle address selection
    document.addEventListener('DOMContentLoaded', function() {
        const addressRadios = document.querySelectorAll('input[name="selectedAddress"]');
        addressRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                console.log("Selected address ID:", this.value);
                // Handle address selection here if needed
            });
        });
    });
</script>
<style>
    /* Address Card */
.card {
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    font-size: 14px; /* Smaller font size for address card */
}

.card-body {
    padding: 10px;
}

.card-body input[type="radio"] {
    cursor: pointer;
    width: 12px; /* Smaller radio button */
    height: 12px; /* Smaller radio button */
}

.address-list {
    max-height: 400px; /* Adjust to fit your layout */
    overflow-y: auto;
}

.address-details {
    margin-left: 10px;
}

.product-img {
    width: 50px; /* Adjust as needed */
    height: auto;
    margin-right: 10px;
    border-radius: 4px;
}

/* Buttons */
.btn {
    border-radius: 20px;
    padding: 8px 16px;
    font-size: 14px;
}

.btn-outline-primary {
    border-color: #007bff;
    color: #007bff;
}

.btn-outline-primary:hover {
    background-color: #007bff;
    color: #fff;
}

.btn-dark {
    background-color: #343a40;
    border-color: #343a40;
}

.btn-dark:hover {
    background-color: #23272b;
}

</style>




<!--  -->

// Certainly. I'll provide a step-by-step guide to implement a shopping cart feature for your product details page, considering the stock quantity and using EJS, Node.js, and MongoDB. Here's how you can do it efficiently:

// Update the product model in MongoDB: Ensure your product schema includes a 'stock' field to track available quantity.
// javascript

// Copy
const productSchema = new mongoose.Schema({
  // ... other fields
  stock: { type: Number, required: true, min: 0 },
  // ...
});
Create a Cart model in MongoDB:
javascript

Copy
const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const CartItem = mongoose.model('CartItem', cartItemSchema);
Update the product detail page (EJS template): Modify the "Add to Cart" form to include quantity input:
html

Copy
<form action="/cart/add" method="POST">
  <input type="hidden" name="productId" value="<%= product._id %>">
  <input type="number" name="quantity" value="1" min="1" max="<%= product.stock %>">
  <button type="submit" <%= product.stock > 0 ? '' : 'disabled' %>>
    <%= product.stock > 0 ? 'Add to Cart' : 'Out of Stock' %>
  </button>
</form>
Create a route to handle adding items to the cart (Node.js):
javascript

Copy
const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const CartItem = require('../models/cartItem');

router.post('/add', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id; // Assuming you have user authentication

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    if (product.stock < quantity) {
      return res.status(400).send('Not enough stock');
    }

    let cartItem = await CartItem.findOne({ user: userId, product: productId });

    if (cartItem) {
      // Update existing cart item
      cartItem.quantity += parseInt(quantity);
      if (cartItem.quantity > product.stock) {
        cartItem.quantity = product.stock;
      }
    } else {
      // Create new cart item
      cartItem = new CartItem({
        user: userId,
        product: productId,
        quantity: parseInt(quantity)
      });
    }

    await cartItem.save();
    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
Create a route to display the cart:
javascript

Copy
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const cartItems = await CartItem.find({ user: userId }).populate('product');
    res.render('cart', { cartItems });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});
Create a cart view (cart.ejs):
html

Copy
<h1>Your Cart</h1>
<% if (cartItems.length === 0) { %>
  <p>Your cart is empty</p>
<% } else { %>
  <ul>
    <% cartItems.forEach(item => { %>
      <li>
        <%= item.product.name %> - Quantity: <%= item.quantity %>
        <form action="/cart/update" method="POST" style="display: inline;">
          <input type="hidden" name="itemId" value="<%= item._id %>">
          <input type="number" name="quantity" value="<%= item.quantity %>" min="1" max="<%= item.product.stock %>">
          <button type="submit">Update</button>
        </form>
        <form action="/cart/remove" method="POST" style="display: inline;">
          <input type="hidden" name="itemId" value="<%= item._id %>">
          <button type="submit">Remove</button>
        </form>
      </li>
    <% }); %>
  </ul>
  <a href="/checkout">Proceed to Checkout</a>
<% } %>
Implement update and remove functionality for cart items:
javascript

Copy
router.post('/update', async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const cartItem = await CartItem.findById(itemId).populate('product');
    if (!cartItem) {
      return res.status(404).send('Cart item not found');
    }
    if (quantity > cartItem.product.stock) {
      return res.status(400).send('Not enough stock');
    }
    cartItem.quantity = parseInt(quantity);
    await cartItem.save();
    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

router.post('/remove', async (req, res) => {
  try {
    const { itemId } = req.body;
    await CartItem.findByIdAndDelete(itemId);
    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});
Update your main app file to use these new routes:
javascript

Copy
const cartRoutes = require('./routes/cart');
app.use('/cart', cartRoutes);
This implementation provides a basic but functional shopping cart system. It checks stock levels, prevents adding more items than available, and allows users to update or remove items from their cart.

To make it more efficient:

Use caching (e.g., Redis) to store cart information for quicker access.
Implement server-side session management to handle guest carts.
Use AJAX for cart updates to avoid full page reloads.
Implement a stock reservation system for items in carts to prevent overselling.
Remember to handle edge cases, such as concurrent updates and session timeouts, in a production environment.

Copy
Retry


Claude does not have the ability to run the code it generates yet.
