const Inventory = require('../models/Inventory');
const ApiError = require('../utils/apiError');

class InventoryService {
  static async reserveStock(items, session = null) {
    const opts = session ? { session } : {};
    const reservedItems = [];

    try {
      for (const item of items) {
        const inv = await Inventory.findOneAndUpdate(
          { product: item.product, availableStock: { $gte: item.quantity } },
          { $inc: { availableStock: -item.quantity, reservedStock: item.quantity } },
          { ...opts, new: true }
        );

        if (!inv) {
          throw new ApiError(400, `Insufficient stock for product ID: ${item.product}`, 'INSUFFICIENT_STOCK');
        }
        reservedItems.push(item);
      }
    } catch (error) {
      if (!session && reservedItems.length > 0) {
        for (const item of reservedItems) {
          await Inventory.findOneAndUpdate(
            { product: item.product },
            { $inc: { availableStock: item.quantity, reservedStock: -item.quantity } }
          );
        }
      }
      throw error;
    }
  }

  static async commitReservation(items, session = null) {
    const opts = session ? { session } : {};
    for (const item of items) {
      await Inventory.findOneAndUpdate(
        { product: item.product, reservedStock: { $gte: item.quantity } },
        { $inc: { reservedStock: -item.quantity } },
        opts
      );
    }
  }

  static async restoreStockForCancellation(order, session = null) {
    const opts = session ? { session } : {};
    const { status, items } = order;

    const unfulfilledStatuses = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'];

    if (unfulfilledStatuses.includes(status)) {
      for (const item of items) {
        await Inventory.findOneAndUpdate(
          { product: item.product },
          { $inc: { availableStock: item.quantity, reservedStock: -item.quantity } },
          opts
        );
      }
    } else if (status === 'DELIVERED' || status === 'COMPLETED') {
      for (const item of items) {
        await Inventory.findOneAndUpdate(
          { product: item.product },
          { $inc: { availableStock: item.quantity } },
          opts
        );
      }
    }
  }

  static async restockReturnedItems(items, session = null) {
    const opts = session ? { session } : {};
    for (const item of items) {
      await Inventory.findOneAndUpdate(
        { product: item.product },
        { $inc: { availableStock: item.quantity } },
        opts
      );
    }
  }
}

module.exports = InventoryService;