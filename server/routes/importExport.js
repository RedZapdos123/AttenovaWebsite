const express = require('express');
const router = express.Router();
const { upload } = require('../utils/fileHandler');
const {
  importAttendance,
  exportAttendance,
  downloadTemplate,
  getImportExportHistory
} = require('../controllers/importExportController');
const { verifyToken } = require('../middleware/authMiddleware');

//Import attendance from file.
router.post('/import', verifyToken, upload.single('attendanceFile'), importAttendance);

//Export attendance data.
router.get('/export', verifyToken, exportAttendance);

//Download attendance template.
router.get('/template', verifyToken, downloadTemplate);

//Get import/export history.
router.get('/history', verifyToken, getImportExportHistory);

module.exports = router;
