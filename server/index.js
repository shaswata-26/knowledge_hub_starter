const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));



// Detailed request logging
app.use((req, res, next) => {
  console.log('📨 Request Details:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    origin: req.headers.origin || 'no-origin',
    'user-agent': req.headers['user-agent'] || 'unknown',
    authorization: req.headers.authorization ? 'present' : 'missing'
  });
  
  // Log full headers for OPTIONS requests
  if (req.method === 'OPTIONS') {
    console.log('🛬 Preflight Headers:', req.headers);
  }
  
  next();
});
app.use(express.json());




app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint - ADD THIS
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    version: '1.0.0'
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Knowledge Hub API' });

});


app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});