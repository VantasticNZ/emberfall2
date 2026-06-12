# Widen the cast's visual range (item 4) by hue/value-shifting EXISTING licence-clean ElizaWy layers into
# more HAIR COLOURS and SKIN TONES (derivatives of the same OGA-BY source; alpha + shading preserved). New
# clothing SHAPES + accessories (hats/aprons/tools) are NOT producible by recolour — those stay a GAP.
from PIL import Image
import os
ST = ['idle','walk','attack']
def proc(src_dir, dst_dir, states, hue=0, sat=1.0, val=1.0, extra=None):
    os.makedirs(dst_dir, exist_ok=True)
    files = list(states)
    if extra: files += extra
    for st in files:
        src = os.path.join(src_dir, st)
        if not os.path.exists(src): continue
        img = Image.open(src).convert('RGBA'); r,g,b,a = img.split()
        h,s,v = Image.merge('RGB',(r,g,b)).convert('HSV').split()
        if hue: h = h.point(lambda p:(p+hue)%256)
        if sat!=1.0: s = s.point(lambda p:max(0,min(255,int(p*sat))))
        if val!=1.0: v = v.point(lambda p:max(0,min(255,int(p*val))))
        r2,g2,b2 = Image.merge('HSV',(h,s,v)).convert('RGB').split()
        Image.merge('RGBA',(r2,g2,b2,a)).save(os.path.join(dst_dir,st))
HAIR = 'public/art/eliza/hair'  # chestnut base
# hair colours (value/sat/hue tuned off chestnut-brown)
proc(HAIR,'public/art/eliza/hair_black',  [f+'.png' for f in ST], hue=0,  sat=0.5, val=0.32)
proc(HAIR,'public/art/eliza/hair_auburn', [f+'.png' for f in ST], hue=245,sat=1.25,val=0.85)
proc(HAIR,'public/art/eliza/hair_blond',  [f+'.png' for f in ST], hue=22, sat=0.95,val=1.45)
proc(HAIR,'public/art/eliza/hair_ginger', [f+'.png' for f in ST], hue=8,  sat=1.4, val=1.1)
# SKIN tones — body + head together (head also has expr.png for the face). Tan + deep.
for skin,(hue,sat,val) in {'tan':(252,1.05,0.74),'deep':(250,1.1,0.5)}.items():
    proc('public/art/eliza/body', f'public/art/eliza/body_{skin}', [f+'.png' for f in ST], hue=hue,sat=sat,val=val)
    proc('public/art/eliza/head', f'public/art/eliza/head_{skin}', [f+'.png' for f in ST], hue=hue,sat=sat,val=val, extra=['expr.png'])
print('done')
