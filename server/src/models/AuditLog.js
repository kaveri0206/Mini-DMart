const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    entity: {
      type: String,
      default: 'RETURN_EXCHANGE',
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    actor: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      email: { type: String, default: 'staff@dmartx.demo' },
      role: { type: String, default: 'STAFF' },
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);