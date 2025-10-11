const router = require('express').Router();
const multer = require('multer');
const xlsx = require('xlsx');
const EligibleVoter = require('../models/EligibleVoter');
const Candidate = require('../models/Candidate');
const ElectionSettings = require('../models/ElectionSettings');
const Vote = require('../models/Vote');
const User = require('../models/User'); // Import User model
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Voter Upload ---
router.post('/upload-voters', [auth, adminAuth, upload.single('votersFile')], async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  try {
    await EligibleVoter.deleteMany({});
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    const votersToInsert = data.slice(1).map(row => ({
      regNumber: row[0],
      phoneNumber: String(row[1]),
      classLevel: row[2]
    }));

    await EligibleVoter.insertMany(votersToInsert);
    res.status(201).json({ message: `${votersToInsert.length} eligible voters have been successfully uploaded.` });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while processing the file.', error: error.message });
  }
});

// --- User Management (Admin) ---
// @route   GET /api/admin/users
// @desc    Get all registered users (voters)
// @access  Admin
router.get('/users', [auth, adminAuth], async (req, res) => {
    try {
        const users = await User.find({ isAdmin: false }).select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/admin/users/:id
// @desc    Update a user's details by ID
// @access  Admin
router.put('/users/:id', [auth, adminAuth], async (req, res) => {
    const { name, email, age, classLevel, gender, hasVoted } = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { name, email, age, classLevel, gender, hasVoted } },
            { new: true }
        ).select('-password');
        res.json(updatedUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- Candidate Management ---
router.post('/candidates', [auth, adminAuth], async (req, res) => {
  // ... (code remains the same)
});
router.get('/candidates', async (req, res) => {
  // ... (code remains the same)
});
router.put('/candidates/:id', [auth, adminAuth], async (req, res) => {
  // ... (code remains the same)
});
router.delete('/candidates/:id', [auth, adminAuth], async (req, res) => {
  // ... (code remains the same)
});

// --- Election Settings ---
router.post('/settings', [auth, adminAuth], async (req, res) => {
  // ... (code remains the same)
});
router.get('/settings', async (req, res) => {
  // ... (code remains the same)
});

// --- Results and Demographics ---
router.get('/results', [auth, adminAuth], async (req, res) => {
  // ... (code remains the same)
});

module.exports = router;