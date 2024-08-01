const mongoose= require("mongoose");
// const  schema  = require("./catogaryModel");

const Schema =mongoose;


const reviewSchema = new mongoose.Schema({
    product :{
        type:Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },
    user:{
        type:Schema.Types.ObjectId,
        ref :'User',
        required:true
    },
    rating: {
        type: Number,
        required: true,
        min: 1, 
        max: 5  
    },
    reviewText: {
        type: String,
        trim: true
    },
    isDeleted:{
        type:Boolean,
        default:true
    }

},{Timestamp:true})

module.exports =mongoose.model("Review",reviewSchema)