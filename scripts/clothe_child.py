# L1: the ElizaWy child body ships BARE (skin only); no matching child clothing exists in the ElizaWy set, and
# the classic-LPC child clothing has a different frame count (9-walk vs 8). So compose a child-FITTED FULL outfit
# (shirt + leggings/pants + shoes) ONTO the bare child body per-frame: auto-detect each frame's body bbox, then
# recolour three bands by MULTIPLYING a fabric colour over the body luminance (so the body's own shading becomes
# cloth folds). The SHIRT band is full-width (arms become sleeves); the PANTS + SHOES bands are restricted to the
# CENTRAL columns so the legs are clothed but the side-hanging hands stay skin. Result: a complete, matched,
# fully-clothed child — torso AND legs covered (fixes the pantless romper), face/hands/lower-arms skin.
from PIL import Image
import colorsys, os
FR = 64

def _tint(R, G, B, rgb):
    lum = (0.3*R + 0.59*G + 0.11*B) / 255.0
    return (int(rgb[0]*lum), int(rgb[1]*lum), int(rgb[2]*lum))

def _greenskin(R, G, B):
    # rotate hue toward goblin-green while keeping the body's shading (value) + a touch more saturation
    h, s, v = colorsys.rgb_to_hsv(R/255.0, G/255.0, B/255.0)
    r, g, b = colorsys.hsv_to_rgb(0.28, min(1.0, s*0.6 + 0.35), v)
    return (int(r*255), int(g*255), int(b*255))

def clothe(src_dir, out_dir, shirt, pants, shoe, greenskin=False):
    os.makedirs(out_dir, exist_ok=True)
    for st in ['idle', 'walk', 'attack']:
        p = os.path.join(src_dir, st + '.png')
        if not os.path.exists(p): continue
        img = Image.open(p).convert('RGBA'); W, H = img.size; px = img.load()
        cols, rows = W // FR, H // FR
        for r in range(rows):
            for c in range(cols):
                xs = []; ys = []
                for y in range(FR):
                    for x in range(FR):
                        if px[c*FR+x, r*FR+y][3] > 24: xs.append(x); ys.append(y)
                if not ys: continue
                x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
                bw, bh = x1 - x0, y1 - y0; cx = (x0 + x1) / 2.0
                lx, rx = cx - 0.40*bw, cx + 0.40*bw   # central columns = the legs (not the side arms/hands)
                # MONSTER: recolour the whole skin green BEFORE the outfit goes on
                if greenskin:
                    for y in range(y0, y1+1):
                        for x in range(x0, x1+1):
                            R, G, B, A = px[c*FR+x, r*FR+y]
                            if A < 24: continue
                            g = _greenskin(R, G, B); px[c*FR+x, r*FR+y] = (g[0], g[1], g[2], A)
                # SHIRT (full width → sleeves): shoulders → hips
                sa, sb = y0+int(bh*0.02), y0+int(bh*0.52)
                for y in range(sa, sb+1):
                    for x in range(FR):
                        R, G, B, A = px[c*FR+x, r*FR+y]
                        if A < 24: continue
                        t = _tint(R, G, B, shirt); px[c*FR+x, r*FR+y] = (t[0], t[1], t[2], A)
                # PANTS (central columns only → legs): hips → ankle
                pa, pb = y0+int(bh*0.52), y0+int(bh*0.87)
                for y in range(pa, pb+1):
                    for x in range(FR):
                        if x < lx or x > rx: continue
                        R, G, B, A = px[c*FR+x, r*FR+y]
                        if A < 24: continue
                        t = _tint(R, G, B, pants); px[c*FR+x, r*FR+y] = (t[0], t[1], t[2], A)
                # SHOES (central columns only → feet): ankle → sole
                ha = y0+int(bh*0.87)
                for y in range(ha, y1+1):
                    for x in range(FR):
                        if x < lx or x > rx: continue
                        R, G, B, A = px[c*FR+x, r*FR+y]
                        if A < 24: continue
                        t = _tint(R, G, B, shoe); px[c*FR+x, r*FR+y] = (t[0], t[1], t[2], A)
        img.save(os.path.join(out_dir, st + '.png'))

PANTS = (110, 82, 55); SHOES = (74, 54, 38)   # shared brown leggings + shoes
COLOURS = {'_blue': (86, 120, 196), '_green': (96, 150, 96), '_rust': (178, 96, 60)}
for skin in ['child_body', 'child_body_tan', 'child_body_brown']:
    for suf, rgb in COLOURS.items():
        clothe(f'public/art/eliza/{skin}', f'public/art/eliza/{skin}{suf}', rgb, PANTS, SHOES)
# MONSTER child — green goblin skin + a tattered earth-toned outfit, in 3 colour variants (tunic hue)
MON = {'_mossy': (96, 132, 78), '_ash': (120, 120, 124), '_blood': (150, 70, 60)}
for suf, rgb in MON.items():
    clothe('public/art/eliza/child_body', f'public/art/eliza/child_body_monster{suf}', rgb, (84, 66, 48), (54, 42, 30), greenskin=True)
print('clothed child bodies written (full outfit: shirt + pants + shoes; + monster green variants)')
