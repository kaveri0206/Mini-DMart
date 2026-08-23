const User = require('../models/User');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const AuditService = require('../services/audit.service');
const { ROLES } = require('../config/constants');

class UserController {
  static async getAllUsers(req, res, next) {
    try {
      const users = await User.find().select('-password -refreshToken').sort({ createdAt: -1 });
      return ApiResponse.send(res, 200, users, 'All users retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async updateUserRole(req, res, next) {
    try {
      const { targetUserId } = req.params;
      const { newRole } = req.body;

      if (!Object.values(ROLES).includes(newRole)) {
        throw new ApiError(400, 'Invalid role specification', 'INVALID_ROLE');
      }

      if (req.user._id.toString() === targetUserId) {
        throw new ApiError(400, 'Administrators cannot alter their own role', 'SELF_MUTATION_BLOCKED');
      }

      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        throw new ApiError(404, 'Target user not found', 'USER_NOT_FOUND');
      }

      const previousRole = targetUser.role;
      targetUser.role = newRole;
      targetUser.tokenVersion += 1;
      await targetUser.save();

      await AuditService.log({
        actor: { id: req.user._id, email: req.user.email, role: req.user.role },
        action: 'ROLE_UPDATED',
        entity: 'User',
        entityId: targetUser._id.toString(),
        metadata: { previousRole, newRole },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return ApiResponse.send(res, 200, targetUser, `Role updated to ${newRole}`);
    } catch (err) {
      next(err);
    }
  }

  static async toggleUserStatus(req, res, next) {
    try {
      const { targetUserId } = req.params;
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
      }

      targetUser.isActive = !targetUser.isActive;
      targetUser.tokenVersion += 1;
      await targetUser.save();

      return ApiResponse.send(
        res,
        200,
        targetUser,
        `User status changed to ${targetUser.isActive ? 'Active' : 'Inactive'}`
      );
    } catch (err) {
      next(err);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user._id).select('-refreshToken');
      return ApiResponse.send(res, 200, user, 'Profile retrieved');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserController;