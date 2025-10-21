const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const AttendanceSession = require('../models/AttendanceSession');
const {
  parseCSV,
  parseExcel,
  validateAttendanceData,
  generateCSV,
  generateExcel,
  generateAttendanceTemplate,
  cleanupFile
} = require('../utils/fileHandler');

//Import attendance data from uploaded file.
exports.importAttendance = async (req, res, next) => {
  let uploadedFilePath = null;

  try {
    if (req.user.role !== 'professor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    uploadedFilePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const { subjectId, sessionName, sessionDate } = req.body;

    //Validate required fields.
    if (!subjectId || !sessionName) {
      return res.status(400).json({
        message: 'Subject ID and session name are required'
      });
    }

    //Verify subject ownership.
    const subject = await Subject.findById(subjectId);
    if (!subject || subject.professorEmail !== req.user.email) {
      return res.status(403).json({
        message: 'Subject not found or access denied'
      });
    }

    //Parse the uploaded file.
    let rawData;
    if (fileExtension === '.csv') {
      rawData = await parseCSV(uploadedFilePath);
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      rawData = parseExcel(uploadedFilePath);
    } else {
      return res.status(400).json({ 
        message: 'Unsupported file format. Please use CSV or Excel files.' 
      });
    }
    
    //Validate the data.
    const validation = validateAttendanceData(rawData);

    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Data validation failed',
        errors: validation.errors,
        totalRecords: validation.totalRecords,
        validCount: validation.validCount
      });
    }

    //Process valid records.
    const processedAttendances = [];
    const attendanceRecords = [];

    for (const record of validation.validRecords) {
      //Find or validate student.
      const student = await User.findOne({
        email: record.studentEmail,
        role: 'student'
      });

      if (!student) {
        validation.errors.push(`Student not found: ${record.studentEmail}`);
        continue;
      }

      //Check if student belongs to the subject's year and section.
      if (student.year !== subject.year || student.section !== subject.section) {
        validation.errors.push(
          `Student ${record.studentEmail} does not belong to ${subject.year} ${subject.section}`
        );
        continue;
      }

      if (record.present) {
        //Create attendance record.
        const attendanceRecord = new Attendance({
          token: `bulk-import-${Date.now()}-${student._id}`,
          expiration: Date.now(),
          subject: subject.subjectName,
          subjectId: subject._id,
          year: subject.year,
          section: subject.section,
          points: record.points,
          student: student._id,
          attendanceType: 'manual',
          professorId: req.user.id
        });
        
        attendanceRecords.push(attendanceRecord);
      }
      
      //Add to session attendances.
      processedAttendances.push({
        studentId: student._id,
        studentEmail: student.email,
        present: record.present,
        points: record.points,
        markedBy: 'bulk_import'
      });
    }
    
    //Create attendance session.
    const session = new AttendanceSession({
      date: sessionDate ? new Date(sessionDate) : new Date(),
      subjectId: subject._id,
      professorId: req.user.id,
      sessionType: 'bulk',
      sessionName,
      description: `Bulk import session - ${req.file.originalname}`,
      attendances: processedAttendances
    });

    //Save all records.
    await session.save();

    //Save individual attendance records.
    for (const record of attendanceRecords) {
      record.sessionId = session._id;
      await record.save();
    }

    //Clean up uploaded file.
    cleanupFile(uploadedFilePath);
    
    res.status(201).json({
      message: 'Attendance imported successfully',
      session: {
        id: session._id,
        sessionName: session.sessionName,
        totalRecords: validation.totalRecords,
        validRecords: validation.validCount,
        presentCount: session.presentCount,
        absentCount: session.absentCount
      },
      errors: validation.errors.length > 0 ? validation.errors : undefined
    });
    
  } catch (err) {
    //Clean up uploaded file on error.
    if (uploadedFilePath) {
      cleanupFile(uploadedFilePath);
    }
    next(err);
  }
};

//Export attendance data.
exports.exportAttendance = async (req, res, next) => {
  try {
    if (req.user.role !== 'professor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      subjectId,
      startDate,
      endDate,
      format = 'csv',
      includeAbsent = 'false'
    } = req.query;

    //Build query.
    let query = { professorId: req.user.id };

    if (subjectId) {
      query.subjectId = subjectId;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    //Get attendance data.
    const attendanceData = await Attendance.find(query)
      .populate('student', 'name email year section')
      .populate('subjectId', 'subjectName subjectCode year section')
      .sort({ createdAt: -1 });
    
    //If includeAbsent is true, also get students who didn't attend.
    let exportData = attendanceData.map(record => ({
      'Student Name': record.student?.name || 'N/A',
      'Student Email': record.student?.email || 'N/A',
      'Year': record.student?.year || record.year || 'N/A',
      'Section': record.student?.section || record.section || 'N/A',
      'Subject': record.subject,
      'Subject Code': record.subjectId?.subjectCode || 'N/A',
      'Present': 'Yes',
      'Points': record.points,
      'Attendance Type': record.attendanceType,
      'Date': record.createdAt.toISOString().split('T')[0],
      'Time': record.createdAt.toISOString().split('T')[1].split('.')[0]
    }));

    //Generate file.
    const timestamp = Date.now();
    const fileName = `attendance_export_${timestamp}.${format}`;
    const filePath = path.join(__dirname, '../uploads', fileName);
    
    let generatedFilePath;
    if (format === 'csv') {
      const headers = [
        { id: 'Student Name', title: 'Student Name' },
        { id: 'Student Email', title: 'Student Email' },
        { id: 'Year', title: 'Year' },
        { id: 'Section', title: 'Section' },
        { id: 'Subject', title: 'Subject' },
        { id: 'Subject Code', title: 'Subject Code' },
        { id: 'Present', title: 'Present' },
        { id: 'Points', title: 'Points' },
        { id: 'Attendance Type', title: 'Attendance Type' },
        { id: 'Date', title: 'Date' },
        { id: 'Time', title: 'Time' }
      ];
      generatedFilePath = await generateCSV(exportData, filePath, headers);
    } else if (format === 'xlsx') {
      generatedFilePath = generateExcel(exportData, filePath, 'Attendance Export');
    } else {
      return res.status(400).json({ 
        message: 'Unsupported format. Use csv or xlsx.' 
      });
    }
    
    //Send file for download.
    res.download(generatedFilePath, fileName, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      //Clean up file after download.
      setTimeout(() => cleanupFile(generatedFilePath), 5000);
    });

  } catch (err) {
    next(err);
  }
};

//Download attendance template.
exports.downloadTemplate = async (req, res, next) => {
  try {
    if (req.user.role !== 'professor') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { format = 'csv' } = req.query;
    
    const templatePath = await generateAttendanceTemplate(format);
    const fileName = `attendance_template.${format}`;
    
    res.download(templatePath, fileName, (err) => {
      if (err) {
        console.error('Error sending template:', err);
      }
      //Clean up template file after download.
      setTimeout(() => cleanupFile(templatePath), 5000);
    });

  } catch (err) {
    next(err);
  }
};

//Get import/export history.
exports.getImportExportHistory = async (req, res, next) => {
  try {
    if (req.user.role !== 'professor') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const sessions = await AttendanceSession.find({
      professorId: req.user.id,
      sessionType: 'bulk'
    })
    .populate('subjectId', 'subjectName subjectCode')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
    
    const total = await AttendanceSession.countDocuments({
      professorId: req.user.id,
      sessionType: 'bulk'
    });
    
    res.status(200).json({
      sessions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
    
  } catch (err) {
    next(err);
  }
};
