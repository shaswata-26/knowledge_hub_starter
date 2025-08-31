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

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (server-to-server, curl, health checks)
    if (!origin) return callback(null, true);
    
    console.log('🌐 Origin requesting access:', origin);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'https://knowledge-hub-starter-frontend.onrender.com',
      'https://knowledge-hub-starter.onrender.com',
      'https://knowledge-hub-backend.onrender.com'
    ];
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => 
      origin === allowedOrigin || origin.endsWith('.render.com')
    );
    
    if (isAllowed) {
      console.log('✅ Allowed origin:', origin);
      callback(null, true);
    } else {
      console.log('🚫 Blocked by CORS:', origin);
      callback(new Error(`Not allowed by CORS. Allowed origins: ${allowedOrigins.join(', ')}`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

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