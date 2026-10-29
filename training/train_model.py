import json
from pathlib import Path

import tensorflow as tf

# --------------------------------------------------
# 1. Project paths and settings
# --------------------------------------------------

PROJECT_DIR = Path(__file__).resolve().parent.parent

DATASET_DIR = (
    PROJECT_DIR
    / "dataset"
    / "plantvillage_dataset"
    / "color"
)

MODEL_DIR = PROJECT_DIR / "model"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
SEED = 42
VALIDATION_SPLIT = 0.20

# Keep training reproducible
tf.keras.utils.set_random_seed(SEED)

print("TensorFlow version:", tf.__version__)
print("Dataset directory:", DATASET_DIR)
print("Model directory:", MODEL_DIR)

if not DATASET_DIR.exists():
    raise FileNotFoundError(
        f"Dataset folder not found: {DATASET_DIR}"
    )

# --------------------------------------------------
# 2. Load images from all 38 class folders
# --------------------------------------------------

print("\nLoading dataset...")

train_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    validation_split=VALIDATION_SPLIT,
    subset="training",
    seed=SEED,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="int",
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    validation_split=VALIDATION_SPLIT,
    subset="validation",
    seed=SEED,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="int",
)

class_names = train_ds.class_names
num_classes = len(class_names)

print("\nNumber of classes:", num_classes)

for index, class_name in enumerate(class_names):
    print(f"{index}: {class_name}")

# Save the exact label order for future predictions
class_names_path = MODEL_DIR / "class_names.json"

with open(class_names_path, "w", encoding="utf-8") as file:
    json.dump(class_names, file, indent=4, ensure_ascii=False)

# --------------------------------------------------
# 3. Optimize dataset input processing
# --------------------------------------------------

AUTOTUNE = tf.data.AUTOTUNE

train_ds = train_ds.prefetch(AUTOTUNE)
val_ds = val_ds.prefetch(AUTOTUNE)

# --------------------------------------------------
# 4. Load the pretrained MobileNetV2 model
# --------------------------------------------------

print("\nLoading MobileNetV2...")

base_model = tf.keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet",
)

# Freeze pretrained layers initially
base_model.trainable = False

# --------------------------------------------------
# 5. Build our plant disease classifier
# --------------------------------------------------

inputs = tf.keras.Input(shape=(224, 224, 3))

# MobileNetV2 expects pixel values scaled to [-1, 1]
x = tf.keras.applications.mobilenet_v2.preprocess_input(inputs)

x = base_model(x, training=False)

x = tf.keras.layers.GlobalAveragePooling2D()(x)

x = tf.keras.layers.Dropout(0.2)(x)

outputs = tf.keras.layers.Dense(
    num_classes,
    activation="softmax",
    name="disease_predictions",
)(x)

model = tf.keras.Model(inputs, outputs)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)

model.summary()

# --------------------------------------------------
# 6. Save the best model during training
# --------------------------------------------------

model_path = MODEL_DIR / "plant_disease_model.keras"

callbacks = [
    tf.keras.callbacks.ModelCheckpoint(
        filepath=str(model_path),
        monitor="val_accuracy",
        save_best_only=True,
        verbose=1,
    ),
    tf.keras.callbacks.EarlyStopping(
        monitor="val_accuracy",
        patience=3,
        restore_best_weights=True,
        verbose=1,
    ),
]

# --------------------------------------------------
# 7. Train the classifier
# --------------------------------------------------

print("\nStarting training...")

history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=10,
    callbacks=callbacks,
)

# Save the final model state as well
final_model_path = MODEL_DIR / "plant_disease_model_final.keras"
model.save(final_model_path)

print("\nTraining completed!")
print("Best model:", model_path)
print("Final model:", final_model_path)
print("Class names:", class_names_path)