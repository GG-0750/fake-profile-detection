import sys
import os
import joblib
import numpy as np

# 1. Dynamically find the path to the model file
# This gets the directory where predict.py is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "fake_detector.pkl")

try:
    # 2. Load the trained model using the absolute path
    model = joblib.load(MODEL_PATH)
except FileNotFoundError:
    print(f"Error: Model file not found at {MODEL_PATH}")
    sys.exit(1)
except Exception as e:
    print(f"Error loading model: {str(e)}")
    sys.exit(1)

def predict():
    # 3. Check if we received the correct number of features (12)
    # sys.argv[0] is the script name, so we need 13 arguments total
    if len(sys.argv) < 13:
        print("Error: Expected 12 features as arguments")
        sys.exit(1)

    try:
        # 4. Get features from command line arguments
        features = [float(x) for x in sys.argv[1:]]
        features_array = np.array(features).reshape(1, -1)

        # 5. Predict
        # pred: 0.0 (Genuine) or 1.0 (Fake)
        # conf: probability of the positive class (Fake)
        pred = model.predict(features_array)[0]
        
        # Get probability (handling cases where model might not support predict_proba)
        if hasattr(model, "predict_proba"):
            conf = model.predict_proba(features_array)[0][1]
        else:
            conf = 1.0 if pred == 1.0 else 0.0

        # 6. Output for backend (Node.js reads this via stdout)
        # Format: prediction|confidence
        print(f"{pred}|{conf:.4f}")

    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    predict()