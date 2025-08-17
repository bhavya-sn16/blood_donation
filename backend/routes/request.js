// backend/routes/requests.js
const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Donor = require('../models/Donor');

// POST /api/v1/requests  -> create a request and return matching donors
router.post('/', async (req, res) => {
  try {
    const { patientName, bloodTypeNeeded, hospitalName, status } = req.body;

    // 1) create the request
    const request = await Request.create({
      patientName,
      bloodTypeNeeded,
      hospitalName,
      status
    });

    // 2) find matching donors (simple exact blood-type match)
    const matches = await Donor.find({ bloodType: bloodTypeNeeded })
      .select('name contactNumber email lastDonationDate bloodType')
      .sort({ lastDonationDate: -1 });

    // 3) return created request + matches
    return res.status(201).json({ request, matches });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// (optional) GET /api/v1/requests/:id/matches -> re-fetch matches later
router.get('/:id/matches', async (req, res) => {
  try {
    const reqDoc = await Request.findById(req.params.id);
    if (!reqDoc) return res.status(404).json({ error: 'request_not_found' });

    const matches = await Donor.find({ bloodType: reqDoc.bloodTypeNeeded })
      .select('name contactNumber email lastDonationDate bloodType')
      .sort({ lastDonationDate: -1 });

    res.json({ requestId: req.params.id, matches });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
