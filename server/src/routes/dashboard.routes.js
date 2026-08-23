const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { ROLES } = require('../config/constants');

router.use(authenticate);
router.get('/manager', authorize(ROLES.MANAGER, ROLES.ADMIN), DashboardController.getManagerAnalytics);

module.exports = router;