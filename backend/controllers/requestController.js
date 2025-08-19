// backend/controllers/requestController.js
const Request = require('../models/Request');
const Donor   = require('../models/Donor');

/**
 * POST /api/v1/requests
 * Body: { patientName, bloodTypeNeeded, hospitalName, status }
 * Creates a Request, then returns donors that match the requested blood type.
 *
 * Response 201: { request, matches }
 * Response 400: { error: <message> }
 */
async function createRequestAndMatch(req, res) {
  try {
    const { patientName, bloodTypeNeeded, hospitalName, status } = req.body;

    // 1) create the request document
    const request = await Request.create({
      patientName,
      bloodTypeNeeded,
      hospitalName,
      status
    });

    // 2) find matching donors (exact blood type match)
    const matches = await Donor.find({ bloodType: bloodTypeNeeded })
      .select('name contactNumber email lastDonationDate bloodType')
      .sort({ lastDonationDate: -1 });

    // 3) return both the created request and the matches
    return res.status(201).json({ request, matches });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

module.exports = { createRequestAndMatch };
