import sys, cv2, numpy as np, eng
idx=[int(x) for x in sys.argv[1:]] or [0,5,20]
ims=[]
for k in idx:
    b=eng.BLK[k]; t=b['s']+(b['e']-b['s'])*0.8
    f=eng.render_frame(int(t*60)); ims.append(cv2.resize(f,(360,640)))
rows=[np.hstack(ims[i:i+6]) for i in range(0,len(ims),6)]
w=max(r.shape[1] for r in rows); rows=[np.pad(r,((0,0),(0,w-r.shape[1]),(0,0))) for r in rows]
cv2.imwrite('sheet.jpg',np.vstack(rows))
