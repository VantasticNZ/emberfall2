// =============================================================================
// DAY/NIGHT cycle config, as DATA. The cycle runs on in-game MINUTES; the scene
// (later) maps real dt -> game minutes via RATE. Phases are fractions of the day.
// Tune the day length / rate here for a faster or slower cycle.
// =============================================================================

export const DAY_LENGTH = 1440;          // in-game minutes per full day (24h)
export const START_TIME = 0.35 * DAY_LENGTH; // begin mid-morning
export const RATE = 60;                   // in-game minutes per REAL second (1 day ~ 24 real sec; tunable)

// Phase boundaries as fractions of the day (0 = midnight). A phase runs from its
// `start` to the next entry's start; night brackets both ends.
export const PHASE_BOUNDS = [
  { name: 'night', start: 0.00 },
  { name: 'dawn',  start: 0.22 },
  { name: 'day',   start: 0.30 },
  { name: 'dusk',  start: 0.72 },
  { name: 'night', start: 0.80 },
];

export function phaseAt(frac) {
  let name = PHASE_BOUNDS[0].name;
  for (const b of PHASE_BOUNDS) if (frac >= b.start) name = b.name;
  return name;
}
