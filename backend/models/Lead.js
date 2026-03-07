const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  addedBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const followUpSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  note: { type: String },
  completed: { type: Boolean, default: false },
  addedBy: { type: String }
});

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    enum: ['website', 'referral', 'social_media', 'email', 'cold_call', 'other'],
    default: 'website'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  notes: [noteSchema],
  followUps: [followUpSchema],
  value: {
    type: Number,
    default: 0
  },
  tags: [String],
  message: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
