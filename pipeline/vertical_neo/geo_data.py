CENT={'United States of America':(-98,39),'Germany':(10.4,51),'Italy':(12.5,42.8),'France':(2.5,46.6),'Russia':(40,56),'China':(104,35),'India':(78,22),'Poland':(19,52),'Turkey':(35,39)}
VAL={'United States of America':8.1335,'Germany':3.3503,'Italy':2.4518,'France':2.437,'Russia':2.3,'China':2.3}   # mil toneladas (WGC/FMI)
NOME={'United States of America':'EUA','Germany':'ALEMANHA','Italy':'ITÁLIA','France':'FRANÇA','Russia':'RÚSSIA','China':'CHINA'}
KBAR=0.012
COVER="*EUA* GUARDAM|*8 MIL* TONELADAS|DE *OURO*"
def fmt(v):
    if abs(v-2.3)<1e-6: return "~2.300 T"
    return f"{v*1000:,.0f} T".replace(',','.')
