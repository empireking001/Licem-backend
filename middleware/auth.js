const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'Super Admin' || req.user.role === 'Editor' || req.user.role === 'Moderator')) {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Super Admin') next();
  else res.status(403).json({ message: 'Super Admin access required' });
};

module.exports = { protect, adminOnly, superAdminOnly };
