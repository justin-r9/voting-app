const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const candidateSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: Schema.Types.ObjectId,
    ref: 'Position',
    required: true
  },
  photoUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
});

const Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = Candidate;