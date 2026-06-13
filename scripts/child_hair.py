# KIDS' HAIR BOUNCE / HAIR-AS-WEAPON — real root cause (live-animation decode): the old bake shifted each
# direction's hair DOWN by a single per-direction CONSTANT. But the head bobs by a DIFFERENT amount PER FRAME,
# and the child hair is baked from the ADULT hair animation (adult per-frame bob != child head per-frame bob).
# A per-direction constant can't track a per-FRAME mismatch — so walk/idle mostly tracked but the ATTACK frames
# displaced the hair 2-4px frame-to-frame (the "hair swings like a weapon"), and any per-frame drift reads as a
# bounce on the moving child.
#
# FIX: seat the hair PER (direction, frame) against the CHILD HEAD's actual crown that frame. For every cell we
# measure the child_head crown-top and the raw adult-hair crown-top, then shift the hair so its crown sits a
# fixed CAP inset G[dir] above the head crown — EVERY frame. Result: the hair caps the head identically in every
# frame of every state/direction (idle/walk/attack) → no bounce, no attack-swing. oy stays 0 (no runtime offset).
# G[dir] = the natural cap inset taken from the already-good WALK frames (up 1px, others 3px).
from PIL import Image
import os
FR = 64
G = {0: 1, 1: 3, 2: 3, 3: 3}   # LPC rows up=0,left=1,down=2,right=3 — hair-crown px above head-crown

def top_opaque(img, c, r):
    px = img.load()
    for y in range(FR):
        for x in range(FR):
            if px[c * FR + x, r * FR + y][3] > 40:
                return y
    return None

def bake(src_tex, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    # the SEATED idle hair pose per direction (row), col 0 — the shape used for EVERY frame so the hair never
    # swooshes. (Crucial: the adult-hair ATTACK frames animate the hair FLYING with the slash — on the child that
    # reads as 'hair-as-weapon'. We discard that motion and keep the seated shape, just re-seated per frame.)
    idle_src = Image.open(f'public/art/eliza/{src_tex}/idle.png').convert('RGBA')
    for st in ['idle', 'walk', 'attack']:
        headp = f'public/art/eliza/child_head/{st}.png'
        if not os.path.exists(headp):
            continue
        head = Image.open(headp).convert('RGBA')
        W, H = head.size
        out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        cols, rows = W // FR, H // FR
        for r in range(rows):
            # the seated idle-hair cell for this direction (its raw crown), reused for every frame of this state
            seat_cell = idle_src.crop((0, r * FR, FR, r * FR + FR))
            seat_top = top_opaque(idle_src, 0, r)
            for c in range(cols):
                headTop = top_opaque(head, c, r)
                if seat_top is None or headTop is None:
                    out.paste(seat_cell, (c * FR, r * FR), seat_cell)
                    continue
                # place the SEATED hair shape so its crown sits G[dir] px above THIS frame's head crown — so the
                # hair tracks the head's per-frame bob/tilt-shift but never swings (idle/walk/attack all seated).
                shift = (headTop - G.get(r, 3)) - seat_top
                out.paste(seat_cell, (c * FR, r * FR + shift), seat_cell)
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
print('child hair re-baked PER-FRAME (hair crown tracks the child head crown every frame; cap inset up 1px / others 3px) — no bounce, no attack-swing')
