#!/usr/bin/env python3
# =============================================================================
# build_lpc_manifest.py — generates the PARTS manifest + attribution credits
# for the LPC character-part working set committed to the repo.
#
# Reads the master library's sheet_definitions (the per-part metadata + credits
# shipped by the Universal-LPC generator) and the actual PNGs copied into
# asset-library/2d/sprites/characters/, then writes:
#   - manifest.json  — PARTS data the Character system can consume (id, name,
#     category, type, zPos, bodytypes, colours, anims, file count, attribution).
#   - CREDITS.md     — full per-part attribution + a deduped author/licence roll.
# Run AFTER build_lpc_charparts.py.
# =============================================================================
import os, json, glob, csv
from collections import defaultdict

HERE   = os.path.dirname(os.path.abspath(__file__))
ROOT   = os.path.abspath(os.path.join(HERE, ".."))
MASTER = r"C:\GameAssets\lpc-full"
DEFS   = os.path.join(MASTER, "sheet_definitions")
CSVF   = os.path.join(MASTER, "CREDITS.csv")
CHARS  = os.path.join(ROOT, "asset-library", "2d", "sprites", "characters")
ANIMS  = {"idle", "walk", "slash"}

# --- 1a. per-part metadata (name/type/zPos/palettes) from sheet_definitions --
#     keyed by the credit-file prefix the def declares (longest-match).
meta_prefixes = []    # (prefix, meta)
for jf in glob.glob(os.path.join(DEFS, "**", "*.json"), recursive=True):
    if os.path.basename(jf).startswith("meta"):
        continue
    try:
        d = json.load(open(jf, encoding="utf-8"))
    except Exception:
        continue
    if "credits" not in d:
        continue
    palettes = (d.get("recolors") or {}).get("palettes", [])
    for c in d["credits"]:
        fp = c.get("file", "").strip("/").replace("\\", "/")
        if fp:
            meta_prefixes.append((fp, {
                "name": d.get("name", ""), "type": d.get("type_name", ""),
                "priority": d.get("priority"), "palettes": palettes,
            }))
meta_prefixes.sort(key=lambda x: -len(x[0]))

def meta_for(rel):
    for fp, m in meta_prefixes:
        if rel == fp or rel.startswith(fp + "/"):
            return fp, m
    return None, {}

# --- 1b. authoritative per-FILE attribution from CREDITS.csv ------------------
#     CSV keys anims as files (.../walk.png); split-layout art stores anims as
#     dirs (.../walk/<colour>.png). Normalise a repo file to its CSV key, then
#     fall back to a parent-walk so every file resolves.
csv_cred = {}         # exact path -> (authors, licenses, urls)
for row in csv.DictReader(open(CSVF, encoding="utf-8")):
    fn = (row.get("filename") or "").strip().strip('"').replace("\\", "/")
    if not fn:
        continue
    a = [x.strip() for x in (row.get("authors") or "").strip().strip('"').split(",") if x.strip()]
    l = [x.strip() for x in (row.get("licenses") or "").strip().strip('"').split(",") if x.strip()]
    u = [x.strip() for x in (row.get("urls") or "").strip().strip('"').split(",") if x.strip()]
    csv_cred[fn] = (a, l, u)
# ancestor-dir index (every parent dir -> a representative credit) so a file in
# a deeper subtree than CREDITS.csv lists still resolves to its nearest covered
# ancestor (same artist family). Closest-listed file wins per dir.
csv_dirs = {}
for fn, v in csv_cred.items():
    segs = fn.split("/")[:-1]
    for i in range(len(segs), 0, -1):
        d = "/".join(segs[:i])
        csv_dirs.setdefault(d, v)

def csv_key(rel):
    parts = rel[:-4].split("/") if rel.endswith(".png") else rel.split("/")
    if len(parts) >= 2 and parts[-2] in ANIMS:      # split layout: leaf=colour
        return "/".join(parts[:-1]) + ".png"        # -> .../walk.png
    return rel

def match(rel):
    k = csv_key(rel)
    if k in csv_cred:
        a, l, u = csv_cred[k]
        return rel.rsplit("/", 1)[0], a, l, u
    d = rel.rsplit("/", 1)[0]                        # parent-walk fallback
    while d:
        if d in csv_dirs:
            a, l, u = csv_dirs[d]
            return d, a, l, u
        if "/" not in d:
            break
        d = d.rsplit("/", 1)[0]
    return None, [], [], []

# --- 2. scan copied repo files, aggregate per part ---------------------------
parts = defaultdict(lambda: {
    "colors": set(), "bodytypes": set(), "anims": set(),
    "files": 0, "category": "", "authors": [], "licenses": [], "urls": [],
})
BODYTYPES = {"male", "female", "muscular", "pregnant", "teen", "child",
             "skeleton", "zombie", "lizard", "thin"}
