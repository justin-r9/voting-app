const router = require('express').Router();
const multer = require('multer');
const xlsx = require('xlsx');
const EligibleVoter = require('../models/EligibleVoter');
const Position = require('../models/Position'); // Import the new Position model
const Candidate = require('../models/Candidate');
const ElectionSettings = require('../models/ElectionSettings');
const Vote = require('../models/Vote');
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Voter Upload ---
router.post('/upload-voters', [auth, adminAuth, upload.single('votersFile')], async (req, res) => {
  console.log('--- File Upload Received ---');
  if (!req.file) {
    console.log('Error: No file was uploaded.');
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  // --- New: Get classLevel from the request body ---
  const { classLevel } = req.body;
  if (!classLevel) {
    return res.status(400).json({ message: 'Please select a class level.' });
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // --- Updated Validation Logic ---
    const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    if (rows.length === 0) {
      return res.status(400).json({ message: 'The uploaded Excel file is empty.' });
    }

    const actualHeaders = (rows[0] || []).map(h => String(h).trim());
    // Expect only two headers now
    const expectedHeaders = ['regNumber', 'phoneNumber'];

    const isValid = expectedHeaders.length === actualHeaders.length && expectedHeaders.every((value, index) => value === actualHeaders[index]);

    if (!isValid) {
      return res.status(400).json({
        message: `Invalid Excel format. For class-specific uploads, please ensure the columns are exactly in this order: ${expectedHeaders.join(', ')}`
      });
    }
    // --- End Validation Logic ---

    const data = xlsx.utils.sheet_to_json(worksheet);

    // --- Updated Logic: Don't clear all voters ---
    // Instead, we will upsert based on registration number for the given class.
    // This allows uploading files class by class without deleting others.
    // For simplicity in this implementation, we will first remove all voters belonging to the specific class level being uploaded.
    console.log(`Clearing existing eligible voters for class: ${classLevel}...`);
    await EligibleVoter.deleteMany({ classLevel });
    console.log(`Existing voters for ${classLevel} cleared.`);

    console.log(`Found ${data.length} rows of data to process for class ${classLevel}.`);
    // Log the first 5 rows to see how they are parsed
    console.log('Sample of parsed data:', data.slice(0, 5));

    // Ensure correct data types and add the classLevel from the dropdown
    const votersToInsert = data.map(row => {
      const phoneNumberStr = String(row.phoneNumber);
      return {
        regNumber: row.regNumber,
        phoneNumber: phoneNumberStr.startsWith('+') ? phoneNumberStr : `+${phoneNumberStr}`,
        classLevel: classLevel // Add the selected classLevel to each record
      };
    });

    console.log('Inserting new voters into database...');
    await EligibleVoter.insertMany(votersToInsert, { ordered: false });
    console.log('Voters successfully inserted.');

    res.status(201).json({ message: `${votersToInsert.length} eligible voters have been successfully uploaded.` });
  } catch (error) {
    console.error('--- UPLOAD ERROR ---');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Full Error Object:', error);

    let errorMessage = 'An error occurred while processing the file.';
    if (error.name === 'MongoBulkWriteError' && error.code === 11000) {
        errorMessage = 'The Excel file contains duplicate registration numbers. Please ensure all registration numbers are unique.';
    } else if (error.name === 'ValidationError') {
        errorMessage = 'The Excel file contains invalid data. Please check that all registration numbers and class levels are in the correct format.';
    }

    res.status(500).json({ message: errorMessage, error: error.message });
  }
});

// --- Eligible Voter Management ---
router.get('/eligible-voters', [auth, adminAuth], async (req, res) => {
  try {
    const voters = await EligibleVoter.find().sort({ regNumber: 1 });
    res.json(voters);
  } catch (err) {
    console.error('Error fetching eligible voters:', err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/eligible-voters/:id', [auth, adminAuth], async (req, res) => {
  const { regNumber, phoneNumber, classLevel } = req.body;
  try {
    const updatedVoter = await EligibleVoter.findByIdAndUpdate(
      req.params.id,
      { $set: { regNumber, phoneNumber, classLevel } },
      { new: true, runValidators: true }
    );
    if (!updatedVoter) {
      return res.status(404).json({ message: 'Eligible voter not found.' });
    }
    res.json(updatedVoter);
  } catch (err) {
    console.error('Error updating eligible voter:', err.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/eligible-voters/:id', [auth, adminAuth], async (req, res) => {
  try {
    const voter = await EligibleVoter.findByIdAndDelete(req.params.id);
    if (!voter) {
      return res.status(404).json({ message: 'Eligible voter not found.' });
    }
    res.json({ message: 'Eligible voter removed.' });
  } catch (err) {
    console.error('Error deleting eligible voter:', err.message);
    res.status(500).send('Server Error');
  }
});


// --- Position Management ---
router.get('/positions', [auth, adminAuth], async (req, res) => {
  try {
    const positions = await Position.find().sort({ name: 1 });
    res.json(positions);
  } catch (err) {
    console.error('Error fetching positions:', err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/positions', [auth, adminAuth], async (req, res) => {
  const { name } = req.body;
  try {
    const newPosition = new Position({ name });
    await newPosition.save();
    res.status(201).json(newPosition);
  } catch (err) {
    console.error('Error creating position:', err.message);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'A position with this name already exists.' });
    }
    res.status(500).send('Server Error');
  }
});

router.delete('/positions/:id', [auth, adminAuth], async (req, res) => {
  try {
    const positionId = req.params.id;
    const position = await Position.findById(positionId);
    if (!position) {
      return res.status(404).json({ message: 'Position not found.' });
    }

    // Cascade Delete: Find and delete all candidates with this position
    const candidatesToDelete = await Candidate.find({ position: positionId });
    if (candidatesToDelete.length > 0) {
      console.log(`Deleting ${candidatesToDelete.length} candidates associated with position: ${position.name}`);
      await Candidate.deleteMany({ position: positionId });
    }

    await Position.deleteOne({ _id: positionId });
    res.json({ message: `Position '${position.name}' and all associated candidates have been deleted.` });
  } catch (err) {
    console.error('Error deleting position:', err.message);
    res.status(500).send('Server Error');
  }
});


// --- User Management (Admin) ---
// ... (rest of the file remains the same)
router.get('/users', [auth, adminAuth], async (req, res) => {
    try {
        const users = await User.find({ isAdmin: false }).select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
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

router.delete('/users/:id', [auth, adminAuth], async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json({ message: 'User removed.' });
    } catch (err) {
        console.error('Error deleting user:', err.message);
        res.status(500).send('Server Error');
    }
});
router.post('/candidates', [auth, adminAuth], async (req, res) => {
  try {
    const newCandidate = new Candidate(req.body);
    await newCandidate.save();
    res.status(201).json(newCandidate);
  } catch (error) {
    res.status(500).json({ message: 'Error creating candidate.', error: error.message });
  }
});
router.get('/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find().populate('position', 'name');
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching candidates.', error: error.message });
  }
});
router.put('/candidates/:id', [auth, adminAuth], async (req, res) => {
  try {
    const updatedCandidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCandidate) return res.status(404).json({ message: 'Candidate not found.' });
    res.json(updatedCandidate);
  } catch (error) {
    res.status(500).json({ message: 'Error updating candidate.', error: error.message });
  }
});
router.delete('/candidates/:id', [auth, adminAuth], async (req, res) => {
  try {
    const deletedCandidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!deletedCandidate) return res.status(404).json({ message: 'Candidate not found.' });
    res.json({ message: 'Candidate successfully deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting candidate.', error: error.message });
  }
});
router.post('/settings', [auth, adminAuth], async (req, res) => {
  try {
    let settings = await ElectionSettings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error updating election settings.', error: error.message });
  }
});
router.get('/settings', async (req, res) => {
  try {
    const settings = await ElectionSettings.findOne();
    res.json(settings || {});
  } catch (error) {
    res.status(500).json({ message: 'Error fetching election settings.', error: error.message });
  }
});
router.get('/results', [auth, adminAuth], async (req, res) => {
  try {
    const totalVotes = await Vote.countDocuments();
    const results = await Vote.aggregate([
        { $group: { _id: '$candidate', count: { $sum: 1 } } },
        { $lookup: { from: 'candidates', localField: '_id', foreignField: '_id', as: 'candidateInfo' } },
        { $unwind: '$candidateInfo' },
        { $project: { name: '$candidateInfo.name', position: '$candidateInfo.position', count: 1 } },
        { $sort: { count: -1 } },
    ]);
    const demographicsByClass = await Vote.aggregate([
        { $group: { _id: { candidate: '$candidate', classLevel: '$classLevel' }, count: { $sum: 1 } } },
        { $lookup: { from: 'candidates', localField: '_id.candidate', foreignField: '_id', as: 'candidateInfo' } },
        { $unwind: '$candidateInfo' },
        { $project: { name: '$candidateInfo.name', classLevel: '$_id.classLevel', count: 1 } },
    ]);
    const demographicsByGender = await Vote.aggregate([
        { $group: { _id: { candidate: '$candidate', gender: '$gender' }, count: { $sum: 1 } } },
        { $lookup: { from: 'candidates', localField: '_id.candidate', foreignField: '_id', as: 'candidateInfo' } },
        { $unwind: '$candidateInfo' },
        { $project: { name: '$candidateInfo.name', gender: '$_id.gender', count: 1 } },
    ]);
    res.json({ totalVotes, results, demographics: { byClass: demographicsByClass, byGender: demographicsByGender } });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching results.', error: error.message });
  }
});

module.exports = router;