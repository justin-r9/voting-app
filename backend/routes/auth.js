const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EligibleVoter = require('../models/EligibleVoter');
const auth = require('../middleware/auth'); // Import auth middleware

// @route   GET /api/auth/me
// @desc    Get current user's data
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    // req.user.id is attached by the auth middleware
    const user = await User.findById(req.user.id).select('-password'); // Exclude password from response
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { email, password, name, regNumber, phoneNumber, classLevel, gender, age } = req.body;

  try {
    const eligibleVoter = await EligibleVoter.findOne({ regNumber, phoneNumber });
    if (!eligibleVoter) {
      return res.status(400).json({ message: 'This user is not registered to vote. Contact the admin.' });
    }

    let existingUser = await User.findOne({ $or: [{ email }, { regNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email or registration number already exists.' });
    }

    const isFirstUser = (await User.countDocuments()) === 0;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      email,
      password: hashedPassword,
      name,
      regNumber,
      phoneNumber,
      classLevel,
      gender,
      age,
      isAdmin: isFirstUser,
    });

    await user.save();

    const payload = { user: { id: user.id, isAdmin: user.isAdmin } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.status(201).json({ token });
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const payload = { user: { id: user.id, isAdmin: user.isAdmin } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

module.exports = router;