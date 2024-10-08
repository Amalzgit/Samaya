const Order = require("../../models/orderModel");
const Product = require("../../models/productModel");
const Wallet = require("../../models/walletModel");
const { storeTransaction } = require("../../utils/transactionUtil");

// const getOrderList = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = 5;
//     const skip = (page - 1) * limit;

//     const totalOrders = await Order.countDocuments();
//     const totalPages = Math.ceil(totalOrders / limit);

//     // Ensure page is within valid range
//     if (page < 1 || page > totalPages) {
//       return res.status(400).send("Invalid page number");
//     }

//     const orders = await Order.find()
//       .populate("user")
//       .skip(skip)
//       .limit(limit)
//       .lean()
//       .sort({ createdAt: -1 });

//     const baseUrl = '/admin/orderList';
//     const pagination = {
//       totalPages,
//       currentPage: page,
//       hasPrevPage: page > 1,
//       hasNextPage: page < totalPages,
//       prevPageUrl: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
//       nextPageUrl: page < totalPages ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
//       pageUrls: []
//     };

//     const maxPagesToShow = 5;
//     let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
//     let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

//     startPage = Math.max(1, endPage - maxPagesToShow + 1);

//     for (let i = startPage; i <= endPage; i++) {
//       pagination.pageUrls.push(`${baseUrl}?page=${i}&limit=${limit}`);
//     }

//     return res.render("orderList", { orders, pagination,totalOrders });
//   } catch (error) {
//     console.error("Order list view error:", error);
//     return res.status(500).send("Internal Server Error");
//   }
// };
const getOrderList = async (req, res) => {
  const orders = await Order.find().populate("user");
  try {
    const totalOrders = await Order.countDocuments();
    
    return res.render("orderList", { orders ,totalOrders});
  } catch (error) {
    console.error("order list view error:", error);
  }
};

const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (status === "Cancelled" || status === "Returned") {
      for (const item of order.items) {
        const product = await Product.findById(item.product);

        if (!product) {
          console.error(`Product with ID ${item.product} not found.`);
          continue;
        }

        product.stock += item.quantity;
        await product.save();
      }
    }

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated successfully!" });
  } catch (error) {
    console.error("Error updating order status:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the order status." });
  }
};

const showOrderdetails = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId)
      .populate("items.product")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).render("error", { message: "Order not foud" });
    }
    res.render("admin_order_details", { order});
  } catch (error) {
    console.error("Error fetching Order", error);
    res
      .status(500)
      .render("error", { message: "An error occurred while fetching Order!!" });
  }
};


const handleReturnRequest = async (req, res) => {
  const { orderId, itemId } = req.params;
  const { action } = req.body;

  try {
    const order = await Order.findOne({
      _id: orderId,
      "items._id": itemId,
      "items.status": "Return Requested",
    }).populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in order" });
    }

    if (item.status !== "Return Requested") {
      return res.status(400).json({ message: "This item does not have a pending return request" });
    }

    if (action === "accept") {
      await handleAcceptReturn(order, item);
    } else if (action === "reject") {
      item.status = "Return Rejected";
    } else {
      return res.status(400).json({ message: "Invalid action specified" });
    }

    await order.save();
    res.json({
      message: `Return request ${action}ed successfully`,
      orderStatus: order.status,
    });
  } catch (error) {
    console.error("Error handling return request:", error);
    res.status(500).json({
      message: "An error occurred while processing the return request.",
    });
  }
};

const handleAcceptReturn = async (order, item) => {
  const discountPerItem = (item.price * item.quantity / order.totalPrice) * order.discount || 0;
      const refundAmount = (item.price * item.quantity)-discountPerItem;
  item.status = "Return Accepted";

  const [product, wallet] = await Promise.all([
    Product.findByIdAndUpdate(
      item.product._id,
      { $inc: { stock: item.quantity } },
      { new: true }
    ),
    Wallet.findOne({ user: order.user._id }),
  ]);

  if (!wallet) {
    await Wallet.create({
      user: order.user._id,
      balance: refundAmount,
      transactions: [
        {
          amount: refundAmount,
          type: "credit",
          status: "completed",
          orderId: order._id,
          description: `Refund for returned item in order ${order._id}`,
        },
      ],
    });
  } else {
    wallet.balance += refundAmount;
    wallet.transactions.push({
      amount: refundAmount,
      type: "credit",
      status: "completed",
      orderId: order._id,
      description: `Refund for returned item in order ${order._id}`,
    });
    await Promise.all([ 
      wallet.save(),
      storeTransaction({
        userId: order.user,
        type: "DEBIT",
        amount: refundAmount,
        description: `Payment for order ${order._id}`,
        orderId: order._id,
        paymentMethod:order.payment.method,
        transactionNumber:
          "TXN-" +
          Date.now() +
          Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0"),
      })
    ])
  }
};


module.exports = {
  getOrderList,
  updateOrderStatus,
  showOrderdetails,
  handleReturnRequest,
};
