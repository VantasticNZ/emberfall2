# EMBERFALL — FULL QUEST WEB (expanded: ~100 main exist / ~40 per run, 100+ side)

> Structured DATA for the interactive browser. Each quest: id, title, region, act, type, choices
> (1-2), each choice's KARMA (Morality/Purity), DEED logged, UNLOCKS/LOCKS (incl. long-range deps),
> ENDING influence. THREE PERMANENT DECISIONS marked [PERMANENT]. Forks mean ~100 exist, ~40/run.
> Tone/twist tagged. This file = the source of truth the HTML visual reads.

LEGEND: M=Morality(Cruel<->Kind) P=Purity(Corrupt<->Pure). Ending infl: W=Warden T=Tyrant L=Liberator.
[PERM] = one of the 3 permanent game-shaping decisions.

================================================================
# THE 3 PERMANENT DECISIONS (spine-defining; gate everything downstream)
================================================================
PERM-1 @ M10 "Hagga's Truth": BELIEVE Hagga / REPORT to Sela / STAY SILENT.
  -> sets whether you know the truth early, Hagga ally strength, Sela's trust. Permanent.
PERM-2 @ M16 "Ember Hollow": MERCY to the god / SEIZE its power / TAKE plainly.
  -> sets Purity hard, Tyrant/Liberator gating. Permanent.
PERM-3 @ M17 "Sela's Design": TRUST Sela / OPPOSE her / GO ALONE.
  -> sets endgame allies, which ending paths remain. Permanent.

================================================================
# ACT 1 — CHILDHOOD (all players; seeds long-range deeds)
================================================================
M1 "A Greenhollow Morning" | hub | tutorial | choice: greet warmly / ignore (M±) | deed: first_impression | unlocks M2
M2 "Chores + Mischief" | hub | story | CHOICE the Chicken: catch(+M)/kick(-M, deed:chicken_kicked)/free(±P) | unlocks M3; chicken_kicked -> locks G7-ally, unlocks far Spire cameo + ending twist
M3 "The Coin" | hub | story | CHOICE: return(+M+P)/keep(-P)/gift-friend(+M) | deed:coin_choice -> adult merchant price/attitude
M4 "The Boarded Cave" | hub | story | CHOICE: tell adult(+P)/explore alone(lore+brave)/dare friend(-P if hurt) | deed:cave -> carving lore; unlocks adult cave revisit
M5 "The Festival" | hub | story/dread | CHOICE: comfort scared child(+M)/ignore | unlocks M6
M6 "The Night It Burned" | hub | CATASTROPHE | CHOICE grief beat: vow vengeance(-? tone)/vow protection(+M) | deed:grief_vow; time-skip; unlocks M7

================================================================
# ACT 2 — RETURN + FOUR REGIONS (forks create exist-vs-per-run gap)
================================================================
## Greenhollow return
M7 "Ten Winters Gone" | hub | story | karma-reactive welcome (reads childhood deeds) | CHOICE: accept Sela / press her(+doubt) | unlocks M8, G1-G7
M7a "Cold Homecoming" [exists if cruel childhood] | hub | story-variant | replaces warm M7 beats; villagers wary; chicken_kicked owner hostile | per-run alt
M7b "Hero's Welcome" [exists if kind childhood] | hub | story-variant | hopeful village; bonus ally | per-run alt

## ASHEN MARSH
M8 "Into the Ashen Marsh" | marsh | story | CHOICE: kind/cruel to bog-folk (M±) | unlocks M9, A1-A5
M9 "The Sunken Shrine" | marsh | dungeon | lantern + SHARD1 + Drowned Guardian | unlocks M10
M10 "Hagga's Truth" [PERM-1] | marsh | story | BELIEVE(+P, Hagga ally, L-path)/REPORT(-P, Hagga gone, T-lean)/SILENT(neutral) | sets M17 intensity, ending gates
M10a "Hagga's Vindication" [exists if BELIEVE] | marsh | follow | Hagga becomes guide; unlocks L-only quests later
M10b "The Exile Silenced" [exists if REPORT] | marsh | follow | Sela "handles" Hagga (dark); +Sela trust; locks Hagga ally
M10c "Quiet Doubt" [exists if SILENT] | marsh | follow | both paths stay ajar; a later forced choice

