const User = require('../models/User');
const ApiError = require('../utils/apiError');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenHelper');
const AuditService = require('./audit.service');
const { ROLES } = require('../config/constants');

class AuthService {
  static async register(userData, reqInfo) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      throw new ApiError(409, 'Email is already registered', 'EMAIL_EXISTS');
    }

    // Single-Admin Lockdown: Direct registration as ADMIN is forbidden
    if (userData.role === ROLES.ADMIN) {
      throw new ApiError(403, 'Administrator accounts cannot be created via public registration.', 'ADMIN_REGISTRATION_FORBIDDEN');
    }

    const requestedRole = [ROLES.STAFF, ROLES.MANAGER].includes(userData.role)
      ? userData.role
      : ROLES.CUSTOMER;

    // Staff & Manager registrations require active approval before login
    const isActive = requestedRole === ROLES.CUSTOMER;

    const user = new User({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      role: requestedRole,
      isActive,
      tokenVersion: 0,
    });

    await user.save();

    await AuditService.log({
      actor: { id: user._id, email: user.email, role: user.role },
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: user._id.toString(),
      metadata: { requestedRole, isActive },
      ...reqInfo,
    });

    if (!isActive) {
      return {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, isActive: false },
        accessToken: null,
        refreshToken: null,
        message: 'Account created! Staff/Manager accounts require Administrator approval before logging in.',
      };
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    return { user, accessToken, refreshToken, message: 'Account registered successfully.' };
  }

  static async login(email, password, reqInfo) {
    const user = await User.findOne({ email }).select('+password +role +isActive +tokenVersion');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password credentials', 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Your account is pending Administrator approval or has been deactivated.', 'ACCOUNT_PENDING_APPROVAL');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await AuditService.log({
        actor: { id: user._id, email: user.email, role: user.role },
        action: 'FAILED_LOGIN_ATTEMPT',
        entity: 'User',
        entityId: user._id.toString(),
        ...reqInfo,
      });
      throw new ApiError(401, 'Invalid email or password credentials', 'INVALID_CREDENTIALS');
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    await AuditService.log({
      actor: { id: user._id, email: user.email, role: user.role },
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user._id.toString(),
      ...reqInfo,
    });

    return { user, accessToken, refreshToken };
  }

  static async logout(user, reqInfo) {
    await User.findByIdAndUpdate(user._id, {
      $inc: { tokenVersion: 1 },
      $unset: { refreshToken: 1 },
    });

    await AuditService.log({
      actor: { id: user._id, email: user.email, role: user.role },
      action: 'USER_LOGOUT',
      entity: 'User',
      entityId: user._id.toString(),
      ...reqInfo,
    });
  }
}

module.exports = AuthService;