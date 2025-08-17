const mongoose = require('mongoose');

const bloodTypes = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

const DonorSchema = new mongoose.Schema({
  name:   { type: String, required: true, trim: true },
  gender: { type: String, enum: ['Male','Female','Other','Prefer not to say'], required: true },
  age:    { type: Number, required: true, min: 18, max: 65 },  // tweak limits if you like
  address:{ type: String, required: true, trim: true },
  email:  { type: String, required: true, trim: true, lowercase: true, unique: true },
  contactNumber: { type: String, required: true, trim: true },
  bloodType: { type: String, required: true, enum: bloodTypes },
  lastDonationDate: { type: Date } // optional; mongoose will cast "YYYY-MM-DD" to Date
}, { timestamps: true });

DonorSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Donor', DonorSchema);
module.exports.bloodTypes = bloodTypes;
