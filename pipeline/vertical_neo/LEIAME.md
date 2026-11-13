Reels verticais QV (1080x1920, 60 fps). Estilo objeto-herói 3D: cada beat = 1 objeto (objs.py) + título curto + fundo alternado (hero.py).
Fluxo: editar roteiro.py -> python3 tts.py 1.2 -> python3 timeline.py -> python3 audio.py -> python3 render.py 0 2 & python3 render.py 1 2 -> concat das partes com mix.wav.
Modelos Kokoro (k.onnx, v.bin) não ficam no repo: ver pipeline/LEIAME.md.
Aguardar os dois render.py terminarem ANTES de concatenar.
