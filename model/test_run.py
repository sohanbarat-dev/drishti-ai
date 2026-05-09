import numpy as np
import pandas as pd
import tensorflow as tf
import cv2
import os

print(f"TensorFlow: {tf.__version__}")
print(f"GPU: {len(tf.config.list_physical_devices('GPU')) > 0}")

DATA_DIR = 'data/train_images'
CSV_PATH = 'data/train.csv'
IMG_SIZE = 224

def ben_graham_preprocess(image, sigmaX=10):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = cv2.resize(image, (IMG_SIZE, IMG_SIZE))
    image = cv2.addWeighted(
        image, 4,
        cv2.GaussianBlur(image, (0, 0), sigmaX), -4,
        128
    )
    return image

def crop_image_from_gray(img, tol=7):
    if img.ndim == 2:
        mask = img > tol
        return img[np.ix_(mask.any(1), mask.any(0))]
    elif img.ndim == 3:
        gray_img = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
        mask = gray_img > tol
        check_shape = img[:, :, 0][np.ix_(mask.any(1), mask.any(0))].shape[0]
        if check_shape == 0:
            return img
        img1 = img[:, :, 0][np.ix_(mask.any(1), mask.any(0))]
        img2 = img[:, :, 1][np.ix_(mask.any(1), mask.any(0))]
        img3 = img[:, :, 2][np.ix_(mask.any(1), mask.any(0))]
        return np.stack([img1, img2, img3], axis=-1)
    return img

def load_and_preprocess(image_path):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Could not load: {image_path}")
    image = crop_image_from_gray(image)
    image = ben_graham_preprocess(image)
    image = image.astype(np.float32) / 255.0
    return image

# Test with only 100 images
print("\nTesting with 100 images...")
df = pd.read_csv(CSV_PATH).head(100)

def remap_label(label):
    if label == 0: return 0
    elif label in [1, 2]: return 1
    else: return 2

df['new_label'] = df['diagnosis'].apply(remap_label)

images, labels = [], []
for idx, row in df.iterrows():
    img_path = os.path.join(DATA_DIR, row['id_code'] + '.png')
    if os.path.exists(img_path):
        img = load_and_preprocess(img_path)
        images.append(img)
        labels.append(row['new_label'])
    if idx % 20 == 0:
        print(f"✅ {len(images)} images loaded...")

X = np.array(images)
y = np.array(labels)
print(f"\n✅ Test successful!")
print(f"X shape: {X.shape}")
print(f"y shape: {y.shape}")
print(f"\nEverything works! Ready for full training.")