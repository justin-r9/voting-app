const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  regNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  classLevel: {
    type: String,
    required: true,
    enum: ['100L', '200L', '300L', '400L', '500L', '600L']
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female']
  },
  age: {
    type: Number,
    required: true
  },
  hasVoted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;