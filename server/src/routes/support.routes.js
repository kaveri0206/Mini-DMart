const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/', authenticate, supportController.createTicket);
router.get('/my-tickets', authenticate, supportController.getMyTickets);
router.get('/all', authenticate, supportController.getAllTickets);
router.post('/:id/reply', authenticate, supportController.replyTicket);

module.exports = router;