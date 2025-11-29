const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for the latest location
let latestLocation = null;

// POST endpoint - Sender sends GPS data
app.post('/location', (req, res) => {
  const { latitude, longitude, speed, timestamp } = req.body;

  if (!latitude || !longitude || !timestamp) {
    return res.status(400).json({ 
      error: 'Missing required fields: latitude, longitude, timestamp' 
    });
  }

  latestLocation = {
    latitude,
    longitude,
    speed: speed || null,
    timestamp,
    receivedAt: Date.now()
  };

  console.log('Location received:', latestLocation);

  res.status(200).json({ 
    success: true, 
    message: 'Location stored successfully' 
  });
});

// GET endpoint - Receiver fetches the latest GPS data
app.get('/location', (req, res) => {
  if (!latestLocation) {
    return res.status(404).json({ 
      error: 'No location data available' 
    });
  }

  res.status(200).json(latestLocation);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`GPS Tracker server running on http://0.0.0.0:${PORT}`);
});
