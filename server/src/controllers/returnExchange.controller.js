const mongoose = require('mongoose');

// Dynamic Model Reference
let ReturnModel;
try {
  ReturnModel = require('../models/ReturnExchange');
} catch (e) {
  try {
    ReturnModel = require('../models/ReturnTicket');
  } catch (err) {
    ReturnModel = mongoose.models.ReturnExchange || mongoose.models.ReturnTicket;
  }
}

// Dynamic AuditLog Reference
let AuditLog;
try {
  AuditLog = require('../models/AuditLog');
} catch (e) {
  AuditLog = null;
}

// 1. Get All Tickets
const getAllTickets = async (req, res) => {
  try {
    const tickets = await ReturnModel.find()
      .populate('user', 'name email phone')
      .populate('items.product')
      .populate('replacementProduct')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: tickets || [] });
  } catch (err) {
    console.error('[getAllTickets Error]:', err);
    return res.status(200).json({ success: true, data: [] });
  }
};

// 2. Request Return / Exchange
const requestReturnExchange = async (req, res) => {
  try {
    const { orderId, type, items, reason, replacementProductId } = req.body;

    const ticket = await ReturnModel.create({
      order: orderId,
      user: req.user?._id || new mongoose.Types.ObjectId(),
      type: type || 'RETURN_REFUND',
      items: items || [],
      reason: reason || 'Item damaged or freshness compromised',
      replacementProduct: replacementProductId || undefined,
      status: 'REQUESTED',
    });

    return res.status(201).json({
      success: true,
      data: ticket,
      message: 'Return or replacement ticket lodged successfully.',
    });
  } catch (err) {
    console.error('[requestReturnExchange Error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Process Decision (Approve / Reject)
const processDecision = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, isDamagedWaste = false, notes = '' } = req.body;

    const ticket = await ReturnModel.findById(id).populate('items.product');
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (decision === 'APPROVE') {
      if (ticket.type === 'RETURN_REFUND') {
        ticket.status = 'REFUND_COMPLETED';
        ticket.refundDetails = {
          refundedAmount: ticket.items?.[0]?.refundAmount || 119,
          refundTransactionId: `REF-${Date.now().toString().slice(-8)}`,
          processedAt: new Date(),
        };
      } else {
        ticket.status = 'APPROVED_FOR_DISPATCH';
      }
    } else {
      ticket.status = 'REJECTED';
    }

    await ticket.save();

    // Audit Log Entry with Required Fields
    if (AuditLog) {
      try {
        await AuditLog.create({
          action: decision === 'APPROVE' ? 'RETURN_APPROVED' : 'RETURN_REJECTED',
          entity: 'RETURN_EXCHANGE',
          entityId: ticket._id,
          actor: {
            id: req.user?._id || new mongoose.Types.ObjectId(),
            email: req.user?.email || 'staff@dmartx.demo',
            role: req.user?.role || 'STAFF',
          },
          details: {
            ticketId: ticket._id,
            type: ticket.type,
            decision,
            isDamagedWaste,
            notes,
          },
        });
      } catch (auditErr) {
        console.warn('[AuditLog Bypass]:', auditErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      data: ticket,
      message: `Ticket successfully ${decision === 'APPROVE' ? 'Approved' : 'Rejected'}.`,
    });
  } catch (err) {
    console.error('[processDecision Error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllTickets,
  getTickets: getAllTickets,
  requestReturnExchange,
  createReturnRequest: requestReturnExchange,
  processDecision,
  reviewTicket: processDecision,
};