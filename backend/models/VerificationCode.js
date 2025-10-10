const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const verificationCodeSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '10m', // The code will automatically be deleted after 10 minutes
  },
});

const VerificationCode = mongoose.model('VerificationCode', verificationCodeSchema);

module.exports = VerificationCode;