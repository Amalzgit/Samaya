const Product = require('../../models/productModel')
const Category =require('../../models/catogaryModel')



const loadproductList = async (req, res) => {
    const { category } = req.query;

    try {
        let filter = {};
        
        if (category) {
            const categoryDoc = await Category.findOne({ name: category, deleted: false });
            
            if (categoryDoc) {
                filter = { category: categoryDoc._id };
            } 
        }

        const categories = await Category.find({ deleted: false });
        const products = await Product.find(filter).populate('category');
       
        return res.render('product-list', { products, categories, successMessage: '', errorMessage: '' });
    } catch (error) {
        console.error('Error loading product list:', error);
        return res.render('product-list', { successMessage: '', errorMessage: 'An error occurred' });
    }
};


const loadAddproduct = async (req, res) => {
    const categories = await Category.find({deleted:false})
    const products = await Product.find().populate('category')
    try {
      return  res.render('add-products', { products,categories,successMessage: '', errorMessage: '' });
    } catch (error) {
        console.error('Error loading login page:', error);
       return res.render('add-products', { successMessage: '', errorMessage: "error loading login page" });
    }

}

const addproduct = async (req, res) => {
    const categories = await Category.find({deleted:false})
    const products = await Product.find().populate('category')  
    

    const { name, price, description, category,deleted,stock} = req.body;
    const images = req.files.map(file => file.filename);
// console.log('category _id:',category)
    if (images.length < 3) {
        return res.render('add-products', {products,categories, successMessage: '', errorMessage: "Add min 3 images" })
    }

    try {
        const newProduct = new Product({
            name,
            price,
            description,
            images,
            category,
            stock,
            deleted,
            // status
        });
        
        await newProduct.save();
        return res.redirect('/admin/product-list')

    } catch (error) {
        console.log(error);
        return res.render('add-products', { successMessage: '', errorMessage: "An error occurd" })
    }
}
const loadEditProduct = async (req,res)=>{
    try {
        const categories =await Category.find({deleted:false})
        const product= await Product.findById(req.params.productId).populate('category');
        // console.log(product);
        if(!product){

            return res.render('product-edit',{ successMessage: '', errorMessage: "Product not found"})
        
        }
             return res.render('product-edit',{product,categories, successMessage: '', errorMessage: "" })
    
    } catch (error) {
        console.log(error);
        const categories =await Category.find({deleted:false})
        const product= await Product.findById(req.params.productId).populate('category');
        return res.render('product-edit',{ categories,product,successMessage: '', errorMessage: "Error loading product edditing page" })

    }
}

const productEdit = async (req, res) => {
    const { name, price, description, category,stock } = req.body;
    const images = req.files ? req.files.map(file => file.filename) : [];

    try {
        const product = await Product.findById(req.params.productId).populate('category');
        const categories = await Category.find({ deleted: false });

        if (!product) {
            return res.render('product-edit', { categories, product, successMessage: '', errorMessage: "Product not found" });
        }

        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;
        product.category = category || product.category;
        product.stock =stock || product.stock
        product.images = images.length === 0 ? product.images : images;

        await product.save();

        return res.redirect('/admin/product-list');
    } catch (error) {
        console.error('Error editing product:', error);
        const categories = await Category.find({ deleted: false });
        const product = await Product.findById(req.params.productId).populate('category');

        return res.render('product-edit', { categories, product, successMessage: '', errorMessage: "Error editing product" });
    }
};

const deleteProduct = async (req,res)=>{
    try {
        const productId =req.params.productId;
        const product =await Product.findById(productId).populate('category');
        product.deleted =true;
        await product.save();

        return res.redirect('/admin/product-list')
    } catch (error) {
        console.log(error);
        return res.redirect('/admin/product-list')
    }

}


const restoreProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findById(productId).populate('category');

        product.deleted = false;
        await product.save();

        return res.redirect('/admin/product-list');
        
    } catch (error) {
        console.log(error);
        return res.redirect('/admin/product-list');
    }
};


module.exports = {
    loadproductList,
    loadAddproduct,
    addproduct,
    productEdit,
    loadEditProduct,
    deleteProduct,
    restoreProduct
}