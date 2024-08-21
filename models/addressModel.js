const mongoose = require("mongoose");
const Schema =mongoose
const addressSchema = new mongoose.Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref :'User',
        required:true
    },
        
    country :{
        type :String,
        required:true
    },
    fullName: {
         type: String,
          required: true
         },
    mobileNumber: { 
        type: String, 
        required: true 
    },
    pincode: { 
        type: String, 
        required: true 
    },
    addressLine1: { 
        type: String, 
        required: true 
    },
    addressLine2: String,

    landmark: String,

    townCity: { 
        type: String, 
        required: true
     },
    state: { 
        type: String, 
        required: true 
    },
    type:{
        type: String,
        enum: ['Work', 'Home'], 
        default: 'Home', 
        required: true
    },
    isDefault: { 
        type: Boolean,
         default: false 
        },
    deliveryInstructions: String

}, { timestamps: true });

const Address = mongoose.model('Address',addressSchema);
module.exports = Address