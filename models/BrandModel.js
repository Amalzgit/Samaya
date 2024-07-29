
const mongoose =require ('mongoose');
const Schema =mongoose ;


const brandSchema =new mongoose.Schema({

    name :{
        type:String,
        required :true,
        unique:true
    },
    logo:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    isActive:{
        type:Boolean,
        default:true
    }

}, {timestamps: true})

module.exports =  mongoose.model('Brand',brandSchema );