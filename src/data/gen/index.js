// =============================================================================
// PROCEDURAL GENERATORS + the GENERATE→VALIDATE loop (Phase 1, BUILD-TOOLING §2/§3).
//   generateDungeon(spec) — a grid of CRAFTED template rooms (templates.js) connected by doors,
//                           with a guaranteed entrance→objective path (the room-graph is grown
//                           connected from the entrance).
//   generateCave(spec)    — cellular-automata caverns + flood-fill (keep the largest region → all
//                           floor reachable).
// Both: constrained Poisson-ish prop scatter (no solid prop on a walkable tile; doors/chest clear),
// then EVERY result is run through navGates (body-walk reachability + no-prop-on-walkable) and
// REJECTED + REGENERATED on failure (with a retry cap + a guaranteed-valid fallback). So an auto-
// generated dungeon/cave can NEVER ship unwalkable or with a blocked objective — the B2 bug class is
// impossible even in generated content. Output = the interiorRegion()/region shape (collision, depth,
// interaction-classes, save, streaming all apply unchanged).
// =============================================================================

import { TILE } from '../worldmap.js';
import { ROOM_W, ROOM_H, byRole } from './templates.js';
import { bodyWalkReachability, noSolidPropOnWalkable } from '../../systems/navGates.js';

// ---- deterministic RNG + small helpers --------------------------------------
export function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const shuffle = (arr, rng) => { for (let i = arr.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0;[arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
const pick = (arr, rng) => arr[(rng() * arr.length) | 0];

// flood the 4-connected floor (0) regions of a binary grid
function floodRegions(g, W, H) {
  const seen = Array.from({ length: H }, () => new Uint8Array(W)), regions = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (g[y][x] || seen[y][x]) continue;
    const reg = [], q = [[x, y]]; seen[y][x] = 1;
    while (q.length) { const [cx, cy] = q.pop(); reg.push([cx, cy]);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = cx + dx, b = cy + dy; if (a < 0 || b < 0 || a >= W || b >= H || g[b][a] || seen[b][a]) continue; seen[b][a] = 1; q.push([a, b]); } }
    regions.push(reg);
  }
  return regions;
}
// BFS over the WALKABLE grid; return the reachable tile farthest from `start` (a destination to validate)
function farthestFloor(walkable, W, H, start) {
  const dist = Array.from({ length: H }, () => new Int32Array(W).fill(-1)); dist[start.ty][start.tx] = 0;
  const q = [[start.tx, start.ty]]; let far = [start.tx, start.ty], fd = 0;
  while (q.length) { const [x, y] = q.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = x + dx, b = y + dy; if (a < 0 || b < 0 || a >= W || b >= H || !walkable[b][a] || dist[b][a] >= 0) continue; dist[b][a] = dist[y][x] + 1; if (dist[b][a] > fd) { fd = dist[b][a]; far = [a, b]; } q.push([a, b]); } }
  return far;
}
const firstFloor = (grid) => { for (let y = 0; y < grid.length; y++) for (let x = 0; x < grid[0].length; x++) if (grid[y][x] !== '#' && grid[y][x] !== 'X') return { tx: x, ty: y }; return { tx: 1, ty: 1 }; };

