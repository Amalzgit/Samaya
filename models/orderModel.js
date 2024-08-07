const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  pincode: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  landmark: { type: String },
  townCity: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  type: { type: String, required: true }
});

const orderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Active', 'Cancelled'],
    default: 'Active'
  }
});

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  address: { type: addressSchema, required: true },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  payment: {
    method: {
      type: String,
      enum: ['Cash on Delivery', 'Credit Card', 'Debit Card', 'UPI'],
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Pending'
    },
    transactionId: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

orderSchema.virtual('formattedTotalPrice').get(function() {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(this.totalPrice);
});

module.exports = mongoose.model('Order', orderSchema);