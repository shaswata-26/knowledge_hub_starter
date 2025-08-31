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
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://knowledge-hub-starter-frontend.onrender.com");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  console.log("Request received:", req.method, req.url);

  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // handle preflight
  }

  next();
});
// JSON body parser
app.use(express.json());

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
