const Brand =require('../../models/BrandModel');


const getBrands = async (req,res)=>{
    try {
        const brands =await Brand.find()
        console.log(brands);
        return res.render('Brands',{brands})
    } catch (error) {
        console.log("Error while rendering brands",error);
        return res.redirect('/admin/adminhome')
    }
}
const getCreateBrands = async(req,res)=>{
    try {
        return res.render('CreateBrand')
    } catch (error) {
        console.log("error while rendering create brands",error);
    }
}
const createBrand =async (req,res)=>{
    try {
        const {brandName,brandDescription} =req.body;
        const brandLogo =req.file.filename;

        const newBrand = new Brand({
            name:brandName,
            description:brandDescription,
            logo:brandLogo
        });

        await newBrand.save();
        return res.redirect('/admin/brands')
       
    } catch (error) {
        console.log('error when creating brand',error);
        return res.redirect('/admin/create-brand')
    }
}
module.exports ={
    getBrands,
    getCreateBrands,
    createBrand
}