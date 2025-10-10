const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const VerificationCode = require('../models/VerificationCode');
const ElectionSettings = require('../models/ElectionSettings');

const generateCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// @route   POST /api/voting/initiate-vote
// @desc    Initiate the voting process for a logged-in user
// @access  Private
router.post('/initiate-vote', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.hasVoted) return res.status(400).json({ message: 'You have already voted.' });

    const settings = await ElectionSettings.findOne();
    const now = new Date();
    if (!settings || now < settings.votingStartDate || now > settings.votingEndDate) {
      return res.status(400).json({ message: 'Voting is not currently open.' });
    }

    let code;
    let isCodeUnique = false;
    while (!isCodeUnique) {
      code = generateCode();
      const existingCode = await VerificationCode.findOne({ code });
      if (!existingCode) isCodeUnique = true;
    }

    const verificationCode = new VerificationCode({ code, user: user.id });
    await verificationCode.save();

    user.hasVoted = true;
    await user.save();

    // TODO: Send code via WhatsApp API. For now, returning for testing.
    res.json({
      message: 'Verification code generated. Please check your WhatsApp.',
      verificationCode: code
    });

  } catch (error) {
    console.error('Error initiating vote:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// @route   POST /api/voting/cast-vote
// @desc    Cast a vote using a verification code
// @access  Public
router.post('/cast-vote', async (req, res) => {
  const { code, candidateId } = req.body;

  try {
    // 1. Find and validate the verification code
    const verificationCode = await VerificationCode.findOne({ code }).populate('user');
    if (!verificationCode) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    // 2. Retrieve candidate to get their position
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
        return res.status(404).json({ message: 'Selected candidate not found.' });
    }

    // 3. Create the anonymous vote
    const { classLevel, gender } = verificationCode.user;
    const newVote = new Vote({
      candidate: candidateId,
      position: candidate.position,
      classLevel,
      gender,
    });
    await newVote.save();

    // 4. Delete the verification code to ensure it's single-use
    await VerificationCode.deleteOne({ _id: verificationCode._id });

    res.status(201).json({ message: 'Your vote has been cast successfully! Thank you for participating.' });

  } catch (error) {
    console.error('Error casting vote:', error);
    res.status(500).json({ message: 'Server error during vote casting.', error: error.message });
  }
});

module.exports = router;