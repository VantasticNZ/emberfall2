#!/usr/bin/env python3
# =============================================================================
# build_lpc_env_manifest.py — manifest + attribution for the LPC-style
# environment / monster / prop / effect working set committed to the repo
# (asset-library/2d/{tiles,buildings,items,sprites/enemies,effects}).
# Writes asset-library/2d/ENV-MANIFEST.json + ENV-CREDITS.md.
# =============================================================================
import os, json

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BASE = os.path.join(ROOT, "asset-library", "2d")

# group dest-prefix -> source/attribution/style metadata (all licence-confirmed
# from the OGA pages / repo Credits; all open-source, none anti-AI).
GROUPS = [
    {"prefix": "tiles/lpc-terrains", "name": "[LPC] Terrains",
     "category": "tileset", "style": "LPC 32px tiles", "gap": "marsh/bog + caves + water + biomes",
     "licenses": ["CC-BY-SA 4.0", "CC-BY-SA 3.0", "CC-BY 3.0", "GPL 3.0"],
     "authors": ["bluecarrot16", "Lanea Zimmerman (Sharm)", "Daniel Eddeland (Daneeklu)",
                 "Richard Kettering (Jetrel)", "Zachariah Husiar (Zabin)", "Hyptosis",
                 "Casper Nilsson", "Buko Studios", "Nushio", "ZaPaper", "billknye",
                 "William Thompson", "caeles", "Stephen Challener (Redshrike)", "Bertram",
                 "Rayane Félix (RayaneFLX)"],
     "urls": ["https://opengameart.org/content/lpc-terrains"],
     "notes": "Includes a 'bog' terrain (Ashen Marsh), plus cave/rock/water/lava/snow/ice/sand. See CREDITS-terrain.txt."},
    {"prefix": "tiles/eliza-terrain", "name": "ElizaWy LPC — Terrain",
     "category": "tileset", "style": "LPC 32px tiles", "gap": "cliffs (mountain/coast), waterfall, ice-shallows, plants, mushrooms, rocks, seasons",
     "licenses": ["OGA-BY 3.0"],
     "authors": ["Eliza Wyatt (DeathsDarling)", "Lanea Zimmerman (Sharm)", "Hyptosis", "bluecarrot16"],
     "urls": ["https://github.com/ElizaWy/LPC"],
     "notes": "Per Terrain/Credits.txt."},
    {"prefix": "buildings/eliza-structure", "name": "ElizaWy LPC — Structure",
     "category": "buildings+interiors", "style": "LPC 32px", "gap": "walls/floors/doors/windows/roofing/fences/bridges/stairs/pillars/signs",
     "licenses": ["OGA-BY 3.0"],
     "authors": ["Eliza Wyatt (DeathsDarling)", "and LPC contributors"],
     "urls": ["https://github.com/ElizaWy/LPC"],
     "notes": "Per Structure/**/Credits.txt."},
    {"prefix": "items/eliza-objects", "name": "ElizaWy LPC — Objects",
     "category": "props", "style": "LPC 32px", "gap": "furniture/chests/barrels/crates/cauldron/smithing/dungeon/wall items (modern props excluded)",
     "licenses": ["OGA-BY 3.0"],
     "authors": ["Eliza Wyatt (DeathsDarling)", "and LPC contributors"],
     "urls": ["https://github.com/ElizaWy/LPC"],
     "notes": "Per Objects/**/Credits.txt. Clearly-modern items (copy machine, fridge, TV, laptop, etc.) were excluded for medieval style fit (kept in master only)."},
    {"prefix": "sprites/enemies/lpc-monsters", "name": "[LPC] Monsters",
     "category": "enemies", "style": "LPC 64px creatures", "gap": "slime/bat/eyeball/bee/worms/man-eater flower/pumpkin king/ghost/snake (+ extended bat)",
     "licenses": ["CC-BY-SA 3.0", "GPL 3.0", "OGA-BY 3.0"],
     "authors": ["Charles Sanchez (CharlesGabriel)", "bagzie", "bluecarrot16", "Evert"],
     "urls": ["https://opengameart.org/content/lpc-monsters",
              "https://opengameart.org/content/lpc-bat-combinedextended"],
     "notes": "Skeleton/zombie/bandit enemies come from the LPC character base (see characters/manifest.json)."},
    {"prefix": "effects/lpc-magic", "name": "Extended LPC Magic pack",
     "category": "effects", "style": "LPC magic, 128px frames", "gap": "fire/ice/lightning/tornado/spikes combat effects",
     "licenses": ["CC-BY-SA 3.0", "GPL 3.0"],
     "authors": ["Daniel Eddeland (Daneeklu)"],
     "urls": ["https://opengameart.org/content/extended-lpc-magic-pack"],
     "notes": "firelion, iceshield, icetacle, lightningclaw, snakebite, spikes, tornado, torrentacle, turtleshell."},
    {"prefix": "effects/eliza-water", "name": "ElizaWy LPC — FX (water)",
     "category": "effects", "style": "LPC", "gap": "water splash/ripple/reflections",
     "licenses": ["OGA-BY 3.0"],
     "authors": ["Eliza Wyatt (DeathsDarling)"],
     "urls": ["https://github.com/ElizaWy/LPC"],
     "notes": "Per FX/Credits.txt."},
]

