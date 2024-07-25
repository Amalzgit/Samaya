const Product = require('../models/productModel');

const getProductById = async (req,res)=>{
    try {
        const productId =req.params.id;
       
        const product =await Product.findById(productId).populate('category');
        
        if(!product){
            return res.render('shop',{message:"product not found"});
        }
        return res.render('ProductDetails',{product})
    } catch (error) {
        console.log('Error getting product',error);
        return res.render('shop',{})
    }
}

module.exports ={
    getProductById
}