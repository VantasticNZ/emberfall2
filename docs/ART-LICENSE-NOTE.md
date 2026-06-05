# ART LICENSE NOTE — Mana Seed Free RPG Starter Pack (BLOCKER)

> Date: 2026-06-05. Authored during the proof-slice build. Decisive finding: the
> Mana Seed art **cannot** be used in Emberfall 2 as currently built, because the
> project's code is written with AI assistance and the Mana Seed license forbids
> exactly that. Preserved here so the constraint is never accidentally violated.

## Source reviewed
- `art-src/mana-seed-starter/NO AI, NO EXCEPTIONS.txt`
- `art-src/mana-seed-starter/Mana Seed readme.txt`
- `art-src/mana-seed-starter/this is a Mana Seed demo.txt`
- `art-src/mana-seed-starter/character_base/readme.txt`
- `art-src/mana-seed-starter/character_base/this is a Character Base demo.txt`
- `art-src/mana-seed-starter/character_base/guides/using this base.txt`
- Full User License: https://selieltheshaper.weebly.com/user-license.html

## Findings (verbatim quotes)

### Commercial use — ALLOWED
- "You may use this demo asset commercially or non-commercially." (Character Base demo)
- "The 'product' in question MAY be a commercial product you charge money for." (User License)

### Attribution — OPTIONAL
- "No, you don't have to credit me, though I would appreciate it 💖 Just don't claim
  you drew it yourself." (User License)

### AI — FORBIDDEN (the blocker), and it explicitly includes CODE
From `NO AI, NO EXCEPTIONS.txt`:
- "This art is totally free, but must NOT be used alongside ANY generative AI content!"
- "AI images? No! / AI voice acting? No! / AI music? No! / **AI code? No!**"
- "If you insist on using genAI anywhere in your development pipeline, I ask that you
  please delete these assets now."
- "I do not want my art to appear in any game that uses genAI in any way."

From the User License:
- "I do not consent for any of my art to be used in any machine learning datasets, nor
  used in a project alongside 'AI' generated imagery, writing, **code**, or anything else."
- "I am morally opposed to this technology for many reasons, please do not ask me if
  your use-case is special; it is not."

## Conclusion
Emberfall 2 is built with AI-assisted code. The Mana Seed license forbids use of the
art in any project that uses generative AI "anywhere in your development pipeline,"
explicitly including "code." Therefore **Mana Seed art must not be used in this project.**
Commercial-permitted + attribution-optional are both irrelevant given this clause.

## Resolution (pending Van's decision)
1. RECOMMENDED — adopt a license-compatible art source (CC0 / OpenGameArt / a license
   that permits AI-assisted projects). License-check it the same rigorous way before use.
2. Build without AI assistance (changes the entire working method).

Until Van decides, the manifest (`src/data/assets.js`) runs in `ART_SOURCE='placeholder'`
mode: procedural textures generated in-engine (no third-party art, no license issue),
sized to the same grid the real art will use, so the slice proves the architecture and
gates now. Dropping in a compatible pack later is a manifest-only edit.
