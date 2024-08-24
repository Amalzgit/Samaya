const ProductOffer = require("../../models/offerSchema");
const Product = require("../../models/productModel");

const viewOffers = async (req, res) => {
  try {
    const offers = await ProductOffer.find().populate("productId");
    return res.render("Offers", { offers });
  } catch (error) {
    console.error("Error fetching offers:", error);
    return res.render("Offers", {
      offers: [],
      errorMessage: "An error occurred while fetching offers.",
    });
  }
};
const loadCreateOffer = async (req, res) => {
  try {
    const products = await Product.find();
    return res.render("createOffer", {
      products,
      successMessage: "",
      errorMessage: "",
    });
  } catch (error) {
    console.error("Error loading add offer page:", error);
    return res.render("Offers", {
      successMessage: "",
      errorMessage: "An error occurred while rendering add offer page.",
    });
  }
};

const addOffer = async (req, res) => {
  const { productId, discount, startDate, endDate } = req.body;

  try {
    const newOffer = new ProductOffer({
      productId,
      discount,
      startDate,
      endDate,
      isActive:true
    });
    await newOffer.save();
    return res.redirect("/admin/show-offers");
  } catch (error) {
    console.error("Error adding offer:", error);
    const products = await Product.find();
    return res.render("createOffer", {
      products,
      successMessage: "",
      errorMessage: "An error occurred while creating the offer.",
    });
  }
};

const loadEditOffer = async (req,res)=>{
try {
    const offer = await ProductOffer.findById(req.params.offerId).populate('productId');
    if (!offer) {
        return res.redirect('/admin/show-offers');
    }
    const products = await Product.find();
    return res.render('edit-offer', { offer, products, successMessage: '', errorMessage: '' });
} catch (error) {
    console.error('Error loading edit offer page:', error);
        return res.render('Offers', { successMessage: '', errorMessage: "An error occurred while rendering edit offer page." });
}
};

const editOffer = async (req,res)=>{
    try {
        const { productId, discount, startDate, endDate, isActive } = req.body;
        const offerId = req.params.offerId;

        if (!productId || discount == null || !startDate || !endDate) {
            return res.redirect('/admin/show-offers');
        }

        await ProductOffer.findByIdAndUpdate(offerId, {
            productId,
            discount,
            startDate,
            endDate,
            isActive: true,
        });
        return res.redirect('/admin/show-offers');
    } catch (error) {
        console.error('Error editing offer:', error);
        const products = await Product.find();
        return res.render('edit-offer', { offer: req.body, products, successMessage: '', errorMessage: 'An error occurred while updating the offer.' });
    }
};

const inactiveOffer = async (req, res) => {
    try {
        const offerId = req.params.offerId;
        const offer = await ProductOffer.findById(offerId);
        if (offer) {
            offer.isActive = false;
            await offer.save();
        }
        return res.redirect('/admin/show-offers');
    } catch (error) {
        console.error('Error deleting offer:', error);
        return res.redirect('/admin/show-offers');
    }
};

const activeOffer = async (req, res) => {
    try {
        const offerId = req.params.offerId;
        const offer = await ProductOffer.findById(offerId);
        if (offer) {
            offer.isActive = true;
            await offer.save();
        }
        return res.redirect('/admin/show-offers');
    } catch (error) {
        console.error('Error restoring offer:', error);
        return res.redirect('/admin/show-offers');
    }
};

const removeOffer = async (req, res) => {
    try {
        const offerId = req.params.offerId;
        await ProductOffer.findByIdAndDelete(offerId);
        return res.redirect('/admin/show-offers');
    } catch (error) {
        console.error('Error removing offer:', error);
        return res.redirect('/admin/show-offers');
    }
};
module.exports = {
  viewOffers,
  loadCreateOffer,
  addOffer,
  loadEditOffer,
  editOffer,
  inactiveOffer,
  activeOffer,
  removeOffer
};