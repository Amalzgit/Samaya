const Product = require('../../models/productModel')



const loadproductList = async (req, res) => {

    try {
        const products = await Product.find()
       return res.render('product-list', { successMessage: '', errorMessage: '', products });
    } catch (error) {
        console.error('Error loading login page:', error);
        return res.render('product-list', { successMessage: '', errorMessage: "An error occurred" });
    }
};

const loadAddproduct = async (req, res) => {

    try {
      return  res.render('add-products', { successMessage: '', errorMessage: '' });
    } catch (error) {
        console.error('Error loading login page:', error);
       return res.render('add-products', { successMessage: '', errorMessage: "error loading login page" });
    }

}

const addproduct = async (req, res) => {

    

    const { name, price, description, category,deleted, status } = req.body;
    const images = req.files.map(file => file.filename);

    if (images.length < 3) {
        return res.render('add-products', { successMessage: '', errorMessage: "Add min 3 images" })
    }

    try {
        const newProduct = new Product({
            name,
            price,
            description,
            images,
            category,
            deleted,
            status
        });
        
        await newProduct.save();
        return res.redirect('/admin/product-list')

    } catch (error) {
        console.log(error);
        return res.render('add-products', { successMessage: '', errorMessage: "An error occurd" })
    }
}


const deleteProduct = async (req,res)=>{
    try {
        const productId =req.params.productId;
        const product =await Product.findById(productId);
        product.deleted =true;
        await product.save();

        return res.redirect('/admin/product-list')
    } catch (error) {
        console.log(error);
        return res.render('product-list', { successMessage: '', errorMessage: "An error occurd While deleting" })
    }

}

const restoreProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findById(productId);

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
    deleteProduct,
    restoreProduct
}