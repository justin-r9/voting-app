const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   PUT /api/users/profile
// @desc    Update a user's profile information
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { name, email, age } = req.body;

  // Build a user object with the fields to update
  const profileFields = {};
  if (name) profileFields.name = name;
  if (email) profileFields.email = email;
  if (age) profileFields.age = age;

  try {
    // Find the user by the ID from the token and update their data
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Ensure the new email doesn't already exist for another user
    if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'An account with this email already exists.' });
        }
    }

    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password'); // Return the updated user without the password

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;