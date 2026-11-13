# Pipeline QV (vídeo horizontal 1920x1080, 60 fps, 8 min 1 s ou mais)
Setup (sessão nova): `pip install kokoro-onnx soundfile scipy opencv-python-headless numpy pillow phonemizer`; `apt-get install -y ffmpeg espeak-ng` se faltar.
Modelo (GitHub releases, sem login):
  curl -L -o k.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
  curl -L -o v.bin  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
Fluxo: copiar esta pasta para /home/claude/qv; escrever roteiro.py novo (formato em roteiro_exemplo_hooks.py: b(cena, texto com *destaque*, visual dict, falado opcional));
`python3 tts.py 1.2` -> `python3 timeline.py` -> `python3 audio.py` -> teste de quadros -> `seq 0 7 | xargs -P2 -I{} python3 render.py {} 8` (setsid nohup; renderizar até o fim no MESMO turno, ~35 min) -> concat + mux (crf 24 maxrate 1800k, abaixo de 95 MB) -> ffprobe (>=481 s, 60 fps).
Visuais: big,title,flow,exit,code,term,tree,cards,cmp,steps,cta1,cta2. Para o próximo vídeo MUDAR fundos (BGS em eng.py), legenda e transições; paleta fixa (#011839, #01FBB4).
Respelling de termos em inglês: dicionário REPL em tts.py e 4º campo (falado) de cada beat.
Entrega: ver workflow "Subir MP4 para o Drive" (branch main) + branch qv-upload.
