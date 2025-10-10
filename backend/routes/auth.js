const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EligibleVoter = require('../models/EligibleVoter');

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

    let user = await User.findOne({ $or: [{ email }, { regNumber }] });
    if (user) {
      return res.status(400).json({ message: 'A user with this email or registration number already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      email,
      password: hashedPassword,
      name,
      regNumber,
      phoneNumber,
      classLevel,
      gender,
      age
    });

    await user.save();

    // TODO: Send WhatsApp verification code

    const payload = { user: { id: user.id } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token });
      }
    );

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
    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // 3. Generate and return JWT token
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        regNumber: user.regNumber
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

module.exports = router;