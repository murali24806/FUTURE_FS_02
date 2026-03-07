const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const { auth, adminOnly } = require('../middleware/auth');

// Get all leads
router.get('/', auth, async (req, res) => {
  try {
    const { status, source, priority, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (source) query.source = source;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    // Agents only see their assigned leads
    if (req.user.role === 'agent') {
      query.assignedTo = req.user._id;
    }

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ leads, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single lead
router.get('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email');
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create lead
router.post('/', auth, async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json(lead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update lead
router.put('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignedTo', 'name email');
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete lead (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add note to lead
router.post('/:id/notes', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    
    lead.notes.push({
      text: req.body.text,
      addedBy: req.user.name
    });
    await lead.save();
    res.json(lead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add follow-up
router.post('/:id/followups', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    
    lead.followUps.push({
      date: req.body.date,
      note: req.body.note,
      addedBy: req.user.name
    });
    await lead.save();
    res.json(lead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Complete follow-up
router.patch('/:id/followups/:fid', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    
    const followUp = lead.followUps.id(req.params.fid);
    if (!followUp) return res.status(404).json({ message: 'Follow-up not found' });
    
    followUp.completed = true;
    await lead.save();
    res.json(lead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Public endpoint for website contact form submissions
router.post('/public/submit', async (req, res) => {
  try {
    const { name, email, phone, company, message, source } = req.body;
    const lead = await Lead.create({
      name, email, phone, company, message,
      source: source || 'website',
      status: 'new'
    });
    res.status(201).json({ message: 'Thank you! We will contact you soon.', id: lead._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
