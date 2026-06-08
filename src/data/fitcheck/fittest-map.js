// =============================================================================
// FIT-CHECK TEST MAP (throwaway fixture — NOT real content, never imported by game code).
// This IS a valid Tiled map (.tmj JSON): the object below can be written to fittest.tmj and
// opened in Tiled. It is a JS module only so Node (the gates) and Vite (the live proof) can both
// import it without a fetch. Proves the GAME-BUILD-PLAYBOOK v2 §8.1 fit-check end-to-end.
//
// 16×12 tiles. SEPARATE LAYERS:
//  - terrain (tilelayer): grass base + a dirt path on the walkable corridor + a water pool; an
//    ART GAP (gid 0 = NO ground art) deliberately left in a blocked zone (bottom-right).
//  - nav (objectgroup): the COLLISION TRUTH — blocked walls frame a corridor with a FORK
//    (left branch OPEN, right branch GATED by tool_lantern). Independent of art.
//  - props (objectgroup): a SOLID boulder off the path (in a blocked zone) + NON-SOLID bush scatter
//    (one overlapping the walkable corridor — allowed for decoration).
//  - entities (objectgroup): a chest (left exit), a sign (corridor), an entrance (right gated exit).
//
// Layout (tx,ty), walkable = trunk(7-9, 4-11) + left arm(2-6, 4-5) + right arm(11-13, 4-5):
//        the right arm is reachable only through the GATE at tx10 (tool_lantern).
// =============================================================================

const W = 16, H = 12;
// terrain tile ids: gid 1 = grass (base, no `set`), gid 2 = dirt, gid 3 = water, gid 0 = NO ART.
const G = 1, D = 2, WA = 3, GAP = 0;
const inRect = (tx, ty, x0, y0, x1, y1) => tx >= x0 && tx <= x1 && ty >= y0 && ty <= y1;
const walkable = (tx, ty) =>
  inRect(tx, ty, 7, 4, 9, 11) || inRect(tx, ty, 2, 4, 6, 5) || inRect(tx, ty, 11, 4, 13, 5);
const data = [];
for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < W; tx++) {
  if (inRect(tx, ty, 10, 6, 15, 11)) data.push(GAP);            // ART GAP — blocked zone, no ground art
  else if (inRect(tx, ty, 3, 1, 5, 2)) data.push(WA);           // a water pool (in the top blocked band)
  else if (walkable(tx, ty)) data.push(D);                      // dirt path on the walkable corridor
  else data.push(G);                                            // grass base everywhere else
}

const r = (x, y, w, h, props) => ({ x: x * 32, y: y * 32, width: w * 32, height: h * 32, properties: props });
const blocked = (x, y, w, h) => r(x, y, w, h, [{ name: 'kind', type: 'string', value: 'blocked' }]);

export const FITTEST = {
  type: 'map', orientation: 'orthogonal', infinite: false,
  width: W, height: H, tilewidth: 32, tileheight: 32,
  tilesets: [{
    firstgid: 1, name: 'fitterrain', tilewidth: 32, tileheight: 32, tilecount: 3, columns: 3,
    tiles: [   // tile id 0 = grass (no set = base); id 1 = dirt; id 2 = water
      { id: 1, properties: [{ name: 'set', type: 'string', value: 'dirt' }] },
      { id: 2, properties: [{ name: 'set', type: 'string', value: 'water' }] },
    ],
  }],
  layers: [
    { type: 'tilelayer', name: 'terrain', width: W, height: H, data, visible: true, opacity: 1 },
    {
      type: 'objectgroup', name: 'nav', objects: [
        blocked(0, 0, 16, 4),      // top band
        blocked(0, 6, 7, 6),       // left-bottom block
        blocked(10, 6, 6, 6),      // RIGHT-BOTTOM block = the ART-GAP zone (looks like open grass, blocks anyway)
        blocked(0, 4, 2, 2),       // left of the left exit
        blocked(14, 4, 2, 2),      // right of the right exit
        r(10, 4, 1, 2, [{ name: 'kind', type: 'string', value: 'gate' }, { name: 'tool', type: 'string', value: 'tool_lantern' }]), // GATE → right arm
      ],
    },
    {
      type: 'objectgroup', name: 'props', objects: [
        { name: 'prop_rock_boulder', type: 'prop', x: 12 * 32, y: 8 * 32, width: 32, height: 32, properties: [{ name: 'solid', type: 'bool', value: true }] },   // SOLID, off-path (blocked zone)
        { name: 'prop_bush', type: 'prop', x: 4 * 32, y: 7 * 32, width: 32, height: 32, properties: [{ name: 'solid', type: 'bool', value: false }] },            // non-solid scatter (blocked zone)
        { name: 'prop_bush', type: 'prop', x: 8 * 32, y: 9 * 32, width: 32, height: 32, properties: [{ name: 'solid', type: 'bool', value: false }] },            // non-solid scatter ON the walkable trunk (allowed)
      ],
    },
    {
      type: 'objectgroup', name: 'entities', objects: [
        { name: 'fitcheck_chest', type: 'chest', x: 2 * 32, y: 4 * 32, width: 32, height: 32, properties: [{ name: 'id', type: 'string', value: 'fitcheck_chest' }, { name: 'gold', type: 'int', value: 5 }] },
        { name: 'fitcheck_sign', type: 'sign', x: 8 * 32, y: 10 * 32, width: 32, height: 32, properties: [{ name: 'text', type: 'string', value: 'FIT-CHECK — up the corridor to the fork: left is open, right is gated (needs the lantern).' }] },
        { name: 'fitcheck_exit', type: 'entrance', x: 13 * 32, y: 4 * 32, width: 32, height: 32, properties: [{ name: 'id', type: 'string', value: 'fitcheck_exit' }, { name: 'to', type: 'string', value: 'Greenhollow' }, { name: 'gate', type: 'string', value: 'tool_lantern' }] },
      ],
    },
  ],
};

// Where the throwaway region sits in world-space (chunk 2,2 = px 2048 — empty NW, far from real regions).
export const FITTEST_ORIGIN = { x: 2048, y: 2048 };
// Intended runtime truths for the gates (independent ground truth):
export const FITTEST_EXPECT = {
  startTile: [9, 11],                 // bottom of the trunk
  reachOpen: [[2, 4]],                // left exit reachable WITHOUT the tool
  reachGatedOnlyWithTool: [[13, 4]],  // right exit reachable ONLY with tool_lantern
  blockedMustHold: [[12, 8], [3, 1], [13, 9]],  // boulder zone / water / art-gap zone — never reachable
};
