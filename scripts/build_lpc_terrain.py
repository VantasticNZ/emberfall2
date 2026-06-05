# =============================================================================
# build_lpc_terrain.py  —  reproducible art-pipeline step for LPC terrain.
#
# Source : public/art/terrain/_src/*.png  (ElizaWy LPC, OGA-BY 3.0 — same art
#          family as the LPC characters, so pixel density matches).
# Output : 32px ground tiles + cropped multi-tile props under public/art/terrain/.
#
# Ground tiles are 32px native (= TILE), tiled 1:1 (no upscale => not blocky).
# Trees are multi-tile sprites cropped to their alpha bbox (tall => Gate C
# occluders). Footprints are computed in final px and printed for the manifest.
# =============================================================================
from PIL import Image
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'public', 'art', 'terrain', '_src')
OUT = os.path.join(ROOT, 'public', 'art', 'terrain')
TS = 32

terrain = Image.open(os.path.join(SRC, 'terrain_summer.png')).convert('RGBA')
trees   = Image.open(os.path.join(SRC, 'trees_summer.png')).convert('RGBA')
plants  = Image.open(os.path.join(SRC, 'plants_summer.png')).convert('RGBA')
tilled  = Image.open(os.path.join(SRC, 'tilled_soil.png')).convert('RGBA')
signs   = Image.open(os.path.join(SRC, 'sign_backgrounds.png')).convert('RGBA')

def cell(img, r, c):
    return img.crop((c * TS, r * TS, c * TS + TS, r * TS + TS))

def save(im, name):
    p = os.path.join(OUT, name); im.save(p)
    print(f'  {name:16} {im.width}x{im.height}')

# --- GROUND TILES (32px seamless fills, chosen by uniformity scan) ------------
# Grass is a FLAT fill (no built-in tuft) so it doesn't tile into a visible
# lattice; variety comes from scattered decals (below), placed off the grid.
print('ground tiles (32px):')
save(cell(terrain, 1, 1),  'grass.png')   # flat grass base
save(cell(terrain, 3, 4),  'dirt.png')    # earth
save(cell(terrain, 6, 3),  'path.png')    # light sand path
save(cell(terrain, 11, 1), 'water.png')   # shallow water
save(cell(tilled, 3, 3),   'garden.png')  # tilled soil (crop patch)

# --- GRASS DECALS (small, scattered off-grid to break uniformity) ------------
def pcell(r, c):
    x = plants.crop((c * TS, r * TS, c * TS + TS, r * TS + TS))
    bb = x.getbbox(); return x.crop(bb) if bb else x
print('grass decals:')
save(pcell(1, 8),  'decal_tuft.png')          # grass tuft
save(pcell(0, 14), 'decal_flower_pink.png')   # pink flower
save(pcell(1, 14), 'decal_flower_white.png')  # white flower

# --- PROPS (cropped to alpha bbox; final px) ----------------------------------
def crop_trim(img, box):
    c = img.crop(box); bb = c.getbbox(); return c.crop(bb) if bb else c

print('props (final px):')
oak  = crop_trim(trees, (320, 0, 416, 160))     # tall oak (canopy + trunk)
pine = crop_trim(trees, (416, 352, 480, 512))   # tall pine
bush = crop_trim(plants, (0, 0, 32, 32))        # round leafy bush
sign = crop_trim(signs, (0, 0, 32, 32))         # wooden sign board
save(oak,  'tree_oak.png')
save(pine, 'tree_pine.png')
save(bush, 'bush.png')
save(sign, 'sign.png')

# footprint hints (trunk/base box, anchored to centre origin)
for name, im, fw in [('tree_oak', oak, 16), ('tree_pine', pine, 12), ('bush', bush, 14), ('sign', sign, 14)]:
    h = im.height
    print(f'  FP {name}: size {im.width}x{h}  base offY={h//2 - 4}')
print('done.')
