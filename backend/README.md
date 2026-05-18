# Chroma AI Backend Inference Engine

## Tech Stack & System Overview
The Chroma AI backend serves as a high-performance, asynchronous, and ephemeral machine learning inference endpoint. It is engineered with the following technologies:
- **Python 3.11**: The core runtime environment.
- **FastAPI**: A modern, fast web framework for building asynchronous APIs.
- **TensorFlow/Keras**: Deep Learning framework powering the colorization models.
- **OpenCV & Scikit-Image**: Advanced image processing and color space conversion utilities.
- **Slowapi**: An extension of Flask-Limiter adapted for FastAPI to enforce rate limits and prevent DoS attacks.

## The High-Res Inference Pipeline (The LAB Trick Explained)
The system achieves flawless high-resolution colorization without distorting structural details by leveraging the CIE LAB color space. The pipeline operates as follows:

1. **Acceptance**: Receives an uploaded high-resolution BGR or Grayscale image.
2. **Color Space Conversion**: The image is converted into the CIE LAB color space.
3. **L-Channel Preservation**: The high-resolution `L` (Lightness) channel, which contains all the structural details and edges, is isolated and preserved.
4. **Resizing for ML**: A copy of the image is downscaled to 256x256 pixels to match the input shape of our 3 specialized Deep Learning models (Base, Landscape, Portrait).
5. **Inference**: The chosen model predicts the missing `a` and `b` color channels at the 256x256 resolution.
6. **Upsampling**: The predicted `a` and `b` channels are upsampled back to the original high-resolution dimensions.
7. **Re-merging**: The preserved high-res `L` channel is merged with the newly upsampled high-res `a` and `b` channels, resulting in a flawless high-resolution colorized image.

## Defense-in-Depth Security Framework
To ensure robust and safe operation, the backend incorporates multiple active security layers:

- **Strict Payload Ceilings (15MB)**: Utilizes a chunked file reading strategy to enforce a strict 15MB upload limit. This protects the server RAM from Out-Of-Memory (OOM) crashes caused by malicious payloads.
- **Magic Bytes Verification**: Checks the raw binary headers of incoming files. It enforces genuine JPEG (`\xff\xd8\xff`) or PNG (`\x89PNG\r\n\x1a\n`) structures, completely bypassing client-spoofed MIME types.
- **Geometry Limits**: Blocks any image with physical dimensions exceeding 4096x4096px, preventing excessive compute load on the machine learning models.
- **Ephemeral Processing**: The entire pipeline is purely in-memory. Zero temporary data or images are written to the server disks at any point.

## The Presentation Safety Net (Demo Mode)
The application includes a global `DEMO_MODE` flag configured at the top of the application. 

When `DEMO_MODE = True`, the system initializes the Slowapi limiter but dynamically elevates the request ceiling to **10,000 requests/minute**. This prevents any accidental rate-limiting lockouts during live presentations or grading sessions. When toggled off, the system securely falls back to its strict production parameters of **5 requests/minute**.

## Deployment Topology
The application is designed for a Docker multi-stage environment:
- Runs inside a secure, isolated, and non-privileged system user account (`appuser`).
- The Deep Learning `.keras` model directory is mounted as a strictly read-only volume (`-v ./chroma:/chroma:ro`).

## Local Setup & Installation Instructions

To establish the virtual environment and boot up the server locally:

```bash
# Navigate to the backend directory
cd backend

# Create and activate a Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the Uvicorn server
uvicorn main:app --reload --port 8000
```

## System Integration Map

### API Communication Architecture
The Frontend communicates across local CORS networks to the Backend using a `POST` request directed at `http://localhost:8000/colorize`. It transmits payload data as a standard multi-part form data array containing the active `image` binary and the selected `model` string.

### Nginx Infrastructure Inversion
In a production deployment, traffic flows from the public interface through Nginx. Nginx acts as a reverse proxy shield, blocking oversized header requests and enforcing layer-7 network connection drops (e.g., maximum concurrent connections). Only validated, rate-limited traffic passes down into the inner, isolated Python container.
