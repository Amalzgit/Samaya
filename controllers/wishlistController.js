const Wishlist = require('../models/wishListModel');
// const User = require('../models/userModel');
// const Product = require('../models/productModel');
 
const addToWishList = async (req, res) => {
   try {
    const { productId } = req.body;
    const userId = req.currentUser._id;

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
    }

    if (wishlist.products.includes(productId)) {
      return res.status(400).json({ success: false, message: 'Product is already in your wishlist.' });
    }

    wishlist.products.push(productId);

    await wishlist.save();
    // console.log('Wishlist:', wishlist);
     res.render('WishList',{wishlist});
  } catch (error) {
    console.log("wishlist adding error:", error);
    res.status(500).json({ success: false, message: 'Server error: unable to add to wishlist.' });
  }
};

const removeWishlistItem = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.currentUser._id
    
        await Wishlist.updateOne(
          { user: userId },
          { $pull: { products: productId } }
        );
    
        res.redirect('/wishlist');
      } catch (error) {
        console.log("wishlist removing error:", error);
        res.redirect('/wishlist');
      } 
};

const getWishlist = async (req, res) => {
    try {
        const userId = req.currentUser._id
        const wishlist = await Wishlist.findOne({ user: userId }).populate('products');

        const { message, error } = req.query;

        res.render('Wishlist', { wishlist, message, error });
    } catch (error) {
        console.log("wishlist showing error:", error);
        res.status(500).json({ error: 'Server error: showing wishlist' });
    }
};

module.exports = {
    getWishlist,
    removeWishlistItem,
    addToWishList
};
