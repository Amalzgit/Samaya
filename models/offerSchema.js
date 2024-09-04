const mongoose = require("mongoose");

const ProductOfferSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
// ProductOfferSchema.pre('find', function () {
//   const currentDate = new Date();

//   this.where({
//     $expr: {
//       $cond: [
//         { $and: [{ $gte: ['$startDate', currentDate] }, { $lte: ['$endDate', currentDate] }] },
//         true,
//         false
//       ]
//     }
//   });
// });

// ProductOfferSchema.pre('findOne', function () {
//   const currentDate = new Date();

//   this.where({
//     $expr: {
//       $cond: [
//         { $and: [{ $gte: ['$startDate', currentDate] }, { $lte: ['$endDate', currentDate] }] },
//         true,
//         false
//       ]
//     }
//   });
// });


const ProductOffer = mongoose.model("ProductOffer", ProductOfferSchema);

module.exports = ProductOffer;
