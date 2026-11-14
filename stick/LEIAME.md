# Pipeline stick QV (provado em 13/11/2026: 2058 quadros em ~50 min, 2 processos)
Base: kit stick-viral (three.js r160 + toon) da skill stick-viral. Esta pasta = projeto pronto "nota de 100 trilhoes".
1. cp -r stick /home/claude/sv/<slug>; instalar: npm i playwright-core three? (ver skill stick-viral setup.sh; Chromium em .chrome)
2. Escrever script.txt (~200 palavras, CTA fixo no fim) -> python3 voz.py script.txt voice.wav --voz pm_santa --vel 1.13 -> python3 timing.py voice.wav script.txt --out work
3. Reescrever web/story.js (SHOTS/CAMS/worldAt/actorsAt/fxAt por frase; modelo = story.js desta pasta) e, se preciso, novos objetos em web/main.js (ex.: nota gigante setNote). Resolucao de render 720x1280 (W,H em main.js, index.html, render.mjs) e upscale p/ 1080x1920 no encode.
4. node render.mjs stills/a "frames,..." 1 0.85 + sheet.py -> olhar; corrigir; render completo em 2 processos RESUME=1.
5. sfx_qv.py (tabela de deixas por quadro) + mix.py; capt_qv.py p/ legenda (Inter 86, destaque #01FBB4); capa = frame 9999 + titulo PIL + logo QV, sobreposta nos frames 0-3 no encode; mascara lateral desfocada/escurecida (gblur 9, brightness -0.16, conteudo x 130..950).
6. Encode: ffmpeg maskedmerge + ass + overlay capa (format gbrp nos mascaras), crf 19, -r 30.
