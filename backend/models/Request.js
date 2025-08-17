const mongoose = require('mongoose');

const bloodTypes = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const statusEnum = ['URGENT', 'NOT_URGENT'];

const RequestSchema = new mongoose.Schema({
  patientName:     { type: String, required: true, trim: true },
  bloodTypeNeeded: { type: String, required: true, enum: bloodTypes },
  hospitalName:    { type: String, required: true, trim: true },
  status:          { type: String, enum: statusEnum, default: 'URGENT' }
}, { timestamps: true });

module.exports = mongoose.model('Request', RequestSchema);
module.exports.bloodTypes = bloodTypes;
module.exports.statusEnum = statusEnum;
