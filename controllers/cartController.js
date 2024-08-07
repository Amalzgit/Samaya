const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const Address = require('../models/addressModel'); 
const User = require('../models/userModel')

const loadCart =async(req,res)=>{
 try {

    userId =req.session.user_id
    const cart = await Cart.findOne({user:userId}).populate('items.product');
    
    
    return res.render('cart',{cart})
 } catch (error) {
    console.log("cart loading error :",error);
    res.status(500).json({ message: 'Error finidng cart', error });
 }
}

const addItemToCart = async(req,res)=>{
    try {
        const { productId , quantity } =req.body;
        const userId =req.session.user_id

        const cart = await Cart.findOne({user:userId});
        const product =await Product.findById(productId);


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
        const cart = await Cart.findOne({ user: req.session.user_id });
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
        const cart =await Cart.findOne({user:req.session.user_id});
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
            { user: req.session.user_id ,'items.product':productId},
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
      const userId = req.session.user_id
      const cartData = req.session.CheckoutCart;
      const userAddress = await Address.find({ user :userId });
      const selectedAddress =userAddress.find(address=>address.isDefault ) || userAddress[0]
      
  
      res.render('checkout', {
        cart: cartData,
        addresses: userAddress, 
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
      const addresses = await Address.find({ user: req.session.user_id });
      res.render("addAddress", { layout: false, addresses });
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
      const userId = req.session.user_id;
      
      if (!userId) {
        console.error("User ID is missing in session.");
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
  
      await newAddress.save();
      res.redirect('/checkout')
    } catch (error) {
      console.error("Error adding address:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  
  const loadEditAddress = async (req, res) => {
    try {
      const { addressId } = req.params;
      const address = await Address.findById(addressId);
      const user = await User.findById(req.session.user_id);
  
      if (!address || !user) {
        return res.status(404).json({ success: false, message: "Address or user not found" });
      }
  
      res.render('edit-address', { user, address, layout: false });
    } catch (error) {
      console.error('Error loading edit address:', error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  
  const editAddress = async (req, res) => {
    const { addressId } = req.params;
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
      const addressToUpdate = await Address.findById(addressId);
      if (!addressToUpdate) {
        return res.status(404).json({ success: false, message: "Address not found" });
      }
  
      if (isDefault === 'on') {
        const currentDefaultAddress = await Address.findOne({ isDefault: true });
        if (currentDefaultAddress && currentDefaultAddress._id.toString() !== addressId) {
          await Address.findByIdAndUpdate(currentDefaultAddress._id, { isDefault: false });
        }
      }
  
      const updateData = {
        country: country || addressToUpdate.country,
        fullName: fullName || addressToUpdate.fullName,
        mobileNumber: mobileNumber || addressToUpdate.mobileNumber,
        pincode: pincode || addressToUpdate.pincode,
        addressLine1: addressLine1 || addressToUpdate.addressLine1,
        addressLine2: addressLine2 || addressToUpdate.addressLine2,
        landmark: landmark || addressToUpdate.landmark,
        townCity: townCity || addressToUpdate.townCity,
        state: state || addressToUpdate.state,
        type: type || addressToUpdate.type,
        isDefault: isDefault === "on"
      };
  
      const address = await Address.findByIdAndUpdate(addressId, updateData, { new: true });
  
      if (!address) {
        return res.status(404).json({ success: false, message: "Address not found" });
      }
  
      res.redirect('/checkout')
    } catch (error) {
      console.error('Error editing address:', error);
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
    loadEditAddress,
    editAddress,

  // checkout
  Checkout,
  getCheckout,
  changeAddress
  

};
