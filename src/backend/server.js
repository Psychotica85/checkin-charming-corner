
// This is a server implementation that would need to be run separately
// from the client-side application. In a production environment, you would
// host this on a server with access to MongoDB.

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
// In a real implementation, store these in .env files
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/guest-checkin';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Define Guest Schema
const guestSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  acceptedRules: {
    type: Boolean,
    required: true,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Guest = mongoose.model('Guest', guestSchema);

// Routes
app.post('/api/checkin', async (req, res) => {
  try {
    const { fullName, company, acceptedRules } = req.body;
    
    if (!fullName || !company || !acceptedRules) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bitte füllen Sie alle erforderlichen Felder aus.' 
      });
    }
    
    const guest = new Guest({
      fullName,
      company,
      acceptedRules
    });
    
    await guest.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Check-in erfolgreich gespeichert. Willkommen!' 
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ein Serverfehler ist aufgetreten.' 
    });
  }
});

app.get('/api/guests', async (req, res) => {
  try {
    const guests = await Guest.find().sort({ timestamp: -1 });
    res.json(guests);
  } catch (error) {
    console.error('Error fetching guests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ein Serverfehler ist aufgetreten.' 
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
