import io
import json
from pathlib import Path

import numpy as np
import tensorflow as tf

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError


# --------------------------------------------------
# 1. Paths and configuration
# --------------------------------------------------

PROJECT_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = PROJECT_DIR / "model" / "plant_disease_model.keras"
CLASS_NAMES_PATH = PROJECT_DIR / "model" / "class_names.json"

IMAGE_SIZE = (224, 224)
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

# --------------------------------------------------
# 2. Load the model and class names
# --------------------------------------------------

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

if not CLASS_NAMES_PATH.exists():
    raise FileNotFoundError(
        f"Class names file not found: {CLASS_NAMES_PATH}"
    )

print("Loading PlantCare model...")

model = tf.keras.models.load_model(MODEL_PATH)

with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as file:
    class_names = json.load(file)

print("PlantCare model loaded successfully!")


# --------------------------------------------------
# 3. Create the FastAPI application
# --------------------------------------------------

app = FastAPI(
    title="PlantCare API",
    description="Plant disease image classification API",
    version="1.0.0",
)

# Allow the frontend to connect during local development.
# Restrict this to your actual frontend origin before deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# --------------------------------------------------
# 4. Health-check endpoint
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Welcome to PlantCare API",
        "status": "running",
        "number_of_classes": len(class_names),
    }


# --------------------------------------------------
# 5. Prediction endpoint
# --------------------------------------------------

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    # Check the uploaded file type
    if file.content_type not in [
        "image/jpeg",
        "image/png",
        "image/webp",
    ]:
        raise HTTPException(
            status_code=415,
            detail="Please upload a JPG, PNG, or WEBP image.",
        )

    # Read a limited amount of data
    contents = await file.read(MAX_FILE_SIZE + 1)

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Image is too large. Maximum size is 10 MB.",
        )

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    # Decode the uploaded image safely
    try:
        with Image.open(io.BytesIO(contents)) as image:
            image.verify()

        with Image.open(io.BytesIO(contents)) as image:
            image = image.convert("RGB")
            image = image.resize(IMAGE_SIZE)

            image_array = np.asarray(
                image,
                dtype=np.float32,
            )

    except (
        UnidentifiedImageError,
        OSError,
        ValueError,
    ):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid image.",
        )

    # Prepare input for MobileNetV2
    image_array = np.expand_dims(image_array, axis=0)

    # Run prediction
    predictions = model.predict(
        image_array,
        verbose=0,
    )[0]

    top_indices = np.argsort(predictions)[-3:][::-1]

    results = []

    for index in top_indices:
        results.append({
            "class_name": class_names[int(index)],
            "score": round(float(predictions[index]), 6),
            "score_percent": round(
                float(predictions[index]) * 100,
                2,
            ),
        })

    return {
        "filename": file.filename,
        "predictions": results,
        "note": (
            "Model scores are not guaranteed probabilities "
            "of a correct diagnosis. Confirm results with "
            "additional evidence or an agricultural expert."
        ),
    }