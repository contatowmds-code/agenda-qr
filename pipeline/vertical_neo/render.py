import sys, subprocess, eng
k,n=int(sys.argv[1]),int(sys.argv[2])
NF=int(round(eng.TOTAL*60)); a=NF*k//n; b=NF*(k+1)//n
p=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','bgr24','-s','1080x1920','-r','60','-i','-','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-g','60',f'part{k}.mp4'],stdin=subprocess.PIPE)
for i in range(a,b):
    p.stdin.write(eng.render_frame(i).tobytes())
    if (i-a)%600==0: print(k,i-a,'/',b-a,flush=True)
p.stdin.close(); p.wait(); print('done',k,flush=True)
