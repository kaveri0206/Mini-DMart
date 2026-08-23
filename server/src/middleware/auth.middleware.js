const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dmartx_super_secure_access_jwt_secret_key_2026_prod';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dmartx_super_secure_refresh_jwt_secret_key_2026_prod';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_MISSING',
        message: 'Authentication token missing.',
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = jwt.verify(token, ACCESS_SECRET);
    } catch (err) {
      // Fallback check against refresh secret in case of mismatch
      try {
        decoded = jwt.verify(token, REFRESH_SECRET);
      } catch (innerErr) {
        return res.status(401).json({
          success: false,
          code: 'TOKEN_EXPIRED',
          message: 'Access token has expired',
        });
      }
    }

    const userId = decoded.id || decoded.userId || decoded._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'Account not found or session cleared.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      code: 'TOKEN_INVALID',
      message: 'Invalid authorization token.',
    });
  }
};

module.exports = { authenticate };