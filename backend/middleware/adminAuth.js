const User = require('../models/User');

module.exports = async function (req, res, next) {
  try {
    // If the token from the 'auth' middleware already confirms it's an admin,
    // we can bypass the database check. This is crucial for the hardcoded admin user.
    if (req.user.isAdmin) {
      return next();
    }

    // For regular users who might somehow reach an admin route, check their DB record.
    const user = await User.findById(req.user.id);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
    }

    next();
  } catch (err) {
    console.error('adminAuth middleware error:', err);
    res.status(401).json({ msg: 'Request is not authorized' });
  }
};