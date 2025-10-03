require('dotenv').config();                 // load .env first
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

mongoose.set('strictQuery', false);         // silence warning

const app = express();
app.use(cors());
app.use(express.json());

// --- Mongo connection ---
const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('❌ MONGO_URI missing. Create backend/.env and set MONGO_URI=');
  process.exit(1);
}
mongoose.connect(uri, { autoIndex: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// health check (optional)
app.get('/api/health', (req, res) => res.send('ok'));

// routes
app.use('/api/v1/donors', require('./routes/donors'));

app.use('/api/v1/request', require('./routes/requests'));
console.log('Mounted /api/v1/requests');
app.use('/api/v1/requests', require('./routes/requests')); // <- use the single-file router


const PORT = process.env.PORT || 5001;
app.post('/api/v1/request', (req, res) => res.json({ ok: true, echo: req.body }));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));