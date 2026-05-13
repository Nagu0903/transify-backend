const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Load = require('../models/Load');

// Middleware to check DB connection
const checkDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      success: false, 
      message: 'Database is not connected.' 
    });
  }
  next();
};

// 1. Get Admin Dashboard Statistics
// GET /api/admin/stats
router.get('/stats', checkDB, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDrivers = await User.countDocuments({ role: 'Driver' });
    const totalLoadOwners = await User.countDocuments({ role: 'Load Owner' });
    
    const totalLoads = await Load.countDocuments();
    const pendingLoads = await Load.countDocuments({ status: 'pending' });
    const acceptedLoads = await Load.countDocuments({ status: 'accepted' });
    const completedLoads = await Load.countDocuments({ status: 'completed' });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalDrivers,
        totalLoadOwners,
        totalLoads,
        pendingLoads,
        acceptedLoads,
        completedLoads
      }
    });
  } catch (err) {
    console.error('Admin Stats Error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
  }
});

// 2. Get All Users
// GET /api/admin/users
router.get('/users', checkDB, async (req, res) => {
  try {
    const users = await User.find({ role: 'Load Owner' }).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// 3. Get All Drivers
// GET /api/admin/drivers
router.get('/drivers', checkDB, async (req, res) => {
  try {
    const drivers = await User.find({ role: 'Driver' }).sort({ createdAt: -1 });
    res.json({ success: true, drivers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch drivers' });
  }
});

// 4. Get All Loads
// GET /api/admin/loads
router.get('/loads', checkDB, async (req, res) => {
  try {
    const loads = await Load.find().sort({ createdAt: -1 });
    res.json({ success: true, loads });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch loads' });
  }
});

module.exports = router;
