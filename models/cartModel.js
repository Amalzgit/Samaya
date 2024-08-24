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
    items: [CartItemSchema] ,
    coupon :{
        type : Schema.Types.ObjectId ,
        ref :'Coupon'
    },
    discount: { 
        type: Number, 
        default: 0 
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    discountedTotal: {
        type: Number,
        default: 0
    },
    appliedCoupon:{
        type: Schema.Types.Mixed 
    }
});

CartSchema.virtual('totalPrice').get(function() {
    if (!this.items || !this.items.length) return 0;
    return this.items.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
    }, 0);
});

// CartSchema.virtual('finalPrice').get(function() {
//     const totalBeforeDiscount = this.totalPrice;
//     const discountAmount = this.discountAmount || 0;
//     return Math.max(totalBeforeDiscount - discountAmount, 0);
// });

// CartSchema.virtual('formattedFinalPrice').get(function() {
//     return new Intl.NumberFormat('en-IN', {
//         style: 'currency',
//         currency: 'INR'
//     }).format(this.finalPrice);
// });
CartSchema.virtual('formattedDiscountedTotal').get(function() {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(this.discountedTotal);
});

CartSchema.virtual('formattedTotalPrice').get(function() {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(this.totalPrice);
});


CartSchema.set('toJSON', { virtuals: true });
CartSchema.set('toObject', { virtuals: true });

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
