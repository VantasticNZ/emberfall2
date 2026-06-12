# The ElizaWy child sheets have idle = 1 frame/direction (64x256) but our ANIMS expect idle=3, attack=7.
# Walk is already 8 (compatible). Tile the single idle frame across to match (a kid stands still — fine;
# kids never attack, so attack reuses the idle frame). 64px frames, 4 directional rows.
from PIL import Image
import os
FR = 64
def tile(src, dst, cols):
    img = Image.open(src).convert('RGBA')  # 64 x (rows*64)
    rows = img.height // FR
    out = Image.new('RGBA', (FR*cols, img.height), (0,0,0,0))
    for r in range(rows):
        cell = img.crop((0, r*FR, FR, (r+1)*FR))
        for c in range(cols): out.paste(cell, (c*FR, r*FR))
    out.save(dst)
for d in ['child_body','child_body_tan','child_body_brown','child_head']:
    base = f'public/art/eliza/{d}'
    if not os.path.exists(base+'/idle.png'): continue
    # idle.png is the original 64-wide single frame; tile to 3 (idle) + 7 (attack)
    src = base+'/idle.png'
    tile(src, base+'/attack.png', 7)   # 7-frame attack (static; never played for kids)
    tile(src, base+'/idle.png', 3)     # overwrite idle with 3 tiled frames
    print('tiled', d)
print('done')
