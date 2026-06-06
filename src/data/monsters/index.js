// =============================================================================
// MONSTERS — archetype behaviours as DATA (Gate E: each a distinct, telegraphed
// QUESTION; the "counter" is what beats it). The behaviour is a small state
// machine: each state has an optional `dur` (seconds; absent = waits for a
// trigger), `flags` the combat layer queries (telegraphing / punishWindow /
// invulnerable / guarding / interruptible / hidden / touchDamage / ...), a `next`
// state, and optional `onInterrupt`. Instances are data per region (skins).
// Bosses = an archetype (or phased archetypes) + a trick + a twist at an HP gate.
// Rendering comes later; the LOGIC + "what beats it" is real here.
// =============================================================================

import { TOOLS } from '../../constants/flags.js';

export const ARCHETYPES = {
  // telegraphed rush in a line -> dodge sideways, punish the recovery
  charger: {
    stats: { hp: 30, dmg: 8, speed: 4 },
    counter: 'Dodge sideways out of the line during the rush, then punish the recovery.',
    element: null, skins: [
      { region: 'Ashen Marsh', name: 'Bog Lunger' }, { region: 'Sundered Peaks', name: 'Crag Ram' },
      { region: 'Tidewreck Coast', name: 'Surf Charger' }, { region: 'Emberwood', name: 'Cinder Boar' },
    ],
    start: 'idle',
    states: {
      idle: { dur: 1.0, next: 'telegraph' },
      telegraph: { dur: 0.6, flags: { telegraphing: true }, next: 'charge' },
      charge: { dur: 0.8, flags: { rushing: true }, next: 'recover' },
      recover: { dur: 1.0, flags: { punishWindow: true }, next: 'idle' },
    },
  },

  // blocks from the front -> flank it or break its guard
  shielded: {
    stats: { hp: 40, dmg: 6, speed: 2 },
    counter: 'Flank it (hit from the side/back) or break its guard; the front is covered.',
    element: null, skins: [{ region: 'Sundered Peaks', name: 'Order Revenant' }, { region: 'Spire', name: 'Warden Shade' }],
    start: 'guard',
    states: {
      guard: { dur: 2.0, flags: { guarding: true, frontImmune: true }, next: 'attack' },
      attack: { dur: 0.5, flags: { punishWindow: true }, next: 'guard' },
    },
  },

  // fires projectiles -> close the distance / use cover / block
  ranged: {
    stats: { hp: 18, dmg: 7, speed: 2 },
    counter: 'Close the distance, use cover, or block the shot; deadly at range, weak up close.',
    element: null, skins: [{ region: 'Tidewreck Coast', name: 'Smuggler Slinger' }, { region: 'Sundered Peaks', name: 'Crag Archer' }],
    start: 'idle',
    states: {
      idle: { dur: 1.0, next: 'aim' },
      aim: { dur: 0.7, flags: { telegraphing: true }, next: 'fire' },
      fire: { dur: 0.2, flags: { firing: true }, next: 'cooldown' },
      cooldown: { dur: 1.0, next: 'idle' },
    },
  },

  // many weak ones -> AoE / the spin (swirl) hit / crowd control
  swarm: {
    stats: { hp: 6, dmg: 3, speed: 3, count: 5 },
    counter: 'Use the spin/swirl hit or any AoE to clear the cluster; one at a time is a losing game.',
    element: null, skins: [{ region: 'Ashen Marsh', name: 'Fen Gnats' }, { region: 'Emberwood', name: 'Ember Sprites' }],
    start: 'idle',
    states: {
      idle: { dur: 1.0, next: 'swarm' },
      swarm: { dur: 1.0, flags: { swarming: true }, next: 'idle' },
    },
  },

  // slow, heavy hits -> dodge the long wind-up, punish
  brute: {
    stats: { hp: 60, dmg: 16, speed: 1 },
    counter: 'Dodge the slow, telegraphed wind-up, then punish during the long recovery.',
    element: null, skins: [{ region: 'Sundered Peaks', name: 'Stone Ogre' }, { region: 'Emberwood', name: 'Charwood Golem' }],
    start: 'idle',
    states: {
      idle: { dur: 1.2, next: 'windup' },
      windup: { dur: 1.2, flags: { telegraphing: true }, next: 'slam' },
      slam: { dur: 0.3, flags: { slamming: true }, next: 'recover' },
      recover: { dur: 1.5, flags: { punishWindow: true }, next: 'idle' },
    },
  },

  // channels an elemental attack -> INTERRUPT it during the channel
  caster: {
    stats: { hp: 22, dmg: 14, speed: 2 },
    counter: 'Interrupt the channel (hit it WHILE it casts); let the channel finish and it hurts.',
    element: 'fire', skins: [{ region: 'Emberwood', name: 'Fever Caster' }, { region: 'Spire', name: 'Binding Acolyte' }],
    start: 'idle',
    states: {
      idle: { dur: 1.0, next: 'channel' },
      channel: { dur: 1.5, flags: { telegraphing: true, interruptible: true }, next: 'release', onInterrupt: 'cooldown' },
      release: { dur: 0.3, flags: { casting: true }, next: 'cooldown' },
      cooldown: { dur: 1.2, next: 'idle' },
    },
  },

  // periodically charges up: INVULNERABLE + damages-on-touch while charging ->
  // do NOT hit it during the charge; wait for the window, then strike
  charger_electric: {
    stats: { hp: 28, dmg: 12, speed: 3 },
    counter: 'Do NOT strike while it is charged (invulnerable + shocks on touch); wait for the window, then hit.',
    element: 'storm', skins: [{ region: 'Sundered Peaks', name: 'Storm Crawler' }, { region: 'Tidewreck Coast', name: 'Galvanic Eel' }],
    start: 'idle',
    states: {
      idle: { dur: 1.5, next: 'charging' },
      charging: { dur: 2.0, flags: { invulnerable: true, touchDamage: true, telegraphing: true }, next: 'discharge' },
      discharge: { dur: 0.2, flags: { discharging: true }, next: 'window' },
      window: { dur: 1.2, flags: { punishWindow: true }, next: 'idle' },
    },
  },

  // leaps to your position -> bait the leap, move, punish the landing
  jumper: {
    stats: { hp: 24, dmg: 9, speed: 5 },
    counter: 'Bait the leap, side-step where it lands, and punish the landing recovery.',
    element: null, skins: [{ region: 'Ashen Marsh', name: 'Leap-Frog Horror' }, { region: 'Emberwood', name: 'Cinder Hopper' }],
    start: 'idle',
    states: {
      idle: { dur: 1.0, next: 'crouch' },
      crouch: { dur: 0.6, flags: { telegraphing: true }, next: 'leap' },
      leap: { dur: 0.5, flags: { leaping: true }, next: 'land' },
      land: { dur: 1.0, flags: { punishWindow: true }, next: 'idle' },
    },
  },

  // hidden until you are close -> perception/WIS reveals it, or it gets a free hit
  ambusher: {
    stats: { hp: 20, dmg: 11, speed: 3 }, revealWis: 3,
    counter: 'High perception/WIS reveals it before it strikes; otherwise it lands a free first hit.',
    element: null, skins: [{ region: 'Tidewreck Coast', name: 'Wreck Wraith' }, { region: 'Ashen Marsh', name: 'Mire Lurker' }],
    start: 'hidden',
    states: {
      hidden: { flags: { hidden: true } },          // no dur — waits for reveal() or ambush
      revealed: { dur: 1.0, flags: { punishWindow: true }, next: 'normal' },
      normal: { dur: 1.5, next: 'normal' },
    },
  },
};

