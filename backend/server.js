const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 3) Health check route
app.get("/", (req, res) => {
  res.json({
    message: "Fake Profile Detector API",
    status: "OK",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// 4) Core API: check profile risk
app.post("/api/check-profile", (req, res) => {
  try {
    const { platform, username, stats } = req.body || {};

    if (!platform || !username || !stats) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        required: ["platform", "username", "stats"]
      });
    }

    const validPlatforms = ["instagram", "twitter", "facebook", "linkedin", "tiktok", "snapchat"];
    if (!validPlatforms.includes(platform.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: "Invalid platform",
        validPlatforms,
        received: platform
      });
    }

    const { followers = 0, following = 0, posts = 0, hasProfilePic = false } = stats;

    if (
      typeof followers !== "number" ||
      typeof following !== "number" ||
      typeof posts !== "number" ||
      followers < 0 ||
      following < 0 ||
      posts < 0
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid stats: followers, following, and posts must be non-negative numbers"
      });
    }

    const { riskScore, status, reasons } = calculateRisk({ followers, following, posts, hasProfilePic });

    res.status(201).json({
      success: true,
      data: { platform, username, riskScore, status, reasons, checkedAt: new Date().toISOString() }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// 10) Risk scoring logic
function calculateRisk({ followers, following, posts, hasProfilePic }) {
  let points = 0;
  const reasons = [];

  if (!hasProfilePic) points += 25, reasons.push("No profile picture");

  if (followers < 20 && following > 500) points += 30, reasons.push("Follows many accounts with very few followers");
  else if (followers < 50 && following > 1000) points += 35, reasons.push("Extremely high following with minimal followers");
  else if (followers < 100 && following > 2000) points += 40, reasons.push("Mass following behavior detected");

  if (followers === 0) points += 20, reasons.push("No followers");
  else if (followers < 10) points += 10, reasons.push("Very few followers (less than 10)");

  if (posts === 0) points += 20, reasons.push("No posts");
  else if (posts < 3) points += 15, reasons.push("Very few posts (less than 3)");
  else if (posts < 5) points += 10, reasons.push("Limited posts (less than 5)");

  if (following > 2000 && posts < 10) points += 15, reasons.push("High following count for a low-activity account");
  if (followers > 0 && following > 0 && followers === following && followers < 100) points += 10, reasons.push("Suspicious follower/following ratio (exactly equal)");

  const riskScore = Math.min(100, Math.max(0, points));

  let status = "Genuine";
  if (riskScore >= 70) status = "Fake";
  else if (riskScore >= 40) status = "Suspicious";

  if (reasons.length === 0) reasons.push("Profile appears normal");

  return { riskScore, status, reasons };
}

// 11) 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found", path: req.path, method: req.method });
});

// 12) Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// 14) Start server
app.listen(PORT, () => {
  console.log("\n".repeat(2));
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});