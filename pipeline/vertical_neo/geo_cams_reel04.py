import numpy as np
def _mc(lon,lat):
    lat=max(-80,min(80,lat)); import math
    return (lon+180)/360.0, 0.5-math.log(math.tan(math.pi/4+math.radians(lat)/2))/(2*math.pi)
CENT={'United States of America':(-98,39),'China':(104,35),'Germany':(10.4,51),'Japan':(138,37),'United Kingdom':(-2,54),'India':(78,22)}
def c_(n,z,p,b):
    lon,lat=CENT[n]; x,y=_mc(lon,lat); return (x,y,z,p,b)
def cam_top(n,z,b=0): return c_(n,z,0,b)
def cam_side(n,z,b): return c_(n,z,58,b)
def cam_low(n,z,b): return c_(n,z,72,b)
def cam_orbit(n,z,b): return c_(n,z,50,b)
def cam_push(n,z,b=-12): return c_(n,z+0.5,42,b)
def _w(lon,lat,z,p,b):
    x,y=_mc(lon,lat); return (x,y,z,p,b)
W0=_w(10,25,1.1,0,0)
W1=_w(30,38,2.0,38,-15)
