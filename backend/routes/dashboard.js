const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

router.get('/stats', auth, async (req, res) => {
  try {
    const query = req.user.role === 'agent' ? { assignedTo: req.user._id } : {};

    const [
      totalLeads,
      newLeads,
      contactedLeads,
      qualifiedLeads,
      convertedLeads,
      lostLeads,
      totalAgents,
      recentLeads,
      leadsBySource,
      monthlyLeads
    ] = await Promise.all([
      Lead.countDocuments(query),
      Lead.countDocuments({ ...query, status: 'new' }),
      Lead.countDocuments({ ...query, status: 'contacted' }),
      Lead.countDocuments({ ...query, status: 'qualified' }),
      Lead.countDocuments({ ...query, status: 'converted' }),
      Lead.countDocuments({ ...query, status: 'lost' }),
      User.countDocuments({ role: 'agent', isActive: true }),
      Lead.find(query).sort({ createdAt: -1 }).limit(5).select('name email status source createdAt'),
      Lead.aggregate([
        { $match: query },
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Lead.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 }
      ])
    ]);

    res.json({
      totals: { totalLeads, newLeads, contactedLeads, qualifiedLeads, convertedLeads, lostLeads, totalAgents },
      recentLeads,
      leadsBySource,
      monthlyLeads: monthlyLeads.reverse()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
