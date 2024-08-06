const Order =require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User =require('../models/userModel');

const placeOrder = async (req, res) => {
    try {
        const { addressId, paymentMethod } = req.body;
        const userId = req.session.user_id;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        const address = user.addresses.id(addressId);
        console.log("address :",address);
        
        if (!address) {
            return res.status(400).json({ success: false, message: 'Invalid address' });
        }

        const order = new Order({
            user: userId,
            address: address,
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

        // Clear the cart
        await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

        res.status(200).json({ success: true, message: 'Order placed successfully', orderId: order._id });
        
    } catch (error) {
        console.log("Order Placing Error:", error);
        res.status(500).json({ success: false, message: 'An error occurred while placing the order' });
    }
};

module.exports ={
    placeOrder
}