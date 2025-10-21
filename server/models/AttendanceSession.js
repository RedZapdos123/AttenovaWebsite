// This program defines the AttendanceSession mongoose model aggregating per-session attendance and metadata.

// models/AttendanceSession.js
const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  professorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionType: { type: String, enum: ['qr', 'manual', 'bulk'], required: true },
  sessionName: { type: String, required: true },
  description: { type: String },
  attendances: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentEmail: { type: String, required: true },
    present: { type: Boolean, required: true },
    points: { type: Number, default: 1 },
    markedAt: { type: Date, default: Date.now },
    markedBy: { type: String, enum: ['qr_scan', 'manual_entry', 'bulk_import'], required: true }
  }],
  totalStudents: { type: Number, default: 0 },
  presentCount: { type: Number, default: 0 },
  absentCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes for efficient queries
attendanceSessionSchema.index({ subjectId: 1, date: 1 });
attendanceSessionSchema.index({ professorId: 1, date: 1 });
attendanceSessionSchema.index({ 'attendances.studentId': 1 });

// Pre-save middleware to calculate counts
attendanceSessionSchema.pre('save', function(next) {
  this.totalStudents = this.attendances.length;
  this.presentCount = this.attendances.filter(att => att.present).length;
  this.absentCount = this.totalStudents - this.presentCount;
  next();
});

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);
