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
const { formatCurrency } = require("../utils/currencyFormatter");
const { calculateOfferDiscount, calculatefinalPrice } = require("../utils/offerCalculator");

const isValidId = (id) => Types.ObjectId.isValid(id);

const placeOrder = async (req, res) => {
  try {
    const { addressId, paymentMethod } = req.body;
    const userId = req.currentUser._id;
    const cartData = await Cart.findOne({ user: userId }).populate("items.product");
    // console.log(cartData, "====>cart data ");

    const items = await Promise.all(
      cartData.items.map(async (item) => {
        const discount = await calculateOfferDiscount(item.product._id);
        if (discount) {
          const offerPrice = calculatefinalPrice(item.product.price, discount);
          return {
            ...item.toObject(),
            product: {
              ...item.product.toObject(),
              originalPrice: item.product.price,
              price: offerPrice,
              hasOffer: true,
              discountPercentage: discount,
            },
          };
        }
        return {
          ...item.toObject(),
          product: {
            ...item.product.toObject(),
            hasOffer: false,
          },
        };
      })
    );

    // Calculate the total price before discount
    let totalPrice = items.reduce((accumulator, item) => {
      return accumulator + item.product.price * item.quantity;
    }, 0);

    // Calculate the discount amount and discounted total
    const discountAmount = (totalPrice * cartData.discount) / 100;
    const discountedTotal = totalPrice - discountAmount;

    const formattedTotalPrice = formatCurrency(totalPrice);
    const formattedDiscountedTotal = formatCurrency(discountedTotal);
    const formattedDiscountAmount = formatCurrency(discountAmount);

    const [user, address] = await Promise.all([
      User.findById(userId),
      addressModel.findById(addressId),
    ]);

    if (!user || !address) {
      return res.status(404).json({ 
        success: false, 
        message: user ? "Invalid address" : "User not found" 
      });
    }

    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { usedCoupons: cartData.appliedCoupon } },
      { new: true }
    );

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
      items: items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        price: parseFloat(item.product.price),
        quantity: parseInt(item.quantity),
        totalPrice: item.product.price * item.quantity,
      })),
      totalPrice: parseFloat(discountedTotal), // Set to discountedTotal
      discount: parseFloat(discountAmount),
    });

    const productUpdates = order.items.map(async (orderItem) => {
      const product = await Product.findById(orderItem.product);
      if (!product) throw new Error(`Product ${orderItem.name} not found`);
      if (product.stock < orderItem.quantity)
        throw new Error(`Insufficient stock for ${product.name}`);
      product.stock -= orderItem.quantity;
      return product.save();
    });

    await Promise.all(productUpdates);

    let responseData = { 
      success: true, 
      order: order,
      totalPrice: formattedTotalPrice,
      discountedTotal: formattedDiscountedTotal,
      discountAmount: formattedDiscountAmount,
    };

    if (paymentMethod === "Cash on Delivery") {
      const result = await Promise.all([
        order.save(),
        Cart.findOneAndUpdate(
          { user: userId },
          { $set: { items: [], appliedCoupon: null, discount: 0 } }
        ),
        storeTransaction({
          userId: userId,
          type: "CREDIT",
          amount: order.totalPrice,
          description: `Payment for order ${order._id}`,
          orderId: order._id,
          paymentMethod: paymentMethod,
          transactionNumber: `TXN-${Date.now()}${Math.floor(
            Math.random() * 1000
          )
            .toString()
            .padStart(3, "0")}`,
        }),
      ]);
      responseData.order = result[0];
    } else if (paymentMethod === "Wallet") {
      const wallet = await Wallet.findOne({ user: userId });
      if (!wallet) throw new Error("Wallet not found");
      if (wallet.balance < discountedTotal)
        throw new Error("Insufficient wallet balance");

      const result = await Promise.all([
        Wallet.findOneAndUpdate(
          { user: userId },
          {
            $inc: { balance: -discountedTotal },
            $push: {
              transactions: {
                amount: discountedTotal,
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
        Cart.findOneAndUpdate(
          { user: userId },
          { $set: { items: [], appliedCoupon: null, discount: 0 } }
        ),
        storeTransaction({
          userId: userId,
          type: "CREDIT",
          amount: order.totalPrice,
          description: `Payment for order ${order._id}`,
          orderId: order._id,
          paymentMethod: paymentMethod,
          transactionNumber: `TXN-${Date.now()}${Math.floor(
            Math.random() * 1000
          )
            .toString()
            .padStart(3, "0")}`,
        }),
      ]);
      responseData.order = result[1];
      
    } else if (paymentMethod === "razorpay") {
      const razorpayOrder = await createOrder(
        discountedTotal * 100,
        "INR",
        `order_${Date.now()}`
      );
      order.payment.razorpayID = razorpayOrder.id;
      await order.save();
      responseData.razorpayOrder = {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      };
    } else {
      return res.status(400).json({ success: false, message: "Invalid payment method" });
    }

    res.status(200).json(responseData);
  } catch (error) {
    console.log("Order Placing Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while placing the order",
    });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const isVerified = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (isVerified) {
      const order = await Order.findOne({
        "payment.razorpayID": razorpay_order_id,
      });

      if (order) {
        order.payment.status = "Completed";
        order.payment.razorpayPaymentId = razorpay_payment_id;

        await Promise.all([
          order.save(),
          storeTransaction({
            userId: req.currentUser._id,
            type: "CREDIT",
            amount: order.totalPrice, 
            description: `Payment for order ${order._id}`,
            orderId: order._id,
            paymentMethod: order.payment.method,
            transactionNumber:
              "TXN-" +
              Date.now() +
              Math.floor(Math.random() * 1000)
                .toString()
                .padStart(3, "0"),
          }),

          Cart.findOneAndUpdate(
            { user: order.user },
            { $set: { items: [], appliedCoupon: null, discount: 0 } }
          ),
        ]);

        return res.json({
          success: true,
          message: "Payment verified successfully",
          orderId: order._id,
        });
      } else {
        console.log("Order not found");
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
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
        amount:item.price * item.quantity,
        description: `Payment for order ${order._id}`,
        orderId: order._id,
        paymentMethod: order.payment.method,
        transactionNumber:
          "TXN-" +
          Date.now() +
          Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0"),
      }),
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


const failureManage =async(req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send('Order not found');
    }

    order.payment.status  = 'Failed';
    order.status = 'Pending';
    await order.save();

    // res.render('payment-failure', { order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).send('Internal server error');
  }
};

const retryPayment = async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const order = await Order.findById(orderId);

    if (!order || order.payment.method !== 'razorpay') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order or payment method.',
      });
    }

    // If the payment status is 'Completed', do not allow retry
    if (order.payment.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed. Retry is not allowed.',
      });
    }

   

    // Create a new Razorpay order
    const razorpayOrder = await createOrder(order.totalPrice * 100, 'INR', `order_${Date.now()}`);

    order.payment.razorpayID = razorpayOrder.id;
    await order.save();

    res.json({
      success: true,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    });
  } catch (error) {
    console.error('Error retrying payment:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.',
    });
  }
};




module.exports = {
  placeOrder,
  verifyRazorpayPayment,
  showOrderPlaced,
  showOrderdetails,
  cancelOrderItem,
  returnOrderItem,
  failureManage,
  retryPayment
};
