const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const Address = require('../models/addressModel'); 
const Order =require('../models/orderModel');


const loadCart =async(req,res)=>{
 try {

    userId =req.session.user_id
    const cart = await Cart.findOne({user:userId}).populate('items.product');
    console.log(cart);
    
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

        // if (!cart) {
        //     return res.status(404).json({ error: 'Cart not found' });
        // }

        // // Find the index of the item in the cart
        // const itemIndex = cart.items.findIndex(item => item.product._id.toString() === productId);

        // if (itemIndex === -1) {
        //     return res.status(404).json({ error: 'Item not found in cart' });
        // }

        // // Update the quantity of the item
        // cart.items[itemIndex].quantity = quantity;

        // Recalculate the total price
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

module.exports = {
    addItemToCart,
    loadCart,
    removeItemFromCart,
    clearCart,
    updateCart
};
