const Order = require('../../models/orderModel');
const Transaction = require('../../models/transactions');
const Category = require('../../models/catogaryModel');
const getDashboardData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const endDateObj = endDate ? new Date(endDate) : new Date();
    const startDateObj = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return res.status(400).send('Invalid date format');
    }

    const query = {
      createdAt: { $gte: startDateObj, $lte: endDateObj },
      "items.status": { $ne: 'Cancelled' }
    };

    // Total Revenue and Total Orders
    const totals = await Order.aggregate([
      { $match: query },
      {
        $unwind: "$items"
      },
      {
        $match: {
          "items.status": { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$items.totalPrice" },
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
        $match: {
          "items.status": { $ne: 'Cancelled' }
        }
      },
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
        $match: {
          "items.status": { $ne: 'Cancelled' }
        }
      },
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
        $match: {
          "items.status": { $ne: 'Cancelled' }
        }
      },
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

    // Daily Revenue Data
    const dailyRevenue = await Order.aggregate([
      { $match: query },
      { $unwind: "$items" },
      {
        $match: {
          "items.status": { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$items.totalPrice" },
          orders: { $sum: 1 },
          cancelled: { $sum: { $cond: [{ $eq: ["$items.status", "Cancelled"] }, 1, 0] } },
          delivered: { $sum: { $cond: [{ $eq: ["$items.status", "Delivered"] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dailyData = dailyRevenue.map(day => ({
      date: day._id,
      revenue: day.revenue,
      orders: day.orders,
      cancelledRate: (day.cancelled / day.orders) * 100 || 0,
      deliveredRate: (day.delivered / day.orders) * 100 || 0
    }));
    const chartData = {
      labels: dailyData.map(day => day.date),
      datasets: [
        {
          label: 'Revenue',
          data: dailyData.map(day => day.revenue),
          borderColor: 'rgba(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192)',
          borderWidth: 1
        },
        // {
        //   label: 'Cancelled Orders Rate (%)',
        //   data: dailyData.map(day => day.cancelledRate),
        //   borderColor: 'rgba(255, 99, 132 )',
        //   backgroundColor: 'rgba(255, 99, 132 )',
        //   borderWidth: 1
        // },
        // {
        //   label: 'Delivered Orders Rate (%)',
        //   data: dailyData.map(day => day.deliveredRate),
        //   borderColor: 'rgba(54, 162, 235)',
        //   backgroundColor: 'rgba(54, 162, 235)',
        //   borderWidth: 1
        // }
      ]
    };

    res.render('dashboard', {
      totalRevenue: totalData.totalRevenue,
      totalOrders: totalData.totalOrders,
      bestSellingProduct,
      bestSellingCategory,
      topProducts,
      latestTransactions,
      chartData: JSON.stringify(chartData)
    });
  } catch (error) {
    console.error('Error generating dashboard data:', error);
    res.status(500).send('Error generating dashboard data');
  }
};


const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, timeFrame } = req.query;

    let endDateObj = endDate ? new Date(endDate) : new Date();
    let startDateObj = startDate ? new Date(startDate) : new Date();

    endDateObj.setHours(23, 59, 59, 999);
    startDateObj.setHours(0, 0, 0, 0);

    switch (timeFrame) {
      case "today":
        startDateObj = new Date();
        startDateObj.setHours(0, 0, 0, 0);
        endDateObj = new Date();
        endDateObj.setHours(23, 59, 59, 999);
        break;
      case "weekly":
        startDateObj = new Date(endDateObj);
        startDateObj.setDate(endDateObj.getDate() - endDateObj.getDay());
        startDateObj.setHours(0, 0, 0, 0);
        break;
      case "monthly":
        startDateObj = new Date(endDateObj.getFullYear(), endDateObj.getMonth(), 1);
        break;
      case "yearly":
        startDateObj = new Date(endDateObj.getFullYear(), 0, 1);
        break;
      default:
        if (!startDate) {
          startDateObj = new Date(endDateObj);
          startDateObj.setDate(endDateObj.getDate() - 30);
        }
        break;
    }
    
    console.log("Adjusted start date:", startDateObj);
    console.log("Adjusted end date:", endDateObj);

    const query = {
      createdAt: { $gte: startDateObj, $lte: endDateObj },
      status: { $ne: "Cancelled" } 
    };

    const orders = await Order.find(query).populate("items.product");
    const totalOrderCount = orders.length;
    const totalBillAmount = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    res.render("sales-report", {
      totalOrderCount,
      totalBillAmount,
      orders,
      startDate: startDateObj.toISOString().split("T")[0],
      endDate: endDateObj.toISOString().split("T")[0],
      timeFrame: timeFrame || '' 
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
