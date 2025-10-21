//This program handles user signup, login, and identity (me) endpoints using JWT authentication.

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || "your_jwt_secret"; //Use env in production.

exports.signup = async (req, res) => {
  try {
    const { email, password, role, name, year, section } = req.body;

    //Validate required fields.
    if (!email || !password || !role || !name) {
      return res.status(400).json({ message: 'Email, password, role, and name are required.' });
    }

    //Validate student-specific fields.
    if (role === 'student' && (!year || !section)) {
      return res.status(400).json({ message: 'Year and section are required for students.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      email,
      password: hashedPassword,
      role,
      name
    };

    //Add student-specific fields.
    if (role === 'student') {
      userData.year = year;
      userData.section = section;
    }

    const user = new User(userData);
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    console.log('[auth] Login attempt', { email, pwLen: password ? String(password).length : 0 });
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      console.warn('[auth] No user found for email');
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn('[auth] Password mismatch for', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (err) {
    console.error('[auth] Login error', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.me = async (req, res) => {
  try {
    //VerifyToken already loaded user from DB and attached to req.user.
    res.status(200).json({ id: req.user.id, email: req.user.email, role: req.user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error during /me' });
  }
};
