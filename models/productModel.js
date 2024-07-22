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

        deleted: {
           type: Boolean, 
           default: false
         },
        
      },{timestamps:true});
      
 module.exports =mongoose.model('products',productSchema)