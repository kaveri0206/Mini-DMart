const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnExchange.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Customer: Lodge return/exchange request
router.post('/request', authenticate, returnController.requestReturnExchange || returnController.createReturnRequest);
router.post('/', authenticate, returnController.requestReturnExchange || returnController.createReturnRequest);

// Staff / Admin: View tickets
router.get('/all', authenticate, returnController.getAllTickets || returnController.getTickets);
router.get('/', authenticate, returnController.getAllTickets || returnController.getTickets);

// Staff / Admin: Approve or Reject
router.patch('/:id/decision', authenticate, returnController.processDecision || returnController.reviewTicket);
router.patch('/:id/review', authenticate, returnController.processDecision || returnController.reviewTicket);

module.exports = router;