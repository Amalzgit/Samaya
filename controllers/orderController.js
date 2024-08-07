const Order =require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User =require('../models/userModel');
const addressModel = require('../models/addressModel');

const placeOrder = async (req, res) => {
    try {
        const { addressId, paymentMethod } = req.body;
        const userId = req.session.user_id;

        // console.log(addressId);
        
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        const address = await addressModel.findById(addressId)
        // console.log( "session :",req.session);
        
        // console.log("address :",address);
        
        if (!address) {
            return res.status(400).json({ success: false, message: 'Invalid address' });
        }

        const order = new Order({
            user: userId,
            address: {
                fullName: address.fullName,
                mobileNumber: address.mobileNumber,
                pincode: address.pincode,
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2,
                landmark: address.landmark,
                townCity: address.townCity,
                state: address.state,
                country: address.country,
                type: address.type
              },
            payment: {
                method: paymentMethod,
                status: 'Pending'
            }
        });

        

        let totalPrice = 0;

        for (const cartItem of cart.items) {
            const product = await Product.findById(cartItem.product._id);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product ${cartItem.product.name} not found` });
            }
            if (product.quantity < cartItem.quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
            }

            const orderItem = {
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                totalPrice: product.price * cartItem.quantity
            };
            order.items.push(orderItem);
            totalPrice += orderItem.totalPrice;

            // Update product quantity
            product.quantity -= cartItem.quantity;
            await product.save();
        }

        order.totalPrice = totalPrice;

        await order.save();
        // console.log(order);


        // Clear the cart
        await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
        
        for (const cartItem of cart.items) {
            const product = await Product.findById(cartItem.product._id);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product ${cartItem.product.name} not found` });
            }
            if (product.quantity < cartItem.quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
            }
        
            product.stock -= cartItem.quantity;
          
            await product.save();
            
        }
        res.redirect(`/order-placed/${order._id}`);
        
    } catch (error) {
        console.log("Order Placing Error:", error);
        res.status(500).json({ success: false, message: 'An error occurred while placing the order' });
    }
};

const showOrderPlaced = async (req,res)=>{
    try {
        const orderId =req.params.orderId;
        const order =await Order.findById(orderId)
        .populate('items.product')
        .populate('user','name email')
console.log("order :" ,order);

        if(!order){
            return res.status(404).render("error",{message:'Order not foud'});
        }
        res.render('orderPlaced',{order ,layout:false})
    } catch (error) {
        console.error("Error fetching Order" , error);
        res.status(500).render('error',{message:'An error occurred while fetching Order!!'})
    }
}

module.exports ={
    placeOrder,
    showOrderPlaced

}