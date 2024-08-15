const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
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
    enum: ['Active', 'Cancelled', 'Return Requested', 'Return Accepted', 'Return Rejected', 'Returned'],
    default: 'Active'
  },
  cancelledAt: { type: Date },
  returnRequestedAt: { type: Date },
  returnedAt: { type: Date }
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
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Partially Cancelled', 'Partially Returned'],
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
      enum: ['Pending', 'Completed', 'Failed', 'Refunded', 'Partially Refunded'],
      default: 'Pending'
    },
    transactionId: { type: String }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

orderSchema.virtual('formattedTotalPrice').get(function() {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(this.totalPrice);
});

orderSchema.methods.cancelItem = function(itemId) {
  const item = this.items.id(itemId);
  if (item && item.status === 'Active') {
    item.status = 'Cancelled';
    item.cancelledAt = new Date();
    this.updateOrderStatus();
  }
};

orderSchema.methods.requestReturnItem = function(itemId) {
  const item = this.items.id(itemId);
  if (item && item.status === 'Active') {
    item.status = 'Return Requested';
    item.returnRequestedAt = new Date();
  }
};

orderSchema.methods.processReturnedItem = function(itemId) {
  const item = this.items.id(itemId);
  if (item && item.status === 'Return Requested') {
    item.status = 'Returned';
    item.returnedAt = new Date();
    this.updateOrderStatus();
  }
};

orderSchema.methods.updateOrderStatus = function() {
  const activeItems = this.items.filter(item => item.status === 'Active');
  const cancelledItems = this.items.filter(item => item.status === 'Cancelled');
  const returnedItems = this.items.filter(item => item.status === 'Returned');

  if (activeItems.length === 0) {
    if (cancelledItems.length > 0) {
      this.status = 'Cancelled';
    } else if (returnedItems.length > 0) {
      this.status = 'Returned';
    }
  } else if (cancelledItems.length > 0 || returnedItems.length > 0) {
    this.status = cancelledItems.length > 0 ? 'Partially Cancelled' : 'Partially Returned';
  }

  this.payment.status = this.status === 'Cancelled' || this.status === 'Returned' ? 'Refunded' :
                        this.status === 'Partially Cancelled' || this.status === 'Partially Returned' ? 'Partially Refunded' :
                        this.payment.status;
};

module.exports = mongoose.model('Order', orderSchema);
