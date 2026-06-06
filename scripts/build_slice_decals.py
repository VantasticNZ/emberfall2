# =============================================================================
# build_slice_decals.py — ground-detail decals for the slice (lived-in variety).
# Source : public/art/terrain/_src/{plants_summer,terrain_summer}.png
#          (ElizaWy LPC + Sharm/Hyptosis, OGA-BY 3.0 — confirmed AI-safe).
# Output : varied grass/flower/plant decals + a soft worn-dirt patch under
#          public/art/terrain/. (A standalone ROCK decal was attempted from the
#          cobble block but read as a flat box — REJECTED, not shipped; a proper
#          rock prop would need an OGA-BY rock pack sourced separately.)
# =============================================================================
from PIL import Image, ImageDraw
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'public', 'art', 'terrain', '_src')
OUT = os.path.join(ROOT, 'public', 'art', 'terrain')
TS = 32

P = Image.open(os.path.join(SRC, 'plants_summer.png')).convert('RGBA')

def pcell(r, c):
    x = P.crop((c * TS, r * TS, c * TS + TS, r * TS + TS))
    bb = x.getbbox()
    return x.crop(bb) if bb else x

# Varied grass + ground-cover + flowers (plants_summer, OGA-BY).
picks = {
    'decal_grass_lush': (0, 8), 'decal_grass_tall': (0, 12), 'decal_clover': (0, 4),
    'decal_fern': (2, 3), 'decal_flower_blue': (2, 14),
}
for name, (r, c) in picks.items():
    pcell(r, c).save(os.path.join(OUT, f'{name}.png'))

# A soft-edged worn-dirt patch derived from the confirmed dirt tile (radial alpha
# falloff so it blends into grass — not a hard square).
dirt = Image.open(os.path.join(OUT, 'dirt.png')).convert('RGBA').resize((28, 20), Image.NEAREST)
mask = Image.new('L', (28, 20), 0)
for yy in range(20):
    for xx in range(28):
        d = ((xx - 14) / 14) ** 2 + ((yy - 10) / 10) ** 2
        mask.putpixel((xx, yy), max(0, min(255, int(255 * (1.0 - d) * 1.4))))
dirt.putalpha(mask)
dirt.save(os.path.join(OUT, 'decal_dirt_patch.png'))

print('baked decals:', list(picks) + ['decal_dirt_patch'])
