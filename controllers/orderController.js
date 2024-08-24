const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const addressModel = require("../models/addressModel");
const Wallet = require("../models/walletModel");
const { Types } = require("mongoose");
const { createOrder } = require("../utils/razorpayUtil");
const { verifyPaymentSignature } = require("../utils/razorpayUtil");
const { storeTransaction } = require("../utils/transactionUtil");

const isValidId = (id) => Types.ObjectId.isValid(id);

const placeOrder = async (req, res) => {
  try {
    const { addressId, paymentMethod } = req.body;
    const userId = req.currentUser._id;

    const [user, cart, address] = await Promise.all([
      User.findById(userId),
      Cart.findOne({ user: userId }).populate("items.product"),
      addressModel.findById(addressId),
    ]);
    await User.findByIdAndUpdate(userId, {
      $addToSet: { usedCoupons: cart.appliedCoupon._id }
  });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ success: false, message: "Cart is empty" });
    if (!address)
      return res
        .status(400)
        .json({ success: false, message: "Invalid address" });

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
        type: address.type,
      },
      payment: {
        method: paymentMethod,
        status: "Pending",
      },
      items: [],
    });

    let totalPrice = 0;
    const productUpdates = cart.items.map(async (cartItem) => {
      const product = await Product.findById(cartItem.product._id);
      if (!product) {
        throw new Error(`Product ${cartItem.product.name} not found`);
      }
      if (product.quantity < cartItem.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      const orderItem = {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        totalPrice: product.price * cartItem.quantity,
      };
      order.items.push(orderItem);
      totalPrice += orderItem.totalPrice;
      product.stock -= cartItem.quantity;

      await product.save();
    });
    await Promise.all(productUpdates);
    order.totalPrice = totalPrice;
    // console.log(totalPrice,"=>Total Price");

    if (paymentMethod === "Cash on Delivery") {
      await Promise.all([
        order.save(),
        ...productUpdates,
        Cart.findOneAndUpdate({ user: userId }, { $set: { items: [],appliedCoupon:null } }),
        storeTransaction({
          userId: req.currentUser._id,
          type: "CREDIT",
          amount: totalPrice,
          description: `Payment for order ${order._id}`,
          orderId: order._id,
          paymentMethod: paymentMethod,
          transactionNumber:
            "TXN-" +
            Date.now() +
            Math.floor(Math.random() * 1000)
              .toString()
              .padStart(3, "0"),
        }),
      ]);
      // res.json({ success: true, message: 'Order placed successfully' });
      return res.redirect(`/order-placed/${order.id}`);
    }
    if (paymentMethod === "Wallet") {
      const wallet = await Wallet.findOne({ user: userId });
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      if (wallet.balance < totalPrice) {
        throw new Error("Insufficient wallet balance");
      }

      await Promise.all([
        Wallet.findOneAndUpdate(
          { user: userId },
          {
            $inc: { balance: -totalPrice },
            $push: {
              transactions: {
                amount: totalPrice,
                type: "debit",
                status: "completed",
                description: `Payment for order ${order._id}`,
                orderId: order._id,
              },
            },
          },
          { new: true }
        ),
        order.save(),
        Cart.findOneAndUpdate({ user: userId }, { $set: { items: [],appliedCoupon:null } }),
        storeTransaction({
          userId: req.currentUser._id,
          type: "CREDIT",
          amount: totalPrice,
          description: `Payment for order ${order._id}`,
          orderId: order._id,
          paymentMethod: paymentMethod,
          transactionNumber:
            "TXN-" +
            Date.now() +
            Math.floor(Math.random() * 1000)
              .toString()
              .padStart(3, "0"),
        }),
      ]);

      return res.redirect(`/order-placed/${order._id}`);
    }

    if (paymentMethod === "razorpay") {
      const razorpayOrder = await createOrder(
        totalPrice * 100,
        "INR",
        `order_${Date.now()}`
      );
      order.payment.razorpayID = razorpayOrder.id;
      await order.save();
     
      return res.json({
        success: true,
        order: order,
        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        },
      });
    }

    return res
      .status(400)
      .json({ success: false, message: "Invalid payment method" });
  } catch (error) {
    console.log("Order Placing Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while placing the order",
    });
  }
};
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const isVerified = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (isVerified) {
      const order = await Order.findOne({
        "payment.razorpayID": razorpay_order_id,
      });
      // console.log(order);

      if (order) {
        order.payment.status = "Completed";
        // order.payment.razorpayPaymentId = razorpay_payment_id;
        await Promise.all([
          order.save(),
          storeTransaction({
            userId: req.currentUser._id,
            type: "CREDIT",
            amount: totalPrice,
            description: `Payment for order ${order._id}`,
            orderId: order._id,
            paymentMethod: paymentMethod,
            transactionNumber:
              "TXN-" +
              Date.now() +
              Math.floor(Math.random() * 1000)
                .toString()
                .padStart(3, "0"),
          }),

          Cart.findOneAndUpdate({ user: order.user }, { $set: { items: [],appliedCoupon:null  } }),
        ]);

        return res.json({
          success: true,
          message: "Payment verified successfully",
          orderId: order.id,
        });
      }
    }

    console.log("Razorpay Verification Error");
    return res
      .status(400)
      .json({ success: false, message: "Invalid payment verification" });
  } catch (error) {
    console.log("Razorpay Verification Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while verifying the payment",
    });
  }
};
const showOrderPlaced = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId)
      .populate("items.product")
      .populate("user", "name email");
    // console.log(orderId,"=>order id");
    // console.log(order,"=>order");

    if (!order) {
      return res
        .status(404)
        .render("orderPlaced", { message: "Order not found", layout: false });
    }

    res.render("orderPlaced", { order, layout: false });
  } catch (error) {
    console.error("Error fetching Order:", error);
    res.status(500).render("error", {
      message: "An error occurred while fetching the order.",
      layout: false,
    });
  }
};
const showOrderdetails = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId)
      .populate({
        path: "items.product",
        populate: {
          path: "brand",
          select: "name",
        },
      })
      .populate("user", "name email");

    if (!order) {
      return res.status(404).render("error", { message: "Order not found" });
    }
    res.render("order_details", { order, layout: false });
  } catch (error) {
    console.error("Error fetching Order", error);
    res
      .status(500)
      .render("error", { message: "An error occurred while fetching Order!!" });
  }
};
const cancelOrderItem = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;

    // console.log("orderid:",orderId ,"itemid",itemId);

    if (!isValidId(orderId) || !isValidId(itemId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order or item ID" });
    }

    // Find and update the order
    const order = await Order.findOneAndUpdate(
      { _id: orderId, "items._id": itemId, "items.status": "Active" },
      {
        $set: {
          "items.$.status": "Cancelled",
          "items.$.cancelledAt": new Date(),
        },
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order or item not found, or item already cancelled",
      });
    }

    const item = order.items.id(itemId);

    if (
      order.payment.method === "Wallet" ||
      order.payment.method === "razorpay"
    ) {
      // Calculate refund amount
      const refundAmount = item.price * item.quantity;

      // Update the wallet balance and record the transaction
      await Wallet.findOneAndUpdate(
        { user: order.user },
        {
          $inc: { balance: refundAmount },
          $push: {
            transactions: {
              amount: refundAmount,
              type: "credit",
              status: "completed",
              description: `Refund for cancelled item ${item.name}`, // Ensure item name is available
              orderId: order._id,
            },
          },
        },
        { new: true }
      );
    }

    // Update the product stock and order status
    const functions = [
      Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      }),
      order.updateOrderStatus(),
      order.save(),
      storeTransaction({
        userId: req.currentUser._id,
        type: "DEBIT",
        amount: item.price * item.quantity
        ,
        description: `Payment for order ${order._id}`,
        orderId: order._id,
        paymentMethod: paymentMethod,
        transactionNumber:
          "TXN-" +
          Date.now() +
          Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0"),
      })
    ];

    await Promise.all(functions);

    res.json({
      success: true,
      message: "Item cancelled and stock restocked successfully",
    });
  } catch (error) {
    console.error("Error cancelling order item:", error);
    res.status(500).json({ success: false, message: "Error cancelling item" });
  }
};

const returnOrderItem = async (req, res) => {
  const { orderId, itemId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in order" });
    }

    if (item.status !== "Active" || order.status !== "Delivered") {
      return res
        .status(400)
        .json({ message: "This item is not eligible for return" });
    }

    item.status = "Return Requested";
    await order.save();

    res.json({ message: "Return request submitted successfully" });
  } catch (error) {
    console.error("Error requesting return:", error);
    res
      .status(500)
      .json({ message: "An error occurred while requesting the return." });
  }
};
module.exports = {
  placeOrder,
  verifyRazorpayPayment,
  showOrderPlaced,
  showOrderdetails,
  cancelOrderItem,
  returnOrderItem,
};
