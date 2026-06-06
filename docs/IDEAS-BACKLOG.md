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

Notes: the music + audio-feedback items both depend on the audio asset pass —
Kenney SFX/UI/voice are already CC0 in `asset-library/audio/`; a licence-checked
MUSIC pack still needs sourcing before adaptive music.
