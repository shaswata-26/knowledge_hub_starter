const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// // Middleware
// app.use(cors({
//   origin: true, // Your Vite frontend URL
//   credentials: true
// }));

app.use(cors({
  origin: 'https://knowledge-hub-starter-frontend.onrender.com',
  credentials: true
}));


// Add debug middleware to see all requests
app.use((req, res, next) => {
  console.log('📨 Request:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin || 'no-origin',
    headers: req.headers
  });
  next();
});

// Handle CORS errors gracefully
app.use((err, req, res, next) => {
  if (err.message.includes('CORS')) {
    console.log('🛑 CORS Error:', err.message);
    return res.status(403).json({
      error: 'CORS policy violation',
      message: err.message,
      allowedOrigins: [
        'http://localhost:5173',
        'https://knowledge-hub-starter-frontend.onrender.com',
        'https://knowledge-hub-starter.onrender.com',
        '*.render.com'
      ]
    });
  }
  next(err);
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