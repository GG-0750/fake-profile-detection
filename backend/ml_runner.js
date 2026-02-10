const { spawn } = require("child_process");
const path = require("path");

/**
 * Executes the Python prediction script with the provided profile data.
 * @param {Object} profileData - The raw data object from the frontend.
 * @returns {Promise<Object>} - The prediction result and confidence score.
 */
const predictProfile = (profileData) => {
  return new Promise((resolve, reject) => {
    // 1. Resolve the absolute path to predict.py
    const scriptPath = path.join(__dirname, "../ml/predict.py");

    // 2. Map object keys to the EXACT order used in your final-v1.csv training
    // If the order here is different from the CSV, your accuracy will drop to 0.
    const orderedFeatures = [
      profileData.edge_followed_by,     // 1. Followers
      profileData.edge_follow,          // 2. Following
      profileData.username_length,      // 3. Length of username
      profileData.username_has_number,   // 4. Numbers in username (0 or 1)
      profileData.full_name_has_number, // 5. Numbers in full name (0 or 1)
      profileData.full_name_length,     // 6. Length of full name
      profileData.is_private,           // 7. Private account (0 or 1)
      profileData.is_joined_recently,   // 8. New account (0 or 1)
      profileData.has_channel,          // 9. Has IG channel (0 or 1)
      profileData.is_business_account,  // 10. Business account (0 or 1)
      profileData.has_guides,           // 11. Has guides (0 or 1)
      profileData.has_external_url      // 12. External link (0 or 1)
    ];

    // 3. Convert all values to strings to be passed as command line arguments
    // Use "0" as a fallback for any missing values
    const stringArgs = orderedFeatures.map((val) => String(val ?? 0));

    // 4. Spawn the Python process
    // NOTE: If 'python' doesn't work, try 'python3'
    const pythonProcess = spawn("python", [scriptPath, ...stringArgs]);

    let result = "";
    let errorData = "";

    // 5. Capture standard output (the pred|conf string)
    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    // 6. Capture any errors from Python
    pythonProcess.stderr.on("data", (data) => {
      errorData += data.toString();
    });

    // 7. Handle process completion
    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error(`ML script failed with code ${code}: ${errorData}`);
        return reject(new Error("Machine Learning prediction failed."));
      }

      try {
        // Parse the "0|0.985" or "1|0.124" output from predict.py
        const output = result.trim();
        const [prediction, confidence] = output.split("|");

        resolve({
          isFake: prediction === "1.0",
          confidence: parseFloat(confidence),
          status: "success"
        });
      } catch (err) {
        reject(new Error("Failed to parse ML output."));
      }
    });
  });
};

module.exports = { predictProfile };