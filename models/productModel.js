const mongoose = require('mongoose');
const Schema = mongoose.Schema
 const productSchema =new mongoose.Schema({
    name: {
          type: String,
          required: true,
          trim: true
        },
    price: {
          type: String,
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
        type: String,
        required: true
      },
      stock: {
        type: Number,
        required: true,
        min: 0
      },
    
      // Specifications
      caseMaterial: {
        type: String,
        required: true
      },
      crystalType: {
        type: String,
        enum: ['Sapphire', 'Mineral', 'Acrylic'],
        required: true
      },
    
      // Design & Aesthetics
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
    
      // Additional Features
      powerReserve: {
        type: String // For mechanical watches
      },
      warrantyPeriod: {
        type: String // e.g., "2 years"
      },
      certifications: {
        type: [String]
      },

    deleted: {
           type: Boolean, 
           default: false
         },
        
      },{timestamps:true});
      
 module.exports =mongoose.model('products',productSchema)