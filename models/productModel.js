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
      stock: {
        type: Number,
        required: true,
        min: 0 
    },

        deleted: {
           type: Boolean, 
           default: false
         },
        
      },{timestamps:true});
      
 module.exports =mongoose.model('products',productSchema)