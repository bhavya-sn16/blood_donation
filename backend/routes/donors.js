// backend/routes/donors.js
const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');

// GET /api/v1/donors  -> list donors
router.get('/', async (req, res) => {
  try {
    const donors = await Donor.find().sort({ createdAt: -1 });
    res.json(donors);
  } catch (err) {
    res.status(500).json({ error: 'failed_to_list' });
  }
});

// POST /api/v1/donors -> create donor
router.post('/', async (req, res) => {
  try {
    const donor = await Donor.create(req.body);
    res.status(201).json(donor);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Email already exists' });
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
