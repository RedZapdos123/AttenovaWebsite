//This program verifies JWTs, loads the user, and enforces authenticated access to protected routes.

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const secret = process.env.JWT_SECRET || "your_jwt_secret";

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  jwt.verify(token, secret, async (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Failed to authenticate token' });
    try {
      const user = await User.findById(decoded.id).select('email role').lean();
      if (!user) return res.status(401).json({ message: 'User not found for token' });
      req.user = { id: decoded.id, email: user.email, role: user.role };
      next();
    } catch (e) {
      next(e);
    }
  });
};
