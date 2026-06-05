EMBERFALL 2 - PRE-BUILD CHECK (read-only, no building yet). Fresh project C:\Games\Emberfall2.
The free Mana Seed starter pack is extracted at C:\Games\Emberfall2\art-src\mana-seed-starter\.
Before ANY build, do these read-only checks and REPORT (do not build, do not commit):

TASK 1 - LICENCE / USAGE: open and read these files fully and quote the relevant terms:
  - "art-src\mana-seed-starter\NO AI, NO EXCEPTIONS.txt"
  - "art-src\mana-seed-starter\Mana Seed readme.txt"
  - "art-src\mana-seed-starter\readme.txt"
  - "art-src\mana-seed-starter\using this base.txt"
  - "art-src\mana-seed-starter\this is a Mana Seed demo.txt" + "this is a Character Base demo.txt"
  Report EXACTLY: (a) can these assets be used in a commercial game? (b) what does the "NO AI"
  policy forbid - does it prohibit USING the art in a game built with AI-assisted CODE, or only
  prohibit feeding the art INTO image-generators / training? (c) any attribution required? (d) any
  restriction we must respect. Quote the actual wording. Do NOT interpret loosely - quote it.

TASK 2 - GRID / DIMENSIONS: inspect the key PNGs to determine exact pixel dimensions + how frames
  are laid out (read "using this base.txt", "animations, page 1.png", "layer order..." guides, and
  measure the actual files):
  - the character base sheet char_a_p1_0bas_humn_v00.png (frame size? sheet layout? how many
    frames/directions/animations?)
  - the paper-doll layer system (base + 1out outfit + 4har hair + 5hat hat + 6tla tool + 7tlb
    shield) - how do layers composite? what's the draw order (per the "layer order" pngs)?
  - the tile/environment sheets (home interiors, simplified full timber, seasonal samples) - tile
    size (16x16?), sheet layout?
  - the props (breakable pots, treasure chests, cozy furnishings), the slime, the npc man/woman
    sheets (frame size + frames?), the water animations.
  Report a clear inventory: for each asset type, the file(s), pixel dimensions, frame layout, and
  what it's for. This becomes the basis for the asset manifest.

TASK 3 - RECOMMENDATION: based on 1+2, confirm whether we can proceed to build a proof slice on
  this art (commercially, AI-code-wise), and note the exact grid conventions the manifest must use.

OUTPUT: a written report only. NO building, NO commits. Van needs the licence answer + the exact
dimensions before the proof slice is built.