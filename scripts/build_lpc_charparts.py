#!/usr/bin/env python3
# =============================================================================
# build_lpc_charparts.py — TWO-TIER asset workflow (2026-06-07).
#
# Copies the RIG-COMPATIBLE working set of LPC character parts from the local
# MASTER LIBRARY (C:\GameAssets\lpc-full, NOT in git) into the repo at
# asset-library/2d/sprites/characters/. "Rig-compatible" = every style, colour
# and bodytype, but ONLY the 3 animations the current 64px paper-doll rig uses
# (idle / walk / slash). The master library holds all 17 animations; when a
# future feature needs more, re-run with a wider ANIMS set (no re-download).
#
# Source: github.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator
# Licence: every asset is OGA-BY / CC-BY-SA / CC-BY / GPL / CC0 (open-source,
# none anti-AI). Full per-part attribution: sheet_definitions + CREDITS.csv in
# the master library; summarised in docs/ASSET-LEDGER.md + the parts manifest.
# =============================================================================
import os, shutil, sys

MASTER = os.environ.get("LPC_SRC", r"C:\GameAssets\lpc-full\spritesheets")
DEST   = os.path.join(os.path.dirname(__file__), "..",
                      "asset-library", "2d", "sprites", "characters")
DEST   = os.path.abspath(DEST)
ANIMS  = {"idle", "walk", "slash"}          # the rig's animations

# top-level spritesheet dir -> repo category folder
def category_for(rel):
    p = rel.replace("\\", "/").split("/")
    top = p[0]
    if top == "body":
        return "accessories" if len(p) > 1 and p[1] == "wings" else "bodies"
    if top in ("head", "eyes"):
        return "bodies"
    if top in ("hair", "beards"):
        return "hair"
    if top in ("torso", "legs", "feet", "dress", "arms", "shoulders"):
        return "clothing"
    if top in ("hat", "cape", "neck", "backpack", "quiver", "facial", "tools"):
        return "accessories"
    if top == "weapon":
        return "weapons"
    if top == "shield":
        return "shields"
    if top == "shadow":
        return None
    return "accessories"

def is_rig_anim(rel, fname):
    base = fname[:-4] if fname.endswith(".png") else fname
    segs = set(rel.replace("\\", "/").split("/"))
    return base in ANIMS or bool(segs & ANIMS)

def main():
    if not os.path.isdir(MASTER):
        sys.exit("master library not found: " + MASTER)
    copied = 0
    per_cat = {}
    for root, _dirs, files in os.walk(MASTER):
        for f in files:
            if not f.endswith(".png"):
                continue
            full = os.path.join(root, f)
            rel = os.path.relpath(full, MASTER).replace("\\", "/")
            if not is_rig_anim(os.path.dirname(rel), f):
                continue
            cat = category_for(rel)
            if cat is None:
                continue
            dst = os.path.join(DEST, cat, rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(full, dst)
            copied += 1
            per_cat[cat] = per_cat.get(cat, 0) + 1
    print(f"copied {copied} png into {DEST}")
    for c in sorted(per_cat):
        print(f"  {per_cat[c]:6d}  {c}")

if __name__ == "__main__":
    main()
