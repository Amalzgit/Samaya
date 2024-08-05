const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the CartItem schema
const CartItemSchema = new Schema({
    product: { 
        type: Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    quantity: { 
        type: Number, 
        required: true,
        min: 1 
    }
});

// Define the Cart schema
const CartSchema = new Schema({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    items: [CartItemSchema] // Reference CartItemSchema
});

// Virtual field to calculate the total price (in cents) for all items in the cart
CartSchema.virtual('totalPrice').get(function() {
    let total = 0;
    this.items.forEach(item => {
        // Multiply price by quantity and accumulate
        total += item.product.price * item.quantity;
    });
    return total;
});

// Virtual field for formatted total price in INR
CartSchema.virtual('formattedPrice').get(function() {
    const totalPriceInINR = this.totalPrice ; // Convert cents to INR
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(totalPriceInINR);
});


// Ensure virtuals are serialized
CartSchema.set('toJSON', { virtuals: true });
CartSchema.set('toObject', { virtuals: true });

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
