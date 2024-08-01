const Brand = require('../../models/BrandModel');
const {validationResult}=require('../../middleware/validator')

const getBrands = async (req, res) => {
    try {
        const brands = await Brand.find();
        return res.render('Brands', { brands });
    } catch (error) {
        console.log("Error while rendering brands", error);
        return res.redirect('/admin/adminhome');
    }
}

const getCreateBrands = async (req, res) => {
    try {
        return res.render('CreateBrand');
    } catch (error) {
        console.log("Error while rendering create brands", error);
    }
}

const createBrand = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.render('createCategory', { successMessage: '', errorMessage: errors.array()[0] });

    }
    try {
        const { brandName, brandDescription } = req.body;
        const brandLogo = req.file.filename;

        const newBrand = new Brand({
            name: brandName,
            description: brandDescription,
            logo: brandLogo
        });

        await newBrand.save();
        return res.redirect('/admin/brands');
    } catch (error) {
        console.log('Error when creating brand', error);
        return res.redirect('/admin/create-brand');
    }
}

const loadEditBrand = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.brandId);

        if (!brand) {
            return res.redirect('/admin/brands');
        }

        res.render('editBrand', { brand, successMessage: '', errorMessage: '' });
    } catch (error) {
        console.log("Error when rendering edit brand", error);
        return res.render('Brands', { successMessage: '', errorMessage: "An error occurred when rendering edit brand" });
    }
}

const editBrand = async (req, res) => {
    try {
        const { name, isActive, description } = req.body;
        const brandId = req.params.brandId;
        let brandLogo = req.file ? req.file.filename : undefined;

        if (!name || !description) {
            return res.redirect('/admin/brands');
        }

        const updatedBrand = await Brand.findByIdAndUpdate(brandId, {
            name: name || Brand.name,
            isActive: isActive,
            description: description || Brand.description,
            logo: brandLogo || Brand.logo
        }, { new: true }); 
        await updatedBrand.save()
        return res.redirect('/admin/brands');
    } catch (error) {
        console.log(error);
        res.render('brands', { brand: req.body, successMessage: '', errorMessage: 'An error occurred while updating the brand' });
    }
}


const deleteBrand = async (req, res) => {
    try {
        const brandId = req.params.brandId;
        const brand = await Brand.findById(brandId);
        brand.isActive = false;
        await brand.save();

        return res.redirect('/admin/brands');
    } catch (error) {
        console.log(error);
        return res.redirect('/admin/brands');
    }
}

const restoreBrand = async (req, res) => {
    try {
        const brandId = req.params.brandId;
        const brand = await Brand.findById(brandId);
        brand.isActive = true;
        await brand.save();

        return res.redirect('/admin/brands');
    } catch (error) {
        console.log(error);
        return res.redirect('/admin/brands');
    }
}

const removeBrand = async (req, res) => {
    try {
        const brandId = req.params.brandId;
        await Brand.findByIdAndDelete(brandId);

        return res.redirect('/admin/brands');
    } catch (error) {
        console.log("Remove brand error", error);
        return res.redirect('/admin/brands');
    }
}

module.exports = {
    getBrands,
    getCreateBrands,
    createBrand,
    loadEditBrand,
    editBrand,
    deleteBrand,
    removeBrand,
    restoreBrand
}
