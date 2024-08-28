const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const CartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [CartItemSchema],
  coupon: {
    type: Schema.Types.ObjectId,
    ref: "Coupon",
  },
  discount: {
    type: Number,
    default: 0,
  },
  appliedCoupon: {
    type: Schema.Types.Mixed,
  },
});

// CartSchema.virtual("totalPrice").get(function () {
//   if (!this.items || !this.items.length) return 0;
//   return this.items.reduce((total, item) => {
//     return total + item.product.price * item.quantity;
//   }, 0);
// });

// CartSchema.virtual("discountAmount").get(function () {
//   return (this.totalPrice * this.discount) / 100;
// });

// CartSchema.virtual("discountedTotal").get(function () {
//   return this.totalPrice - this.discountAmount;
// });

// CartSchema.virtual("formattedDiscountedTotal").get(function () {
//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//   }).format(this.discountedTotal);
// });

// CartSchema.virtual("formattedTotalPrice").get(function () {
//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//   }).format(this.totalPrice);
// });
// CartSchema.statics.formatCurrency = function (amount) {
//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//   }).format(amount);
// };

// CartSchema.set("toJSON", { virtuals: true });
// CartSchema.set("toObject", { virtuals: true });

const Cart = mongoose.model("Cart", CartSchema);

module.exports = Cart;