// ---- char-grid → region shape (the interiorRegion()/region contract) ---------
function emit({ key, otx, oty, grid, floor, decorKey = 'prop_bush', obstacleKey = 'prop_rock_small', chestGold = 25 }) {
  const H = grid.length, W = grid[0].length, ox = otx * TILE, oy = oty * TILE;
  const walkable = [], gated = [], colliders = [], props = [], chests = [], interactables = [], floorRects = [];
  let spawn = null;
  for (let ty = 0; ty < H; ty++) {
    walkable[ty] = new Uint8Array(W); gated[ty] = new Uint8Array(W);
    for (let tx = 0; tx < W; tx++) {
      const c = grid[ty][tx], wall = c === '#' || c === 'X', wx = ox + tx * TILE + TILE / 2, wy = oy + ty * TILE + TILE / 2;
      walkable[ty][tx] = wall ? 0 : 1;
      if (wall) colliders.push({ x: wx, y: wy, w: TILE, h: TILE }); else floorRects.push([tx, ty, 1, 1]);
      if (c === 'X') props.push({ key: obstacleKey, x: wx, y: wy - 4, solid: false, scale: 0.95 });     // a visual pillar on the wall tile
      else if (c === 'o') props.push({ key: decorKey, x: wx, y: wy, solid: false, scale: 0.55 + 0.3 * ((tx * 7 + ty * 13) % 5) / 5 }); // non-solid decoration
      if (c === 'S') spawn = { tx, ty };
      if (c === 'C') chests.push({ id: `${key}_chest_${tx}_${ty}`, x: wx, y: wy, gold: chestGold });
    }
  }
  if (!spawn) spawn = firstFloor(grid);
  const sx = ox + spawn.tx * TILE + TILE / 2, sy = oy + spawn.ty * TILE + TILE / 2;
  interactables.push({ via: 'door', key: 'prop_sign', solid: false, x: sx, y: sy, to: 'back', prompt: 'Leave (back outside)' });
  const reach = chests.map((c) => [Math.round((c.x - ox - TILE / 2) / TILE), Math.round((c.y - oy - TILE / 2) / TILE)]);
  reach.push(farthestFloor(walkable, W, H, spawn));     // validate the whole space is body-reachable
  return {
    key, origin: { x: ox, y: oy }, widthTiles: W, heightTiles: H, bounds: { x: ox, y: oy, w: W * TILE, h: H * TILE },
    route: true, interior: true, generated: true, mapColor: 0x3a3530,
    terrain: { patches: [{ set: floor, rects: floorRects }] },
    colliders, props, npcs: [], chests, interactables,
    spawn: { x: sx, y: sy }, nav: { walkable, gated, W, H },
    expect: { startTile: [spawn.tx, spawn.ty], reachOpen: reach, reachGatedOnlyWithTool: [], blockedMustHold: [[0, 0], [W - 1, H - 1]] },
  };
}

// ---- DUNGEON: a connected grid of template rooms ----------------------------
function genDungeon(spec, seed) {
  const rng = mulberry32(seed >>> 0), GW = spec.gw || 4, GH = spec.gh || 3, kk = (x, y) => x + ',' + y;
  const cells = {}, start = { x: 0, y: (GH / 2) | 0 }; cells[kk(start.x, start.y)] = { role: 'entrance', x: start.x, y: start.y };
  const q = [start], target = Math.min(GW * GH, 6 + ((rng() * 4) | 0)); let count = 1;
  while (q.length && count < target) {
    const c = q.shift();
    for (const [dx, dy] of shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]], rng)) {
      const nx = c.x + dx, ny = c.y + dy; if (nx < 0 || ny < 0 || nx >= GW || ny >= GH || cells[kk(nx, ny)]) continue;
      const filled = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([a, b]) => cells[kk(nx + a, ny + b)]).length;
      if (filled >= 2 || rng() < 0.35) continue;
      cells[kk(nx, ny)] = { role: 'normal', x: nx, y: ny }; q.push({ x: nx, y: ny }); if (++count >= target) break;
    }
  }
  const list = Object.values(cells);
  // boss = the cell farthest (graph BFS) from the entrance; treasure = a dead-end
  const dist = {}; dist[kk(start.x, start.y)] = 0; const bq = [start];
  while (bq.length) { const c = bq.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = cells[kk(c.x + dx, c.y + dy)]; if (n && dist[kk(n.x, n.y)] === undefined) { dist[kk(n.x, n.y)] = dist[kk(c.x, c.y)] + 1; bq.push(n); } } }
  let boss = null, md = -1; for (const c of list) { const d = dist[kk(c.x, c.y)] || 0; if (c.role !== 'entrance' && d > md) { md = d; boss = c; } }
  if (boss) boss.role = 'boss';
  for (const c of list) { if (c.role !== 'normal') continue; if ([[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([a, b]) => cells[kk(c.x + a, c.y + b)]).length === 1) { c.role = 'treasure'; break; } }
  // stamp templates
  const W = GW * ROOM_W, H = GH * ROOM_H, grid = Array.from({ length: H }, () => new Array(W).fill('#'));
  for (const c of list) { const t = pick(byRole(c.role).length ? byRole(c.role) : byRole('normal'), rng); for (let ry = 0; ry < ROOM_H; ry++) for (let rx = 0; rx < ROOM_W; rx++) grid[c.y * ROOM_H + ry][c.x * ROOM_W + rx] = t.rows[ry][rx]; }
  // carve 2-tile doors between adjacent placed cells (through the connection cross)
  for (const c of list) {
    if (cells[kk(c.x + 1, c.y)]) { const y = c.y * ROOM_H + 3; grid[y][c.x * ROOM_W + ROOM_W - 1] = '.'; grid[y][(c.x + 1) * ROOM_W] = '.'; }
    if (cells[kk(c.x, c.y + 1)]) { const x = c.x * ROOM_W + 4; grid[c.y * ROOM_H + ROOM_H - 1][x] = '.'; grid[(c.y + 1) * ROOM_H][x] = '.'; }
  }
  return grid;
}