## SUNDERED PEAKS
M11 "The Sundered Peaks" | peaks | story | CHOICE: local dispute lean (P3 seed) | unlocks M12, P1-P5
M12 "Cinder Keep" | peaks | dungeon | grapple + SHARD2 + boss; TRUTH order knew | unlocks M13 (or M13-alt by route)
M12a "The Order's Guilt" [exists if PERM-1=BELIEVE] | peaks | follow | deeper order-lie reveal; +L
M12b "Loyal Blindness" [exists if PERM-1=REPORT] | peaks | follow | you doubt the records; +T-lean

## TIDEWRECK COAST
M13 "The Tidewreck Coast" | coast | story | CHOICE: smugglers vs authority lean (T1 seed) | unlocks M14, T1-T5
M14 "The Drowned Vault" | coast | dungeon | hookshot + SHARD3 + boss; TRUTH past betrayal | unlocks M15
M14a "Mirror of Betrayal" [exists if any prior betrayal deed] | coast | follow | the past betrayal echoes your own; foreshadows M17

## EMBERWOOD
M15 "The Emberwood" | emberwood | story | CHOICE: begin E2 settlement dilemma | unlocks M16, E1-E5
M16 "Ember Hollow" [PERM-2] | emberwood | dungeon | fire/frost + SHARD4 + elemental boss | MERCY(+P, L-gate, short-term weaker)/SEIZE(-P, T-gate, power reward)/TAKE(neutral) | unlocks M17
M16a "The Compassionate Path" [exists if MERCY] | emberwood | follow | god-fragment trusts you; L-only Spire beat
M16b "The Hungry Path" [exists if SEIZE] | emberwood | follow | dark power grows; T-only Spire beat

## CONVERGENCE
M17 "Sela's Design" [PERM-3] | hub/spire-approach | story | TRUST(W/T paths)/OPPOSE(L-path, Hagga needed)/ALONE(hard, any) | reads PERM-1+2+deeds; sets endgame
M17a "Sela's Betrayal" [exists if REPORTED Hagga or corrupt] | story | she strikes hardest; brutal
M17b "Sela's Honesty" [exists if high trust] | story | she's aligned; smoother approach
M17c "The Lone Road" [exists if ALONE] | story | no allies, hardest Spire

================================================================
# ACT 3 — SPIRE
================================================================
M18 "The Long Ascent" | spire | gauntlet | deed-memory echoes (spared help/betrayed hinder/chicken cameo) | CHOICE: mercy/cruelty beats (M±) | unlocks M19
M18a "Echoes of the Kind" [exists if high M] | spire | allies aid ascent
M18b "Echoes of the Cruel" [exists if low M] | spire | enemies swarm; harder
M19 "The Binding Chamber" | spire | boss | over-built-up brutal boss + SHARD5 | unlocks M20
M20 "The Choice" | spire | finale | WARDEN(default)/TYRANT(cruel+corrupt+SEIZE+PERM3 trust/alone)/LIBERATOR(pure+mercy+BELIEVE+OPPOSE) | + ~dozen deed-driven epilogue twists

================================================================
# ENDING TWISTS (side-impacts layered on the 3 endings, by deeds)
================================================================
ET1 chicken_kicked -> a darkly comic epilogue cameo
ET2 Bram grief_vow honored/forgotten -> memorial beat
ET3 G4 Mara exposed -> she's absent from epilogue
ET4 E2 settlement choice -> which half survives in epilogue
ET5 T1 smuggler faction -> coast's fate
ET6 P3 miner choice -> peaks' fate
ET7 T5 betrayal vengeance/mercy -> your reputation coda
ET8 spared-vs-killed bosses -> world-state cards
ET9 G2 Pem found -> a hopeful secret card
ET10 cave M4 explored -> extra lore card
ET11 high Purity + Liberator -> the secret-best transcendent card
ET12 all-cruel + Tyrant -> the darkest card

