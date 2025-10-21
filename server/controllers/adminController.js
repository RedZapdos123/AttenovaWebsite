//This program handles administrator operations including professor/subject management, CSV export with session type filtering, dashboard stats, and audit log retrieval.

const bcrypt = require('bcryptjs');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const User = require('../models/User');
const Subject = require('../models/Subject');
const AttendanceSession = require('../models/AttendanceSession');
const Attendance = require('../models/Attendance');
const AuditLog = require('../models/AuditLog');

const SALT_ROUNDS = 10;

function ensureAdmin(req, res) {
  if (!req.user || req.user.role !== 'administrator') {
    res.status(403).json({ message: 'Access denied' });
    return false;
  }
  return true;
}

exports.createProfessor = async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const prof = new User({ name, email, password: passwordHash, role: 'professor' });
    await prof.save();
    await AuditLog.create({ action: 'createProfessor', actorId: req.user.id, actorEmail: req.user.email, details: { professorId: prof._id, email } });
    const out = prof.toObject();
    delete out.password;
    res.status(201).json({ message: 'Professor created successfully', professor: out });
  } catch (err) { next(err); }
};

exports.getAllProfessors = async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const profs = await User.find({ role: 'professor' }).select('-password').sort({ name: 1 });
    res.status(200).json({ professors: profs });
  } catch (err) { next(err); }
};

exports.createSubject = async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const { subjectName, subjectCode, year, section, professorEmail, description } = req.body || {};
    if (!subjectName || !subjectCode || !year || !section || !professorEmail) {
      return res.status(400).json({ message: 'subjectName, subjectCode, year, section, professorEmail are required' });
    }
    const prof = await User.findOne({ email: professorEmail, role: 'professor' });
    if (!prof) return res.status(400).json({ message: 'Professor not found for professorEmail' });

    const dup = await Subject.findOne({ subjectCode, year, section, professorEmail });
    if (dup) return res.status(400).json({ message: 'Subject already exists for this professor/year/section' });

    const subject = new Subject({
      subjectName,
      subjectCode,
      year,
      section,
      professorEmail: prof.email,
      professorId: prof._id,
      description: description || '',
      isActive: true,
    });
    await subject.save();
    await AuditLog.create({ action: 'createSubject', actorId: req.user.id, actorEmail: req.user.email, details: { subjectId: subject._id, subjectCode } });
    res.status(201).json({ message: 'Subject created successfully', subject });
  } catch (err) { next(err); }
};

exports.getAllSubjects = async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const subjects = await Subject.find({}).populate('professorId', 'name email').sort({ year: 1, section: 1, subjectName: 1 });
    res.status(200).json({ subjects });
  } catch (err) { next(err); }
};

exports.assignProfessorToSubject = async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const { subjectId } = req.params;
    const { professorEmail } = req.body || {};
    if (!mongoose.Types.ObjectId.isValid(subjectId)) return res.status(400).json({ message: 'Invalid subjectId' });
    if (!professorEmail) return res.status(400).json({ message: 'professorEmail is required' });

    const prof = await User.findOne({ email: professorEmail, role: 'professor' });
    if (!prof) return res.status(400).json({ message: 'Professor not found for professorEmail' });
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    subject.professorEmail = prof.email;
    subject.professorId = prof._id;
    await subject.save();
    res.status(200).json({ message: 'Professor assigned successfully', subject });
  } catch (err) { next(err); }
};

function parseCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', () => resolve(rows))
      .on('error', (err) => reject(err));
  });
}

