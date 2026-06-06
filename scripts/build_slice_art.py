# =============================================================================
# build_slice_art.py — reproducible art-pipeline step for the vertical slice.
#
# Source : public/art/terrain/_src/terrain_summer.png (ElizaWy LPC, OGA-BY 3.0)
#          + public/art/eliza/shirt/{idle,walk,attack}.png (the hero shirt layer).
# Output : a POND 9-slice (grass-banked water -> a real pond, not a flat blue box)
#          under public/art/terrain/, and Mara's RED shirt (a hue-rotated recolour
#          of the blue shirt, shading + alpha preserved) under public/art/eliza/.
# =============================================================================
from PIL import Image
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'public', 'art', 'terrain', '_src')
OUT = os.path.join(ROOT, 'public', 'art', 'terrain')
TS = 32

T = Image.open(os.path.join(SRC, 'terrain_summer.png')).convert('RGBA')
def cell(r, c): return T.crop((c * TS, r * TS, c * TS + TS, r * TS + TS))

# --- POND 9-slice (grass-banked water block at rows 10-12, cols 0-2) ----------
# centre = open water; the 8 surround = grass banks + rocky shore.
pond = {'nw': (10, 0), 'n': (10, 1), 'ne': (10, 2),
        'w':  (11, 0), 'c': (11, 1), 'e':  (11, 2),
        'sw': (12, 0), 's': (12, 1), 'se': (12, 2)}
for name, (r, c) in pond.items():
    cell(r, c).save(os.path.join(OUT, f'pond_{name}.png'))
print(f'pond 9-slice: {len(pond)} tiles')

# --- Mara's red shirt (hue-rotate the blue shirt; keep shading + alpha) --------
def recolour(img, dh):
    r, g, b, a = img.split()
    h, s, v = Image.merge('RGB', (r, g, b)).convert('HSV').split()
    h = h.point(lambda x: (x + dh) % 256)
    s = s.point(lambda x: min(255, int(x * 1.05)))
    rgb = Image.merge('HSV', (h, s, v)).convert('RGB')
    return Image.merge('RGBA', (*rgb.split(), a))

dst = os.path.join(ROOT, 'public', 'art', 'eliza', 'shirt_red')
os.makedirs(dst, exist_ok=True)
for st in ['idle', 'walk', 'attack']:
    src = Image.open(os.path.join(ROOT, 'public', 'art', 'eliza', 'shirt', f'{st}.png')).convert('RGBA')
    recolour(src, 105).save(os.path.join(dst, f'{st}.png'))     # +105 ≈ blue -> warm red
print('shirt_red: idle/walk/attack')
print('done.')
