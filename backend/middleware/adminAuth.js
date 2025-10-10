const User = require('../models/User');

module.exports = async function (req, res, next) {
  try {
    // We assume the standard 'auth' middleware has already run and attached the user ID.
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
    }

    next();
  } catch (err) {
    res.status(401).json({ msg: 'Request is not authorized' });
  }
};