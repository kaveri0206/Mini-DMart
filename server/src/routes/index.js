const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');
const returnExchangeRoutes = require('./returnExchange.routes');
const dashboardRoutes = require('./dashboard.routes');
const aiRoutes = require('./ai.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/returns-exchanges', returnExchangeRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/ai', aiRoutes);

module.exports = router;