part_meta = {}        # part key -> meta dict
unmatched = 0
for cat in sorted(os.listdir(CHARS)) if os.path.isdir(CHARS) else []:
    catdir = os.path.join(CHARS, cat)
    if not os.path.isdir(catdir):
        continue
    for root, _d, files in os.walk(catdir):
        for f in files:
            if not f.endswith(".png"):
                continue
            full = os.path.join(root, f)
            rel = os.path.relpath(full, catdir).replace("\\", "/")  # spritesheets-rel
            cprefix, a, l, u = match(rel)                # CSV attribution
            mprefix, m = meta_for(rel)                   # def metadata
            if a == []:
                unmatched += 1
            # part key: the def style prefix if known, else the CSV prefix
            key = mprefix or cprefix or rel.rsplit("/", 1)[0]
            p = parts[key]
            p["category"] = cat
            p["files"] += 1
            if a: p["authors"] = a
            if l: p["licenses"] = l
            if u: p["urls"] = u
            part_meta.setdefault(key, m)
            segs = rel.split("/")
            base = f[:-4]
            if base in ANIMS:                       # flat layout: colour is palette-driven
                p["anims"].add(base)
                p["colors"].add("(palette)")
            else:                                   # split layout: colour is the filename
                p["colors"].add(base)
                for s in segs:
                    if s in ANIMS:
                        p["anims"].add(s)
            for s in segs:
                if s in BODYTYPES:
                    p["bodytypes"].add(s)

# --- 3. write manifest.json --------------------------------------------------
parts_out = []
for key in sorted(parts):
    p = parts[key]
    m = part_meta.get(key, {}) or {}
    parts_out.append({
        "id": key,
        "name": m.get("name", key.rsplit("/", 1)[-1]),
        "type": m.get("type", ""),
        "category": p["category"],
        "zPos": m.get("priority"),
        "bodytypes": sorted(p["bodytypes"]),
        "colors": sorted(p["colors"]),
        "anims": sorted(p["anims"]),
        "palettes": m.get("palettes", []),
        "path": "asset-library/2d/sprites/characters/%s/%s" % (p["category"], key),
        "files": p["files"],
        "authors": p["authors"],
        "licenses": p["licenses"],
        "urls": p["urls"],
    })

cat_counts = defaultdict(int)
total_files = 0
for p in parts_out:
    cat_counts[p["category"]] += 1
    total_files += p["files"]

manifest = {
    "_meta": {
        "source": "Universal-LPC-Spritesheet-Character-Generator "
                  "(github.com/LiberatedPixelCup/...)",
        "tier": "repo working set: every style/colour/bodytype, anims=idle/walk/slash",
        "master_library": r"C:\GameAssets\lpc-full (full 17-animation set, not in git)",
        "frame_px": 64, "anims_included": sorted(ANIMS),
        "licenses": "OGA-BY / CC-BY-SA / CC-BY / GPL / CC0 (all open-source, none anti-AI)",
        "wiring": "NOT wired into the game; catalogue/PARTS data only",
        "parts": len(parts_out), "files": total_files,
        "categories": dict(sorted(cat_counts.items())),
    },
    "parts": parts_out,
}
out_json = os.path.join(CHARS, "manifest.json")
json.dump(manifest, open(out_json, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
print("wrote", out_json, "-", len(parts_out), "parts,", total_files, "files")
print("categories:", dict(sorted(cat_counts.items())))

# --- 4. write CREDITS.md -----------------------------------------------------
all_authors, all_licenses = set(), set()
for p in parts_out:
    all_authors.update(p["authors"])
    all_licenses.update(p["licenses"])
lines = []
lines.append("# LPC CHARACTER PARTS — ATTRIBUTION (repo working set)\n")
lines.append("Source: **Universal-LPC-Spritesheet-Character-Generator** "
             "(github.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator), "
             "which aggregates the OpenGameArt LPC collection with per-asset credits.\n")
lines.append("Every asset here is open-source (OGA-BY 3.0/4.0 · CC-BY 3.0/4.0 · "
             "CC-BY-SA 3.0/4.0 · GPL 2.0/3.0 · CC0 · OGA-SA 3.0) — **none carry an "
             "anti-AI clause**, so all are usable in this AI-assisted project. "
             "CC-BY-SA / GPL are copyleft: a commercial ship keeps these art files "
             "under the same licence + an in-game credits screen.\n")
lines.append("Frame 64px; rows up/left/down/right; anims idle/walk/slash (rig set). "
             "Full 17-anim masters + full CREDITS.csv live in the local master "
             "library `C:\\GameAssets\\lpc-full`.\n")
lines.append("## Licences present\n")
for L in sorted(all_licenses):
    lines.append(f"- {L}")
lines.append("\n## Contributing artists (all parts, deduped)\n")
for a in sorted(all_authors):
    lines.append(f"- {a}")
lines.append("\n## Per-part attribution\n")
for p in parts_out:
    lines.append(f"### `{p['id']}` — {p['name']} ({p['category']})")
    if p["authors"]:
        lines.append("- Authors: " + "; ".join(p["authors"]))
    if p["licenses"]:
        lines.append("- Licence: " + " / ".join(p["licenses"]))
    if p["urls"]:
        lines.append("- Source: " + " ; ".join(p["urls"]))
    lines.append("")
out_md = os.path.join(CHARS, "CREDITS.md")
open(out_md, "w", encoding="utf-8").write("\n".join(lines))
print("wrote", out_md, "-", len(all_authors), "artists,", len(all_licenses), "licences")

print("files with NO attribution match:", unmatched)
