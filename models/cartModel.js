const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

const CartSchema = new Schema({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    items: [CartItemSchema] 
});

CartSchema.virtual('totalPrice').get(function() {
    let total = 0;
    this.items.forEach(item => {
        total += item.product.price * item.quantity;
    });
    return total;
});

CartSchema.virtual('formattedPrice').get(function() {
    const totalPriceInINR = this.totalPrice ; 
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(totalPriceInINR);
});


CartSchema.set('toJSON', { virtuals: true });
CartSchema.set('toObject', { virtuals: true });

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