def count(prefix):
    d = os.path.join(BASE, prefix)
    return sum(1 for r, _x, fs in os.walk(d) for f in fs) if os.path.isdir(d) else 0

groups_out = []
all_auth, all_lic, total = set(), set(), 0
for g in GROUPS:
    n = count(g["prefix"])
    total += n
    all_auth.update(g["authors"]); all_lic.update(g["licenses"])
    groups_out.append({**g, "path": "asset-library/2d/" + g["prefix"], "files": n})

manifest = {
    "_meta": {
        "purpose": "LPC-style environment/monster/prop/effect working set filling Emberfall gaps",
        "tier": "repo working set (LPC-style only); full hauls in C:\\GameAssets\\lpc-env (not in git)",
        "licenses": "all open-source (CC-BY / CC-BY-SA / OGA-BY / GPL) — none anti-AI",
        "wiring": "NOT wired into the game; catalogue only",
        "groups": len(groups_out), "files": total,
    },
    "groups": groups_out,
}
json.dump(manifest, open(os.path.join(BASE, "ENV-MANIFEST.json"), "w", encoding="utf-8"),
          indent=1, ensure_ascii=False)
print("wrote ENV-MANIFEST.json -", len(groups_out), "groups,", total, "files")

L = ["# LPC ENVIRONMENT / MONSTERS / PROPS / EFFECTS — ATTRIBUTION (repo working set)\n"]
L.append("All assets below are LPC-style and open-source (no anti-AI clause), filling "
         "specific Emberfall gaps. Full hauls live in the local master library "
         "`C:\\GameAssets\\lpc-env` (NOT in git). CC-BY-SA / GPL are copyleft — keep "
         "same licence + an in-game credits screen on a commercial ship.\n")
L.append("## Licences present\n")
for x in sorted(all_lic): L.append(f"- {x}")
L.append(f"\n## Contributing artists ({len(all_auth)})\n")
for a in sorted(all_auth): L.append(f"- {a}")
L.append("\n## Per-source attribution\n")
for g in groups_out:
    L.append(f"### {g['name']} — `{g['path']}` ({g['files']} files)")
    L.append(f"- Category: {g['category']} · Style: {g['style']}")
    L.append(f"- Fills gap: {g['gap']}")
    L.append("- Authors: " + "; ".join(g["authors"]))
    L.append("- Licence: " + " / ".join(g["licenses"]))
    L.append("- Source: " + " ; ".join(g["urls"]))
    if g.get("notes"): L.append("- Notes: " + g["notes"])
    L.append("")
open(os.path.join(BASE, "ENV-CREDITS.md"), "w", encoding="utf-8").write("\n".join(L))
print("wrote ENV-CREDITS.md -", len(all_auth), "artists,", len(all_lic), "licences")
