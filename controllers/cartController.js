const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const Address = require('../models/addressModel'); 
const Coupon = require('../models/CouponModel')

const loadCart =async(req,res)=>{
 try {

    const Id = req.currentUser._id

    const [cart, coupons] = await Promise.all([
      Cart.findOne({user: Id}).populate('items.product'),
      Coupon.find()
    ]);
    return res.render('cart',{cart,coupons})
 } catch (error) {
    console.log("cart loading error :",error);
    res.status(500).json({ message: 'Error finidng cart', error });
 }
}

const addItemToCart = async(req,res)=>{
    try {
        const { productId , quantity } =req.body;
        const userId =req.currentUser._id

        const [cart, product] = await Promise.all([
          Cart.findOne({user: userId}),
          Product.findById(productId)
        ]);

        if(!product){
            return res.status(404).json({ message: 'Product not found' })
        }

        if(product.stock <quantity){
            return res.status(400).json({ message: 'Not enough stock' });
        }

        if(!cart){
            const  newCart =new Cart({
                user:userId,
                items:[{product:productId,quantity}],
                total:product.price *quantity
            });
            await newCart.save()
        }else{
            const existingItem =cart.items.find(item => item.product.toString() === productId);
            if(existingItem){
                existingItem.quantity += parseInt(quantity)
            }else{
                cart.items.push({product:productId,quantity});
            }
            cart.total =cart.items.reduce((total,item)=>total +(item.product.price * item.quantity),0);
            await cart.save();
        }
        res.redirect('/cart');
        
    } catch (error) {
        console.log("adding to cart error :",error);
        
        res.status(500).json({ message: 'Error adding to cart', error });
    }
}
 
const removeItemFromCart =async (req,res)=>{

    try {
        const { productId } = req.body;
        const cart = await Cart.findOne({ user: req.currentUser._id });
        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        cart.total = cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
        await cart.save();
        res.redirect('/cart');
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ message: 'Error removing from cart', error });
    }
};

const clearCart = async(req,res)=>{

    try {
        const cart =await Cart.findOne({user:req.currentUser._id});
        cart.items = [];
        cart.total = 0;
        await cart.save();
        res.redirect('/cart')
        
    } catch (error) {
        console.log("clear cart error :",error);
        res.status(500).json({ message: 'Error clearing cart', error });

        
    }

}

const updateCart =async (req,res)=>{
    try {
        const { productId, quantity } = req.body;
        
        // Find the cart for the current user
        const cart = await Cart.findOneAndUpdate(
            { user: req.currentUser._id ,'items.product':productId},
            { $set:{'items.$.quantity':quantity}},
            {new:true}
        ).populate('items.product');

        
        cart.total = cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);

        // Save the updated cart
        await cart.save();

        const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
        const formattedSubtotal = formatter.format(cart.items.find(item => item.product._id.toString() === productId).product.price * quantity);
        const formattedTotal = formatter.format(cart.total);

        res.json({
            success: true,
            formattedSubtotal,
            formattedTotal,
            cartSubtotal: formattedTotal
        });
    } catch (error) {
        console.log('Update cart error:',error);
        res.status(500).json({ message: 'Error updating cart', error });
    }
}



// checkout

const Checkout = async (req,res)=>{
    try {
      const cartData =JSON.parse(req.body.cartData);

      req.session.CheckoutCart =cartData
  
      res.redirect('/checkout-page');
    } catch (error) {
      console.log("checkout error:",error);
      res.redirect('/cart');
  
    }
  };
  const getCheckout = async (req, res) => {
    try {
      const userId = req.currentUser._id
      const cartData = req.session.CheckoutCart;
      const [userAddress, user] = await Promise.all([
        Address.find({ user: userId }),
        req.currentUser
      ]);
      const selectedAddress =userAddress.find(address=>address.isDefault ) || userAddress[0]

  
      res.render('checkout', {
        cart: cartData,
        addresses: userAddress,
        user,
        selectedAddress,
        layout: false
      });
    } catch (error) {
      console.log("Error in getCheckout:", error);
      res.status(500).send("An error occurred while processing your request.");
    }
  };

  const changeAddress =async (req,res) =>{
  try {
    const { addressId } = req.body;
    req.session.selectedAddressId = addressId;
    res.sendStatus(200);
  } catch (error) {
    console.log("change address :",error);
  }
}


const loadAddAddress = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.currentUser._id });
    res.render("checkoutAddAddress", { layout: false, addresses });
  } catch (error) {
    console.error("Error loading add address page:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const addAddress = async (req, res) => {
  const {
    country,
    fullName,
    mobileNumber,
    pincode,
    addressLine1,
    addressLine2,
    landmark,
    townCity,
    state,
    type,
    isDefault
  } = req.body;

  try {
    const userId = req.currentUser._id;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is missing" });
    }

    const isDefaultBoolean = isDefault === "on";

    if (isDefaultBoolean) {
      await Address.updateMany(
        { user: userId, isDefault: true },
        { isDefault: false }
      );
    }

    const newAddress = new Address({
      country,
      fullName,
      mobileNumber,
      pincode,
      addressLine1,
      addressLine2,
      landmark,
      townCity,
      state,
      type,
      isDefault: isDefaultBoolean,
      user: userId
    });

    const savedAddress = await newAddress.save();
    if (!savedAddress) {
      return res.status(500).json({ success: false, message: "Failed to save address" });
    }
    res.redirect('/checkout-page');
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};





module.exports = {
    addItemToCart,
    loadCart,
    removeItemFromCart,
    clearCart,
    updateCart,
    loadAddAddress,
    addAddress,
  // checkout
  Checkout,
  getCheckout,
  changeAddress
  

};
