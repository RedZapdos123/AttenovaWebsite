// This program defines the User mongoose model (professor, student, administrator) and related schema indexes.

// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['professor', 'student', 'administrator'], required: true },
  year: { type: String, enum: ['1st', '2nd', '3rd', '4th'], required: function() { return this.role === 'student'; } },
  section: { type: String, enum: ['A', 'B', 'C', 'D'], required: function() { return this.role === 'student'; } },
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