// BOSSES = a phased archetype + a TRICK + a TWIST at an HP gate (learn-the-pattern).
// Example: the Drowned Guardian — shrouded/SHIELDED, the lantern (trick) strips the
// shroud to let you hit it; at half HP it ENRAGES into a BRUTE (the twist).
export const BOSSES = {
  drowned_guardian: {
    name: 'The Drowned Guardian', region: 'Ashen Marsh',
    stats: { hp: 120, dmg: 14, speed: 2 },
    trick: { tool: TOOLS.tool_lantern, desc: "Lantern-light strips its shroud so your blows land." },
    twistDesc: 'At half health it tears off the last of the shroud and rampages.',
    phases: [
      { behaviour: 'shielded' },                                   // shrouded: must use the lantern (trick) or flank
      { belowHp: 0.5, behaviour: 'brute', twist: 'enraged' },      // the twist
    ],
  },

  // The Keep Sentinel (Cinder Keep, Sundered Peaks M12) — welded armour, too
  // armoured to face head-on; the GRAPPLE (trick) hauls its shield-arm off-balance
  // so your blows land; at half armour it tears loose and rampages (BRUTE twist).
  keep_sentinel: {
    name: 'The Keep Sentinel', region: 'Sundered Peaks',
    stats: { hp: 130, dmg: 15, speed: 2 },
    trick: { tool: TOOLS.tool_grapple, desc: 'Grapple its shield-arm to haul it off-balance, then strike.' },
    twistDesc: 'At half armour it tears loose of its mounts and rampages.',
    phases: [
      { behaviour: 'shielded' },                                   // armoured: grapple (trick) or flank
      { belowHp: 0.5, behaviour: 'brute', twist: 'unleashed' },    // the twist
    ],
  },
};

export function archetype(id) { const a = ARCHETYPES[id]; if (!a) throw new Error(`unknown archetype: ${id}`); return a; }
