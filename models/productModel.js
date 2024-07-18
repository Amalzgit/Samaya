const mongoose = require('mongoose');
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
          type: String,
          default: 'All category'
        },
        status: {
          type: String,
          enum: ['Active', 'Disabled', 'Show all'],
          default: 'Active'
        },
        deleted: {
           type: Boolean, 
           default: false
         },
        dateAdded: {
          type: Date,
          default: Date.now
        }
      });
      
 module.exports =mongoose.model('products',productSchema)