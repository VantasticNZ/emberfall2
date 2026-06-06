#!/usr/bin/env python3
# =============================================================================
# build_lpc_env.py — ASSET HUNT (2026-06-07). Copies the LPC-STYLE environment /
# monster / prop / effect working set from the local master env library
# (C:\GameAssets\lpc-env, NOT in git) into the repo at asset-library/2d/.
#
# Only LPC-style, Emberfall-usable art is copied (style consistency: 32px LPC
# tiles / 64px LPC creatures). Clearly-modern props are skipped (kept in master).
# Sources (all open-source, none anti-AI):
#   - [LPC] Terrains   — bluecarrot16 + many — CC-BY-SA 4.0/3.0 — bog/cave/water/biomes
#   - ElizaWy/LPC      — Eliza Wyatt + contributors — OGA-BY 3.0 — terrain/structure/objects/FX
#   - [LPC] Monsters   — CharlesGabriel, bagzie, bluecarrot16 — CC-BY-SA 3.0/GPL 3.0 — 64px creatures
#   - Extended LPC Magic pack — Daniel Eddeland — CC-BY-SA 3.0/GPL 3.0 — combat FX
# =============================================================================
import os, shutil

SRC  = r"C:\GameAssets\lpc-env"
DEST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..",
                                    "asset-library", "2d"))

# clearly-modern / anachronistic props to exclude from a medieval marsh RPG
MODERN = {
    "Copy Machine.png", "Fridge.png", "Oven, Modern.png", "TV, Widescreen.png",
    "TV, Widescreen - No Service.png", "Vending Machine.png", "Water Cooler.png",
    "Coffee Maker.png", "Laptop.png", "Rotary Phones.png", "Desk, Office.png",
    "Sink, Countertop.png", "Sink, Pedestal.png", "Christmas Tree.png",
    "Presents.png",
}

def copytree(src, dst, skip=None):
    n = 0
    for root, _dirs, files in os.walk(src):
        for f in files:
            if skip and f in skip:
                continue
            s = os.path.join(root, f)
            rel = os.path.relpath(s, src)
            d = os.path.join(dst, rel)
            os.makedirs(os.path.dirname(d), exist_ok=True)
            shutil.copy2(s, d)
            n += 1
    return n

def copyfiles(srcdir, dst, exts=(".png", ".txt", ".tsx")):
    n = 0
    os.makedirs(dst, exist_ok=True)
    for f in sorted(os.listdir(srcdir)):
        if f.lower().endswith(exts):
            shutil.copy2(os.path.join(srcdir, f), os.path.join(dst, f))
            n += 1
    return n

# lpc-terrains: copy ONLY the real art + tsx + credits (skip the huge id-map +
# Tiled tooling artifacts terrain-map-v7.png / .tmx / .sh — kept in master only).
_lt_src = os.path.join(SRC, "terrains", "lpc-terrains")
_lt_dst = os.path.join(DEST, "tiles", "lpc-terrains")
os.makedirs(_lt_dst, exist_ok=True)
_lt_n = 0
for _f in ("terrain-v7.png", "terrain-v7.tsx", "CREDITS-terrain.txt"):
    _s = os.path.join(_lt_src, _f)
    if os.path.isfile(_s):
        shutil.copy2(_s, os.path.join(_lt_dst, _f)); _lt_n += 1
print(f"  {_lt_n:4d}  tiles/lpc-terrains (bog/cave/water/biomes; art+tsx+credits only)")

jobs = [
    # (label, src, dest, skip)
    ("tiles/eliza-terrain (cliffs/waterfall/ice/plants)",
     os.path.join(SRC, "eliza", "Terrain"),
     os.path.join(DEST, "tiles", "eliza-terrain"), None),
    ("buildings/eliza-structure (walls/floors/doors/windows/roofing)",
     os.path.join(SRC, "eliza", "Structure"),
     os.path.join(DEST, "buildings", "eliza-structure"), None),
    ("items/eliza-objects (furniture/props, modern skipped)",
     os.path.join(SRC, "eliza", "Objects"),
     os.path.join(DEST, "items", "eliza-objects"), MODERN),
    ("sprites/enemies/lpc-monsters (64px creatures)",
     os.path.join(SRC, "monsters", "lpc-monsters"),
     os.path.join(DEST, "sprites", "enemies", "lpc-monsters"), None),
    ("effects/eliza-water (splash/ripple/reflections)",
     os.path.join(SRC, "eliza", "FX"),
     os.path.join(DEST, "effects", "eliza-water"), None),
]

total = _lt_n
for label, src, dst, skip in jobs:
    if not os.path.isdir(src):
        print("  MISSING SRC:", src); continue
    n = copytree(src, dst, skip)
    total += n
    print(f"  {n:4d}  {label}")

# magic pack: just the sheets/ (combat FX), not gifs/previews
msrc = os.path.join(SRC, "magic", "magic_pack", "sheets")
if os.path.isdir(msrc):
    n = copyfiles(msrc, os.path.join(DEST, "effects", "lpc-magic"), (".png",))
    total += n
    print(f"  {n:4d}  effects/lpc-magic (firelion/ice/lightning/tornado/...)")
# the extended bat too (master root)
ebat = os.path.join(SRC, "monsters", "bat.png")
if os.path.isfile(ebat):
    shutil.copy2(ebat, os.path.join(DEST, "sprites", "enemies", "lpc-monsters", "bat_extended.png"))
    total += 1

print("total files copied to repo:", total)
