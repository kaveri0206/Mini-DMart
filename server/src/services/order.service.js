const Order = require('../models/Order');
const Product = require('../models/Product');
const PickupSlot = require('../models/PickupSlot');
const DeliveryZone = require('../models/DeliveryZone');
const InventoryService = require('./inventory.service');
const AuditService = require('./audit.service');
const ApiError = require('../utils/apiError');
const { withTransaction } = require('../utils/dbTransaction');
const { ORDER_STATUS, VALID_TRANSITIONS, FULFILLMENT_TYPES, TAX_RATE } = require('../config/constants');

class OrderService {
  static async createOrder(user, orderPayload, reqInfo) {
    return await withTransaction(async (session) => {
      const { fulfillmentType, items, deliveryAddress, pickupSlotId } = orderPayload;

      if (!items || items.length === 0) {
        throw new ApiError(400, 'Order must contain at least one item', 'EMPTY_ORDER');
      }

      const productIds = items.map((i) => i.productId);
      const query = Product.find({ _id: { $in: productIds }, isActive: true });
      if (session) query.session(session);
      const dbProducts = await query;

      if (dbProducts.length !== items.length) {
        throw new ApiError(400, 'One or more products are inactive or invalid', 'INVALID_PRODUCTS');
      }

      const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));
      let itemsSubtotal = 0;
      const orderItems = [];

      for (const item of items) {
        const prod = productMap.get(item.productId.toString());
        const effectivePrice = prod.discountPrice !== null && prod.discountPrice < prod.regularPrice
          ? prod.discountPrice
          : prod.regularPrice;

        const lineTotal = effectivePrice * item.quantity;
        itemsSubtotal += lineTotal;

        orderItems.push({
          product: prod._id,
          name: prod.name,
          sku: prod.sku,
          unitPrice: effectivePrice,
          quantity: item.quantity,
          subtotal: lineTotal,
        });
      }

      let deliveryFee = 0;
      let pickupDetails = undefined;
      let deliveryDetails = undefined;
      const opts = session ? { session } : {};

      if (fulfillmentType === FULFILLMENT_TYPES.STORE_PICKUP) {
        if (!pickupSlotId) throw new ApiError(400, 'Pickup slot required', 'SLOT_REQUIRED');

        const slot = await PickupSlot.findOneAndUpdate(
          { _id: pickupSlotId, isActive: true, $expr: { $lt: ['$bookedCount', '$capacity'] } },
          { $inc: { bookedCount: 1 } },
          { ...opts, new: true }
        );

        if (!slot) {
          throw new ApiError(400, 'Selected pickup slot is full or inactive', 'SLOT_FULL');
        }

        pickupDetails = {
          slotId: slot._id,
          slotDate: slot.date,
          slotTimeWindow: `${slot.startTime} -${slot.endTime}`,
        };
      } else if (fulfillmentType === FULFILLMENT_TYPES.HOME_DELIVERY) {
        if (!deliveryAddress || typeof deliveryAddress.distanceKm !== 'number') {
          throw new ApiError(400, 'Valid delivery address and distance are required', 'ADDRESS_REQUIRED');
        }

        const distance = deliveryAddress.distanceKm;
        const zoneQuery = DeliveryZone.findOne({
          minDistanceKm: { $lte: distance },
          maxDistanceKm: { $gt: distance },
          isActive: true,
        });
        if (session) zoneQuery.session(session);
        const zone = await zoneQuery;

        if (!zone) {
          throw new ApiError(400, 'Delivery is unavailable for this location', 'ZONE_UNAVAILABLE');
        }

        deliveryFee = zone.fee;
        deliveryDetails = {
          address: deliveryAddress,
          zoneId: zone._id,
          distanceKm: distance,
        };
      } else {
        throw new ApiError(400, 'Invalid fulfillment type', 'INVALID_FULFILLMENT');
      }

      await InventoryService.reserveStock(orderItems, session);

      const taxTotal = Math.round(itemsSubtotal * TAX_RATE * 100) / 100;
      const grandTotal = itemsSubtotal + taxTotal + deliveryFee;
      const orderNumber = `DMX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const order = new Order({
        orderNumber,
        user: user._id,
        items: orderItems,
        fulfillmentType,
        status: ORDER_STATUS.PLACED,
        pricing: { itemsSubtotal, taxTotal, deliveryFee, grandTotal },
        deliveryDetails,
        pickupDetails,
        statusHistory: [{ status: ORDER_STATUS.PLACED, changedBy: user._id, comment: 'Order placed' }],
      });

      await order.save(opts);

      await AuditService.log({
        actor: { id: user._id, email: user.email, role: user.role },
        action: 'ORDER_CREATED',
        entity: 'Order',
        entityId: order._id.toString(),
        metadata: { orderNumber, grandTotal },
        ...reqInfo,
      });

      return order;
    });
  }

  static async updateOrderStatus(orderId, nextStatus, user, comment, reqInfo) {
    return await withTransaction(async (session) => {
      const opts = session ? { session } : {};
      const orderQuery = Order.findById(orderId);
      if (session) orderQuery.session(session);
      const order = await orderQuery;

      if (!order) throw new ApiError(404, 'Order not found', 'NOT_FOUND');

      const allowedNext = VALID_TRANSITIONS[order.status] || [];
      if (!allowedNext.includes(nextStatus)) {
        throw new ApiError(
          400,
          `Invalid status transition from ${order.status} to${nextStatus}`,
          'INVALID_STATE_TRANSITION'
        );
      }

      if (nextStatus === ORDER_STATUS.CANCELLED) {
        await InventoryService.restoreStockForCancellation(order, session);
        if (order.fulfillmentType === FULFILLMENT_TYPES.STORE_PICKUP && order.pickupDetails?.slotId) {
          await PickupSlot.findByIdAndUpdate(
            order.pickupDetails.slotId,
            { $inc: { bookedCount: -1 } },
            opts
          );
        }
      }

      if (nextStatus === ORDER_STATUS.COMPLETED || nextStatus === ORDER_STATUS.DELIVERED) {
        await InventoryService.commitReservation(order.items, session);
      }

      order.status = nextStatus;
      order.statusHistory.push({
        status: nextStatus,
        changedBy: user._id,
        comment: comment || `Status updated to ${nextStatus}`,
      });

      await order.save(opts);

      await AuditService.log({
        actor: { id: user._id, email: user.email, role: user.role },
        action: `ORDER_STATUS_${nextStatus}`,
        entity: 'Order',
        entityId: order._id.toString(),
        metadata: { previousStatus: order.status, newStatus: nextStatus },
        ...reqInfo,
      });

      return order;
    });
  }
}

module.exports = OrderService;