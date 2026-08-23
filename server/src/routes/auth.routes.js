const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authController.logout);

// Admin-only operations
router.get('/users', authenticate, authController.getAllUsers);
router.post('/add-staff', authenticate, authController.addStaff);

module.exports = router;