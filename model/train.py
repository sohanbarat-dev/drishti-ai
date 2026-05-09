import numpy as np
import pandas as pd
import tensorflow as tf
import cv2
import os
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, f1_score
from tensorflow.keras.applications import EfficientNetB3
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint

print(f"TensorFlow: {tf.__version__}")
print(f"GPU: {len(tf.config.list_physical_devices('GPU')) > 0}")

# ── Config ───────────────────────────────────
DATA_DIR = 'data/train_images'
CSV_PATH = 'data/train.csv'
IMG_SIZE = 224
BATCH_SIZE = 16
EPOCHS_PHASE1 = 15
EPOCHS_PHASE2 = 25
MODEL_SAVE_PATH = 'drishti_model.keras'

# ── Preprocessing ────────────────────────────
def crop_image_from_gray(img, tol=7):
    if img.ndim == 2:
        mask = img > tol
        return img[np.ix_(mask.any(1), mask.any(0))]
    elif img.ndim == 3:
        gray_img = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
        mask = gray_img > tol
        if mask.any():
            img = img[np.ix_(mask.any(1), mask.any(0))]
        return img
    return img

def ben_graham_preprocess(image, sigmaX=10):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = cv2.resize(image, (IMG_SIZE, IMG_SIZE))
    image = cv2.addWeighted(
        image, 4,
        cv2.GaussianBlur(image, (0, 0), sigmaX), -4,
        128
    )
    return image

def load_and_preprocess(image_path):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Could not load: {image_path}")
    image = crop_image_from_gray(image)
    image = ben_graham_preprocess(image)
    image = preprocess_input(image.astype(np.float32))
    return image

# ── Load Dataset ─────────────────────────────
print("\nLoading dataset...")
df = pd.read_csv(CSV_PATH)

def remap_label(label):
    if label == 0: return 0
    elif label in [1, 2]: return 1
    else: return 2

df['new_label'] = df['diagnosis'].apply(remap_label)

train_df, val_df = train_test_split(
    df, test_size=0.2, random_state=42,
    stratify=df['new_label']
)

print(f"Train: {len(train_df)} | Val: {len(val_df)}")

# ── tf.data Pipeline ─────────────────────────
def load_image_label(image_path, label):
    def _load(path, lbl):
        path = path.numpy().decode('utf-8')
        img = load_and_preprocess(path)
        return img, lbl
    image, label = tf.py_function(
        _load, [image_path, label], [tf.float32, tf.int32]
    )
    image.set_shape([IMG_SIZE, IMG_SIZE, 3])
    label.set_shape([])
    return image, label

def augment(image, label):
    image = tf.image.random_flip_left_right(image)
    image = tf.image.random_flip_up_down(image)
    image = tf.image.rot90(image, k=tf.random.uniform(
        shape=[], minval=0, maxval=4, dtype=tf.int32
    ))
    image = tf.image.random_contrast(image, 0.9, 1.1)
    return image, label

def create_dataset(dataframe, augment_data=False, shuffle=False):
    paths, labels = [], []

    for _, row in dataframe.iterrows():
        path = os.path.join(DATA_DIR, row['id_code'] + '.png')
        if os.path.exists(path):
            paths.append(path)
            labels.append(row['new_label'])

    print(f"Loaded {len(paths)} images")

    dataset = tf.data.Dataset.from_tensor_slices((paths, labels))

    if shuffle:
        dataset = dataset.shuffle(buffer_size=len(paths), seed=42)

    dataset = dataset.map(load_image_label, num_parallel_calls=tf.data.AUTOTUNE)

    if augment_data:
        dataset = dataset.map(augment, num_parallel_calls=tf.data.AUTOTUNE)

    dataset = dataset.batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)

    return dataset, len(paths)

print("\nCreating datasets...")
train_dataset, train_size = create_dataset(train_df, augment_data=True, shuffle=True)
val_dataset, val_size = create_dataset(val_df, augment_data=False, shuffle=False)

print(f"Train samples: {train_size}")
print(f"Val samples: {val_size}")

# ── Build Model ──────────────────────────────
def build_model(trainable_base=False):
    base_model = EfficientNetB3(
        weights='imagenet',
        include_top=False,
        input_shape=(IMG_SIZE, IMG_SIZE, 3)
    )
    base_model.trainable = trainable_base

    inputs = tf.keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
    x = base_model(inputs, training=trainable_base)
    x = GlobalAveragePooling2D()(x)
    x = Dropout(0.3)(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.2)(x)
    outputs = Dense(3, activation='softmax')(x)

    return Model(inputs, outputs), base_model

# ── Phase 1 ──────────────────────────────────
print("\n🔥 Phase 1 Training...")
model, base_model = build_model(trainable_base=False)

model.compile(
    optimizer=Adam(1e-4),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']   # ✅ FIXED (removed AUC)
)

history1 = model.fit(
    train_dataset,
    validation_data=val_dataset,
    epochs=EPOCHS_PHASE1,
    callbacks=[
        EarlyStopping(patience=5, restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(patience=3, factor=0.5, verbose=1),
    ]
)

# ── Phase 2 ──────────────────────────────────
print("\n🔥 Phase 2 Fine-tuning...")

fine_tune_from = int(len(base_model.layers) * 0.6)
for layer in base_model.layers[fine_tune_from:]:
    layer.trainable = True

model.compile(
    optimizer=Adam(1e-5),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']   # ✅ FIXED
)

history2 = model.fit(
    train_dataset,
    validation_data=val_dataset,
    epochs=EPOCHS_PHASE2,
    callbacks=[
        EarlyStopping(patience=7, restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(patience=3, factor=0.5, verbose=1),
        ModelCheckpoint(MODEL_SAVE_PATH, save_best_only=True, monitor='val_accuracy', verbose=1),
    ]
)

# ── Evaluation ───────────────────────────────
print("\n📊 Evaluating...")

val_images, val_labels = [], []
for x, y in val_dataset:
    val_images.append(x.numpy())
    val_labels.append(y.numpy())

val_images = np.concatenate(val_images)
val_labels = np.concatenate(val_labels)

y_pred = np.argmax(model.predict(val_images), axis=1)

print(classification_report(val_labels, y_pred))
print("F1 Score:", f1_score(val_labels, y_pred, average='weighted'))

# Confusion Matrix
cm = confusion_matrix(val_labels, y_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
plt.title('Confusion Matrix')
plt.savefig('confusion_matrix.png')
plt.show()

print("\n🎉 Training complete!")