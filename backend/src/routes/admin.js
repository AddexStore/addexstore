const express = require('express');
const router = express.Router();
const {
  getDashboard, getAnalytics, getInventory, updateStock, bulkUpdateStock
} = require('../controllers/adminController');
const Settings = require('../models/Settings');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/dashboard', protect, adminOnly, getDashboard);
router.get('/analytics', protect, adminOnly, getAnalytics);
router.get('/inventory', protect, adminOnly, getInventory);
router.put('/inventory/:id', protect, adminOnly, updateStock);
router.put('/inventory/bulk', protect, adminOnly, bulkUpdateStock);

router.get('/settings', protect, adminOnly, async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ settings });
  } catch (error) {
    next(error);
  }
});

router.put('/settings', protect, adminOnly, async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.json({ settings });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
