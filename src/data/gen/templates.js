// =============================================================================
// ROOM-TEMPLATE LIBRARY (Phase 1, BUILD-TOOLING §2) — hand-designed room pieces the dungeon
// generator stamps + connects, so generated dungeons are made of CRAFTED rooms (the Spelunky/Isaac
// model), not noise. Each template is a 9×7 char grid (the room owns its wall border; the generator
// carves a 2-tile DOOR where two rooms abut). Chars:  # wall · . floor · S spawn · C chest-slot
//   o decoration-slot (non-solid) · X solid-obstacle (a pillar — non-walkable, a prop over the wall).
// RULE: the connection CROSS (row 3 + col 4, the door-to-door paths) stays floor, so any two doors
// are always linked — obstacles live in the corners. (navGates re-validates every assembly anyway.)
// =============================================================================

export const ROOM_W = 9, ROOM_H = 7;

const T = (role, ...rows) => ({ role, rows });

export const TEMPLATES = [
  // ENTRANCE — the spawn room (the door back to the overworld is placed at S by the generator)
  T('entrance',
    '#########',
    '#.......#',
    '#.o...o.#',
    '#...S...#',
    '#.o...o.#',
    '#.......#',
    '#########'),
  // NORMAL rooms (variety: pillars / open-with-debris / corner-blocks / a plain junction)
  T('normal',
    '#########',
    '#.......#',
    '#.X...X.#',
    '#.......#',
    '#.X...X.#',
    '#.......#',
    '#########'),
  T('normal',
    '#########',
    '#.o...o.#',
    '#.......#',
    '#.......#',
    '#.......#',
    '#.o...o.#',
    '#########'),
  T('normal',
    '#########',
    '#X.....X#',
    '#..o.o..#',
    '#.......#',
    '#..o.o..#',
    '#X.....X#',
    '#########'),
  T('normal',
    '#########',
    '#.......#',
    '#.......#',
    '#.......#',
    '#.......#',
    '#.......#',
    '#########'),
  // TREASURE rooms (the chest at the centre; corner cover)
  T('treasure',
    '#########',
    '#.......#',
    '#.o...o.#',
    '#...C...#',
    '#.o...o.#',
    '#.......#',
    '#########'),
  T('treasure',
    '#########',
    '#X.....X#',
    '#.......#',
    '#...C...#',
    '#.......#',
    '#X.....X#',
    '#########'),
  // BOSS — an open arena (the objective chest stands in for the boss grant for now)
  T('boss',
    '#########',
    '#.......#',
    '#.......#',
    '#...C...#',
    '#.......#',
    '#.......#',
    '#########'),
];

export const byRole = (role) => TEMPLATES.filter((t) => t.role === role);
