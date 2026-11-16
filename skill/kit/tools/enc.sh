set -e
T="Quatro planetas no céu antes do sol nascer #quantovale #astronomia #curiosidades"
mkdir -p out
ffmpeg -v error -y -framerate 30 -i frames/f%04d.jpg -i mask.png -loop 1 -t 1 -i cover.png -i mix_raw.wav \
 -filter_complex "[0:v]scale=1080:1920:flags=lanczos,format=gbrp,split[a][b]; [b]gblur=sigma=4,format=gbrp[bl]; [1:v]scale=1080:1920,format=gbrp[m]; [a][bl][m]maskedmerge,format=yuv420p[v0]; [v0]ass=legenda.ass:fontsdir=/usr/share/fonts/opentype/inter[v1]; [2:v]format=yuv420p[c]; [v1][c]overlay=enable='lt(n,4)'[v]; [3:a]loudnorm=I=-14:TP=-1.5:LRA=11[a]" \
 -map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 19 -r 30 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "out/$T.mp4"
ffprobe -v error -show_entries stream=width,height,duration,r_frame_rate -of compact "out/$T.mp4"; ls -l out
