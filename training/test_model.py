import json
from pathlib import Path

import numpy as np
import tensorflow as tf
from tensorflow.keras.utils import load_img, img_to_array

# Project paths
PROJECT_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = PROJECT_DIR / "model" / "plant_disease_model.keras"
CLASS_NAMES_PATH = PROJECT_DIR / "model" / "class_names.json"

IMAGE_SIZE = (224, 224)

# Check that required files exist
if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

if not CLASS_NAMES_PATH.exists():
    raise FileNotFoundError(
        f"Class names not found: {CLASS_NAMES_PATH}"
    )

# Load model and class labels
print("Loading trained model...")
model = tf.keras.models.load_model(MODEL_PATH)

with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as file:
    class_names = json.load(file)

print("Model loaded successfully!")
print("Number of classes:", len(class_names))

# Ask for an image path
image_path = input(
    "\nEnter the full path of a leaf image: "
).strip().strip('"')

image_path = Path(image_path)

if not image_path.is_file():
    raise FileNotFoundError(f"Image not found: {image_path}")

# Load and prepare image
image = load_img(
    image_path,
    target_size=IMAGE_SIZE,
    color_mode="rgb",
)

image_array = img_to_array(image)
image_array = np.expand_dims(image_array, axis=0)

# Predict
print("\nAnalyzing image...")

predictions = model.predict(image_array, verbose=0)[0]

# Show the three highest-scoring classes
top_indices = np.argsort(predictions)[-3:][::-1]

print("\n========== PREDICTION RESULTS ==========")

for rank, index in enumerate(top_indices, start=1):
    print(
        f"{rank}. {class_names[index]}: "
        f"{predictions[index] * 100:.2f}%"
    )

print("========================================")
print(
    "Note: These scores are model confidence scores, "
    "not guaranteed probabilities of a correct diagnosis."
)