const ApiError = require('../utils/apiError');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new ApiError(403, 'Identity unverified', 'FORBIDDEN'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Forbidden: Role '${req.user.role}' lacks permission for this resource`,
          'INSUFFICIENT_PERMISSIONS'
        )
      );
    }
    next();
  };
};

module.exports = { authorize };