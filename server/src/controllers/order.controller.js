const Order = require('../models/Order');
const Inventory = require('../models/Inventory');

// 1. Create Order (Handles POST /api/v1/orders)
exports.createOrder = async (req, res) => {
  try {
    const { items, fulfillmentType, deliveryAddress, paymentMethod, paymentDetails, pickupSlot } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required to create an order.' });
    }

    const orderNumber = `DMX-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const processedItems = items.map((it) => {
      const unitPrice = it.product?.discountPrice || it.product?.regularPrice || it.price || it.unitPrice || 50;
      const qty = it.quantity || 1;
      return {
        product: it.product?._id || it.product || it._id,
        name: it.product?.name || it.name || 'Grocery Item',
        quantity: qty,
        unitPrice: unitPrice,
        price: unitPrice,
        totalPrice: unitPrice * qty,
      };
    });

    const grandTotal = processedItems.reduce((acc, it) => acc + it.totalPrice, 0);

    const newOrder = await Order.create({
      orderNumber,
      user: req.user?._id || req.user?.id,
      items: processedItems,
      fulfillmentType: fulfillmentType || 'HOME_DELIVERY',
      status: 'PLACED',
      deliveryAddress: deliveryAddress || {
        street: 'Flat 402, Green Avenue Heights',
        city: 'Mumbai',
        pincode: '400001',
      },
      paymentDetails: {
        method: paymentMethod || paymentDetails?.method || 'COD',
        status: 'PAID',
        transactionId: `TXN-${Date.now()}`,
      },
      pickupSlot: pickupSlot || undefined,
      grandTotal: grandTotal,
      totalAmount: grandTotal,
      tracking: {
        currentMilestone: 'Order Placed at Dark Store',
        estimatedMinutes: 15,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: newOrder,
    });
  } catch (err) {
    console.error('[CreateOrder Error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Get User's Orders
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Get All Orders (Staff/Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email phone').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Update Order Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    if (order.tracking) {
      if (status === 'PREPARING') order.tracking.currentMilestone = 'Picking & Packed in Cold-Chain Tote';
      if (status === 'OUT_FOR_DELIVERY') order.tracking.currentMilestone = 'Out for Delivery (Rider Unit #04)';
      if (status === 'DELIVERED') order.tracking.currentMilestone = 'Handover Complete at Doorstep';
    }

    await order.save();
    return res.status(200).json({ success: true, message: 'Order updated', order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 5. Cancel Order
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = 'CANCELLED';
    if (order.tracking) {
      order.tracking.currentMilestone = 'Order Cancelled by Customer';
    }
    await order.save();

    return res.status(200).json({ success: true, message: 'Order cancelled successfully', order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};