exports.uploadBulkAttendance = async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;
    if (!req.file) return res.status(400).json({ message: 'CSV file is required' });

    const filePath = req.file.path;
    const rows = await parseCsv(filePath);

    const errors = [];
    const groups = new Map(); // key: subjectCode|date|sessionName => rows[]

    for (const [idx, row] of rows.entries()) {
      const studentEmail = (row.studentEmail || '').trim();
      const subjectCode = (row.subjectCode || '').trim();
      const dateStr = (row.date || '').trim();
      const status = (row.status || '').trim().toLowerCase();
      const sessionName = (row.sessionName || '').trim() || 'Bulk Session';

      if (!studentEmail || !subjectCode || !dateStr || !status) {
        errors.push({ row: idx + 1, message: 'Missing required fields' });
        continue;
      }
      if (!['present', 'absent'].includes(status)) {
        errors.push({ row: idx + 1, message: 'Invalid status (present/absent only)' });
        continue;
      }
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        errors.push({ row: idx + 1, message: 'Invalid date' });
        continue;
      }

      const key = `${subjectCode}|${date.toISOString().slice(0,10)}|${sessionName}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push({ studentEmail, subjectCode, date, status, sessionName });
    }

    let sessionsCreated = 0;
    let attendanceRecordsCreated = 0;

    for (const [key, entries] of groups.entries()) {
      const { subjectCode, date, sessionName } = entries[0];
      const subject = await Subject.findOne({ subjectCode });
      if (!subject) { errors.push({ key, message: 'Subject not found' }); continue; }
      const professorId = subject.professorId;

      const sessionDoc = new AttendanceSession({
        date,
        subjectId: subject._id,
        professorId,
        sessionType: 'bulk',
        sessionName,
        description: 'Bulk import via admin upload',
        attendances: []
      });

      const attendances = [];
      for (const entry of entries) {
        const student = await User.findOne({ email: entry.studentEmail, role: 'student' });
        if (!student) { errors.push({ key, studentEmail: entry.studentEmail, message: 'Student not found' }); continue; }
        const present = entry.status === 'present';
        attendances.push({
          studentId: student._id,
          studentEmail: student.email,
          present,
          points: 1,
          markedAt: date,
          markedBy: 'bulk_import'
        });
        if (present) {
          const rec = new Attendance({
            token: `bulk-${sessionDoc._id}-${student._id}`,
            expiration: Date.now(),
            subject: subject.subjectName,
            subjectId: subject._id,
            year: subject.year,
            section: subject.section,
            points: 1,
            student: student._id,
            sessionId: sessionDoc._id,
            attendanceType: 'bulk',
            professorId,
          });
          await rec.save();
          attendanceRecordsCreated++;
        }
      }

      sessionDoc.attendances = attendances;
      await sessionDoc.save();
      sessionsCreated++;
    }

    // Cleanup uploaded file
    fs.unlink(filePath, () => {});

    res.status(200).json({ sessionsCreated, attendanceRecordsCreated, errors });
  } catch (err) { next(err); }
};



// Soft-deactivate a professor
exports.deactivateProfessor = async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const prof = await User.findById(id);
    if (!prof || prof.role !== 'professor') return res.status(404).json({ message: 'Professor not found' });
    prof.isActive = false;
    await prof.save();
    await AuditLog.create({ action: 'deactivateProfessor', actorId: req.user.id, actorEmail: req.user.email, details: { professorId: prof._id } });
    res.status(200).json({ message: 'Professor deactivated' });
  } catch (err) { next(err); }
};

// Soft-deactivate a subject
exports.deactivateSubject = async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const subject = await Subject.findById(id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    subject.isActive = false;
    await subject.save();
    await AuditLog.create({ action: 'deactivateSubject', actorId: req.user.id, actorEmail: req.user.email, details: { subjectId: subject._id } });
    res.status(200).json({ message: 'Subject deactivated' });
  } catch (err) { next(err); }
};

// Export attendance as CSV for a subject and date range
exports.exportAttendanceCsv = async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const { subjectId, start, end, sessionType } = req.query;
    if (!subjectId || !mongoose.Types.ObjectId.isValid(subjectId)) return res.status(400).json({ message: 'subjectId is required' });
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    const startDate = start ? new Date(start) : new Date('1970-01-01');
    const endDate = end ? new Date(end) : new Date();
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return res.status(400).json({ message: 'Invalid start/end' });

    const query = { subjectId: subject._id, createdAt: { $gte: startDate, $lte: endDate } };
    const allowed = ['qr', 'manual', 'bulk'];
    if (sessionType && allowed.includes(String(sessionType))) {
      query.attendanceType = sessionType;
    }

    const recs = await Attendance.find(query).populate('student', 'email name').sort({ createdAt: 1 });

    const header = ['date','subjectCode','subjectName','studentEmail','studentName','attendanceType','points'];
    const lines = [header.join(',')];
    for (const r of recs) {
      const dateStr = new Date(r.createdAt).toISOString();
      const row = [
        dateStr,
        subject.subjectCode,
        subject.subjectName,
        r.student?.email || '',
        r.student?.name || '',
        r.attendanceType || 'qr',
        String(r.points ?? 1)
      ];
      // simple CSV escaping for commas/quotes
      const esc = (v) => {
        const s = String(v ?? '');
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s;
      };
      lines.push(row.map(esc).join(','));
    }
    const csvStr = lines.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_${subject.subjectCode}.csv`);
    res.status(200).send(csvStr);
  } catch (err) { next(err); }
};
// Dashboard stats
exports.getStats = async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const [professors, subjects, students, sessions] = await Promise.all([
      User.countDocuments({ role: 'professor', isActive: { $ne: false } }),
      Subject.countDocuments({ isActive: { $ne: false } }),
      User.countDocuments({ role: 'student' }),
      AttendanceSession.countDocuments({})
    ]);
    res.status(200).json({ totals: { professors, subjects, students, sessions } });
  } catch (err) { next(err); }
};

// Audit logs viewer
exports.getAuditLogs = async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const action = (req.query.action || '').trim();

    const filter = {};
    if (action) filter.action = action;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('actorId', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter)
    ]);

    res.status(200).json({ logs, total, page, limit });
  } catch (err) { next(err); }
};

