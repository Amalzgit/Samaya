const Order = require('../../models/orderModel');
const Transaction = require('../../models/transactions');
const Category = require('../../models/catogaryModel');
const { jsPDF } = require("jspdf");
const getDashboardData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const endDateObj = endDate ? new Date(endDate) : new Date();
    const startDateObj = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days

    const query = {
      createdAt: { $gte: startDateObj, $lte: endDateObj },
      status: { $ne: 'Cancelled' }
    };

    // Total Revenue and Total Orders
    const totals = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    const totalData = totals.length > 0 ? totals[0] : { totalRevenue: 0, totalOrders: 0 };

    // Best Selling Product
    const bestSellingProducts = await Order.aggregate([
      { $match: query },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.totalPrice" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          name: "$productDetails.name",
          category: "$productDetails.category",
          totalSold: 1,
          revenue: 1
        }
      }
    ]);

    const bestSellingProduct = bestSellingProducts.length > 0 ? bestSellingProducts[0] : null;

    // Best Selling Category
    const bestSellingCategories = await Order.aggregate([
      { $match: query },
      { $unwind: "$items" },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.category",
          totalSold: { $sum: "$items.quantity" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 1 }
    ]);

    const bestSellingCategoryId = bestSellingCategories.length > 0 ? bestSellingCategories[0]._id : null;
    const bestSellingCategory = bestSellingCategoryId ? await Category.findById(bestSellingCategoryId) : null;

    // Top Ten Best Selling Products
    const topProducts = await Order.aggregate([
      { $match: query },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.totalPrice" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          name: "$productDetails.name",
          category: "$productDetails.category",
          totalSold: 1,
          revenue: 1
        }
      }
    ]);

    // Latest 10 Transactions
    const latestTransactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(10)  
      .populate('user', 'name email')
      .populate('order', 'orderNumber totalPrice');

    res.render('dashboard', {
      totalRevenue: totalData.totalRevenue,
      totalOrders: totalData.totalOrders,
      bestSellingProduct,
      bestSellingCategory,
      topProducts,
      latestTransactions
    });
  } catch (error) {
    console.error('Error generating dashboard data:', error);
    res.status(500).send('Error generating dashboard data');
  }
};

const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, timeFrame } = req.query;
    const endDateObj = endDate ? new Date(endDate) : new Date();
    const startDateObj = startDate ? new Date(startDate) : new Date();

    // Adjust the start and end date based on the time frame if necessary
    if (timeFrame === "daily") {
      startDateObj.setHours(0, 0, 0, 0);
      endDateObj.setHours(23, 59, 59, 999);
    } else if (timeFrame === "weekly") {
      startDateObj.setDate(startDateObj.getDate() - startDateObj.getDay()); // Start of the week
      endDateObj.setDate(endDateObj.getDate() - endDateObj.getDay() + 6); // End of the week
    } else if (timeFrame === "monthly") {
      startDateObj.setDate(1); // Start of the month
      endDateObj.setMonth(endDateObj.getMonth() + 1); // Move to the next month
      endDateObj.setDate(0); // End of the previous month
    }

    const query = {
      createdAt: { $gte: startDateObj, $lte: endDateObj },
      status: { $ne: "Cancelled" } // Exclude cancelled orders
    };

    const orders = await Order.find(query).populate("items.product");

    // Render sales report page with timeFrame included
    res.render("sales-report", {
      orders,
      startDate: startDateObj.toISOString().split("T")[0],
      endDate: endDateObj.toISOString().split("T")[0],
      timeFrame: timeFrame || '' // Ensure timeFrame is passed to the view
    });
  } catch (error) {
    console.error('Error fetching sales report:', error);
    res.status(500).send('Error fetching sales report');
  }
};

module.exports = {
  getSalesReport,
  getDashboardData
};
