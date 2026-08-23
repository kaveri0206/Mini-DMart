const mongoose = require('mongoose');
const SupportTicket = require('../models/SupportTicket');

// Customer creates a ticket
exports.createTicket = async (req, res) => {
  try {
    const { category, message, subject } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const userId = req.user?._id || req.user?.id || new mongoose.Types.ObjectId();
    const userName = req.user?.name || 'Customer';
    const userEmail = req.user?.email || 'customer@dmartx.demo';

    const ticket = await SupportTicket.create({
      user: userId,
      userName,
      userEmail,
      category: category || 'DELIVERY_DELAY',
      subject: subject || `Inquiry: ${category || 'General'}`,
      status: 'OPEN',
      messages: [
        {
          senderRole: req.user?.role || 'CUSTOMER',
          senderName: userName,
          text: message.trim(),
          createdAt: new Date(),
        },
      ],
    });

    return res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    console.error('[createTicket Error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Customer retrieves own tickets
exports.getMyTickets = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const userEmail = req.user?.email;

    const query = {
      $or: [
        { user: userId },
        { userEmail: userEmail }
      ]
    };

    const tickets = await SupportTicket.find(query).sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, data: tickets || [] });
  } catch (err) {
    console.error('[getMyTickets Error]:', err);
    return res.status(200).json({ success: true, data: [] });
  }
};

// Staff retrieves all tickets
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find().sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, data: tickets || [] });
  } catch (err) {
    console.error('[getAllTickets Error]:', err);
    return res.status(200).json({ success: true, data: [] });
  }
};

// Reply to a ticket
exports.replyTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, status } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Reply text is required' });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const role = req.user?.role || 'STAFF';
    const name = req.user?.name || (role === 'CUSTOMER' ? 'Customer' : 'Store Attendant');

    ticket.messages.push({
      senderRole: role,
      senderName: name,
      text: text.trim(),
      createdAt: new Date(),
    });

    if (status) {
      ticket.status = status;
    } else if (role === 'STAFF' || role === 'ADMIN') {
      ticket.status = 'IN_PROGRESS';
    }

    await ticket.save();
    return res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    console.error('[replyTicket Error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};