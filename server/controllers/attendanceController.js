//This program handles QR generation, attendance marking (scan/manual), and related attendance endpoints.

const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Subject = require('../models/Subject');
const AttendanceSession = require('../models/AttendanceSession');

exports.generateQR = async (req, res, next) => {
  try {
    if (req.user.role !== 'professor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const expiryMinutesRaw = req.body.expiryMinutes ?? req.body.expiryTime; //Backward compatible.
    const parsed = Number.parseInt(expiryMinutesRaw, 10);
    const expiryMinutes = Number.isFinite(parsed) ? parsed : 5; //Default 5 only when missing/NaN.
    const clampedExpiryMinutes = Math.min(Math.max(expiryMinutes, 1), 60);

    const token = Math.random().toString(36).substring(2, 15);
    const expiration = Date.now() + clampedExpiryMinutes * 60 * 1000;

    const { subject, subjectId, year, section, attendanceCount, sessionName } = req.body;
    if (!subject || !year || !section || !attendanceCount) {
      return res.status(400).json({ message: 'Subject, year, section, and attendance count are required.' });
    }

    //Find or validate subject if subjectId is provided.
    let subjectDoc = null;
    if (subjectId) {
      subjectDoc = await Subject.findById(subjectId);
      if (!subjectDoc || subjectDoc.professorEmail !== req.user.email) {
        return res.status(403).json({ message: 'Invalid subject or access denied' });
      }
    }

    //Create an AttendanceSession for tracking first.
    const attendanceSession = new AttendanceSession({
      date: new Date(),
      subjectId: subjectDoc ? subjectDoc._id : null,
      professorId: req.user.id,
      sessionType: 'qr',
      sessionName: sessionName || `QR Session - ${subject}`,
      description: `QR code session for ${subject} (${year} ${section})`,
      attendances: []
    });
    await attendanceSession.save();

    //Create a session record (student is null) with points equal to attendanceCount, link to AttendanceSession.
    const sessionRecord = new Attendance({
      token,
      expiration,
      subject,
      subjectId: subjectDoc ? subjectDoc._id : null,
      year,
      section,
      points: attendanceCount,
      attendanceType: 'qr',
      professorId: req.user.id,
      sessionId: attendanceSession._id
    });
    await sessionRecord.save();

    res.status(200).json({
      token,
      expiration,
      expiryDuration: clampedExpiryMinutes,
      attendanceCount,
      sessionId: attendanceSession._id,
      subject,
      year,
      section
    });
  } catch (err) {
    next(err);
  }
};

exports.markAttendance = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { token } = req.body;

    //Find the session record (student: null) to confirm the QR code is valid.
    const session = await Attendance.findOne({ token, student: null });
    if (!session) return res.status(400).json({ message: 'Invalid QR code' });
    if (Date.now() > session.expiration) return res.status(400).json({ message: 'QR code expired' });

    //Check if the student has already marked attendance for this session.
    const existingRecord = await Attendance.findOne({
      token,
      student: new mongoose.Types.ObjectId(req.user.id)
    });
    if (existingRecord) {
      return res.status(400).json({ message: 'Attendance already marked for this session' });
    }

    //Get student details.
    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    //Create a student attendance record awarding the full points from the session.
    const studentRecord = new Attendance({
      token,
      expiration: session.expiration,
      subject: session.subject,
      subjectId: session.subjectId,
      year: session.year,
      section: session.section,
      points: session.points,
      student: new mongoose.Types.ObjectId(req.user.id),
      sessionId: session.sessionId,
      attendanceType: 'qr',
      professorId: session.professorId
    });
    await studentRecord.save();

    //Update the corresponding AttendanceSession if it exists.
    if (session.sessionId) {
      const attendanceSession = await AttendanceSession.findById(session.sessionId);
      if (attendanceSession) {
        attendanceSession.attendances.push({
          studentId: student._id,
          studentEmail: student.email,
          present: true,
          points: session.points,
          markedBy: 'qr_scan'
        });
        await attendanceSession.save();
      }
    }

    res.status(200).json({ message: 'Attendance marked', points: session.points });
  } catch (err) {
    next(err);
  }
};

exports.getRecord = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }
    //Use timestamps to sort the records by creation time.
    const studentObjectId = new mongoose.Types.ObjectId(req.user.id);
    const records = await Attendance.aggregate([
      { $match: { student: studentObjectId } },
      { $sort: { createdAt: 1 } },  //Sort by createdAt ascending.
      { $group: {
          _id: "$subject",
          totalPoints: { $sum: "$points" },
          lastPoints: { $last: "$points" }
      } },
      { $project: {
          subject: "$_id",
          totalAttendances: "$totalPoints",
          attendancesGiven: "$lastPoints",
          _id: 0
      } }
    ]);
    res.status(200).json({ records });
  } catch (err) {
    next(err);
  }
};

