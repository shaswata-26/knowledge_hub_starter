const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");

// Load env vars
dotenv.config();
console.log("🚦 CORS_ORIGIN:", process.env.CORS_ORIGIN);

// Connect to database
connectDB();

const app = express();

// --- CORS Setup ---
app.use(cors({
  origin: process.env.CORS_ORIGIN || "https://knowledgehubmern.netlify.app/",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Handle preflight requests explicitly (optional but good for logging)
app.options("*", cors());

// JSON body parser
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});


// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working!",
    version: "1.0.0",
  });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/documents", require("./routes/documentRoutes"));

// Catch-all
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

