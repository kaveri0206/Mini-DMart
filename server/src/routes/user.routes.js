const express = require('express');
const router = express.Router();
const User = require('../models/User');
const UserController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { ROLES } = require('../config/constants');
const ApiResponse = require('../utils/apiResponse');

router.use(authenticate);

// Admin: Query all users across all roles
router.get('/all', authorize(ROLES.ADMIN), async (req, res, next) => {
  try {
    const users = await User.find().select('-password -refreshToken').sort({ createdAt: -1 });
    return ApiResponse.send(res, 200, users, 'All users retrieved');
  } catch (err) {
    next(err);
  }
});

// Admin: Update user role
router.patch('/:targetUserId/role', authorize(ROLES.ADMIN), UserController.updateUserRole);

// Admin: Toggle account active status
router.patch('/:targetUserId/status', authorize(ROLES.ADMIN), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.targetUserId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    user.tokenVersion += 1;
    await user.save();
    return ApiResponse.send(res, 200, user, `User status updated to ${user.isActive ? 'Active' : 'Inactive'}`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;