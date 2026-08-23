const mongoose = require('mongoose');
const ApiError = require('../utils/apiError');
const { ROLES } = require('../config/constants');

const requireOwnershipOrPrivilege = (Model, paramKey = 'id', ownerField = 'user') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramKey];

      if (!mongoose.Types.ObjectId.isValid(resourceId)) {
        return next(new ApiError(400, 'Invalid resource identifier format', 'INVALID_ID'));
      }

      const document = await Model.findById(resourceId);
      if (!document) {
        return next(new ApiError(404, 'Resource not found', 'RESOURCE_NOT_FOUND'));
      }

      const isPrivileged = [ROLES.STAFF, ROLES.MANAGER, ROLES.ADMIN].includes(req.user.role);
      const isOwner = document[ownerField] && document[ownerField].toString() === req.user._id.toString();

      if (!isOwner && !isPrivileged) {
        return next(new ApiError(403, 'Access denied: You do not own this resource', 'FORBIDDEN_IDOR'));
      }

      req.resolvedResource = document;
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = { requireOwnershipOrPrivilege };