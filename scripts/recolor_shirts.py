# Hue-shift the base blue shirt (art/eliza/shirt) into distinct colour variants (town-feel 6). Pure hue
# rotation of a licence-clean OGA-BY shirt = an OGA-BY derivative; alpha + folds preserved. Some get a value
# nudge to read as a deeper/lighter tone (amber lighter, maroon darker).
from PIL import Image
import os
BASE = 'public/art/eliza/shirt'; STATES = ['idle','walk','attack']
# name -> (hue offset 0-255, value scale)
VARIANTS = {
    'shirt_red':   (105, 1.0),   # warm red
    'shirt_plum':  (60,  1.0),   # plum / magenta
    'shirt_teal':  (220, 1.0),   # teal / cyan
    'shirt_amber': (135, 1.12),  # amber / gold (orange hue, lifted)
    'shirt_maroon':(100, 0.72),  # deep maroon (red hue, darkened)
}
def conv(img, off, vscale):
    img = img.convert('RGBA'); r,g,b,a = img.split()
    h,s,v = Image.merge('RGB',(r,g,b)).convert('HSV').split()
    h = h.point(lambda p:(p+off)%256)
    if vscale != 1.0: v = v.point(lambda p:max(0,min(255,int(p*vscale))))
    r2,g2,b2 = Image.merge('HSV',(h,s,v)).convert('RGB').split()
    return Image.merge('RGBA',(r2,g2,b2,a))
# clean out the mis-named earlier folders
for old in ('shirt_rust','shirt_wine'):
    d=f'public/art/eliza/{old}'
    if os.path.isdir(d):
        for f in os.listdir(d): os.remove(os.path.join(d,f))
        os.rmdir(d)
for name,(off,vs) in VARIANTS.items():
    d=f'public/art/eliza/{name}'; os.makedirs(d, exist_ok=True)
    for st in STATES:
        src=os.path.join(BASE,f'{st}.png')
        if os.path.exists(src): conv(Image.open(src),off,vs).save(os.path.join(d,f'{st}.png'))
    print('wrote',name)
