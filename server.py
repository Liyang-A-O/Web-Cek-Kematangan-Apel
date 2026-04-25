# -*- coding: utf-8 -*-
from flask import Flask, render_template, request, jsonify, send_from_directory
from inference_sdk import InferenceHTTPClient
import base64
import io
from PIL import Image
import os
import json
from datetime import datetime
import sys
import traceback

# Force UTF-8 encoding for stdout on Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Initialize Flask app
app = Flask(__name__, static_folder='web', template_folder='web')

# Initialize the inference client
client = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key="atskCHUBF2ID0riGFZqk"
)

# Logging function - simplified
def log_debug(message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_message = f"[{timestamp}] {message}"
    print(log_message, flush=True)
    try:
        with open("debug_log.txt", "a", encoding='utf-8') as f:
            f.write(log_message + "\n")
    except:
        pass

# Serve static files
@app.route('/')
def index():
    return send_from_directory('web', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('web', filename)

# Global error handler
@app.errorhandler(Exception)
def handle_exception(e):
    error_msg = str(e)
    tb = traceback.format_exc()
    log_debug(f"GLOBAL ERROR: {error_msg}")
    log_debug(tb)
    return jsonify({'error': 'Internal Server Error: ' + error_msg}), 500

# API endpoint for detection
@app.route('/api/detect', methods=['POST'])
def detect():
    log_debug("=== NEW DETECTION REQUEST ===")
    
    try:
        # Parse JSON
        data = request.json
        if not data:
            log_debug("ERROR: No JSON data received")
            return jsonify({'error': 'No JSON data'}), 400
        
        log_debug("JSON parsed successfully")
        image_data = data.get('image')
        
        if not image_data:
            log_debug("ERROR: No image data in request")
            return jsonify({'error': 'No image provided'}), 400
        
        log_debug(f"Image data received: {len(image_data)} chars")
        
        # Decode base64 image
        try:
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            log_debug(f"Image decoded successfully: {image.size}")
        except Exception as e:
            log_debug(f"ERROR decoding image: {str(e)}")
            return jsonify({'error': f'Failed to decode image: {str(e)}'}), 400
        
        # Save temporarily to process
        temp_path = 'temp_image.jpg'
        try:
            image.save(temp_path, 'JPEG')
            log_debug(f"Image saved to {temp_path}")
        except Exception as e:
            log_debug(f"ERROR saving image: {str(e)}")
            return jsonify({'error': f'Failed to save image: {str(e)}'}), 400
        
        # Run detection using Roboflow workflow
        try:
            log_debug("Calling Roboflow workflow...")
            result = client.run_workflow(
                workspace_name="liyang-s65dy",
                workflow_id="apelmatang",
                images={"image": temp_path},
                use_cache=False
            )
            log_debug(f"Roboflow response received. Type: {type(result)}")
            log_debug(f"Response: {json.dumps(result, indent=2, default=str)[:500]}")
        except Exception as e:
            log_debug(f"ERROR calling Roboflow: {str(e)}")
            log_debug(traceback.format_exc())
            return jsonify({'error': f'Roboflow API error: {str(e)}'}), 500
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
                log_debug("Temp file cleaned up")
        
        # Parse Roboflow result
        detections = parse_roboflow_result(result)
        log_debug(f"Parsed {len(detections)} detections")
        log_debug("REQUEST SUCCESS")
        
        return jsonify({
            'success': True,
            'detections': detections
        })
    
    except Exception as e:
        log_debug(f"UNHANDLED ERROR: {str(e)}")
        log_debug(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

def parse_roboflow_result(result):
    """Parse Roboflow workflow result and extract detection data"""
    detections = []
    output_image = None
    count_objects = 0

    log_debug(f"Parsing result. Type: {type(result)}")

    # STEP 1: kalau result list → ambil item pertama
    if isinstance(result, list):
        log_debug(f"Result is list with {len(result)} items")
        if len(result) > 0:
            result = result[0]
        else:
            return detections

    # STEP 2: pastikan result dict
    if not isinstance(result, dict):
        log_debug("Result is not a dict after processing")
        return detections

    log_debug(f"Result keys: {list(result.keys())}")

    # STEP 3: HANDLE output_image + predictions (INI YANG PENTING)
    if 'output_image' in result:
        output_image = result.get('output_image')
        count_objects = result.get('count_objects', 0)

        log_debug(f"Found output_image with {count_objects} objects")

    # Coba extract dari predictions array
    raw_predictions = result.get('predictions', {})
    log_debug(f"Predictions type: {type(raw_predictions)}")

    # HANDLE SEMUA KEMUNGKINAN STRUKTUR
    if isinstance(raw_predictions, dict):
        predictions = raw_predictions.get('predictions', [])
        log_debug(f"Nested predictions found: {len(predictions)} items")
    elif isinstance(raw_predictions, list):
        predictions = raw_predictions
        log_debug(f"Direct predictions list: {len(predictions)} items")
    else:
        predictions = []
        log_debug("Predictions format tidak dikenali")

    # =============================
    # PARSING DETECTIONS
    # =============================
    if len(predictions) > 0:
        log_debug(f"🔍 Parsing {len(predictions)} predictions")
        log_debug(f"First prediction: {json.dumps(predictions[0], indent=2, default=str)[:300]}")

        for idx, pred in enumerate(predictions):
            if isinstance(pred, dict):
                label = pred.get('class') or pred.get('class_name') or pred.get('label') or 'Unknown'
                confidence = float(pred.get('confidence', 0))

                log_debug(f"  Pred {idx}: label='{label}', confidence={confidence}")

                detections.append({
                    'label': str(label),
                    'confidence': confidence,
                    'image': output_image if idx == 0 else None,
                    'x': float(pred.get('x', 0)),
                    'y': float(pred.get('y', 0)),
                    'width': float(pred.get('width', 0)),
                    'height': float(pred.get('height', 0))
                })

        # Tandai detection pertama punya gambar
        if detections:
            detections[0]['_has_output_image'] = True

        log_debug(f"✅ SUCCESS: Extracted {len(detections)} detections")

    else:
        # ❗ Fallback DIMATIKAN / DIPERINGAN
        log_debug("⚠️ No predictions found - SKIPPING fallback")
        return []  # ⬅️ penting: jangan bikin dummy lagi

    return detections

if __name__ == '__main__':
    print("Starting Apple Ripeness Detection Server...")
    print("Server running at http://localhost:5000")
    app.run(debug=True, host='localhost', port=5000)