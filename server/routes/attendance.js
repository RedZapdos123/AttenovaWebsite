//This program defines attendance routes (QR generation, marking, records, and summaries).

const express = require('express');
const router = express.Router();
const {
  generateQR,
  markAttendance,
  getRecord,
  markAttendanceManual,
  removeAttendanceManual,
  getDetailedRecord,
  getAttendanceSummary,
  exportAttendance
} = require('../controllers/attendanceController');
const { verifyToken } = require('../middleware/authMiddleware');

//QR code and basic attendance routes.
router.post('/generate', verifyToken, generateQR);
router.post('/mark', verifyToken, markAttendance);
router.get('/record', verifyToken, getRecord);
router.get('/detailed-record', verifyToken, getDetailedRecord);

//Manual attendance routes.
router.post('/mark-manual', verifyToken, markAttendanceManual);
router.post('/remove-attendance-manual', verifyToken, removeAttendanceManual);

//Professor analytics and export routes.
router.get('/summary', verifyToken, getAttendanceSummary);
router.get('/export', verifyToken, exportAttendance);

module.exports = router;
