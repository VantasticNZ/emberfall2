# IDEAS BACKLOG (captured, not built)

Parked ideas + small polish, with rough priority and WHEN to do them. Two buckets:
**[SLICE]** = do during/as part of the first playable vertical slice (cheap, or
needed to prove the loop is fun). **[LATER]** = after the slice is proven fun.
The slice is a HARD GATE (see PLAN.md): nothing new ships until the loop is fun.

| idea | what it is | when | priority |
|---|---|---|---|
| **screen-shake + hit-pause** | combat juice on hits (Gate E feel; toggleable) | **[SLICE]** | high — the slice must FEEL good |
| **lighting / time-of-day tint** | a simple colour wash driven by TimeOfDay phase | **[SLICE]** | med — cheap, sells the world (Gate G) |
| **camera-scroll smoothing** | the parked choppy-follow item (lerp + pixel rounding) | **[SLICE]** | med — already a known parked polish item |
| **fold god_mercy/mercy_shown** | one canonical mercy deed-id (currently bridged in content) | **[SLICE]** | low — quick cleanup; do while touching quests |
| **ambient NPC deed-barks** | a few one-line NPC reactions keyed off deeds (reuses the reactive route) | **[SLICE]** | med — cheap, shows reactivity live |
| **universal audio feedback** | hit/UI/footstep SFX hooks (Kenney audio is licence-clear) | **[SLICE]** | med — feel; assets already in asset-library |
| **adaptive per-region music** | calm vs combat tracks per region | **[LATER]** | med — needs a licence-checked MUSIC asset pass first |
| **deed-driven epilogue montage** | render M20 `epilogueCards()` as an end montage | **[LATER]** | med — logic exists; needs UI |
| **point-of-no-return warning** | a clear "last chance" prompt before the Spire (M18+) | **[LATER]** | high (before ship) — UX safety |
| **skill respec at a cost** | rebuy/reassign skill points for gold | **[LATER]** | low |
| **New Game+** | carry karma/deeds/level into a fresh run; harder, new reactions | **[LATER]** | med — big, post-ship-quality |
| **crouch + stealth** | a dedicated crouch action enabling sneaking/hiding/ducking + a low crouch-roll (see design note below) | **[LATER]** | med — ties to "outsmart, don't always fight"; build after combat feel is tuned + a region is fully playable |

Notes: the music + audio-feedback items both depend on the audio asset pass —
Kenney SFX/UI/voice are already CC0 in `asset-library/audio/`; a licence-checked
MUSIC pack still needs sourcing before adaptive music.

---

## CROUCH + STEALTH mechanic (design — build LATER)

**When:** after combat FEEL is tuned (Van's pass) AND at least one region is fully
playable. NOT now.

**Core rule — keep it separate from the combat dodge.** The combat **dodge-roll stays a
single instant input** (tap, reactive panic-dodge with i-frames). Crouch is its **own
action on its own button** (a dedicated key / controller button — hold-to-crouch or
toggle, TBD in tuning). Do NOT overload the dodge button with crouch — conflating them
would make the panic-dodge laggy/ambiguous.

**Crouch enables:**
- **Sneaking / stealth** — move quietly + slowly; reduced enemy detection radius / noise
  (enemies use a detection cone/range; crouch shrinks it).
- **Hiding behind cover** — crouch near tall grass / crates / walls to break line-of-sight.
- **Ducking under low things** — pass under low obstacles/gaps that block standing movement.
- **Low crouch-roll for traversal/stealth** — from crouch, `direction + roll` does a low
  scoot to cover quickly while staying low. This is an **exploration/stealth** move, NOT
  the combat panic-dodge (different intent, different context).

**Why it fits Emberfall:** core to the **"outsmart, don't always fight"** philosophy —
sneak *past* enemies instead of fighting, slip by the immortal treasure-guard **frog**
(it can't be beaten in a fight — see the late-frog rule), avoid patrols on a pacifist/low-
karma route. Hooks the **Rogue / sneak skill branch** (stealth, lockpicking, backstab)
from SYSTEMS-DESIGN-V2.

**Build notes / dependencies (for the later session):**
- New canonical action in `src/constants/controls.js` (`crouch`) — both keyboard + Xbox
  bindings; rebindable. Keep it distinct from `dodge`.
- Enemy **detection** model in the Monsters system (sight cone/range + a noise/visibility
  value the player state feeds) — doesn't exist yet; this is the real new system.
- Cover / line-of-sight + "low obstacle" tile flags in the region data.
- VISUAL: a crouch pose — **LPC has no crouch/roll frames** (checked, master library), so
  the same honest squash-approximation as the dodge-roll until proper art exists. FLAG art.
- Stealth UI: a detection indicator (alert/searching/spotted), like the combat telegraph.
