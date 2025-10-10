const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const voteSchema = new Schema({
  candidate: {
    type: Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  // Store demographic data for analysis, but no user ID to ensure anonymity.
  classLevel: {
    type: String,
    required: true,
    enum: ['100L', '200L', '300L', '400L', '500L', '600L']
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female']
  }
}, {
  timestamps: true,
});

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;