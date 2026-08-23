const Order = require('../models/Order');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const ApiError = require('../utils/apiError');

class BuyAgainService {
  static async prepareBuyAgainItems(orderId, userId) {
    const order = await Order.findById(orderId).lean();
    if (!order) throw new ApiError(404, 'Order not found', 'ORDER_NOT_FOUND');

    if (order.user.toString() !== userId.toString()) {
      throw new ApiError(403, 'Forbidden access to this order history', 'FORBIDDEN');
    }

    const originalProductIds = order.items.map((i) => i.product);

    const activeProducts = await Product.find({
      _id: { $in: originalProductIds },
      isActive: true,
    }).populate('category').lean();

    const activeMap = new Map(activeProducts.map((p) => [p._id.toString(), p]));

    const inventories = await Inventory.find({ product: { $in: originalProductIds } }).lean();
    const inventoryMap = new Map(inventories.map((inv) => [inv.product.toString(), inv.availableStock]));

    const availableItems = [];
    const unavailableItems = [];

    for (const item of order.items) {
      const pId = item.product.toString();
      const currentProduct = activeMap.get(pId);
      const stock = inventoryMap.get(pId) || 0;

      if (!currentProduct || stock <= 0) {
        unavailableItems.push({
          productId: pId,
          name: item.name,
          sku: item.sku,
          reason: !currentProduct ? 'Discontinued or Inactive' : 'Out of Stock',
        });
      } else {
        const livePrice =
          currentProduct.discountPrice !== null && currentProduct.discountPrice < currentProduct.regularPrice
            ? currentProduct.discountPrice
            : currentProduct.regularPrice;

        const maxAddableQty = Math.min(item.quantity, stock);

        availableItems.push({
          productId: currentProduct._id,
          name: currentProduct.name,
          sku: currentProduct.sku,
          unit: currentProduct.unit,
          images: currentProduct.images,
          currentPrice: livePrice,
          previousPrice: item.unitPrice,
          priceChanged: livePrice !== item.unitPrice,
          requestedQuantity: item.quantity,
          assignedQuantity: maxAddableQty,
          availableStock: stock,
        });
      }
    }

    return {
      orderId,
      availableItems,
      unavailableItems,
      readyToReorderCount: availableItems.length,
      outOfStockCount: unavailableItems.length,
    };
  }
}

module.exports = BuyAgainService;