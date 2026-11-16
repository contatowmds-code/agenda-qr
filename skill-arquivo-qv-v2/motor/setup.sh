#!/bin/bash
# Prepara o ambiente do zero (rodar 1x por sessão). Idempotente.
set -e
cd "$(dirname "$0")"
pip install -q kokoro-onnx soundfile scipy opencv-python-headless numpy pillow phonemizer --break-system-packages 2>&1 | tail -1 || true
[ -f k.onnx ] || curl -sL -o k.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
[ -f v.bin ] || curl -sL -o v.bin https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
[ -d node_modules/three ] || npm i three@0.160.0 gsap@3.12.5 @fontsource/montserrat@5.0.8 >/dev/null 2>&1
pgrep -f "http.server 8123" >/dev/null || (setsid nohup python3 -m http.server 8123 >/dev/null 2>&1 &)
sleep 1; echo "setup ok"
