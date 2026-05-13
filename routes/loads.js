const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Load = require('../models/Load');

// Middleware to check DB connection
const checkDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      success: false, 
      message: 'Database is not connected. Please check Atlas IP whitelist (0.0.0.0/0).' 
    });
  }
  next();
};

// Post a new load
router.post('/', checkDB, async (req, res) => {
  try {
    const { ownerId, from, to, material, weight, vehicle, amount, notes, distance, ownerName, ownerPhone } = req.body;

    const newLoad = new Load({
      ownerId,
      ownerName,
      ownerPhone,
      from,
      to,
      material,
      weight,
      vehicle,
      amount,
      notes,
      distance
    });

    await newLoad.save();
    res.status(201).json({ success: true, message: 'Load posted successfully', load: newLoad });
  } catch (err) {
    console.error('Post Load Error:', err);
    res.status(500).json({ success: false, message: 'Failed to post load', error: err.message });
  }
});

// Get all loads (Filtering pending ones)
router.get('/', checkDB, async (req, res) => {
  try {
    const loads = await Load.find({ status: 'Pending' }).sort({ createdAt: -1 });
    res.json({ success: true, loads });
  } catch (err) {
    console.error('Get Loads Error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch loads' });
  }
});

// Driver Accepts a Load
router.put('/:id/accept', checkDB, async (req, res) => {
  try {
    const { driverId, driverName, driverPhone } = req.body;
    const loadId = req.params.id;

    const load = await Load.findById(loadId);
    if (!load) {
      return res.status(404).json({ success: false, message: 'Load not found' });
    }

    if (load.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Load is no longer available' });
    }

    load.status = 'Accepted';
    load.driverId = driverId;
    load.driverName = driverName;
    load.driverPhone = driverPhone;

    await load.save();
    res.json({ success: true, message: 'Load accepted successfully', load });
  } catch (err) {
    console.error('Accept Load Error:', err);
    res.status(500).json({ success: false, message: 'Failed to accept load' });
  }
});

// Delete a Load
router.delete('/:id', checkDB, async (req, res) => {
  try {
    const load = await Load.findByIdAndDelete(req.params.id);
    if (!load) {
      return res.status(404).json({ success: false, message: 'Load not found' });
    }
    res.json({ success: true, message: 'Load deleted successfully' });
  } catch (err) {
    console.error('Delete Load Error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete load' });
  }
});

// Get Loads by Owner ID
router.get('/owner/:ownerId', checkDB, async (req, res) => {
  try {
    const loads = await Load.find({ ownerId: req.params.ownerId }).sort({ createdAt: -1 });
    res.json({ success: true, loads });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch your loads' });
  }
});

// Get Loads by Driver ID
router.get('/driver/:driverId', checkDB, async (req, res) => {
  try {
    const loads = await Load.find({ driverId: req.params.driverId }).sort({ createdAt: -1 });
    res.json({ success: true, loads });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch accepted loads' });
  }
});

module.exports = router;
