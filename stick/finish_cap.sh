#!/usr/bin/env bash
# Codifica frames + mix + legendas dinâmicas palavra por palavra.  bash finish_cap.sh "Titulo"
set -e; T="${1:-short}"; F="out/${T// /-}.mp4"
python3 capt.py work/words.json legenda.ass
ffmpeg -v error -y -i mix_raw.wav -af "loudnorm=I=-14:TP=-1.5:LRA=7" -ar 48000 -ac 2 mix.wav
ffmpeg -v error -y -framerate 30 -i ${FR:-frames}/f%04d.jpg -i mix.wav -map 0:v:0 -map 1:a:0 -vf "ass=legenda.ass:fontsdir=/usr/share/fonts/opentype/inter" -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "$F"
ffprobe -v error -show_entries format=duration -of compact "$F"; echo "$F"
