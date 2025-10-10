const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eligibleVoterSchema = new Schema({
  regNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    // Corrected Regex to match format 20XX/XXXXXX where X are all numbers
    match: [/^20\d{2}\/\d{6}$/, 'is not a valid registration number format (e.g., 2023/123456).']
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true,
});

const EligibleVoter = mongoose.model('EligibleVoter', eligibleVoterSchema);

module.exports = EligibleVoter;