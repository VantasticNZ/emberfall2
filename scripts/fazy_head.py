# FETCH (free, no commission): a PLUMP/jowly head for Fazy Lastard, from the Universal-LPC `male_plump` head
# (Redshrike + LPC, CC-BY-SA 3.0 / GPL 3.0 — AI-commercial safe). Its skin is the EXACT eliza ivory (249,213,186)
# and its head geometry is within ~2px of the eliza head, so it drops onto Fazy's body_ivory with a small seat
# offset (set in assets.js). Fazy is static (speed 0, idle), so the cross-rig walk-bob is moot — only the idle
# frames are seen. We still build all three states (the loader expects them) by reconciling the ULPC frame
# counts to the eliza layout: idle 2->3, walk 9->8 (drop the lead stand-frame), slash 6 -> attack 7 (repeat last).
from PIL import Image
import os
FR = 64
SRC = 'C:/GameAssets/lpc-full/spritesheets/head/heads/human/male_plump'
OUT = 'public/art/eliza/head_plump'
os.makedirs(OUT, exist_ok=True)

def remap(src_png, col_map, out_png):
    im = Image.open(src_png).convert('RGBA'); W, H = im.size; rows = H // FR
    out = Image.new('RGBA', (FR * len(col_map), H), (0, 0, 0, 0))
    for r in range(rows):
        for di, sc in enumerate(col_map):
            cell = im.crop((sc*FR, r*FR, sc*FR+FR, r*FR+FR))
            out.paste(cell, (di*FR, r*FR), cell)
    out.save(out_png)

remap(f'{SRC}/idle.png',  [0, 1, 0],                 f'{OUT}/idle.png')    # 2 ULPC frames -> 3 (eliza idle)
remap(f'{SRC}/walk.png',  [1, 2, 3, 4, 5, 6, 7, 8],  f'{OUT}/walk.png')    # 9 -> 8 (drop the lead stand-frame)
remap(f'{SRC}/slash.png', [0, 1, 2, 3, 4, 5, 5],     f'{OUT}/attack.png')  # 6 slash -> 7 attack (repeat last)
print('head_plump written (idle 3 / walk 8 / attack 7) — ULPC male_plump reconciled to the eliza layout')
