// This program defines the Subject mongoose model and indexes for common queries.

// models/Subject.js
const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  subjectCode: { type: String, required: true },
  year: { type: String, enum: ['1st', '2nd', '3rd', '4th'], required: true },
  section: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  professorEmail: { type: String, required: true },
  professorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Compound index for efficient queries
subjectSchema.index({ professorEmail: 1, year: 1, section: 1 });
subjectSchema.index({ subjectCode: 1, year: 1, section: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
