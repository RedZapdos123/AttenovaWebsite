//This program handles subject CRUD and subject-related queries for professors.

const Subject = require('../models/Subject');
const User = require('../models/User');
const AttendanceSession = require('../models/AttendanceSession');
const Attendance = require('../models/Attendance');

//Get all subjects for a professor.
exports.getSubjects = async (req, res, next) => {
  try {
    if (req.user.role !== 'professor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const subjects = await Subject.find({
      professorEmail: req.user.email,
      isActive: true
    }).sort({ subjectName: 1 });

    res.status(200).json({ subjects });
  } catch (err) {
    next(err);
  }
};

//Create a new subject.
exports.createSubject = async (req, res, next) => {
  try {
    if (req.user.role !== 'professor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { subjectName, subjectCode, year, section, description } = req.body;

    if (!subjectName || !subjectCode || !year || !section) {
      return res.status(400).json({
        message: 'Subject name, code, year, and section are required'
      });
    }

    //Check if subject already exists for this professor, year, and section.
    const existingSubject = await Subject.findOne({
      professorEmail: req.user.email,
      subjectCode,
      year,
      section,
      isActive: true
    });

    if (existingSubject) {
      return res.status(400).json({
        message: 'Subject already exists for this year and section'
      });
    }

    const subject = new Subject({
      subjectName,
      subjectCode,
      year,
      section,
      professorEmail: req.user.email,
      professorId: req.user.id,
      description
    });

    await subject.save();
    res.status(201).json({ message: 'Subject created successfully', subject });
  } catch (err) {
    next(err);
  }
};

//Get students for a specific subject (year and section).
exports.getStudentsForSubject = async (req, res, next) => {
  try {
    if (req.user.role !== 'professor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { subjectId } = req.params;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    if (subject.professorEmail !== req.user.email) {
      return res.status(403).json({ message: 'Access denied to this subject' });
    }

    const students = await User.find({
      role: 'student',
      year: subject.year,
      section: subject.section
    }).select('email name year section').sort({ name: 1 });

    res.status(200).json({ students, subject });
  } catch (err) {
    next(err);
  }
};

//Create manual attendance session.
exports.createManualAttendanceSession = async (req, res, next) => {
  try {
    if (req.user.role !== 'professor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { subjectId, sessionName, date, attendances, description } = req.body;

    if (!subjectId || !sessionName || !date || !attendances || !Array.isArray(attendances)) {
      return res.status(400).json({
        message: 'Subject ID, session name, date, and attendances array are required'
      });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    if (subject.professorEmail !== req.user.email) {
      return res.status(403).json({ message: 'Access denied to this subject' });
    }

    //Validate and process attendances.
    const processedAttendances = [];
    for (const attendance of attendances) {
      const student = await User.findOne({
        email: attendance.studentEmail,
        role: 'student'
      });

      if (student) {
        processedAttendances.push({
          studentId: student._id,
          studentEmail: student.email,
          present: attendance.present,
          points: attendance.points || 1,
          markedBy: 'manual_entry'
        });
      }
    }

    const session = new AttendanceSession({
      date: new Date(date),
      subjectId,
      professorId: req.user.id,
      sessionType: 'manual',
      sessionName,
      description,
      attendances: processedAttendances
    });

    await session.save();

    //Also create individual attendance records for compatibility.
    for (const attendance of processedAttendances) {
      if (attendance.present) {
        const attendanceRecord = new Attendance({
          token: `manual-session-${session._id}-${attendance.studentId}`,
          expiration: Date.now(),
          subject: subject.subjectName,
          subjectId: subject._id,
          year: subject.year,
          section: subject.section,
          points: attendance.points,
          student: attendance.studentId,
          sessionId: session._id,
          attendanceType: 'manual',
          professorId: req.user.id
        });

        await attendanceRecord.save();
      }
    }

    res.status(201).json({
      message: 'Manual attendance session created successfully',
      session
    });
  } catch (err) {
    next(err);
  }
};

//Get attendance sessions for a subject.
exports.getAttendanceSessions = async (req, res, next) => {
  try {
    if (req.user.role !== 'professor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { subjectId } = req.params;
    const { startDate, endDate } = req.query;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    if (subject.professorEmail !== req.user.email) {
      return res.status(403).json({ message: 'Access denied to this subject' });
    }

    let query = { subjectId, isActive: true };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sessions = await AttendanceSession.find(query)
      .populate('attendances.studentId', 'name email')
      .sort({ date: -1 });

    res.status(200).json({ sessions, subject });
  } catch (err) {
    next(err);
  }
};

// Update subject
exports.updateSubject = async (req, res, next) => {
  try {
    if (req.user.role !== 'professor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { subjectId } = req.params;
    const { subjectName, subjectCode, description } = req.body;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    if (subject.professorEmail !== req.user.email) {
      return res.status(403).json({ message: 'Access denied to this subject' });
    }

    if (subjectName) subject.subjectName = subjectName;
    if (subjectCode) subject.subjectCode = subjectCode;
    if (description !== undefined) subject.description = description;

    await subject.save();
    res.status(200).json({ message: 'Subject updated successfully', subject });
  } catch (err) {
    next(err);
  }
};

// Delete subject (soft delete)
exports.deleteSubject = async (req, res, next) => {
  try {
    if (req.user.role !== 'professor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { subjectId } = req.params;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    if (subject.professorEmail !== req.user.email) {
      return res.status(403).json({ message: 'Access denied to this subject' });
    }

    subject.isActive = false;
    await subject.save();

    res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (err) {
    next(err);
  }
};
