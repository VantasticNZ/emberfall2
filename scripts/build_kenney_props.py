# =============================================================================
# build_kenney_props.py  —  reproducible art-pipeline step (one-off, re-runnable)
#
# Source : public/art/kenney/tiny_town.png  (Kenney "Tiny Town" 1.1, CC0)
#          a 12x11 grid of 16px tiles (tilemap_packed.png).
# Output : individual ground tiles (16px, native) + composed props (final px),
#          written under public/art/kenney/.  ALL art is CC0 (see ART-LICENSE-NOTE).
#
# WHY pre-build: the world renders Kenney at 2x (32px tiles) so 3-tile houses
# (~96px) read taller than the 64px LPC hero (cohesion + Gate C occlusion).
# Ground tiles stay 16px native (tiled with tileScale=2); props are baked to
# their final pixel size here so collision footprints are plain final-px data
# (no sprite-scale / body-scale math in the engine).
# =============================================================================
from PIL import Image
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEN = os.path.join(ROOT, 'public', 'art', 'kenney')
SHEET = Image.open(os.path.join(KEN, 'tiny_town.png')).convert('RGBA')
COLS, TS = 12, 16

def tile(i):
    c, r = i % COLS, i // COLS
    return SHEET.crop((c * TS, r * TS, c * TS + TS, r * TS + TS))

def stamp(rows):
    """Composite a grid of tile indices (None = empty cell) into one image."""
    h = len(rows); w = max(len(r) for r in rows)
    im = Image.new('RGBA', (w * TS, h * TS), (0, 0, 0, 0))
    for r, row in enumerate(rows):
        for c, idx in enumerate(row):
            if idx is not None:
                im.alpha_composite(tile(idx), (c * TS, r * TS))
    return im

def up(im, scale):
    return im.resize((im.width * scale, im.height * scale), Image.NEAREST)

def save(im, name):
    p = os.path.join(KEN, name); im.save(p)
    print(f'  {name:18} {im.width}x{im.height}')

# --- GROUND TILES (16px native; engine tiles them at 2x) ---------------------
print('ground tiles (16px native):')
save(tile(0),  'grass.png')          # plain grass
save(tile(2),  'grass_flower.png')   # grass w/ flowers (accent)
save(tile(25), 'dirt.png')           # seamless full dirt (roads / paths)
save(tile(43), 'garden.png')         # tilled crop patch (replaces the old pond)

# --- PROPS (baked to FINAL px = native * 2) ----------------------------------
print('props (final px, 2x):')
# House: red roof (2 rows) over a wall row (window-door-window). 48x48 -> 96x96.
save(up(stamp([[52, 53, 54], [64, 65, 66], [89, 88, 90]]), 2), 'house.png')
save(up(tile(28), 2), 'tree.png')        # round green tree
save(up(tile(30), 2), 'bush.png')        # leafy bush
save(up(tile(83), 2), 'sign.png')        # wooden signpost
save(up(tile(107), 2), 'barrel.png')     # wooden barrel
save(up(tile(29), 2), 'mushroom.png')    # red mushrooms (decor, non-solid)
print('done.')
