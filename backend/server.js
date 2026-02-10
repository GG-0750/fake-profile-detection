const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");

const app = express();
// Use 5000 as default, but allow environment variables
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 1) Health check route
app.get("/", (req, res) => {
  res.json({
    message: "Fake Profile Detector API",
    status: "ML Connected",
    version: "1.2.0",
    timestamp: new Date().toISOString()
  });
});

// 2) Core API: Predict using the ML Model
app.post("/api/check-profile", (req, res) => {
  try {
    const { platform, username, stats } = req.body || {};

    // Validate Input
    if (!stats || typeof stats !== 'object') {
      return res.status(400).json({ success: false, error: "Missing profile stats" });
    }

    /**
     * CRITICAL: Feature Mapping
     * This array matches your 95% accuracy model training order.
     * Do not change this order.
     */
    const featureOrder = [
      stats.edge_followed_by || 0,     // 1
      stats.edge_follow || 0,          // 2
      stats.username_length || 0,      // 3
      stats.username_has_number || 0,   // 4
      stats.full_name_has_number || 0, // 5
      stats.full_name_length || 0,     // 6
      stats.is_private || 0,           // 7
      stats.is_joined_recently || 0,   // 8
      stats.has_channel || 0,          // 9
      stats.is_business_account || 0,  // 10
      stats.has_guides || 0,           // 11
      stats.has_external_url || 0      // 12
    ];

    // Use absolute path to ensure Python finds the script regardless of where you start the server
    const pythonScript = path.resolve(__dirname, "../ml/predict.py");

    // Spawn Python Process
    // Passing featureOrder mapped to Strings as command line arguments
    const pythonProcess = spawn("python", [pythonScript, ...featureOrder.map(String)]);

    let resultData = "";
    let errorData = "";

    pythonProcess.stdout.on("data", (data) => {
      resultData += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorData += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("ML Error Output:", errorData);
        return res.status(500).json({ 
          success: false, 
          error: "ML Model execution failed",
          details: errorData 
        });
      }

      // Parse the "pred|conf" string from predict.py
      const output = resultData.trim().split("|");
      
      if (output.length < 2) {
        return res.status(500).json({ success: false, error: "Invalid ML output format" });
      }

      const prediction = parseFloat(output[0]); // 1.0 = Fake, 0.0 = Genuine
      const confidence = parseFloat(output[1]);

      res.status(200).json({
        success: true,
        data: {
          platform: platform || "Instagram",
          username: username || "Unknown",
          isFake: prediction === 1.0,
          riskScore: (confidence * 100).toFixed(2), // 0 to 100%
          status: prediction === 1.0 ? "Fake" : "Genuine",
          checkedAt: new Date().toISOString()
        }
      });
    });

  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// 3) 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// 4) Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Backend integrated with ML!`);
  console.log(`📡 API is live at http://localhost:${PORT}`);
  console.log(`📂 ML Script Path: ${path.resolve(__dirname, "../ml/predict.py")}`);
});