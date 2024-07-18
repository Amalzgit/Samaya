const Product = require('../../models/productModel')



const loadproductList = async (req, res) => {

    try {
        const products = await Product.find()
       return res.render('product-list', {products , successMessage: '', errorMessage: ''});
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
const loadEditProduct = async (req,res)=>{
    try {
        const product= await Product.findById(req.params.productId);
        if(!product){

            return res.render('product-edit',{ successMessage: "", errorMessage: "Product not found"})
        
        }
             return res.render('product-edit',{product, successMessage: '', errorMessage: "" })
    
    } catch (error) {
        console.log(error);
        return res.render('product-edit',{ product: {},successMessage: '', errorMessage: "Error loading product edditing page" })

    }
}

const productEdit =async (req,res)=>{
    
        const{name, price, description,deleted, category, status}=req.body;
        const images = req.files ? req.files.map(file => file.filename) : [];
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.render('product-edit',{product, successMessage: '', errorMessage: "product not found" });
            }
                product.name=name;
                product.price = price;
                product.description = description;
                product.category = category;
                product.deleted = deleted;
                product.status = status;
                product.images = images;
                product.updatedAt = Date.now();
                await product.save();

                return res.redirect('/admin/product-list')
    
    } catch (error) {
        console.log(error);
        const product = await Product.findById(req.params.id);
        return res.render('product-edit',{product, successMessage: '', errorMessage: "Error loading product adding page" })

    }
}

const deleteProduct = async (req,res)=>{
    try {
        const productId =req.params.productId;
        const product =await Product.findById(productId);
        product.deleted =true;
        await product.save();

        return res.render('product-list', { products, successMessage: '', errorMessage: "An error occurred while deleting" });
    } catch (error) {
        console.log(error);
        return res.render('product-list', { products: [], successMessage: '', errorMessage: "An error occurred while deleting" });    }

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
        return res.render('/admin/product-list',{ successMessage: '', errorMessage: "An error occurd While restoring" });
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