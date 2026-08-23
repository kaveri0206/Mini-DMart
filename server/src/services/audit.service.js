const AuditLog = require('../models/AuditLog');
const logger = require('../config/logger');

class AuditService {
  static async log({ actor, action, entity, entityId, metadata, ipAddress, userAgent }) {
    try {
      await AuditLog.create({
        actor,
        action,
        entity,
        entityId: String(entityId || ''),
        metadata,
        ipAddress,
        userAgent,
      });
    } catch (err) {
      logger.error(`Audit Logging Failed: ${err.message}`);
    }
  }
}

module.exports = AuditService;