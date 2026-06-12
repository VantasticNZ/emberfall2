# L1: the ElizaWy child body ships BARE (skin only); no matching child clothing exists in the ElizaWy set, and
# the classic-LPC child clothing has a different frame count (9-walk vs 8). So compose a child-FITTED simple
# romper/tunic ONTO the bare child body per-frame: auto-detect each frame's body bbox, then recolour the
# torso+hips band (a fraction of the body height) to a fabric colour, MULTIPLYING so the body's own shading
# becomes cloth folds. Head/arms-lower/legs-lower/feet stay skin. A complete, matched, on-style child.
from PIL import Image
import os
FR = 64
def clothe(src_dir, out_dir, torso_rgb):
    os.makedirs(out_dir, exist_ok=True)
    for st in ['idle','walk','attack']:
        p = os.path.join(src_dir, st+'.png')
        if not os.path.exists(p): continue
        img = Image.open(p).convert('RGBA'); W,H = img.size; px = img.load()
        cols, rows = W//FR, H//FR
        for r in range(rows):
            for c in range(cols):
                # bbox of the body in this cell
                ys=[]
                for y in range(FR):
                    for x in range(FR):
                        if px[c*FR+x, r*FR+y][3] > 24: ys.append(y); break
                if not ys: continue
                y0, y1 = min(ys), max(ys); bh = y1-y0
                # the GARMENT band. The child_body texture is HEADLESS (head is a separate layer), so y0 is the
                # SHOULDER line, not the hair-tip. A romper/tunic therefore runs from just below the shoulders
                # (4%) down past the hips to upper-thigh (60%) — covering the whole chest+torso (no bare chest).
                # Legs + hands below stay skin (a short romper); upper arms get sleeved, which reads correct.
                ga, gb = y0+int(bh*0.04), y0+int(bh*0.60)
                for y in range(ga, gb+1):
                    for x in range(FR):
                        R,G,B,A = px[c*FR+x, r*FR+y]
                        if A < 24: continue
                        lum = (0.3*R+0.59*G+0.11*B)/255.0
                        # multiply the garment colour by the body luminance → shaded cloth
                        px[c*FR+x, r*FR+y] = (int(torso_rgb[0]*lum), int(torso_rgb[1]*lum), int(torso_rgb[2]*lum), A)
        img.save(os.path.join(out_dir, st+'.png'))
# a few clothed child bodies (a romper colour each), per skin tone base
COLOURS = {'_blue':(86,120,196), '_green':(96,150,96), '_rust':(178,96,60)}
for skin in ['child_body','child_body_tan','child_body_brown']:
    for suf,rgb in COLOURS.items():
        clothe(f'public/art/eliza/{skin}', f'public/art/eliza/{skin}{suf}', rgb)
print('clothed child bodies written')
