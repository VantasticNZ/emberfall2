# ECONOMY BALANCE (Emberfall 2)

The model the Economy/Inventory engines implement. All numbers are DATA in
`src/data/economy.js` (`BALANCE`, `REGION_PRICES`, `SHOPS`, `JOBS`) +
`src/data/items/index.js` — tune there, not in code. Goal (QUALITY-BIBLE Gate F):
**fair** — you can grind a bit, but you cannot trivially out-earn costs.

## Start
- Starting gold: **20**. Base max HP: **100**. Carry limit: **40** items.

## Income (small → medium, never a faucet)
| source | amount | notes |
|---|---|---|
| enemy drops | ~2–8 g | small, frequent |
| selling loot | region `sell` × value | **always < buy price** (see pricing) |
| jobs (repeatable) | 6–40 g | woodcutting 8(+timber), fishing 6(+fish), smithing 15(+ore+skill), delivery 12, bounty 40 (level 3+) |
| quests | ~30–80 g | medium, one-off |
| property rent | 25–60 g / period | passive, after a big up-front sink |

## Sinks (where the gold goes)
| sink | cost | notes |
|---|---|---|
| **lantern oil** | 5 / refill | the deliberate EARLY sink (Marsh region) |
| consumables | 12 (minor) – 35 (major) potion; food 3–8 | |
| gear | 15 (wooden) → 80 (steel) → 120–160 (armour) → 220–260 (epic) | |
| repair / services | (skill `repair` from a 60 g book cuts this) | durability per SYSTEMS-DESIGN |
| **property** | house 1500 (lvl 5), shop 3500 (lvl 10) | the big sink; pays back slowly via rent |

## Regional pricing (arbitrage is intended)
`REGION_PRICES[region] = { buy, sell }`. **buy** multiplies value to purchase;
**sell** is the fraction of value you get back. Examples: Tidewreck (port) buy
**0.90** / sell **0.45** — cheap goods, poor loot payout; Emberwood buy **1.30** /
sell **0.65** — dear, but values rare loot. Buy cheap in a port, haul loot to a
remote region for a better sell = a real, gentle money-making loop. `sell < buy`
everywhere, so no infinite money pump.

## Life-sim
- **Books** (consumed on reading) teach a skill (`repair`, `haggle`) or grant a
  skill point.
- **Property**: buy (level + gold gated) → `collectRent(periods)` trickles gold.
- **Food / body-state**: eating heals + raises a `foodMeter` (0–120). `≥100` →
  **fat** (+20% max HP, −1 speed); `≤20` → **skinny** (+1 speed, −20% max HP);
  middle → normal. The meter decays ~10/day (`tickFood`). Light + non-judgmental.

## Death penalty
- Lose **15%** of gold on death, **capped at 200 g** (`deathPct`, `deathCap`).
  A sting at any wealth, never a wipe (at 2000 g you lose 200, not 300).
