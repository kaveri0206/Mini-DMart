const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Root order endpoints
router.post('/', authenticate, orderController.createOrder);
router.post('/create', authenticate, orderController.createOrder); // Alias for compatibility
router.get('/', authenticate, orderController.getAllOrders);
router.get('/my-orders', authenticate, orderController.getMyOrders);

// Actions on single order
router.patch('/:id/status', authenticate, orderController.updateOrderStatus);
router.put('/:id', authenticate, orderController.updateOrderStatus);
router.patch('/:id/cancel', authenticate, orderController.cancelOrder);

module.exports = router;