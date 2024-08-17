const Order =require('../models/orderModel');
const Cart = require('../models/cartModel');
const User =require('../models/userModel');
const Product = require('../models/productModel');
const addressModel = require('../models/addressModel');
const { Types } = require('mongoose');
const {createOrder} =require('../utils/razorpayUtil');
const { verifyPaymentSignature } = require('../utils/razorpayUtil');

const isValidId = (id) => Types.ObjectId.isValid(id);

const placeOrder = async (req, res) => {
  

    try {
        const { addressId, paymentMethod } = req.body;
        const userId = req.currentUser._id;
  
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
  
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
          return res.status(400).json({ success: false, message: 'Cart is empty' });
        }
  
        const address = await addressModel.findById(addressId);
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
  
          product.quantity -= cartItem.quantity;
          await product.save();
        }
  
        order.totalPrice = totalPrice;
        if(paymentMethod ==='razorpay'){
          const razorpayOrder =await createOrder(
            totalPrice *100,
            'INR',
            `order_${Date.now()}`
          );
          order.payment.razorpayOrder = razorpayOrder.id;
          await order.save();

          return res.json({
            success:true,
            order:order,
            razorpayOrder :{
              id: razorpayOrder.id,
              amount :razorpayOrder.amount,
              currency :razorpayOrder.currency
            }
          });
        }else{
        await order.save();
  
        await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
  
        for (const cartItem of cart.items) {
          const product = await Product.findById(cartItem.product._id);
          if (product) {
            product.stock -= cartItem.quantity;
            await product.save();
          }
        }
  
        res.redirect(`/order-placed/${order._id}`);
      }
      } catch (error) {
        console.log("Order Placing Error:", error);
        res.status(500).json({ success: false, message: 'An error occurred while placing the order' });
      }
};
const verifyRazorpayPayment = async (req,res)=>{
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)){
      const order = await Order.findOne({ 'payment.razorpayOrderId': razorpay_order_id });
      if (order) {
        order.payment.status = 'Paid';
        order.payment.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        // Clear the cart
        await Cart.findOneAndUpdate({ user: order.user }, { $set: { items: [] } });

        return res.json({ success: true, message: 'Payment verified successfully' });
      }
    }

    return res.status(400).json({ success: false, message: 'Invalid payment verification' });
  } catch (error) {
    console.log("Razorpay Verification Error:", error);
    res.status(500).json({ success: false, message: 'An error occurred while verifying the payment' });
  }
}

const showOrderPlaced = async (req,res)=>{
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId)
          .populate('items.product')
          .populate('user', 'name email');
  
        if (!order) {
          return res.status(404).render("error", { message: 'Order not found' });
        }
        res.render('orderPlaced', { order, layout: false });
      } catch (error) {
        console.error("Error fetching Order", error);
        res.status(500).render('error', { message: 'An error occurred while fetching Order!!' });
      }
}
const showOrderdetails =async(req,res)=>{
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId)
        .populate({
          path: 'items.product',
          populate: {
            path: 'brand', 
            select: 'name' 
          }
        })
        .populate('user', 'name email');
  
        if (!order) {
          return res.status(404).render("error", { message: 'Order not found' });
        }
        res.render('order_details', { order, layout: false });
      } catch (error) {
        console.error("Error fetching Order", error);
        res.status(500).render('error', { message: 'An error occurred while fetching Order!!' });
      }
};

const cancelOrderItem = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;

    if (!isValidId(orderId) || !isValidId(itemId)) {
      return res.status(400).json({ success: false, message: 'Invalid order or item ID' });
    }

    const result = await Order.findOneAndUpdate(
      { _id: orderId, 'items._id': itemId, 'items.status': 'Active' },
      {
        $set: {
          'items.$.status': 'Cancelled',
          'items.$.cancelledAt': new Date()
        }
      },
      { new: true } 
    );

    if (!result) {
      return res.status(404).json({ success: false, message: 'Order or item not found, or item already cancelled' });
    }

    const item = result.items.id(itemId);
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: item.quantity } }
    );

    await result.updateOrderStatus();
    await result.save();

    res.json({ success: true, message: 'Item cancelled and stock restocked successfully' });
  } catch (error) {
    console.error('Error cancelling order item:', error);
    res.status(500).json({ success: false, message: 'Error cancelling item' });
  }
}

const returnOrderItem = async (req, res) => {
  const { orderId, itemId } = req.params;

  try {
      const order = await Order.findById(orderId);
      if (!order) {
          return res.status(404).json({ message: 'Order not found' });
      }

      const item = order.items.id(itemId);
      if (!item) {
          return res.status(404).json({ message: 'Item not found in order' });
      }

      if (item.status !== 'Active' || order.status !== 'Delivered') {
          return res.status(400).json({ message: 'This item is not eligible for return' });
      }

      item.status = 'Return Requested';
      await order.save();

      res.json({ message: 'Return request submitted successfully' });
  } catch (error) {
      console.error('Error requesting return:', error);
      res.status(500).json({ message: 'An error occurred while requesting the return.' });
  }
};
module.exports ={
    placeOrder,
    verifyRazorpayPayment ,
    showOrderPlaced,
    showOrderdetails,
    cancelOrderItem,
    returnOrderItem

}