================================================================
# SIDE QUESTS (100+ target; each with choices, links, long-range deps)
# Format: id "title" | region | type | choice(s) | karma/deed | unlocks/locks | ending infl
================================================================
## GREENHOLLOW (hub)
S-G1 "Fatley's Mug" | hub | tutorial/fun | do it | unlocks SEE-MARKERS skill path | -
S-G2 "PEM WOZ ERE" | hub | clue-hunt | assemble clues across ALL regions (needs S-A?,S-P?,S-T?,S-E? clue finds) | unlocks Pem -> epic reward | ET9
S-G3 "Hodge's Apprentice" | hub | job | help smith | gear discount + repair skill | -
S-G4 "Mara's Letters" | hub | morality | return(+M)/keep/expose(-M, deed:mara_exposed) | mara_exposed locks her epilogue | ET3
S-G5 "The Tankard Songs" | hub | fun | learn songs (Wayne Kerr, Amanda Hugginkiss) | unlock gestures/charisma | -
S-G6 "Pem's Deliveries" | hub | job | runs | gold + waystone knowledge | -
S-G7 "The Orchard Thief" | hub | morality | punish(-M)/cover(+M)/recruit(±P) | recruit -> ally later; locked if chicken_kicked made kid distrust you | -
S-G8 "The Widow's Plea" | hub | heartfelt | help/decline | +M; deed feeds M18 echoes | ET8
S-G9 "Rats in the Cellar" | hub | fun/combat | clear them | gold + a trinket | -
S-G10 "The Drunk's Wager" | hub | fun/trick | accept bet | win gold or get pickpocketed (trick) | -
S-G11 "Buy the Old House" | hub | property | purchase (gold sink) | own a home; storage; rep | -
S-G12 "Festival Rebuilt" [exists if kind path] | hub | heartfelt | help rebuild | town morale; ally | ET2

## ASHEN MARSH
S-A1 "Bog-Folk Troubles" | marsh | story | help | bog trust; PEM clue | S-G2
S-A2 "Hagga's Errands" | marsh | morality/P | do/refuse | sets Hagga ally strength (feeds PERM-3) | L
S-A3 "The Sunken Dead" | marsh | fun/loot | lantern rooms | epic loot | -
S-A4 "Frog of the Fen" | LATE region (NOT the early marsh) | TWIST | escape: apple/blow-kiss/lead-away (NOT a fight) | guards REAL treasure | see DESIGN RULE below

## >>> DESIGN RULE — THE IMMORTAL TREASURE-GUARD FROG IS A LATE-GAME ENCOUNTER <<<
## The undefeatable "don't fight it, outsmart it" frog must appear MID/LATE (a later
## region or deep in one), GUARDING REAL TREASURE — never early or accidental. Its
## whole subversion ("the thing you can't kill — so DON'T") only lands AFTER the
## player has internalised the normal combat rules (telegraph/dodge/punish). Met
## early, before combat is established, the player just reads it as a broken fight,
## not a clever puzzle. So: gate S-A4 behind solid combat experience (relocate it
## out of the Act-1 marsh to a later region / late beat), make it clearly guard
## something worth the trick, and ensure no early/random spawn can trigger it.
S-A5 "Drowned Letters" | marsh | deed-link | deliver to Greenhollow NPC | that NPC reacts | -
S-A6 "The Lantern Smith" | marsh | job | gather oil materials | cheaper oil | -
S-A7 "Mire Madness" | marsh | dark | a maddened exile; mercy/kill (M±) | world card | ET8
S-A8 "The Stilt-Walker's Bet" | marsh | fun | race challenge | gold/trinket | -

