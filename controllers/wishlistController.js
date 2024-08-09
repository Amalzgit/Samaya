const Wishlist = require('../models/wishListModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');

const addToWishList = async (req, res) => {
   try {
    const { productId } = req.body;
    const userId = req.session.user_id;

    // Find or create wishlist for the user
    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
    }

    // Check if the product is already in the wishlist
    if (wishlist.products.includes(productId)) {
      return res.status(400).json({ success: false, message: 'Product is already in your wishlist.' });
    }

    // Add product to the wishlist
    wishlist.products.push(productId);

    await wishlist.save();
     res.render('WishList');
    // res.status(200).json({ success: true, message: 'Product added to wishlist.' });
  } catch (error) {
    console.log("wishlist adding error:", error);
    res.status(500).json({ success: false, message: 'Server error: unable to add to wishlist.' });
  }
};

const removeWishlistItem = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.session.user_id;
    
        await Wishlist.updateOne(
          { user: userId },
          { $pull: { products: productId } }
        );
    
        res.redirect('/wishlist');/*?message=Product%20removed%20from%20wishlist*/
      } catch (error) {
        console.log("wishlist removing error:", error);
        res.redirect('/wishlist');/*??error=Server%20error:%20removing%20from%20wishlist*/
      } 
};

const getWishlist = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const wishlist = await Wishlist.findOne({ user: userId }).populate('products');

        // Retrieve success or error messages from query parameters
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
