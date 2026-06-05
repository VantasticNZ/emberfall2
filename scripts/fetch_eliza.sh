#!/usr/bin/env bash
# =============================================================================
# fetch_eliza.sh — reproducible fetch of the ElizaWy "LPC Revised" character
# layers (github.com/ElizaWy/LPC, OGA-BY 3.0). ElizaWy ships ONE sheet per
# animation; we save them with clean names (idle/walk/attack, +expr for the
# head) under /public/art/eliza/<layer>/ so the per-animation pipeline can load
# them. (Body+head+hair+clothing+props share poses => pixel-perfect alignment.)
# =============================================================================
set -e
cd "$(dirname "$0")/.."
RAW="https://raw.githubusercontent.com/ElizaWy/LPC/master/Characters"
enc() { echo "$1" | sed 's/ /%20/g; s/,/%2C/g'; }

# fetch idle/walk/attack for one layer folder (src under Characters/, dest under eliza/)
getlayer() {
  local src="$1" dest="$2"; mkdir -p "public/art/eliza/$dest"
  curl -sf --max-time 60 -o "public/art/eliza/$dest/idle.png"   "$(enc "$RAW/$src/Idle.png")"
  curl -sf --max-time 60 -o "public/art/eliza/$dest/walk.png"   "$(enc "$RAW/$src/Walk.png")"
  curl -sf --max-time 60 -o "public/art/eliza/$dest/attack.png" "$(enc "$RAW/$src/Combat 1h - Slash.png")"
}

getlayer "Body/Body 02 - Masculine, Thin/Ivory" "body"
getlayer "Head/Head 02 - Masculine/Ivory" "head"
curl -sf --max-time 60 -o "public/art/eliza/head/expr.png" \
  "$(enc "$RAW/Head/Head 02 - Masculine/Ivory/Expressions.png")"
getlayer "Hair/Eyebrows 02 - Thick Eyebrows/Chestnut" "eyebrows"
getlayer "Hair/Short 04 - Cowlick/Chestnut" "hair"
getlayer "Clothing/Masculine, Thin/Torso/Shirt 01 - Longsleeve Shirt/Blue" "shirt"
getlayer "Clothing/Masculine, Thin/Legs/Pants 03 - Pants/Black" "pants"
getlayer "Clothing/Masculine, Thin/Feet/Shoes 01 - Shoes/Brown" "shoes"

# Equipment (Gate M) — combat slash only; sword is 128px oversize, front+behind.
mkdir -p public/art/eliza/sword_front public/art/eliza/sword_behind \
         public/art/eliza/shield_front public/art/eliza/shield_behind
curl -sf --max-time 60 -o public/art/eliza/sword_front/attack.png  "$(enc "$RAW/Props/Sword 01 - Arming Sword/Steel/Combat 1h - Slash.png")"
curl -sf --max-time 60 -o public/art/eliza/sword_behind/attack.png "$(enc "$RAW/Props/Sword 01 - Arming Sword/_Behind/Steel/Combat 1h - Slash.png")"
curl -sf --max-time 60 -o public/art/eliza/shield_front/attack.png  "$(enc "$RAW/Props/Shield 01 - Heater Shield/Wood/Brown/Combat 1h - Slash.png")"
curl -sf --max-time 60 -o public/art/eliza/shield_behind/attack.png "$(enc "$RAW/Props/Shield 01 - Heater Shield/Wood/Brown/_Behind/Combat 1h - Slash.png")"
echo "ElizaWy layers + equipment fetched into public/art/eliza/"
