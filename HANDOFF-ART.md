EMBERFALL 2 proof slice - WIRE IN REAL ART (LPC chars + Kenney tiles). Fresh project
C:\Games\Emberfall2. Read docs\QUALITY-BIBLE.md (esp Part 0-3 + GATE M), then proceed.

CONTEXT: Mana Seed is BANNED (anti-AI licence). Use only AI-SAFE art:
- CHARACTERS: LPC (Liberated Pixel Cup) - 64px, animated, LAYERED (body+hair+clothes+armour+
  hat+weapon+shield stack), CC0/CC-BY-SA (AI-safe, no anti-AI clause). Van must place/download LPC
  assets; if not present, fetch via the Universal LPC generator assets or OpenGameArt CC0/CC-BY-SA
  LPC sheets. LICENCE-CHECK each: confirm CC0 or CC-BY-SA (NOT anti-AI), record in docs\ART-
  LICENSE-NOTE.md (attribution list for CC-BY-SA).
- TILES: Kenney (CC0, safe) top-down/RPG tiles. License-safe by CC0.

TASKS (one at a time, verify LIVE + screenshot, per-file commit):
1. Update src/data/assets.js manifest: target grid = 64px characters. Wire LPC char layers +
   Kenney tiles through the single manifest. Document conventions.
2. LAYERED CHARACTER SYSTEM (write-once): render a character as stacked layers (base+hair+clothes
   +armour+hat+weapon+shield) sharing one animation set (idle/walk/run/attack/cast/use/pickup).
   Equipping = toggle a layer (DATA-driven).
3. Update the Greenhollow slice to use real art: hero (LPC, layered) + 2-3 NPCs (varied layers) +
   Kenney tiles/props.
4. PROVE GATE M: equip a shirt+hat -> shows on body; equip a sword -> in hand, swings from ARM;
   equip a shield -> on arm; pick up an item -> pickup pose; all 4 directions + frames aligned.
   Screenshot each.
5. Re-run gates A/B/C/I/K + M by their methods; screenshots; 0 console errors; clean build.

CONSTRAINTS: AI-safe art ONLY (CC0/CC-BY-SA, no anti-AI); write-once + data-driven; verify each
LIVE w/ screenshot before next; per-file commit. SMALL + correct.

REPORT: confirm the real LPC+Kenney look renders, Gate M passes (equip/wear/use/pickup all work +
animate consistently), all gates passed w/ screenshots, licences recorded. Flag anything honestly.