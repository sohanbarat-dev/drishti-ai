import numpy as np
import tensorflow as tf
import cv2
import matplotlib.pyplot as plt
import os
from tensorflow.keras.applications.efficientnet import preprocess_input

IMG_SIZE = 224

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
    image = crop_image_from_gray(image)
    image = ben_graham_preprocess(image)
    preprocessed = preprocess_input(image.astype(np.float32))
    return image, preprocessed

def generate_gradcam(model, img_array):
    try:
        # Find EfficientNetB3 sublayer
        efficientnet_layer = None
        for layer in model.layers:
            if 'efficientnet' in layer.name.lower():
                efficientnet_layer = layer
                break

        if efficientnet_layer is None:
            print("EfficientNet layer not found")
            return None

        # Find last conv layer
        last_conv_name = None
        for layer in reversed(efficientnet_layer.layers):
            if isinstance(layer, tf.keras.layers.Conv2D):
                last_conv_name = layer.name
                break

        if not last_conv_name:
            print("No Conv2D found")
            return None

        print(f"Using conv layer: {last_conv_name}")

        # Build grad model from efficientnet submodel
        grad_model = tf.keras.models.Model(
            inputs=efficientnet_layer.input,
            outputs=[
                efficientnet_layer.get_layer(last_conv_name).output,
                efficientnet_layer.output
            ]
        )

        img_tensor = tf.cast(img_array, tf.float32)

        with tf.GradientTape() as tape:
            tape.watch(img_tensor)
            conv_outputs, predictions = grad_model(img_tensor)
            pred_class = tf.argmax(predictions[0])
            class_score = predictions[0][pred_class]

        grads = tape.gradient(class_score, conv_outputs)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

        conv_outputs = conv_outputs[0]
        heatmap = tf.reduce_sum(
            tf.multiply(pooled_grads, conv_outputs), axis=-1
        )
        heatmap = tf.maximum(heatmap, 0)
        max_val = tf.reduce_max(heatmap)
        if max_val > 0:
            heatmap = heatmap / max_val

        return heatmap.numpy()

    except Exception as e:
        print(f"Grad-CAM error: {e}")
        return None

def visualize_gradcam(image_path, model, save_path='gradcam_result.png'):
    CLASS_NAMES = ['No DR', 'Low DR', 'High DR']
    COLORS = ['green', 'orange', 'red']

    original_bgr, preprocessed = load_and_preprocess(image_path)
    original_rgb = cv2.cvtColor(original_bgr, cv2.COLOR_BGR2RGB)
    img_array = np.expand_dims(preprocessed, axis=0)

    # Predict
    predictions = model.predict(img_array, verbose=0)
    predicted_class = int(np.argmax(predictions[0]))
    confidence = float(np.max(predictions[0])) * 100

    print(f"Prediction: {CLASS_NAMES[predicted_class]} ({confidence:.1f}%)")
    print(f"No DR={predictions[0][0]*100:.1f}% | Low DR={predictions[0][1]*100:.1f}% | High DR={predictions[0][2]*100:.1f}%")

    # Grad-CAM
    heatmap = generate_gradcam(model, img_array)

    if heatmap is None:
        print("Grad-CAM failed — showing prediction only")
        plt.figure(figsize=(6, 6))
        original_resized = cv2.resize(original_rgb, (IMG_SIZE, IMG_SIZE))
        plt.imshow(original_resized)
        plt.title(f'Prediction: {CLASS_NAMES[predicted_class]} ({confidence:.1f}%)',
                  color=COLORS[predicted_class], fontweight='bold')
        plt.axis('off')
        plt.savefig(save_path, dpi=150)
        plt.show()
        return

    # Resize heatmap to image size
    original_resized = cv2.resize(original_rgb, (IMG_SIZE, IMG_SIZE))
    heatmap_resized = cv2.resize(heatmap, (IMG_SIZE, IMG_SIZE))
    heatmap_uint8 = np.uint8(255 * heatmap_resized)
    heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    heatmap_rgb = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
    overlay = cv2.addWeighted(original_resized, 0.6, heatmap_rgb, 0.4, 0)

    # Plot 3 panels
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    fig.suptitle(
        f'DrishtiAI — Grad-CAM Explanation\nPrediction: {CLASS_NAMES[predicted_class]} ({confidence:.1f}% confident)',
        fontsize=13, fontweight='bold',
        color=COLORS[predicted_class]
    )

    axes[0].imshow(original_resized)
    axes[0].set_title('Original Retina Scan', fontweight='bold')
    axes[0].axis('off')

    axes[1].imshow(heatmap_rgb)
    axes[1].set_title('Grad-CAM Heatmap\n🔴 Red = Model focused here', fontweight='bold')
    axes[1].axis('off')

    axes[2].imshow(overlay)
    axes[2].set_title('Overlay\nSuspicious regions highlighted', fontweight='bold')
    axes[2].axis('off')

    fig.text(
        0.5, 0.01,
        f'No DR: {predictions[0][0]*100:.1f}%  |  Low DR: {predictions[0][1]*100:.1f}%  |  High DR: {predictions[0][2]*100:.1f}%',
        ha='center', fontsize=11, color='gray', style='italic'
    )

    plt.tight_layout()
    plt.savefig(save_path, dpi=150, bbox_inches='tight')
    plt.show()
    print(f"✅ Saved to {save_path}")

if __name__ == '__main__':
    print("Loading model...")
    model = tf.keras.models.load_model('drishti_model.keras')
    print("✅ Model loaded!")

    TEST_IMAGE = 'data/train_images/000c1434d8d7.png'

    if os.path.exists(TEST_IMAGE):
        visualize_gradcam(TEST_IMAGE, model)
    else:
        print(f"Image not found: {TEST_IMAGE}")