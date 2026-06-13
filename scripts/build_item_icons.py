#!/usr/bin/env python3
# Extract item ICONS from the licence-vetted eliza-objects "Small Items" set (ElizaWy LPC Objects, OGA-BY 3.0)
# into public/art/icons/<id>.png — the inventory/buy/sell pictures (Item 3). 32px grid cells.
# Also builds /tmp montages of ambiguous sheets (scaled, grid-labelled) so the exact cell can be picked by eye.
import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'asset-library/2d/items/eliza-objects/Small Items')
OUT = os.path.join(ROOT, 'public/art/icons')
TMP = os.path.join(ROOT, 'asset-gap-test')   # scratch montages (gitignored area)
os.makedirs(OUT, exist_ok=True)
os.makedirs(TMP, exist_ok=True)
TS = 32

def sheet(rel): return Image.open(os.path.join(SRC, rel + '.png')).convert('RGBA')
def cell(img, c, r): return img.crop((c * TS, r * TS, c * TS + TS, r * TS + TS))

# CONFIDENT extractions (each cell VIEWED in the montages below — unambiguous) -> public/art/icons/<id>.png.
# These are the items eliza-objects clearly covers (food + materials). Everything else falls back to its NAME.
CONFIDENT = [
    ('bread',    'Food/Bread A',            0, 0),   # the loaf, top-left
    ('cheese',   'Food/Cheese A',           0, 0),   # the wedge, top-left
    ('apple',    'Food/Fruit B',            0, 0),   # red apple, top-left
    ('stew',     'Food/Meals',              2, 0),   # red soup/stew bowl
    ('meat_pie', 'Food/Meals',              0, 0),   # golden pie in a dish
    ('fish',     'Food/Seafood A',          4, 0),   # a single blue fish
    ('iron_ore', 'Ores & Ingots/Ore, Iron', 0, 0),   # raw iron chunk
    ('bog_iron', 'Ores & Ingots/Ore, Iron', 1, 0),   # a second ore chunk (bog iron)
    ('timber',   'Lumber',                  0, 0),   # a single plank/board
]
for name, rel, c, r in CONFIDENT:
    cell(sheet(rel), c, r).save(os.path.join(OUT, name + '.png'))
    print('icon:', name, '<-', rel, (c, r))

# MONTAGES for the ambiguous sheets — scale 4x, draw the grid + (col,row) labels so cells are pickable by eye.
def montage(rel):
    img = sheet(rel); cols, rows = img.width // TS, img.height // TS
    S = 4; cw = TS * S
    out = Image.new('RGBA', (cols * cw, rows * cw), (30, 30, 40, 255))
    d = ImageDraw.Draw(out)
    for r in range(rows):
        for c in range(cols):
            cel = cell(img, c, r).resize((cw, cw), Image.NEAREST)
            out.alpha_composite(cel, (c * cw, r * cw))
            d.rectangle([c*cw, r*cw, c*cw+cw-1, r*cw+cw-1], outline=(90,90,110,255))
            d.text((c*cw+2, r*cw+2), f'{c},{r}', fill=(255,230,90,255))
    p = os.path.join(TMP, 'mont_' + rel.split('/')[-1].replace(' ', '_').replace(',', '') + '.png')
    out.save(p); print('montage:', p, f'({cols}x{rows})')

for rel in ['Food/Fruit A', 'Food/Meals', 'Food/Seafood A', 'Lumber', 'Tools, Smithing', 'Lighting, Table', 'Loose Paper', 'Food/Dessert']:
    try: montage(rel)
    except Exception as e: print('skip', rel, e)
