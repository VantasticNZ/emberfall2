# LPC "push and carry" animations — licence + attribution (AI-SAFE)

- **Source page:** https://opengameart.org/content/lpc-character-animations-push-and-carry
- **Direct file:** https://opengameart.org/sites/default/files/push_and_carry.zip (185,442 bytes)
- **Submitter:** Evert (credit optional)
- **Licence:** **CC-BY-SA 3.0** AND **GPL 3.0** (dual). No anti-AI clause → **AI-assisted commercial dev SAFE** (matches the LPC base-art licence the project already uses). Obligation: attribution + share-alike on derivatives.
- **Frame layout:** 64×64 LPC frames. `body/male/carry.png` etc. are **576×256** = 9 columns × 4 rows = (1 idle + 8 walkcycle) × 4 directions (up/left/down/right). Standard Universal-LPC layout.
- **Contents:** `carry` (overhead-carry) + `push` + `grab` + `jump` animations, as layered LPC parts (body, hair, shoes, pants, longsleeve, tunic, belt).

## Attribution string (verbatim from the pack README)
> Credit goes to Stephen Challener (Redshrike), Johannes Sjölund (wulax), Manuel Riecke (MrBeast), Joe White, Michael Whitlock (bigbeargames), Matthew Krohn (makrohn), Daniel Eddeland (Daneeklu), bluecarrot16, David Conway Jr. (JaidynReiman) as appropriate for the assets listed above.

## STATUS — PARKED, NOT YET INTEGRATED
These are **base-LPC (wulax) body** carry frames. The live characters use the **ElizaWy LPC Revised** body (different proportions/faces) + a child variant. Dropping base-LPC carry frames straight onto the revised rig would create a visible style/proportion mismatch, and HARD RULE 3 forbids touching the existing LPC pipeline without care.

**Integration is deferred** (see `docs/DEFERRED.md` — carry-pose). Trigger: a dedicated carry-pose pass that (a) matches/recolors these frames to the ElizaWy revised body, (b) authors the child variant, (c) wires the CARRY verb to play the overhead frames instead of the seated-hen fallback. The note in the README that the jump tunic was "modified by Eliza Wyatt" suggests compatibility is feasible — but it needs Van's eyes on the style-match before shipping.
