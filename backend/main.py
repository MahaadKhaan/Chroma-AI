import io
import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from skimage.color import rgb2lab, lab2rgb
import tensorflow as tf
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

DEMO_MODE = True
limiter = Limiter(key_func=get_remote_address, enabled=True)

def get_application_limit():
    return "10000/minute" if DEMO_MODE else "5/minute"

# Load models on startup
base_model = None
landscape_model = None
portrait_model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global base_model, landscape_model, portrait_model
    try:
        print("Loading models...")
        base_model = tf.keras.models.load_model('../chroma/chroma_v2_latest.keras', compile=False)
        landscape_model = tf.keras.models.load_model('../chroma/chroma_v2_5_landscape_latest.keras', compile=False)
        portrait_model = tf.keras.models.load_model('../chroma/chroma_v2_6_portrait_latest.keras', compile=False)
        print("Models loaded successfully.")
    except Exception as e:
        print(f"Error loading models: {e}")
    yield
    # Clean up (if any)
    base_model = None
    landscape_model = None
    portrait_model = None

app = FastAPI(title="Chroma AI Backend", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/colorize")
@limiter.limit(get_application_limit)
async def colorize(
    request: Request,
    image: UploadFile = File(...),
    model_type: str = Form("base")
):
    global base_model, landscape_model, portrait_model
    
    model = None
    if model_type == "base":
        model = base_model
    elif model_type == "landscape":
        model = landscape_model
    elif model_type == "portrait":
        model = portrait_model
    else:
        raise HTTPException(status_code=400, detail="Invalid model_type. Choose 'base', 'landscape', or 'portrait'.")

    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded. Please check server logs.")

    try:
        # Step A: Read image and get original dimensions
        chunk = await image.read(8)
        if not (chunk.startswith(b'\xff\xd8\xff') or chunk.startswith(b'\x89PNG\r\n\x1a\n')):
            raise HTTPException(status_code=400, detail="Invalid magic bytes. Only JPEG and PNG are allowed.")
        
        contents = bytearray(chunk)
        while True:
            data = await image.read(1024 * 1024) # 1MB chunks
            if not data:
                break
            contents.extend(data)
            if len(contents) > 15 * 1024 * 1024:
                raise HTTPException(status_code=400, detail="File too large. Maximum 15MB allowed.")
        contents = bytes(contents)
        
        nparr = np.frombuffer(contents, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img_bgr is None:
            raise HTTPException(status_code=400, detail="Invalid image file.")
            
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        H, W = img_rgb.shape[:2]
        
        if H > 4096 or W > 4096:
            raise HTTPException(status_code=400, detail="Image resolution too high. Maximum 4096x4096px allowed.")
        
        # Convert high-res original to LAB space
        img_lab_high_res = rgb2lab(img_rgb)
        L_high_res = img_lab_high_res[:, :, 0]
        
        # Step B: Create a copy, resize to 256x256, normalize, and extract L channel
        img_resized = cv2.resize(img_rgb, (256, 256))
        img_resized_norm = img_resized / 255.0
        img_resized_lab = rgb2lab(img_resized_norm)
        
        L_resized = img_resized_lab[:, :, 0]
        L_input = (L_resized / 50.0) - 1.0
        L_input = L_input.reshape((1, 256, 256, 1))
        
        # Step C: Predict
        predicted_ab = model.predict(L_input)
        
        # Step D: Denormalize and resize up to original
        pred_ab = predicted_ab[0] # (256, 256, 2)
        pred_ab_denorm = pred_ab * 128.0
        
        pred_ab_up = cv2.resize(pred_ab_denorm, (W, H))
        
        # Step E: Merge high-res L with upscaled predicted ab
        merged_lab = np.dstack((L_high_res, pred_ab_up))
        
        # Step F: Convert back to RGB, encode and return
        merged_rgb = lab2rgb(merged_lab)
        merged_rgb = np.clip(merged_rgb, 0, 1)
        merged_rgb_uint8 = (merged_rgb * 255.0).astype(np.uint8)
        
        # Convert back to BGR for encoding with cv2
        merged_bgr = cv2.cvtColor(merged_rgb_uint8, cv2.COLOR_RGB2BGR)
        success, encoded_image = cv2.imencode('.jpg', merged_bgr)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to encode image.")
            
        return StreamingResponse(io.BytesIO(encoded_image.tobytes()), media_type="image/jpeg")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
