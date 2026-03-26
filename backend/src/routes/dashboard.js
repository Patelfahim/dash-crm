const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Lead = require('../models/Lead');
const Task = require('../models/Task');
const User = require('../models/User');

// @route   GET /api/dashboard/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const totalLeads = await Lead.count();
    const hotLeads = await Lead.count({ where: { status: 'Hot' } });
    const tasksToday = await Task.count({ where: { status: 'Pending' } });
    
    // Calculate total revenue from Lead values (basic extraction)
    const allLeads = await Lead.findAll();
    const totalRevenue = allLeads.reduce((acc, lead) => {
      const val = parseInt(lead.value.replace(/[^0-9]/g, '')) || 0;
      return acc + val;
    }, 0);

    res.json({
      success: true,
      data: {
        totalLeads,
        hotLeads,
        tasksToday,
        revenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
        conversionRate: totalLeads > 0 ? `${Math.round((hotLeads/totalLeads)*100)}%` : '0%',
        activePipeline: `₹${(totalRevenue * 0.4).toLocaleString('en-IN')}` // Dummy calculation for pipeline
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- LEADS CRUD ---

router.get('/leads', protect, async (req, res) => {
  try {
    const leads = await Lead.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: leads, total: leads.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/leads', protect, async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json({ success: true, data: lead });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/leads/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    await lead.update(req.body);
    res.json({ success: true, data: lead });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/leads/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    await lead.destroy();
    res.json({ success: true, message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- TASKS CRUD ---

router.get('/tasks', protect, async (req, res) => {
  try {
    const tasks = await Task.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: tasks, total: tasks.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/tasks', protect, async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/tasks/:id', protect, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    await task.update(req.body);
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/tasks/:id', protect, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    await task.destroy();
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- USERS (Read Only for now) ---
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json({ success: true, data: users, total: users.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
