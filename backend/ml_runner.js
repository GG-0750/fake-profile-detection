const { spawn } = require("child_process");
const path = require("path");

const predictProfile = (features) => {
  return new Promise((resolve, reject) => {
    // Ensure the path points to your predict.py
    const scriptPath = path.join(__dirname, "../ml/predict.py");
    
    // Calls: python ../ml/predict.py feat1 feat2 ...
    const pythonProcess = spawn("python", [scriptPath, ...features]);

    let result = "";
    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        reject("ML process failed");
      } else {
        // Splitting the "pred|conf" output from your predict.py
        const [prediction, confidence] = result.trim().split("|");
        resolve({
          isFake: prediction === "1.0",
          confidence: parseFloat(confidence)
        });
      }
    });
  });
};

module.exports = { predictProfile };