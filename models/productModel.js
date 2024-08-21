const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number, 
    required: true
  },
  description: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  brand: {
    type: Schema.Types.ObjectId,
    ref: 'Brand'
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  caseMaterial: {
    type: String,
    required: true
  },
  crystalType: {
    type: String,
    enum: ['Sapphire', 'Mineral', 'Acrylic'],
    required: true
  },
  dialColor: {
    type: String
  },
  hourMarkers: {
    type: String
  },
  handType: {
    type: String
  },
  bezelType: {
    type: String
  },
  caseShape: {
    type: String
  },
  additionalDesignElements: {
    type: [String]
  },
  powerReserve: {
    type: String 
  },
  warrantyPeriod: {
    type: String 
  },
  certifications: {
    type: [String]
  },
  deleted: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

productSchema.virtual('formattedPrice').get(function () {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.price);
});
productSchema.index({ name: 'text', description: 'text' });
const Product = mongoose.model('Product', productSchema);
module.exports = Product