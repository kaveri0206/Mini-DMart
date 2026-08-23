const { Return, Exchange } = require('../models/Return');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const InventoryService = require('./inventory.service');
const AuditService = require('./audit.service');
const ApiError = require('../utils/apiError');
const { withTransaction } = require('../utils/dbTransaction');
const { RETURN_WINDOW_DAYS, ORDER_STATUS } = require('../config/constants');

class ReturnExchangeService {
  static async requestExchange(user, payload, reqInfo) {
    const { orderId, originalProductId, originalQuantity, replacementProductId, replacementQuantity, reason } = payload;

    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, 'Order not found', 'ORDER_NOT_FOUND');

    if (order.user.toString() !== user._id.toString()) {
      throw new ApiError(403, 'Forbidden access to this order', 'FORBIDDEN');
    }

    if (order.status !== ORDER_STATUS.DELIVERED && order.status !== ORDER_STATUS.COMPLETED) {
      throw new ApiError(400, 'Exchanges are only valid on delivered or completed orders', 'INVALID_STATUS');
    }

    const deliveredDate = order.updatedAt;
    const daysSinceDelivery = (Date.now() - new Date(deliveredDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
      throw new ApiError(400, `Exchange window (${RETURN_WINDOW_DAYS} days) has expired`, 'WINDOW_EXPIRED');
    }

    const orderItem = order.items.find((i) => i.product.toString() === originalProductId);
    if (!orderItem || originalQuantity > orderItem.quantity) {
      throw new ApiError(400, 'Exchange quantity exceeds purchased quantity', 'INVALID_QUANTITY');
    }

    const replacementInv = await Inventory.findOne({ product: replacementProductId });
    if (!replacementInv || replacementInv.availableStock < replacementQuantity) {
      throw new ApiError(400, 'Replacement product does not have adequate stock', 'OUT_OF_STOCK');
    }

    const exchange = new Exchange({
      order: order._id,
      user: user._id,
      originalItem: { product: originalProductId, quantity: originalQuantity },
      replacementProduct: replacementProductId,
      replacementQuantity,
      reason,
      status: 'EXCHANGE_REQUESTED',
    });

    await exchange.save();

    await AuditService.log({
      actor: { id: user._id, email: user.email, role: user.role },
      action: 'EXCHANGE_REQUESTED',
      entity: 'Exchange',
      entityId: exchange._id.toString(),
      metadata: { orderId, originalProductId, replacementProductId },
      ...reqInfo,
    });

    return exchange;
  }

  static async processExchangeDecision(exchangeId, decision, staffUser, notes, reqInfo) {
    return await withTransaction(async (session) => {
      const opts = session ? { session } : {};
      const exchangeQuery = Exchange.findById(exchangeId);
      if (session) exchangeQuery.session(session);
      const exchange = await exchangeQuery;

      if (!exchange) throw new ApiError(404, 'Exchange request not found', 'NOT_FOUND');
      if (exchange.status !== 'EXCHANGE_REQUESTED') {
        throw new ApiError(400, 'Exchange request has already been processed', 'ALREADY_PROCESSED');
      }

      if (decision === 'APPROVE') {
        await InventoryService.reserveStock(
          [{ product: exchange.replacementProduct, quantity: exchange.replacementQuantity }],
          session
        );
        await InventoryService.restockReturnedItems(
          [{ product: exchange.originalItem.product, quantity: exchange.originalItem.quantity }],
          session
        );
        exchange.status = 'EXCHANGE_APPROVED';
      } else if (decision === 'REJECT') {
        exchange.status = 'EXCHANGE_REJECTED';
      } else {
        throw new ApiError(400, 'Invalid decision. Must be APPROVE or REJECT', 'INVALID_DECISION');
      }

      exchange.processedBy = staffUser._id;
      exchange.resolutionNotes = notes;
      await exchange.save(opts);

      await AuditService.log({
        actor: { id: staffUser._id, email: staffUser.email, role: staffUser.role },
        action: `EXCHANGE_${exchange.status}`,
        entity: 'Exchange',
        entityId: exchange._id.toString(),
        metadata: { decision, notes },
        ...reqInfo,
      });

      return exchange;
    });
  }
}

module.exports = ReturnExchangeService;