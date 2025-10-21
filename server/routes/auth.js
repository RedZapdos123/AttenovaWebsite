//This program defines authentication routes (signup, login, me).

const express = require('express');
const router = express.Router();
const { signup, login, me } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', verifyToken, me);

module.exports = router;