exports.markAttendanceManual = async (req, res, next) => {
  try {
    if (req.user.role !== 'professor') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { email, subject, attendanceCount } = req.body;
    const student = await User.findOne({ email, role: 'student' });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const manualToken = "manual-" + Math.random().toString(36).substring(2, 15);
    const record = new Attendance({
      token: manualToken,
      expiration: Date.now(),
      subject: subject || "Not Specified",
      points: attendanceCount || 1,
      student: student._id
    });
    await record.save();
    const notifMsg = `Attendance manually marked for ${student.email} for subject ${subject || "Not Specified"} (${attendanceCount || 1} point(s))`;
    res.status(200).json({ message: notifMsg });
  } catch (err) {
    next(err);
  }
};

exports.removeAttendanceManual = async (req, res, next) => {
  try {
    if (req.user.role !== 'professor') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { email } = req.body;
    const student = await User.findOne({ email, role: 'student' });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const result = await Attendance.deleteMany({ student: student._id, token: { $regex: /^manual-/ } });
    const notifMsg = result.deletedCount > 0
      ? `Removed ${result.deletedCount} manual attendance record(s) for ${student.email}`
      : 'No manual attendance records found for this student';
    res.status(200).json({ message: notifMsg });
  } catch (err) {
    next(err);
  }
};

// Get detailed attendance records for students
exports.getDetailedRecord = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const studentObjectId = new mongoose.Types.ObjectId(req.user.id);
    const { subjectId, startDate, endDate } = req.query;

    let matchQuery = { student: studentObjectId };

    if (subjectId) {
      matchQuery.subjectId = new mongoose.Types.ObjectId(subjectId);
    }

    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const records = await Attendance.aggregate([
      { $match: matchQuery },
      { $lookup: {
          from: 'subjects',
          localField: 'subjectId',
          foreignField: '_id',
          as: 'subjectDetails'
      }},
      { $sort: { createdAt: -1 } },
      { $project: {
          subject: 1,
          points: 1,
          attendanceType: 1,
          createdAt: 1,
          subjectDetails: { $arrayElemAt: ['$subjectDetails', 0] }
      }}
    ]);

    res.status(200).json({ records });
  } catch (err) {
    next(err);
  }
};

// Get attendance summary for professors
exports.getAttendanceSummary = async (req, res, next) => {
  try {
    if (req.user.role !== 'professor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { subjectId, startDate, endDate } = req.query;

    let matchQuery = { professorId: new mongoose.Types.ObjectId(req.user.id) };

    if (subjectId) {
      matchQuery.subjectId = new mongoose.Types.ObjectId(subjectId);
    }

    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const summary = await Attendance.aggregate([
      { $match: matchQuery },
      { $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentDetails'
      }},
      { $lookup: {
          from: 'subjects',
          localField: 'subjectId',
          foreignField: '_id',
          as: 'subjectDetails'
      }},
      { $group: {
          _id: {
            subject: '$subject',
            subjectId: '$subjectId',
            student: '$student'
          },
          totalPoints: { $sum: '$points' },
          attendanceCount: { $sum: 1 },
          lastAttendance: { $max: '$createdAt' },
          studentDetails: { $first: { $arrayElemAt: ['$studentDetails', 0] } },
          subjectDetails: { $first: { $arrayElemAt: ['$subjectDetails', 0] } }
      }},
      { $sort: { '_id.subject': 1, 'studentDetails.name': 1 } }
    ]);

    res.status(200).json({ summary });
  } catch (err) {
    next(err);
  }
};

// Export attendance data
exports.exportAttendance = async (req, res, next) => {
  try {
    if (req.user.role !== 'professor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { subjectId, startDate, endDate, format } = req.query;

    let matchQuery = { professorId: new mongoose.Types.ObjectId(req.user.id) };

    if (subjectId) {
      matchQuery.subjectId = new mongoose.Types.ObjectId(subjectId);
    }

    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendanceData = await Attendance.find(matchQuery)
      .populate('student', 'name email year section')
      .populate('subjectId', 'subjectName subjectCode')
      .sort({ createdAt: -1 });

    // Format data for export
    const exportData = attendanceData.map(record => ({
      'Student Name': record.student?.name || 'N/A',
      'Student Email': record.student?.email || 'N/A',
      'Year': record.student?.year || record.year || 'N/A',
      'Section': record.student?.section || record.section || 'N/A',
      'Subject': record.subject,
      'Subject Code': record.subjectId?.subjectCode || 'N/A',
      'Points': record.points,
      'Attendance Type': record.attendanceType,
      'Date': record.createdAt.toISOString().split('T')[0],
      'Time': record.createdAt.toISOString().split('T')[1].split('.')[0]
    }));

    res.status(200).json({
      data: exportData,
      format: format || 'json',
      totalRecords: exportData.length
    });
  } catch (err) {
    next(err);
  }
};
