const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
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

// 1. Create a new load
// POST /api/loads/create
router.post('/create', checkDB, async (req, res) => {
  console.log('--- Create Load Request ---');
  try {
    const { userId, fullName, phone, fromLocation, toLocation, truckType, material, price, weight, notes, distance } = req.body;

    if (!userId || !fromLocation || !toLocation || !price) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newLoad = new Load({
      userId,
      fullName,
      phone,
      fromLocation,
      toLocation,
      truckType,
      material,
      price,
      weight,
      notes,
      distance,
      status: 'pending' // Force default
    });

    await newLoad.save();
    console.log('✅ Load Created:', newLoad._id);
    res.status(201).json({ success: true, message: 'Load posted successfully', load: newLoad });
  } catch (err) {
    console.error('Create Load Error:', err);
    res.status(500).json({ success: false, message: 'Failed to create load', error: err.message });
  }
});

// 2. Fetch My Loads (Filtered by userId)
// GET /api/loads/my-loads/:userId
router.get('/my-loads/:userId', checkDB, async (req, res) => {
  try {
    const loads = await Load.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, loads });
  } catch (err) {
    console.error('Fetch My Loads Error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch your loads' });
  }
});

// 3. Update Load Status
// PUT /api/loads/status/:loadId
router.put('/status/:loadId', checkDB, async (req, res) => {
  try {
    const { status, driverId, driverName, driverPhone } = req.body;
    const loadId = req.params.loadId;

    const updateData = { status };
    if (driverId) updateData.driverId = driverId;
    if (driverName) updateData.driverName = driverName;
    if (driverPhone) updateData.driverPhone = driverPhone;

    const load = await Load.findByIdAndUpdate(loadId, updateData, { new: true });
    
    if (!load) {
      return res.status(404).json({ success: false, message: 'Load not found' });
    }

    console.log(`✅ Load ${loadId} status updated to: ${status}`);
    res.json({ success: true, message: `Load ${status} successfully`, load });
  } catch (err) {
    console.error('Update Status Error:', err);
    res.status(500).json({ success: false, message: 'Failed to update load status' });
  }
});

// 4. Get all pending loads (For Drivers)
// GET /api/loads
router.get('/', checkDB, async (req, res) => {
  try {
    const loads = await Load.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json({ success: true, loads });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch loads' });
  }
});

// 5. Get Loads by Driver ID
// GET /api/loads/driver/:driverId
router.get('/driver/:driverId', checkDB, async (req, res) => {
  try {
    const loads = await Load.find({ driverId: req.params.driverId }).sort({ createdAt: -1 });
    res.json({ success: true, loads });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch accepted loads' });
  }
});

module.exports = router;
