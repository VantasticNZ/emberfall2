# =============================================================================
# build_slice_art.py — reproducible art-pipeline step for the vertical slice.
#
# Source : public/art/terrain/_src/terrain_summer.png (ElizaWy LPC, OGA-BY 3.0)
# Output : a POND 9-slice (grass-banked water -> a real pond, not a flat blue box)
#          under public/art/terrain/.
# (Mara's earlier hue-rotated "red shirt" hack was REPLACED by real ElizaWy
#  feminine LPC layers — see scripts/fetch_eliza_npcs.sh.)
# =============================================================================
from PIL import Image
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'public', 'art', 'terrain', '_src')
OUT = os.path.join(ROOT, 'public', 'art', 'terrain')
TS = 32

T = Image.open(os.path.join(SRC, 'terrain_summer.png')).convert('RGBA')
def cell(r, c): return T.crop((c * TS, r * TS, c * TS + TS, r * TS + TS))

# POND 9-slice (grass-banked water block, rows 10-12 x cols 0-2; centre = water).
pond = {'nw': (10, 0), 'n': (10, 1), 'ne': (10, 2),
        'w':  (11, 0), 'c': (11, 1), 'e':  (11, 2),
        'sw': (12, 0), 's': (12, 1), 'se': (12, 2)}
for name, (r, c) in pond.items():
    cell(r, c).save(os.path.join(OUT, f'pond_{name}.png'))
print(f'pond 9-slice: {len(pond)} tiles')
print('done.')