## SUNDERED PEAKS
S-P1 "The Order's Records" | peaks | story | read | supports M12 truth; PEM clue | S-G2
S-P2 "Bounty: Crag Beast" | peaks | job/loot | hunt | epic weapon | -
S-P3 "The Stubborn Miner" (Mike Hunt) | peaks | morality | worker(+M)/owner(-P,gold)/peace(+P) | faction echo | ET6
S-P4 "High-Pass Climb" | peaks | fun | grapple challenge | treasure | -
S-P5 "A Stranger's Plea" | peaks | TRICK | help -> outcome flips on YOUR morality (rescue vs you're-used) | deed twist | -
S-P6 "The Frozen Pilgrim" | peaks | heartfelt | aid/abandon | +M; lore | ET8
S-P7 "Avalanche Watch" | peaks | job | clear paths | gold; opens shortcut | -
S-P8 "The Hermit's Riddle" | peaks | fun/puzzle | solve | trinket + see-secrets bonus | -

## TIDEWRECK COAST
S-T1 "Smuggler's Bargain" (Hugh Jass) | coast | morality/P | run goods(-P)/turn in(+P) | smuggler vs authority faction | ET5
S-T2 "Tide-Cave Treasures" | coast | fun/loot | hookshot puzzles | epic loot | -
S-T3 "The Lighthouse Keeper" (Holden McGroin, played straight) | coast | heartfelt | stay/brush off | mirrors Bram; +M | ET2
S-T4 "Bounty: Wreck Wraith" | coast | job/loot | hunt | epic gear | -
S-T5 "Saltbreak Betrayal" | coast | betrayal | (triggers if earlier ally-deed) vengeance(-M)/mercy(+M) | reputation coda | ET7
S-T6 "The Fisher's Daughter" | coast | romance/heartfelt | court/help | companion option | -
S-T7 "Wreckers' Lantern" | coast | dark/trick | join wreckers / expose | gold-dark / +P | ET8
S-T8 "Message in a Bottle" | coast | fun/link | find -> PEM clue | S-G2

## EMBERWOOD
S-E1 "Fire and Frost" | emberwood | story | investigate | M16 truth support; clue | S-G2
S-E2 "The Caught Settlement" | emberwood | HEAVY morality | save burn-side / freeze-side (can't fully both) | epilogue which-half | ET4
S-E3 "Ashen Relics" | emberwood | fun/loot | elemental puzzle | treasure | -
S-E4 "The Weeping Tree" | emberwood | heartfelt | witness | +P compassion; deepens M16 | ET11
S-E5 "Bounty: Cinder Stag" | emberwood | job/loot | hunt | epic gear | -
S-E6 "The Frostwidow" | emberwood | dark | a grieving elemental; mercy/banish | world card | ET8
S-E7 "Emberbrew" | emberwood | fun | brew a fire-ale | buff recipe + tavern gag | -

## SPIRE
S-S1 "Echoes of the Climb" | spire | reactive | (auto from deeds) | allies/enemies on ascent | ET8
S-S2 "The Last Confession" | spire | story | confess/refuse | extra ending nuance cards | ET10,ET12

## JOBS / LIFE-SIM (repeatable, any region)
S-J1 Woodcutting, S-J2 Fishing, S-J3 Cooking (buff food), S-J4 Smithing-help, S-J5 Deliveries,
S-J6 Bounty board (rotating). Gold -> gear/consumables/fuel/repair/property. Rep from gestures+deeds.

## NOTE: ~70 named here + jobs/bounties variants + procedural board = 100+. All quality-gated (Gate D).
## More addable as data. Cross-links: PEM clue-hunt (S-G2) needs S-A1/S-P1/S-T8/S-E1; betrayals seed
## from earlier ally-deeds; faction choices (P3/T1/E2) -> epilogue twists.
