const Coupon = require('../../models/CouponModel');

const getCreateCoupon = async (req,res)=>{
    try {
        res.render('createCoupon', {
            successMessage: null,
            errorMessage: null
        });
    } catch (error) {
        console.log('error  create coupon page :',error)
    }
}
const createCoupon = async (req,res) =>{
    try {
        const { code, discount, expiryDate, minAmount, maxAmount, isActive } = req.body;

        // Validate inputs (additional validation logic can be added as needed)
        if (!code || discount <= 0 || new Date(expiryDate) < new Date() || minAmount < 0 || maxAmount <= minAmount) {
            req.flash('errorMessage', 'Invalid input values');
            return res.redirect('/admin/create-coupon');
        }

        // Create a new coupon
        const newCoupon = new Coupon({
            code,
            discount,
            expiryDate,
            minAmount,
            maxAmount,
            isActive: isActive === 'true' // Convert string 'true'/'false' to boolean
        });

        await newCoupon.save();
        req.flash('successMessage', 'Coupon created successfully');
        res.redirect('/admin/show-coupon');
    } catch (error) {
        console.log('Error creating coupon:', error);
        req.flash('errorMessage', 'Failed to create coupon');
        res.redirect('/admin/create-coupon');
    }
};

const getCoupons = async(req,res)=>{
    try {
        const coupons = await Coupon.find({});
        res.render('Coupons', { coupons });
    } catch (error) {
        console.log('Error fetching coupons:', error);
        res.status(500).send('Server Error');
    }
}

const getCouponById = async (req,res)=>{
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            req.flash('errorMessage', 'Coupon not found');
            return res.redirect('/admin/coupons');
        }
        res.render('editCoupon', { coupon, successMessage: req.flash('successMessage'), errorMessage: req.flash('errorMessage') });
    } catch (err) {
        req.flash('errorMessage', 'An error occurred');
        res.redirect('/admin/coupons');
    }
}
const  updateCouponById =async (req,res)=>{
    try {
        const { code, discount, expiryDate, minAmount, maxAmount, isActive } = req.body;
        const updatedCoupon = await Coupon.findByIdAndUpdate(req.params.id, {
            code, discount, expiryDate, minAmount, maxAmount, isActive: isActive === 'true'
        }, { new: true });

        if (!updatedCoupon) {
            req.flash('errorMessage', 'Failed to update coupon');
            return res.redirect(`/admin/edit-coupon/${req.params.id}`);
        }

        req.flash('successMessage', 'Coupon updated successfully');
        res.redirect('/admin/show-coupon');
    } catch (err) {
        req.flash('errorMessage', 'An error occurred');
        res.redirect(`/admin/edit-coupon/${req.params.id}`);
    }
}
const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            req.flash('errorMessage', 'Coupon not found');
            return res.redirect('/admin/show-coupon');
        }

        await coupon.softDelete();

        req.flash('successMessage', 'Coupon soft deleted successfully');
        res.redirect('/admin/show-coupon');
    } catch (err) {
        req.flash('errorMessage', 'An error occurred');
        res.redirect('/admin/show-coupon');
    }
  };
const restoreCoupon =async (req,res)=>{
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            req.flash('errorMessage', 'Coupon not found');
            return res.redirect('/admin/show-coupon');
        }

        await coupon.restore();

        req.flash('successMessage', 'Coupon restored successfully');
        res.redirect('/admin/show-coupon');
    } catch (err) {
        req.flash('errorMessage', 'An error occurred');
        res.redirect('/admin/show-coupon');
    }
}
const removeCoupon =async(req,res)=>{
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            req.flash('errorMessage', 'Coupon not found');
            return res.redirect('/admin/show-coupon');
        }

        await Coupon.findByIdAndDelete(req.params.id);

        req.flash('successMessage', 'Coupon permanently deleted');
        res.redirect('/admin/show-coupon');
    } catch (err) {
        req.flash('errorMessage', 'An error occurred');
        res.redirect('/admin/show-coupon');
    }
}
module.exports ={
    getCreateCoupon,
    createCoupon,
    getCoupons,
    getCouponById,
    updateCouponById,
    deleteCoupon,
    restoreCoupon,
    removeCoupon
}