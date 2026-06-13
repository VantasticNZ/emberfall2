# MONSTER child head — asset-first audit verdict: the owned art has NO monster/creature parts and NO horn
# layers, so a true creature rig is a COMMISSION. The honest playable monster-child built from owned parts =
# the child head recoloured goblin-green with small horns COMPOSITED on (procedural pixels, same technique as
# the romper), matched to the green monster body. Per cell: tint the head green, then draw two short horn nubs
# at the head's top-corners (greyed bone), so they sit on the skull across all four facings.
from PIL import Image
import colorsys, os
FR = 64
HORN = (208, 198, 176)   # pale bone
HORN_DK = (150, 138, 116)

def greenskin(R, G, B):
    h, s, v = colorsys.rgb_to_hsv(R/255.0, G/255.0, B/255.0)
    r, g, b = colorsys.hsv_to_rgb(0.28, min(1.0, s*0.6 + 0.35), v)
    return (int(r*255), int(g*255), int(b*255))

def horn(px, W, Hh, ox, oy, side):
    # a 5px-tall nub tapering up, leaning outward; side = -1 (left) / +1 (right). ox/oy are ABSOLUTE pixels.
    for i, w in enumerate([2, 2, 2, 1, 1]):     # base→tip widths (i=0 base, i=4 tip)
        yy = oy - i                             # base at oy, tip 4px above
        lean = side * (i // 2)                  # tip leans outward
        for k in range(w):
            xx = ox + side*k + lean
            if 0 <= xx < W and 0 <= yy < Hh:
                px[xx, yy] = (HORN_DK[0], HORN_DK[1], HORN_DK[2], 255) if i >= 3 else (HORN[0], HORN[1], HORN[2], 255)

def build(src_dir, out_dir):
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
                # tint the head green
                for y in range(y0, y1+1):
                    for x in range(x0, x1+1):
                        R, G, B, A = px[c*FR+x, r*FR+y]
                        if A < 24: continue
                        g = greenskin(R, G, B); px[c*FR+x, r*FR+y] = (g[0], g[1], g[2], A)
                # horns at the top corners of the skull (base ON the head top row, ABSOLUTE pixel coords)
                horn(px, W, H, c*FR + x0 + 2, r*FR + y0 + 1, -1)
                horn(px, W, H, c*FR + x1 - 2, r*FR + y0 + 1, +1)
        img.save(os.path.join(out_dir, st + '.png'))

build('public/art/eliza/child_head', 'public/art/eliza/child_head_monster')
print('monster child head written (green skin + composited horns)')
