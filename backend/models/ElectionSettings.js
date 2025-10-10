const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const electionSettingsSchema = new Schema({
  votingStartDate: {
    type: Date,
    required: true
  },
  votingEndDate: {
    type: Date,
    required: true
  },
  registrationEndDate: {
    type: Date,
    required: true,
  }
}, {
  timestamps: true,
});

const ElectionSettings = mongoose.model('ElectionSettings', electionSettingsSchema);

module.exports = ElectionSettings;