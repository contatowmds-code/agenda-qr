CENT={'Brazil':(-52,-12),'Argentina':(-65,-36),'Colombia':(-73,4),'Chile':(-71,-33),'Peru':(-75,-10)}
VAL={'Brazil':2.65,'Argentina':0.7682,'Colombia':0.572,'Chile':0.4022,'Peru':0.3996}   # US$ tri, FMI out/2026
NOME={'Brazil':'BRASIL','Argentina':'ARGENTINA','Colombia':'COLÔMBIA','Chile':'CHILE','Peru':'PERU'}
KBAR=0.03
COVER="*BRASIL* VALE MAIS|QUE *4 PAÍSES*|JUNTOS"
def fmt(v): return f"US$ {v:.2f} TRI".replace('.',',') if v>=1 else f"US$ {v*1000:.0f} BI"
