// This program defines the AuditLog mongoose model for administrator action auditing.

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorEmail: { type: String },
  details: { type: Object },
}, { timestamps: true });

auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

