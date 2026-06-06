# ASSET LEDGER (machine-read by scripts/verify.mjs)

Every shipped asset directory under `public/art/` is accounted for here: source +
licence + AI-safe flag + category. The verify gate FAILS if any art file lives
outside a covered prefix, or under a prefix flagged `ai_safe=no`. Full per-asset
attribution + licence reasoning lives in [ART-LICENSE-NOTE.md](ART-LICENSE-NOTE.md);
the wider licence-vetted library (3D/audio) is in [ASSET-LIBRARY.md](ASSET-LIBRARY.md).

**AI-safe** = licence has NO anti-AI / no-genAI clause (CC0 / OGA-BY / CC-BY[-SA] /
GPL all qualify; Mana Seed does NOT — see ART-LICENSE-NOTE).

The block below is the source of truth for the verify gate. Format, one row per line:
`prefix | source | licence | ai_safe | category`

```ledger
public/art/eliza/   | ElizaWy LPC (github.com/ElizaWy/LPC)                          | OGA-BY-3.0                        | yes | character
public/art/terrain/ | ElizaWy LPC terrain + Sharm LPC house (OpenGameArt/LiberatedPixelCup) | OGA-BY-3.0 / CC-BY-SA-3.0 / GPL-3.0 | yes | terrain+building
public/art/kenney/  | Kenney (kenney.nl)                                            | CC0-1.0                           | yes | tiles (legacy, unreferenced)
public/art/lpc/     | sanderfrenken Universal-LPC-Spritesheet                       | CC-BY-SA-3.0 / OGA-BY-3.0 / GPL-3.0 | yes | character (legacy, superseded by eliza)
```

> Share-alike note: CC-BY-SA / GPL assets are copyleft — a commercial ship keeps
> the art under the same licence + an in-game credits screen. OGA-BY / CC0 are
> attribution-only / public-domain. Re-confirm before commercial release.
