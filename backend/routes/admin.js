const router = require('express').Router();
const multer = require('multer');
const xlsx = require('xlsx');
const EligibleVoter = require('../models/EligibleVoter');
const Candidate = require('../models/Candidate');
const ElectionSettings = require('../models/ElectionSettings');
const Vote = require('../models/Vote');
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

    // Updated to handle three columns: regNumber, phoneNumber, classLevel
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

// --- Candidate Management ---
router.post('/candidates', [auth, adminAuth], async (req, res) => {
  try {
    const newCandidate = new Candidate(req.body);
    await newCandidate.save();
    res.status(201).json(newCandidate);
  } catch (error) {
    res.status(500).json({ message: 'Error creating candidate.', error: error.message });
  }
});

// Public route for voting page
router.get('/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find();
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

// --- Election Settings ---
router.post('/settings', [auth, adminAuth], async (req, res) => {
  try {
    let settings = await ElectionSettings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error updating election settings.', error: error.message });
  }
});

// Public route for countdown timer
router.get('/settings', async (req, res) => {
  try {
    const settings = await ElectionSettings.findOne();
    res.json(settings || {});
  } catch (error) {
    res.status(500).json({ message: 'Error fetching election settings.', error: error.message });
  }
});

// --- Results and Demographics ---
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