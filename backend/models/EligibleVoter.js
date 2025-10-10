const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eligibleVoterSchema = new Schema({
  regNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/20\d{2}\/[A-Z]{3}\d{3}/, 'is not a valid registration number.']
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