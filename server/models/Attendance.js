// This program defines the Attendance mongoose model used for session headers and student attendance records.

// models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expiration: { type: Number, required: true },
  subject: { type: String, required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  year: { type: String, enum: ['1st', '2nd', '3rd', '4th'] },
  section: { type: String, enum: ['A', 'B', 'C', 'D'] },
  points: { type: Number, required: true }, // Points awarded to a student for this session
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null for session record
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSession' },
  attendanceType: { type: String, enum: ['qr', 'manual', 'bulk'], default: 'qr' },
  professorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Indexes for efficient queries
attendanceSchema.index({ token: 1 });
attendanceSchema.index({ student: 1, subject: 1 });
attendanceSchema.index({ subjectId: 1, createdAt: 1 });
attendanceSchema.index({ professorId: 1, createdAt: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
