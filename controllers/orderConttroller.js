const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');

exports.createOrder = async (req, res) => {
    const { address } = req.body;

    try {
        // Fetch the cart for the user
        const cart = await Cart.findOne({ user: req.session.user_id }).populate('items.product');
        

        // Create order items array from cart items
        const orderItems = cart.items.map(item => ({
            name: item.product.name,
            price: item.price,
            quantity: item.quantity
        }));

        // Create the order
        const order = new Order({
            user: req.session.user_id,
            items: orderItems,
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
                type: address.type,
                
            }
        });

        // Save the order
        await order.save();

        // Clear the cart
        await Cart.deleteOne({ user: req.user.id });

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: 'Unable to create order' });
    }
};
