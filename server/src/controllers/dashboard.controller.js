const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

class DashboardController {
  static async getManagerAnalytics(req, res, next) {
    try {
      const [totalOrders, lowStockItems, totalUsers] = await Promise.all([
        Order.countDocuments(),
        Inventory.countDocuments({ $expr: { $lte: ['$availableStock', '$lowStockThreshold'] } }),
        User.countDocuments(),
      ]);

      const salesAgg = await Order.aggregate([
        { $match: { status: { $in: ['COMPLETED', 'DELIVERED'] } } },
        { $group: { _id: null, totalRevenue: { $sum: '$pricing.grandTotal' } } },
      ]);

      return ApiResponse.send(
        res,
        200,
        {
          totalOrders,
          totalRevenue: salesAgg[0]?.totalRevenue || 0,
          lowStockCount: lowStockItems,
          totalCustomers: totalUsers,
        },
        'Manager metrics retrieved'
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DashboardController;