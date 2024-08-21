const mongoose =require( "mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    minAmount: {
      type: Number,
      required: true,
    },
    maxAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

couponSchema.methods.softDelete = function () {
  this.isActive = false;
  return this.save();
};

couponSchema.methods.restore = function () {
  this.isActive = true;
  return this.save();
};

couponSchema.methods.validateCoupon = function (cartTotal) {
  if (!this.isActive) {
    return { valid: false, message: "Coupon is not active" };
  }

  if (new Date() > new Date(this.expiryDate)) {
    return { valid: false, message: "Coupon has expired" };
  }

  if (cartTotal < this.minAmount) {
    return {
      valid: false,
      message: `Minimum cart amount should be ${this.minAmount} to apply this coupon`,
    };
  }

  if (cartTotal > this.maxAmount) {
    return {
      valid: false,
      message: `Maximum cart amount should be ${this.maxAmount} to apply this coupon`,
    };
  }

  return { 
    valid: true,
    message: `Coupon is valid.`,
  };
};




const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon