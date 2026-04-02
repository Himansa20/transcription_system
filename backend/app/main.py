from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
import subprocess
import asyncio
import imageio_ffmpeg
import shutil
import sys
import stat

# Add bundled ffmpeg to PATH BEFORE importing whisper
# (Whisper hardcodes "ffmpeg" as the executable name it calls)
FFMPEG_ORIG_PATH = imageio_ffmpeg.get_ffmpeg_exe()
BIN_DIR = os.path.join(os.path.dirname(__file__), ".bin")
os.makedirs(BIN_DIR, exist_ok=True)
exe_name = "ffmpeg.exe" if sys.platform == "win32" else "ffmpeg"
FFMPEG_PATH = os.path.join(BIN_DIR, exe_name)

if not os.path.exists(FFMPEG_PATH):
    try:
        os.link(FFMPEG_ORIG_PATH, FFMPEG_PATH)
    except OSError:
        shutil.copy(FFMPEG_ORIG_PATH, FFMPEG_PATH)

try:
    st = os.stat(FFMPEG_PATH)
    os.chmod(FFMPEG_PATH, st.st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
except Exception:
    pass

os.environ["PATH"] = BIN_DIR + os.pathsep + os.environ.get("PATH", "")
print(f"✅ Using ffmpeg at: {FFMPEG_PATH}")

import numpy as np
import noisereduce as nr
from scipy.io import wavfile
import whisper
from app.routes.patient_routes import router as patient_router
from app.routes.queue_routes import router as queue_router

app = FastAPI()
# CORS — allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include patient routes
app.include_router(patient_router)

# Include queue routes
app.include_router(queue_router)

# Load Whisper model once at startup
model = whisper.load_model("base")


def convert_to_wav(input_path: str) -> str:
    """Convert any audio format to 16kHz mono WAV using ffmpeg."""
    output_path = input_path + ".wav"
    try:
        result = subprocess.run(
            [
                FFMPEG_PATH,
                "-y",
                "-i", input_path,
                "-ar", "16000",
                "-ac", "1",
                "-f", "wav",
                output_path,
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False
        )
        if result.returncode != 0:
            raise RuntimeError(f"ffmpeg conversion failed: {result.stderr.decode('utf-8', errors='ignore')}")
    except Exception as convert_e:
        print(f"ERROR IN convert_to_wav: {convert_e}")
        import traceback
        traceback.print_exc()
        raise
    return output_path


def reduce_noise_wav(wav_path: str) -> str:
    """Apply spectral-gating noise reduction to a WAV file in-place."""
    try:
        rate, data = wavfile.read(wav_path)
        # Convert to float32 for noisereduce
        if data.dtype != np.float32:
            data = data.astype(np.float32)
        reduced = nr.reduce_noise(y=data, sr=rate, prop_decrease=0.6)
        wavfile.write(wav_path, rate, reduced.astype(np.int16))
        print("🔇 Noise reduction applied")
    except Exception as e:
        print(f"⚠️ Noise reduction failed (proceeding without): {e}")
    return wav_path


def _transcribe_chunk(webm_path: str) -> str:
    """Convert webm to wav, reduce noise, transcribe with Whisper, clean up temp files."""
    wav_path = None
    try:
        wav_path = convert_to_wav(webm_path)
    except Exception as e:
        print(f"Failed in convert_to_wav: {e}")
        raise

    # Apply noise reduction before transcription
    reduce_noise_wav(wav_path)

    try:
        result = model.transcribe(wav_path)
        return result["text"].strip()
    except Exception as e:
        print(f"Failed in whisper model.transcribe: {e}")
        raise
    finally:
        # Clean up temp files
        for path in [webm_path, wav_path]:
            if path and os.path.exists(path):
                try:
                    os.remove(path)
                except OSError:
                    pass


@app.websocket("/ws/transcribe/{patient_id}")
async def websocket_endpoint(websocket: WebSocket, patient_id: str):
    await websocket.accept()
    print(f"✅ WebSocket connected for patient: {patient_id}")

    # Ensure transcripts directory exists
    transcripts_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "transcripts")
    os.makedirs(transcripts_dir, exist_ok=True)
    transcript_path = os.path.join(transcripts_dir, f"{patient_id}.txt")

    try:
        while True:
            # Receive audio chunk (bytes) from the browser
            audio_bytes = await websocket.receive_bytes()
            print(f"📦 Received {len(audio_bytes)} bytes from patient {patient_id}")

            if len(audio_bytes) == 0:
                continue
            # Save as .webm (the actual format the browser sends)
            with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
                tmp.write(audio_bytes)
                temp_path = tmp.name
            try:
                # Run transcription in a thread so we don't block the event loop
                text = await asyncio.to_thread(_transcribe_chunk, temp_path)

                if text:
                    # Append to patient transcript file
                    with open(transcript_path, "a") as f:
                        f.write(text + "\n")

                    # Send text back to frontend
                    await websocket.send_text(text)
                    print(f"📝 Transcribed: {text[:80]}...")
                else:
                    await websocket.send_text("")

            except Exception as e:
                print(f"⚠️ Transcription error for chunk: {e}")
                # Send error info but keep connection alive
                await websocket.send_text(f"[transcription error]")
                # Clean up temp file if _transcribe_chunk didn't get to it
                if os.path.exists(temp_path):
                    os.remove(temp_path)

    except WebSocketDisconnect:
        print(f"🔌 WebSocket disconnected for patient: {patient_id}")
    except Exception as e:
        print(f"❌ WebSocket error for patient {patient_id}: {e}")
    finally:
        print(f"🛑 Session ended for patient: {patient_id}")
