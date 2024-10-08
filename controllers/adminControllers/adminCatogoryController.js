const { validationResult } = require('express-validator');
const Category = require('../../models/catogaryModel');

const categoryView = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const itemsPerPage = 5;
        const skip = (page - 1) * itemsPerPage;
        const searchQuery = req.query.search || ''; 

        const filter = searchQuery ? {
            $or: [
                { name: new RegExp(searchQuery, 'i') },
                { description: new RegExp(searchQuery, 'i') }
            ]
        } : {};

        const totalCategories = await Category.countDocuments(filter);
        
        const categories = await Category.find(filter).skip(skip).limit(itemsPerPage);

        const totalPages = Math.ceil(totalCategories / itemsPerPage);

        const pagination = {
            currentPage: page,
            totalPages,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevPageUrl: page > 1 ? `?page=${page - 1}&search=${searchQuery}` : null,
            nextPageUrl: page < totalPages ? `?page=${page + 1}&search=${searchQuery}` : null,
            pageUrls: Array.from({ length: totalPages }, (_, i) => `?page=${i + 1}&search=${searchQuery}`)
        };



        return res.render('Categories', {
            categories,
            currentPage: page,
            totalPages,
            totalCategories,
            itemsPerPage,
            searchQuery, 
            pagination 
        });
    } catch (error) {
        console.error('Error fetching category view:', error);
        return res.render('Categories', {
            categories: [],
            currentPage: 1,
            totalPages: 1,
            totalCategories: 0,
            itemsPerPage: 10,
            searchQuery: '',
            pagination: {
                currentPage: 1,
                totalPages: 1,
                hasPrevPage: false,
                hasNextPage: false,
                prevPageUrl: null,
                nextPageUrl: null,
                pageUrls: []
            },
            errorMessage: "An error occurred while rendering Categories"
        });
    }
};

const loadAddCategory = async (req, res) => {
    try {
        return res.render('createCategory', { successMessage: '', errorMessage: '' });
    } catch (error) {
        console.error('Error cached in load add category:', error);
        return res.render('Categories', { successMessage: '', errorMessage: "An error occurred while rendering createCategory" });
    }
};

const addCategory = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.render('createCategory', { successMessage: '', errorMessage: errors.array()[0] });

    }
        

    const { name, createdAt, description } = req.body;
    const deleted = req.body.deleted === 'on';

    try {
        const newCategory = new Category({
            name,
            deleted,
            createdAt,
            description
        });
        await newCategory.save();
        return res.redirect('/admin/Categories');
    } catch (error) {
        console.error('Error cached in add category:', error);
        return res.render('createCategory', { successMessage: '', errorMessage: "An error occurred when creating Category" });
    }
};

const loadEditCategory =async(req,res)=>{
    try {
        const category = await Category.findById(req.params.categoryId);

        if (!category) {
            return res.redirect('/admin/Categories');
        }

        res.render('edit-categories', { category, successMessage: '', errorMessage: '' });

    } catch (error) {
        return res.render('Categories', { successMessage: '', errorMessage: "An error occurred when rendering edit category" });

    }
}
const editCategory = async(req,res)=>{


    try {
        const { name, deleted, description } = req.body;
        // console.log(name);
        // console.log(deleted);
        // console.log(description);


        const categoryId = req.params.categoryId;

        if (!name || !description) {
            return res.redirect('/admin/categories')
        }
       

         await Category.findByIdAndUpdate(categoryId,{
            name:name || name,
            deleted,
            description:description|| description
        })
       return res.redirect('/admin/categories');
    } catch (error) {
        console.log(error);
        res.render('edit-categories', {category: req.body,successMessage: '', errorMessage: 'An error occurred while updating the category' });
    }
}

const deleteCategory =async(req,res)=>{
    try{
        const categoryId =req.params.categoryId;
        const category =await Category.findById(categoryId);
        category.deleted=true;
        await category.save();

        return res.redirect('/admin/Categories')

    }catch(error){
        console.log(error);
        return res.redirect('/admin/Categories')
    }
}

const restoreCategory =async (req,res)=>{
    try {
        const categoryId= req.params.categoryId;
        const category =await Category.findById(categoryId);
        category.deleted =false;
        await category.save();

        return res.redirect('/admin/Categories')
    } catch (error) {
        console.log(error);
        return res.redirect('/admin/Categories')
    }
}

const removeCategory= async (req,res)=>{
    try {
     const categoryId =req.params.categoryId;
     await Category.findByIdAndDelete({_id:categoryId});
 
     return res.redirect('/admin/Categories')
 
    } catch (error) {
     console.log("remove Category error",error);
     return res.redirect('/admin/Categories')
    }
 
 }

module.exports = {
    categoryView,
    loadAddCategory,
    addCategory,
    loadEditCategory,
    editCategory,
    deleteCategory,
    restoreCategory,
    removeCategory
};
