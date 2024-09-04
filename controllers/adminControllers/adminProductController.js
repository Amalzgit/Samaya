const Product = require('../../models/productModel')
const Category =require('../../models/catogaryModel');
const { validationResult } = require('express-validator');
const Brand =require('../../models/BrandModel')


const loadproductList = async (req, res) => {
    const { category, brand, page = 1 } = req.query;
    const limit = 5;
    const skip = (page - 1) * limit;
    try {
        let filter = {};
        
        const [categoryDoc, brandDoc, categories, brands] = await Promise.all([
            category ? Category.findOne({ name: category, deleted: false }) : null,
            brand ? Brand.findOne({ name: brand, isActive: true }) : null,
            Category.find({ deleted: false }),
            Brand.find({ isActive: true })
        ]);

        if (categoryDoc) filter.category = categoryDoc._id;
        if (brandDoc) filter.brand = brandDoc._id;

        const total = await Product.countDocuments(filter);

        const products = await Product.find(filter)
            .skip(skip)
            .limit(limit)
            .populate('category')
            .populate('brand');

        const totalPages = Math.ceil(total / limit);
        const currentPage = parseInt(page);

        const baseUrl = `${req.protocol}://${req.get("host")}${req.path}`;
        const pageUrls = {};
        for (let i = 1; i <= totalPages; i++) {
            const urlParams = new URLSearchParams(req.query);
            urlParams.set("page", i);
            pageUrls[i] = `${baseUrl}?${urlParams.toString()}`;
        }
        const pagination = {
            currentPage: currentPage,
            totalPages: totalPages,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1,
            nextPageUrl: currentPage < totalPages ? pageUrls[currentPage + 1] : null,
            prevPageUrl: currentPage > 1 ? pageUrls[currentPage - 1] : null,
            pageUrls: pageUrls,
        };

        return res.render('product-list', { products, categories, pagination, brands, successMessage: '', errorMessage: '' });
    } catch (error) {
        console.error('Error loading product list:', error);

        const pagination = {
            currentPage: 1,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
            nextPageUrl: null,
            prevPageUrl: null,
            pageUrls: {},
        };

        return res.render('product-list', { successMessage: '', products: {}, categories: {}, pagination, brands: {}, errorMessage: 'An error occurred' });
    }
};


const loadAddproduct = async (req, res) => {
    try {
        const [categories, brands] = await Promise.all([
            Category.find({ deleted: false }),
            Brand.find({ isActive: true })
        ]);
        return res.render('add-products', { categories, brands, successMessage: '', errorMessage: '' });
    } catch (error) {
        console.error('Error loading add product page:', error);
        return res.render('add-products', { categories: [], brands: [], successMessage: '', errorMessage: 'An error occurred' });
    }
};

const addproduct = async (req, res) => {
    const [categories, brands] = await Promise.all([
        Category.find({ deleted: false }),
        Brand.find({ isActive: true })
    ]);

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
        // console.log("brand doc :",brandDoc);
        
        const newProduct = new Product({
            name,
            price,
            description,
            images,
            category,
            stock,
            brand: brandDoc._id, 
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
        const [categories, brands, product] = await Promise.all([
            Category.find({ deleted: false }),
            Brand.find({ isActive: true }),
            Product.findById(req.params.productId)
        ]);
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
        const [product, categories, brands, brandDoc] = await Promise.all([
            Product.findById(req.params.productId).populate('category').populate('brand'),
            Category.find({ deleted: false }),
            Brand.find({ isActive: true }),
            Brand.findOne({ name: brand })
        ]);

        if (!product) {
            return res.render('product-edit', {
                categories, brands, product: null,
                successMessage: '', errorMessage: 'Product not found'
            });
        }

        if (!brandDoc) {
            return res.render('product-edit', {
                categories, brands, product,
                successMessage: '', errorMessage: 'Invalid brand'
            });
        }

        Object.assign(product, {
            name: name || product.name,
            price: price || product.price,
            description: description || product.description,
            category: category || product.category,
            brand: brandDoc._id,
            stock: stock || product.stock,
            caseMaterial: caseMaterial || product.caseMaterial,
            crystalType: crystalType || product.crystalType,
            dialColor: dialColor || product.dialColor,
            hourMarkers: hourMarkers || product.hourMarkers,
            handType: handType || product.handType,
            bezelType: bezelType || product.bezelType,
            caseShape: caseShape || product.caseShape,
            additionalDesignElements: additionalDesignElements || product.additionalDesignElements,
            powerReserve: powerReserve || product.powerReserve,
            warrantyPeriod: warrantyPeriod || product.warrantyPeriod,
            certifications: certifications || product.certifications,
            images: images.length > 0 ? images : product.images
        });

        await product.save();

        return res.redirect('/admin/product-list');

    } catch (error) {
        console.error('Error editing product:', error);
        return res.render('product-edit', {
            categories: [], brands: [], product: null,
            successMessage: '', errorMessage: 'Error editing product'
        });
    }
};



const deleteProduct = async (req,res)=>{
    try {
        const productId =req.params.productId;
        await Product.findByIdAndUpdate(productId, { deleted: true });
        return res.redirect('/admin/product-list');
    } catch (error) {
        console.log(error);
        return res.redirect('/admin/product-list')
    }

}


const restoreProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        await Product.findByIdAndUpdate(productId, { deleted: false });
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