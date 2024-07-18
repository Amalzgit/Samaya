const Category = require('../../models/catogaryModel');

const categoryView = async (req, res) => {
    try {
        const categories = await Category.find(); 
        return res.render('Categories', { categories });
    } catch (error) {
        console.error('Error lcached  category view:', error);
        return res.render('Categories', { successMessage: '', errorMessage: "An error occurred while rendering Categories" });
    }
};

const loadAddCategory = async (req, res) => {
    try {
        return res.render('createCategory', { successMessage: '', errorMessage: '' });
    } catch (error) {
        console.error('Error cached in load add category:', error);
        return res.render('createCategory', { successMessage: '', errorMessage: "An error occurred while rendering createCategory" });
    }
};

const addCategory = async (req, res) => {
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
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.redirect('/admin/edit-categories'); // Redirect if category not found
        }
        res.render('edit-categories', { category, successMessage: '', errorMessage: '' });

    } catch (error) {
        return res.render('edit-categories', { successMessage: '', errorMessage: "An error occurred when rendering edit category" });

    }
}
const editCategory = async(req,res)=>{
    try {
        const { name, deleted, createdAt, description } = req.body;
        const categoryId = req.params.id;

        if (!name || !createdAt || !description) {
            return res.render('edit-categories', { category: req.body, successMessage: '',errorMessage: 'All fields are required' });
        }

        const updatedCategory = await Category.findByIdAndUpdate(categoryId,{
            name,
            deleted,
            createdAt,
            description
        },{new:true})
       return res.redirect('/admin/categories');
    } catch (error) {
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
        return res.render('Categories', { successMessage: '', errorMessage: "An error occurd While deleting" })
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
        return res.render('Categories', { successMessage: '', errorMessage: "An error occurd While restoring" })
    }
}

module.exports = {
    categoryView,
    loadAddCategory,
    addCategory,
    loadEditCategory,
    editCategory,
    deleteCategory,
    restoreCategory
};