// ---- CAVE: cellular automata + flood-fill connectivity ----------------------
function genCave(spec, seed) {
  const rng = mulberry32(seed >>> 0), W = spec.w || 26, H = spec.h || 18;
  let g = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (x === 0 || y === 0 || x === W - 1 || y === H - 1 || rng() < 0.45) ? 1 : 0));
  for (let p = 0; p < 4; p++) {
    const n = g.map((r) => r.slice());
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { let w = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && g[y + dy][x + dx]) w++; n[y][x] = g[y][x] ? (w >= 4 ? 1 : 0) : (w >= 5 ? 1 : 0); }
    g = n;
  }
  for (let x = 0; x < W; x++) { g[0][x] = 1; g[H - 1][x] = 1; } for (let y = 0; y < H; y++) { g[y][0] = 1; g[y][W - 1] = 1; }
  const regions = floodRegions(g, W, H); if (!regions.length) return null;
  regions.sort((a, b) => b.length - a.length);
  if (regions[0].length < W * H * 0.25) return null;                       // too little open → retry
  const keep = new Set(regions[0].map(([x, y]) => x + ',' + y));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x] === 0 && !keep.has(x + ',' + y)) g[y][x] = 1;
  const grid = g.map((row) => row.map((c) => (c ? '#' : '.')));
  const floors = regions[0];
  const spawn = floors.reduce((a, p) => ((p[0] + p[1]) < (a[0] + a[1]) ? p : a), floors[0]);   // nearest top-left floor
  grid[spawn[1]][spawn[0]] = 'S';
  const far = farthestFloor(g.map((r) => r.map((c) => (c ? 0 : 1))), W, H, { tx: spawn[0], ty: spawn[1] });
  if (far) grid[far[1]][far[0]] = 'C';
  return grid;
}

// ---- constrained scatter (Poisson-ish: min-spacing, density roll, clear of S/C) ----
function scatterDecor(grid, rng) {
  const H = grid.length, W = grid[0].length, placed = [], cands = [];
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (grid[y][x] !== '.') continue;
    let near = false; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const c = grid[y + dy][x + dx]; if (c === 'S' || c === 'C') near = true; }
    if (!near) cands.push([x, y]);
  }
  shuffle(cands, rng);
  for (const [x, y] of cands) { if (rng() > 0.13) continue; if (placed.some(([px, py]) => Math.abs(px - x) + Math.abs(py - y) < 2)) continue; grid[y][x] = 'o'; placed.push([x, y]); }
  return grid;
}

const fallbackGrid = (W, H) => { const g = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (x === 0 || y === 0 || x === W - 1 || y === H - 1) ? '#' : '.')); g[H - 2][1] = 'S'; g[1][W - 2] = 'C'; return g; };

// ---- THE GENERATE→VALIDATE LOOP ---------------------------------------------
export function generate(kind, spec) {
  const build = kind === 'cave' ? genCave : genDungeon, floor = spec.floor || 'rock', baseSeed = (spec.seed || 1) >>> 0, tries = spec.maxTries ?? 16;
  for (let t = 0; t < tries; t++) {
    const seed = (baseSeed + t * 0x9E3779B1) >>> 0;
    let grid = build(spec, seed); if (!grid) continue;
    grid = scatterDecor(grid, mulberry32((seed ^ 0xABCD1234) >>> 0));
    const region = emit({ key: spec.key, otx: spec.otx, oty: spec.oty, grid, floor, chestGold: kind === 'cave' ? 20 : 30 });
    const bw = bodyWalkReachability(region, region.expect), np = noSolidPropOnWalkable(region);
    if (bw.ok && np.ok) return { region, seed, tries: t + 1, fallback: false };
  }
  // FALLBACK — a guaranteed-valid plain room (never ships something broken)
  const grid = fallbackGrid(spec.w || 14, spec.h || 10);
  return { region: emit({ key: spec.key, otx: spec.otx, oty: spec.oty, grid, floor, chestGold: 15 }), seed: baseSeed, tries, fallback: true };
}
export const generateDungeon = (spec) => generate('dungeon', spec);
export const generateCave = (spec) => generate('cave', spec);
