const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eligibleVoterSchema = new Schema({
  regNumber: {
    type: String,
    required: true,
    trim: true,
    // Regex to match format 20XX/XXXXXX where X are all numbers
    match: [/^20\d{2}\/\d{6}$/, 'is not a valid registration number format (e.g., 2023/123456).']
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  classLevel: {
    type: String,
    required: true,
    enum: ['200L', '300L', '400L', '500L', '600L']
  }
}, {
  timestamps: true,
});

// Create a compound index to ensure the combination of regNumber and classLevel is unique
eligibleVoterSchema.index({ regNumber: 1, classLevel: 1 }, { unique: true });

const EligibleVoter = mongoose.model('EligibleVoter', eligibleVoterSchema);

module.exports = EligibleVoter;