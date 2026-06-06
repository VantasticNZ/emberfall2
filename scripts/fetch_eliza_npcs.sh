#!/usr/bin/env bash
# =============================================================================
# fetch_eliza_npcs.sh — ART FOUNDATION pass (2026-06-06). Fetches the extra
# ElizaWy "LPC Revised" layers (github.com/ElizaWy/LPC, OGA-BY 3.0) needed for a
# COMPLETE Greenhollow cast: a fuller hero hair (replaces the sparse cowlick),
# and REAL distinct outfits (not hue-rotation) for Mara (a feminine villager) and
# Bram (a bearded smith). Same per-animation pipeline as fetch_eliza.sh.
# =============================================================================
set -e
cd "$(dirname "$0")/.."
RAW="https://raw.githubusercontent.com/ElizaWy/LPC/master/Characters"
enc() { echo "$1" | sed 's/ /%20/g; s/,/%2C/g'; }
getlayer() {                       # <src under Characters/> <dest folder>
  local src="$1" dest="$2"; mkdir -p "public/art/eliza/$dest"
  curl -sf --max-time 60 -o "public/art/eliza/$dest/idle.png"   "$(enc "$RAW/$src/Idle.png")"
  curl -sf --max-time 60 -o "public/art/eliza/$dest/walk.png"   "$(enc "$RAW/$src/Walk.png")"
  curl -sf --max-time 60 -o "public/art/eliza/$dest/attack.png" "$(enc "$RAW/$src/Combat 1h - Slash.png")"
}

# Hero — replace the sparse "Cowlick" with the fuller "Natural" (same Chestnut).
getlayer "Hair/Short 05 - Natural/Chestnut" "hair"

# Mara — a feminine villager (distinct body + bob + forest-green shirt).
getlayer "Body/Body 01 - Feminine, Thin/Ivory" "body_fem"
getlayer "Head/Head 01 - Feminine/Ivory" "head_fem"
curl -sf --max-time 60 -o "public/art/eliza/head_fem/expr.png" "$(enc "$RAW/Head/Head 01 - Feminine/Ivory/Expressions.png")"
getlayer "Hair/Medium 07 - Bob, Side Part/Blonde" "hair_mara"
getlayer "Clothing/Feminine, Thin/Torso/Shirt 01 - Longsleeve Shirt/Forest" "shirt_forest"
getlayer "Clothing/Feminine, Thin/Legs/Pants 03 - Pants/Brown" "pants_fem"
getlayer "Clothing/Feminine, Thin/Feet/Shoes 01 - Shoes/Brown" "shoes_fem"

# Bram — an older bearded smith (gray parted hair + medium beard + leather shirt).
getlayer "Hair/Short 02 - Parted/Gray" "hair_bram"
getlayer "Hair/Facial Hair 07 - Medium Beard/Gray" "beard_bram"
getlayer "Clothing/Masculine, Thin/Torso/Shirt 01 - Longsleeve Shirt/Leather" "shirt_leather"

echo "ElizaWy NPC layers fetched into public/art/eliza/"
