
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const movieRoutes = require("./routes/movieRoutes");
const userRoutes = require("./routes/userRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const adminAiRoutes = require("./routes/adminAiRoutes");
const supportChatRoutes = require("./routes/supportChatRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// General middleware
app.use(cors());
app.use(express.json());

// Serve uploaded poster, banner and video files
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    acceptRanges: true,
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();

      const contentTypes = {
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".mov": "video/quicktime",
        ".m4v": "video/mp4",
        ".mkv": "video/x-matroska",
        ".avi": "video/x-msvideo",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
      };

      const contentType = contentTypes[ext];

      if (contentType) {
        res.setHeader("Content-Type", contentType);
      }
    },
  })
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// Support chat routes
app.use("/api/support", supportChatRoutes);

// Admin AI route
app.use("/api/admin-ai", adminAiRoutes);

// Backend health check
app.get("/", (req, res) => {
  res.status(200).send("Apex Backend is running!");
});

// Handle unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    message: "API route not found",
  });
});

// General error handler
app.use((err, req, res, next) => {
  console.error("Backend error:", err);

  if (res.headersSent) {
    return next(err);
  }

  if (err.name === "MulterError") {
    return res.status(400).json({
      message: `Upload error: ${err.message}`,
    });
  }

  return res.status(500).json({
    message: err.message || "Internal server error",
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
