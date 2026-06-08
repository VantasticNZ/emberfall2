// =============================================================================
// tiledToRegion() — the Tiled → engine adapter (GAME-BUILD-PLAYBOOK v2 §2 integration).
// Takes a Tiled map (.tmj JSON) + a world `origin` and returns the SAME finite-region
// shape OverworldScene._buildRegion already consumes ({origin, bounds, terrain, colliders,
// props, npcs, chests, entrances}) PLUS a `nav` truth-grid for the runtime gates (§3.1).
// Pure data transform — no Phaser, Node + browser importable.
//
// LAYER CONTRACT (the test map follows it; real regions will too):
//   - objectgroup "nav"      : rectangles; property kind = "blocked" | "gate" (gate also has `tool`).
//                              The nav layer is the COLLISION TRUTH, independent of art.
//   - tilelayer   "terrain"  : ground; each tileset tile may carry a `set` property (dirt/water/…)
//                              naming an autotiler set in terrainTiles.js. No `set` = base grass.
//   - objectgroup "props"    : point/rect objects; name = PROPS key; property solid = bool.
//   - objectgroup "entities" : objects with type = "chest" | "sign" | "entrance" (+ props).
// TERRAIN-RENDER PATH: we CONVERT the Tiled tile layer → terrain PATCHES (per-tile [tx,ty,1,1]
//   rects per set) so the existing autotiler renders it — zero new render code. See the report.
// =============================================================================

import { TILE } from './worldmap.js';

const propsOf = (o) => Object.fromEntries(((o && o.properties) || []).map((p) => [p.name, p.value]));
const layer = (tmj, name) => (tmj.layers || []).find((l) => l.name === name);

/** Build gid → autotiler-set name from the map's tilesets (tile.properties.set). */
function gidSetMap(tmj) {
  const map = {};
  for (const ts of (tmj.tilesets || [])) {
    for (const t of (ts.tiles || [])) {
      const set = propsOf(t).set;
      if (set) map[ts.firstgid + t.id] = set;
    }
  }
  return map;
}

export function tiledToRegion(tmj, { key, origin }) {
  const W = tmj.width, H = tmj.height;
  const ox = origin.x, oy = origin.y;

  // ---- TERRAIN: convert the Tiled tile layer → autotiler patches (one set → its tiles) ----
  const gset = gidSetMap(tmj);
  const tl = layer(tmj, 'terrain');
  const bySet = {};
  if (tl && tl.data) {
    for (let i = 0; i < tl.data.length; i++) {
      const set = gset[tl.data[i]]; if (!set) continue;             // gid 0 / base grass → no patch
      const tx = i % W, ty = (i / W) | 0;
      (bySet[set] = bySet[set] || []).push([tx, ty, 1, 1]);
    }
  }
  const terrain = { patches: Object.entries(bySet).map(([set, rects]) => ({ set, rects })) };

  // ---- NAV: the collision truth. blocked → colliders; gate → gatedColliders; build walkable grid --
  const walkable = Array.from({ length: H }, () => new Uint8Array(W).fill(1));  // 1 = walkable
  const gated = Array.from({ length: H }, () => new Uint8Array(W));             // 1 = gated tile
  const colliders = [], gatedColliders = [];
  const nav = layer(tmj, 'nav');
  const stampTiles = (o, grid, val) => {
    const tx0 = Math.floor(o.x / TILE), ty0 = Math.floor(o.y / TILE);
    const tx1 = Math.floor((o.x + o.width - 0.01) / TILE), ty1 = Math.floor((o.y + o.height - 0.01) / TILE);
    for (let ty = Math.max(0, ty0); ty <= Math.min(H - 1, ty1); ty++)
      for (let tx = Math.max(0, tx0); tx <= Math.min(W - 1, tx1); tx++) grid[ty][tx] = val;
  };
  const rect = (o) => ({ x: ox + o.x + o.width / 2, y: oy + o.y + o.height / 2, w: o.width, h: o.height });
  for (const o of ((nav && nav.objects) || [])) {
    const kind = propsOf(o).kind || o.type;
    if (kind === 'blocked') { colliders.push(rect(o)); stampTiles(o, walkable, 0); }
    else if (kind === 'gate') { gatedColliders.push({ ...rect(o), gate: propsOf(o).tool }); stampTiles(o, gated, 1); }
  }

  // ---- PROPS ----
  const props = [];
  for (const o of ((layer(tmj, 'props') || {}).objects || [])) {
    const p = propsOf(o);
    props.push({ key: o.name, x: ox + o.x + (o.width || 0) / 2, y: oy + o.y + (o.height || 0) / 2, solid: !!p.solid, scale: p.scale, text: p.text });
  }

  // ---- ENTITIES (chests / signs / entrances) ----
  const chests = [], entrances = [];
  for (const o of ((layer(tmj, 'entities') || {}).objects || [])) {
    const p = propsOf(o), wx = ox + o.x + (o.width || 0) / 2, wy = oy + o.y + (o.height || 0) / 2;
    if (o.type === 'chest') chests.push({ id: p.id || o.name, x: wx, y: wy, gold: p.gold });
    else if (o.type === 'sign') props.push({ key: 'prop_sign', x: wx, y: wy, solid: !!p.solid, text: p.text });
    else if (o.type === 'entrance') entrances.push({ id: p.id || o.name, x: wx, y: wy, to: p.to, gate: p.gate });
  }

  return {
    key, origin,
    widthTiles: W, heightTiles: H,
    bounds: { x: ox, y: oy, w: W * TILE, h: H * TILE },
    terrain, colliders, gatedColliders, props, npcs: [], chests, entrances,
    // the nav TRUTH for the runtime gates (§3.1) — independent of art:
    nav: { walkable, gated, W, H },
  };
}
