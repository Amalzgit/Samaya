const Product = require('../models/productModel')
const Category =require('../models/catogaryModel')



const loadShop = async (req,res)=>{

    try {
      const categories = await Category.find({deleted:false})
      const products = await Product.find({deleted:false}).populate('category')
      // console.log(products);
       return res.render('shop', {products,categories, successMessage:'',errorMessage:''});
    } catch (error) {
        console.error('Error loading login page:', error);
      return  res.render('shop', {successMessage:'', errorMessage: "An error occurred" });
    }
};
 module.exports ={
    loadShop
}