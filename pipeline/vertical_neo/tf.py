import sys,time,cv2,numpy as np,eng
ts=[float(x) for x in sys.argv[1:]]
ims=[]
for t in ts:
    t0=time.time(); f=eng.render_frame(int(t*60)); print(t,round(time.time()-t0,2),flush=True); ims.append(cv2.resize(f,(360,640)))
cv2.imwrite('tf.jpg',np.hstack(ims))
