import pandas as pd
import joblib # To save the model
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix

# 1. Load the balanced dataset
# Make sure the filename matches exactly
df = pd.read_csv('ml/final-v1.csv') 

# 2. Separate Features and Target
X = df.drop('is_fake', axis=1)
y = df['is_fake']

# 3. Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Train the Model
print("Training the model...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 5. Evaluate (Check if it's still biased!)
predictions = model.predict(X_test)
print("\n--- Model Performance ---")
print(confusion_matrix(y_test, predictions))
print(classification_report(y_test, predictions))

# 6. Save the model to the ml/ folder
joblib.dump(model, 'ml/fake_detector.pkl')
print("\nSuccess: Model saved as fake_detector.pkl")