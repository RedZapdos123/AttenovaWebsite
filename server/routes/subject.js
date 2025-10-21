//This program defines subject routes for professors (CRUD and related lookups).

const express = require('express');
const router = express.Router();
const {
  getSubjects,
  createSubject,
  getStudentsForSubject,
  createManualAttendanceSession,
  getAttendanceSessions,
  updateSubject,
  deleteSubject
} = require('../controllers/subjectController');
const { verifyToken } = require('../middleware/authMiddleware');

//Subject management routes.
router.get('/', verifyToken, getSubjects);
router.post('/', verifyToken, createSubject);
router.get('/:subjectId/students', verifyToken, getStudentsForSubject);
router.get('/:subjectId/sessions', verifyToken, getAttendanceSessions);
router.put('/:subjectId', verifyToken, updateSubject);
router.delete('/:subjectId', verifyToken, deleteSubject);

//Manual attendance session routes.
router.post('/manual-attendance', verifyToken, createManualAttendanceSession);

module.exports = router;
