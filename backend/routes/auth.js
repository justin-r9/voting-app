const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EligibleVoter = require('../models/EligibleVoter');
const auth = require('../middleware/auth');

// @route   GET /api/auth/me
// @desc    Get current user's data
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
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
// @desc    Register a new user (voter)
// @access  Public
router.post('/register', async (req, res) => {
  const { email, password, name, regNumber, phoneNumber, classLevel, gender, age } = req.body;

  try {
    // Prevent registration with the admin's email
    if (email === process.env.ADMIN_EMAIL) {
      return res.status(400).json({ message: 'This email is reserved.' });
    }

    // **New Stricter Validation**
    // Check if regNumber, phoneNumber, AND classLevel all match a single document.
    const eligibleVoter = await EligibleVoter.findOne({
      regNumber,
      phoneNumber: `+${phoneNumber}`,
      classLevel
    });

    if (!eligibleVoter) {
      return res.status(400).json({ message: 'This user is not registered to vote with the provided details. Please check your registration number, phone number, and class level, then try again. Contact the admin if the issue persists.' });
    }

    let existingUser = await User.findOne({ $or: [{ email }, { regNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email or registration number already exists.' });
    }

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
      isAdmin: false,
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
// @desc    Authenticate user or admin & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (email === process.env.ADMIN_EMAIL) {
      if (password === process.env.ADMIN_PASSWORD) {
        const payload = { user: { id: 'admin', isAdmin: true } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
        return res.json({ token });
      } else {
        return res.status(400).json({ message: 'Invalid credentials.' });
      }
    }

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