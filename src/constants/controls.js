// =============================================================================
// SINGLE SOURCE OF TRUTH — CONTROL MAP (controller-first, remappable).
// The input layer READS these; the options menu REBINDS them (persisted later).
// Canonical actions are device-agnostic; each device maps buttons/keys to them.
// AIM / STRAFE / RANGED are RESERVED here (defined) but wired in a LATER stage.
// =============================================================================

// Every canonical action in the game (device-agnostic).
export const ACTIONS = Object.freeze([
  'move_up', 'move_down', 'move_left', 'move_right',
  'run',        // hold (keyboard) / analog-far (stick)
  'interact',   // talk / confirm / pickup
  'attack',
  'dodge',      // the DODGE-ROLL (i-frames)
  'use',        // use / throw item
  'aim',        // hold; strafe while aiming  [RESERVED — ranged is a later stage]
  'block',      // hold; tap-at-impact = parry
  'cycle_prev', 'cycle_next', // cycle the active item
  'menu',       // game menu (inventory/character/map/quests)
  'settings',   // the options/settings menu
]);

// Human labels for the rebinding UI.
export const ACTION_LABELS = Object.freeze({
  move_up: 'Move Up', move_down: 'Move Down', move_left: 'Move Left', move_right: 'Move Right',
  run: 'Run', interact: 'Interact / Talk', attack: 'Attack', dodge: 'Dodge-roll', use: 'Use / Throw',
  aim: 'Aim (later)', block: 'Block / Parry', cycle_prev: 'Prev Item', cycle_next: 'Next Item',
  menu: 'Game Menu', settings: 'Settings',
});

// Default KEYBOARD bindings (Phaser key names). Left-click also attacks; right-
// click also aims (mouse handled in the scene). Remappable via the options menu.
export const DEFAULT_KEYBOARD = Object.freeze({
  move_up: 'W', move_down: 'S', move_left: 'A', move_right: 'D',
  run: 'SHIFT', interact: 'E', attack: 'J', dodge: 'SPACE', use: 'Q',
  aim: 'R', block: 'C', cycle_prev: 'OPEN_BRACKET', cycle_next: 'CLOSED_BRACKET',
  menu: 'TAB', settings: 'ESC',
});

// Default XBOX gamepad bindings (Phaser standard Xbox button indices).
// A=0 B=1 X=2 Y=3 LB=4 RB=5 LT=6 RT=7 Back=8 Start=9 LSclick=10 RSclick=11
// Dpad U=12 D=13 L=14 R=15. Left stick = move (analog). RESERVED until Gate-N wiring.
export const DEFAULT_GAMEPAD = Object.freeze({
  interact: 0, dodge: 1, attack: 2, use: 3, cycle_prev: 4, cycle_next: 5,
  block: 6, aim: 7, settings: 8, menu: 9,
  // move = left stick (analog: magnitude >~0.85 = run, else walk); handled in the input layer.
});

// The LIVE, mutable bindings the game actually reads (rebinding mutates these).
// Start as copies of the defaults; the options menu writes here + persists later.
export const bindings = {
  keyboard: { ...DEFAULT_KEYBOARD },
  gamepad: { ...DEFAULT_GAMEPAD },
  options: { aimInvert: false, threatIndicators: false, audio: { master: 0.8, sfx: 0.8, music: 0.6 } },
};

/** Reset all bindings + control options to the canonical defaults. */
export function resetBindings() {
  bindings.keyboard = { ...DEFAULT_KEYBOARD };
  bindings.gamepad = { ...DEFAULT_GAMEPAD };
  bindings.options = { aimInvert: false, audio: { master: 0.8, sfx: 0.8, music: 0.6 } };
}
