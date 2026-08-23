// server/src/controllers/return.controller.js
const { Return, Exchange } = require('../models/Return');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const AuditLog = require('../models/AuditLog');
const ApiResponse = require('../utils/apiResponse');

exports.approveReturnOrExchange = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { decision, notes, isDamagedWaste } = req.body; // decision: 'APPROVE' | 'REJECT'

    const exchangeDoc = await Exchange.findById(id).populate('replacementProduct');
    if (!exchangeDoc) {
      return res.status(404).json({ message: 'Return/Exchange ticket not found' });
    }

    if (decision === 'APPROVE') {
      exchangeDoc.status = 'APPROVED';
      exchangeDoc.approvedBy = req.user._id;
      exchangeDoc.resolutionNotes = notes || 'Approved by store staff';
      await exchangeDoc.save();

      // 1. If it's an EXCHANGE: Reserve 1 unit of the replacement product
      if (exchangeDoc.replacementProduct) {
        await Inventory.findOneAndUpdate(
          { product: exchangeDoc.replacementProduct._id },
          { $inc: { availableStock: -1, reservedStock: 1 } }
        );
      }

      // 2. If it's a RETURN: Check if item can be restocked or written off
      if (!isDamagedWaste && exchangeDoc.originalItem?.product) {
        await Inventory.findOneAndUpdate(
          { product: exchangeDoc.originalItem.product },
          { $inc: { availableStock: 1 } }
        );
      }

      // 3. Log Audit Trail
      await AuditLog.create({
        actor: req.user._id,
        action: 'RETURN_EXCHANGE_APPROVED',
        details: `Ticket #${id} approved. Resolution: ${exchangeDoc.status}`,
        timestamp: new Date()
      });

      return ApiResponse.send(res, 200, exchangeDoc, 'Return approved & inventory updated');
    } else {
      exchangeDoc.status = 'REJECTED';
      exchangeDoc.resolutionNotes = notes || 'Inspection failed: Item seal broken or damaged by user';
      await exchangeDoc.save();

      return ApiResponse.send(res, 200, exchangeDoc, 'Return request rejected');
    }
  } catch (err) {
    next(err);
  }
};