const Product = require('../../models/productModel')
const Category =require('../../models/catogaryModel');
const { validationResult } = require('express-validator');
const Brand =require('../../models/BrandModel')


const loadproductList = async (req, res) => {
    const { category, brand } = req.query;

    try {
        let filter = {};
        
        if (category) {
            const categoryDoc = await Category.findOne({ name: category, deleted: false });
            if (categoryDoc) {
                filter.category = categoryDoc._id;
            }
        }

        if (brand) {
            const brandDoc = await Brand.findOne({ name: brand, isActive: true });
            if (brandDoc) {
                filter.brand = brandDoc._id;
            }
        }

        const categories = await Category.find({ deleted: false });
        const brands = await Brand.find({ isActive: true });
        const products = await Product.find(filter).populate('category').populate('brand');
       
        return res.render('product-list', { products, categories, brands, successMessage: '', errorMessage: '' });
    } catch (error) {
        console.error('Error loading product list:', error);
        return res.render('product-list', { successMessage: '', errorMessage: 'An error occurred' });
    }
};

const loadAddproduct = async (req, res) => {
    try {
        const categories = await Category.find({ deleted: false });
        const brands = await Brand.find({ isActive: true });
        return res.render('add-products', { categories, brands, successMessage: '', errorMessage: '' });
    } catch (error) {
        console.error('Error loading add product page:', error);
        return res.render('add-products', { categories: [], brands: [], successMessage: '', errorMessage: 'An error occurred' });
    }
};

const addproduct = async (req, res) => {
    const categories = await Category.find({ deleted: false });
    const brands = await Brand.find({ isActive: true });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('add-products', { categories, brands, successMessage: '', errorMessage: errors.array()[0] });
    }

    const {
        name,
        price,
        description,
        category,
        stock,
        brand,
        caseMaterial,
        crystalType,
        dialColor,
        hourMarkers,
        handType,
        bezelType,
        caseShape,
        additionalDesignElements,
        powerReserve,
        warrantyPeriod,
        certifications
    } = req.body;

    const images = req.files.map(file => file.filename);

    if (images.length < 3) {
        return res.render('add-products', { categories, brands, successMessage: '', errorMessage: "Add min 3 images" });
    }

    try {
        const brandDoc = await Brand.findOne({ name: brand });
        if (!brandDoc) {
            return res.render('add-products', { categories, brands, successMessage: '', errorMessage: "Invalid brand" });
        }
        
        const newProduct = new Product({
            name,
            price,
            description,
            images,
            category,
            stock,
            brand: brandDoc._id, // Use ObjectId of the brand
            caseMaterial,
            crystalType,
            dialColor,
            hourMarkers,
            handType,
            bezelType,
            caseShape,
            additionalDesignElements,
            powerReserve,
            warrantyPeriod,
            certifications
        });

        await newProduct.save();
        return res.redirect('/admin/product-list');
    } catch (error) {
        console.error('Error adding product:', error);
        return res.render('add-products', { categories, brands, successMessage: '', errorMessage: 'An error occurred' });
    }
};

  
const loadEditProduct = async (req, res) => {
    try {
        const categories = await Category.find({ deleted: false });
        const brands = await Brand.find({ isActive: true });
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.render('product-edit', {
                product: null,
                categories,
                brands,
                successMessage: '',
                errorMessage: 'Product not found'
            });
        }
        
        return res.render('product-edit', {
            product,
            categories,
            brands,
            successMessage: '',
            errorMessage: ''
        });
    } catch (error) {
        console.error('Error loading product:', error);
        return res.render('product-edit', {
            categories: [],
            brands: [],
            product: null,
            successMessage: '',
            errorMessage: 'Error loading product editing page'
        });
    }
};

const productEdit = async (req, res) => {
    const { name,
         price, 
         description,
         category, 
         brand, 
         stock,
         caseMaterial, 
         crystalType, 
         dialColor, 
         hourMarkers, 
         handType, 
         bezelType, 
         caseShape, 
         additionalDesignElements, 
         powerReserve, 
         warrantyPeriod, 
         certifications } = req.body;
    const images = req.files ? req.files.map(file => file.filename) : [];

    try {
        const product = await Product.findById(req.params.productId).populate('category').populate('brand');
        const categories = await Category.find({ deleted: false });
        const brands = await Brand.find({ isActive: true });

        if (!product) {
            return res.render('product-edit', {
                categories,
                brands,
                product: null,
                successMessage: '',
                errorMessage: 'Product not found'
            });
        }

        const brandDoc = await Brand.findOne({ name: brand });
        if (!brandDoc) {
            return res.render('product-edit', {
                categories,
                brands,
                product,
                successMessage: '',
                errorMessage: 'Invalid brand'
            });
        }

        // const formattedPrice = new Intl.NumberFormat('en-IN', {
        //     style: 'currency',
        //     currency: 'INR'
        // }).format(price);

        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;
        product.category = category || product.category;
        product.brand = brandDoc._id || product.brand; 
        product.stock = stock || product.stock;
        product.caseMaterial = caseMaterial || product.caseMaterial;
        product.crystalType = crystalType || product.crystalType;
        product.dialColor = dialColor || product.dialColor;
        product.hourMarkers = hourMarkers || product.hourMarkers;
        product.handType = handType || product.handType;
        product.bezelType = bezelType || product.bezelType;
        product.caseShape = caseShape || product.caseShape;
        product.additionalDesignElements = additionalDesignElements || product.additionalDesignElements;
        product.powerReserve = powerReserve || product.powerReserve;
        product.warrantyPeriod = warrantyPeriod || product.warrantyPeriod;
        product.certifications = certifications || product.certifications;
        product.images = images.length > 0 ? images : product.images; 

        await product.save();

        return res.redirect('/admin/product-list');
    } catch (error) {
        console.error('Error editing product:', error);
        const categories = await Category.find({ deleted: false });
        const brands = await Brand.find({ isActive: true });
        const product = await Product.findById(req.params.productId).populate('category').populate('brand');

        return res.render('product-edit', {
            categories,
            brands,
            product,
            successMessage: '',
            errorMessage: 'Error editing product'
        });
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
}
const removeProduct = async (req,res)=>{
   try {
    const productId =req.params.productId;
    await Product.findByIdAndDelete({_id:productId});

    return res.redirect('/admin/product-list');

   } catch (error) {
    console.log("remove product error",error);
    return res.redirect('/admin/product-list');
  }

}

module.exports = {
    loadproductList,
    loadAddproduct,
    addproduct,
    productEdit,
    loadEditProduct,
    deleteProduct,
    restoreProduct,
    removeProduct
}