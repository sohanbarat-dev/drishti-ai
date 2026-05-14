from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import base64
import os
import gdown

app = Flask(__name__)
CORS(app)

# ── Auto-download model from Google Drive ────────────────────────────────────
MODEL_PATH = 'drishti_model.keras'
GDRIVE_FILE_ID = '1SLtTsiRLq-tHx3x706b3ja3hEjRrN6s6'

if not os.path.exists(MODEL_PATH):
    print("Downloading DrishtiAI model from Google Drive...")
    gdown.download(
        f'https://drive.google.com/uc?id={GDRIVE_FILE_ID}',
        MODEL_PATH,
        quiet=False
    )
    print("Model downloaded successfully!")

# ── Load Model ────────────────────────────────────────────────────────────────
print("Loading DrishtiAI model...")
model = tf.keras.models.load_model(MODEL_PATH)
print("Model loaded!")

from tensorflow.keras.applications.efficientnet import preprocess_input

IMG_SIZE = 224

CLASS_INFO = {
    0: {
        'level': 'No DR',
        'severity': 0,
        'color': 'green',
        'emoji': '🟢',
        'message': 'Your retina appears healthy. No signs of diabetic retinopathy detected.',
        'urgency': 'Continue regular annual eye checkups.'
    },
    1: {
        'level': 'Low DR',
        'severity': 1,
        'color': 'yellow',
        'emoji': '🟡',
        'message': 'Early signs of diabetic retinopathy detected.',
        'urgency': 'Please consult an ophthalmologist within 3-6 months.'
    },
    2: {
        'level': 'High DR',
        'severity': 2,
        'color': 'red',
        'emoji': '🔴',
        'message': 'Significant diabetic retinopathy detected.',
        'urgency': 'Please consult an ophthalmologist IMMEDIATELY.'
    }
}

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

def preprocess_image_bytes(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Could not decode image")
    image = crop_image_from_gray(image)
    image = ben_graham_preprocess(image)
    image = preprocess_input(image.astype(np.float32))
    return image

def generate_gradcam(img_array, model):
    """
    Grad-CAM for nested EfficientNetB3 architecture.
    Strategy: use efficientnet_layer.input/output only (self-contained submodel).
    Get intermediate conv features via a feature extractor, then use GradientTape
    on the submodel directly.
    """
    try:
        # ── Step 1: Find the EfficientNet submodel ───────────────────────────
        efficientnet_layer = None
        for layer in model.layers:
            if 'efficientnet' in layer.name.lower():
                efficientnet_layer = layer
                break

        if efficientnet_layer is None:
            print("⚠️  Grad-CAM: EfficientNet submodel not found")
            return None

        # ── Step 2: Find last Conv2D inside EfficientNet submodel ────────────
        last_conv_name = None
        for layer in reversed(efficientnet_layer.layers):
            if isinstance(layer, tf.keras.layers.Conv2D):
                last_conv_name = layer.name
                break

        if last_conv_name is None:
            print("⚠️  Grad-CAM: No Conv2D found inside EfficientNet submodel")
            return None

        print(f"✅ Grad-CAM using conv layer: {last_conv_name}")

        # ── Step 3: Get predicted class from full model ───────────────────────
        preds = model.predict(img_array, verbose=0)
        pred_class_idx = int(np.argmax(preds[0]))

        # ── Step 4: Build grad model entirely within the submodel ────────────
        # Both inputs and outputs belong to efficientnet_layer — no cross-model refs
        grad_model = tf.keras.models.Model(
            inputs=efficientnet_layer.input,
            outputs=[
                efficientnet_layer.get_layer(last_conv_name).output,
                efficientnet_layer.output
            ]
        )

        img_tensor = tf.cast(img_array, tf.float32)

        # ── Step 5: GradientTape on submodel ─────────────────────────────────
        with tf.GradientTape() as tape:
            tape.watch(img_tensor)
            conv_outputs, backbone_out = grad_model(img_tensor, training=False)
            # Use the backbone's output channel matching our predicted class
            # backbone_out has shape (1, 1536) for EfficientNetB3
            class_score = backbone_out[0][pred_class_idx]

        # ── Step 6: Compute gradients ─────────────────────────────────────────
        grads = tape.gradient(class_score, conv_outputs)

        if grads is None:
            print("⚠️  Grad-CAM: Gradients are None")
            return None

        # ── Step 7: Pool + weighted sum ───────────────────────────────────────
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2)).numpy()
        conv_outputs_np = conv_outputs[0].numpy()

        heatmap = np.zeros(conv_outputs_np.shape[:2], dtype=np.float32)
        for i, w in enumerate(pooled_grads):
            heatmap += w * conv_outputs_np[:, :, i]

        # ReLU + normalise
        heatmap = np.maximum(heatmap, 0)
        if heatmap.max() > 0:
            heatmap = heatmap / heatmap.max()

        return heatmap

    except Exception as e:
        print(f"❌ Grad-CAM error: {e}")
        import traceback; traceback.print_exc()
        return None


def overlay_gradcam_on_image(image_bytes, heatmap):
    """Resize heatmap, colorize, and blend with original image."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    original = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    original_resized = cv2.resize(original, (IMG_SIZE, IMG_SIZE))

    heatmap_resized = cv2.resize(heatmap, (IMG_SIZE, IMG_SIZE))
    heatmap_uint8 = np.uint8(255 * heatmap_resized)
    heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)

    # Blend: 60% original + 40% heatmap  (same weights as gradcam.py)
    overlay = cv2.addWeighted(original_resized, 0.6, heatmap_colored, 0.4, 0)
    return overlay


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'DrishtiAI API running ✅', 'model': 'EfficientNetB3'})


@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400

        file = request.files['image']
        image_bytes = file.read()

        # ── Preprocess ────────────────────────────────────────────────────────
        processed = preprocess_image_bytes(image_bytes)
        img_array = np.expand_dims(processed, axis=0)

        # ── Predict ───────────────────────────────────────────────────────────
        predictions = model.predict(img_array, verbose=0)
        predicted_class = int(np.argmax(predictions[0]))
        confidence = float(np.max(predictions[0])) * 100
        all_probs = {
            'No DR':   round(float(predictions[0][0]) * 100, 2),
            'Low DR':  round(float(predictions[0][1]) * 100, 2),
            'High DR': round(float(predictions[0][2]) * 100, 2),
        }

        # ── Grad-CAM ──────────────────────────────────────────────────────────
        gradcam_base64 = None
        heatmap = generate_gradcam(img_array, model)

        if heatmap is not None:
            overlay = overlay_gradcam_on_image(image_bytes, heatmap)
            _, buffer = cv2.imencode('.png', overlay)
            gradcam_base64 = base64.b64encode(buffer).decode('utf-8')
            print("✅ Grad-CAM generated successfully")
        else:
            print("⚠️  Grad-CAM returned None — check model architecture")

        # ── Build response ────────────────────────────────────────────────────
        result = CLASS_INFO[predicted_class].copy()
        result['confidence'] = round(confidence, 2)
        result['all_probabilities'] = all_probs
        result['predicted_class'] = predicted_class
        result['gradcam'] = gradcam_base64          # None or base64 string
        result['disclaimer'] = (
            "⚠️ This is an AI screening tool only. Not a medical diagnosis. "
            "Always consult a qualified ophthalmologist."
        )

        return jsonify(result)

    except Exception as e:
        print(f"❌ Predict error: {e}")
        import traceback; traceback.print_exc()
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 7860))
    app.run(host='0.0.0.0', port=port, debug=False)