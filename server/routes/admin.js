//This program defines administrator routes for management, CSV export, stats, and audit logs.

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/authMiddleware');
const {
  createProfessor,
  getAllProfessors,
  createSubject,
  getAllSubjects,
  assignProfessorToSubject,
  uploadBulkAttendance,
  deactivateProfessor,
  deactivateSubject,
  exportAttendanceCsv,
  getStats
} = require('../controllers/adminController');

//Ensure uploads directory exists.
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 }, //5MB.
  fileFilter: (req, file, cb) => {
    const allowed = ['.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) return cb(new Error('Only .csv files are allowed'));
    cb(null, true);
  }
});

//All routes require authentication.
router.use(verifyToken);

//Professor management.
router.post('/professors', createProfessor);
//Deactivate professor.
router.delete('/professors/:id', deactivateProfessor);

router.get('/professors', getAllProfessors);

//Subject management.
router.post('/subjects', createSubject);
//Deactivate subject.
router.delete('/subjects/:id', deactivateSubject);

router.get('/subjects', getAllSubjects);
router.put('/subjects/:subjectId/assign-professor', assignProfessorToSubject);
//CSV export.
router.get('/export-attendance', exportAttendanceCsv);
//Dashboard stats.
router.get('/stats', getStats);
//Audit logs.
router.get('/audit-logs', require('../controllers/adminController').getAuditLogs);


//Bulk attendance upload.
router.post('/upload-attendance', upload.single('file'), uploadBulkAttendance);

module.exports = router;

