# KIDS' HAIR BOUNCE — root cause: the adult hair textures are drawn for the ADULT head's per-direction
# position. On the smaller child head the crown sits LOWER, but by a DIFFERENT amount per facing — UP ~4px,
# left/down/right ~6px (measured: child_head_top - adult_head_top). A single constant `oy` offset (the old fix)
# therefore mis-seats one direction by ~2px, so the hair JUMPS when the child turns/walks UP — the "bounce".
# A per-layer oy can't vary by direction, so BAKE the per-direction shift into child-fitted hair sheets: shift
# each direction's rows DOWN by its own amount, per frame, so the hair caps the child head identically in every
# frame of every direction. The child_hair_* PARTS then use these baked textures with oy:0 (no runtime offset).
from PIL import Image
import os
FR = 64
# LPC row order: up=0, left=1, down=2, right=3. Per-direction downward shift onto the child skull.
SHIFT = {0: 4, 1: 6, 2: 6, 3: 6}

def bake(src_tex, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    for st in ['idle', 'walk', 'attack']:
        p = f'public/art/eliza/{src_tex}/{st}.png'
        if not os.path.exists(p): continue
        img = Image.open(p).convert('RGBA'); W, H = img.size
        out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        cols, rows = W // FR, H // FR
        for r in range(rows):
            sh = SHIFT.get(r, 6)
            for c in range(cols):
                cell = img.crop((c*FR, r*FR, c*FR+FR, r*FR+FR))
                # paste the cell shifted DOWN by `sh` (hair lives at the top of the cell, so it stays in-frame)
                out.paste(cell, (c*FR, r*FR + sh), cell)
        out.save(os.path.join(out_dir, st + '.png'))

# src adult-hair tex -> baked child hair name (same colours the presets/kids reference)
STYLES = {
    'hair':        'child_hair_natural',
    'hair_black':  'child_hair_black',
    'hair_ginger': 'child_hair_ginger',
    'hair_blond':  'child_hair_blond',
    'hair_auburn': 'child_hair_auburn',
    'hair_mara':   'child_hair_bob',
}
for src, name in STYLES.items():
    bake(src, f'public/art/eliza/{name}')
print('child hair baked (per-direction seat: up 4px, others 6px) — no more bounce')
