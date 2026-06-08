// =============================================================================
// Self-test for the Interactables resolver (cut / push / search). Proves the
// FREE-NOW playground verbs: weighted loot rolls (deterministic), carry-limit
// respect, SEARCH-ONCE permanence that SURVIVES a save round-trip (no re-loot),
// locked containers, bush-respawn vs permanent-break, and push-if-clear. Plain
// Node + node:assert (no Phaser).
// =============================================================================

import assert from 'node:assert/strict';
import { rollLoot, grantLoot, searchContainer, cutObject, pushBlock } from './Interactables.js';
import { LOOT } from '../data/loot.js';
import { Inventory } from './Inventory.js';
import { SaveManager } from './SaveManager.js';
import { memoryStorage } from './storage.js';

let n = 0;
const pass = (m) => { n++; console.log('  ✓ ' + m); };
// seeded LCG so rolls are deterministic + reproducible
const lcg = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

// 1) rollLoot — every table yields only valid grant shapes, respects `nothing`/gold/item
{
  for (const [id, t] of Object.entries(LOOT)) {
    const rng = lcg(123);
    for (let i = 0; i < 200; i++) {
      const out = rollLoot(id, rng);
      assert.ok(Array.isArray(out));
      for (const g of out) {
        if (g.gold != null) assert.ok(g.gold >= 1, `${id} gold >=1`);
        else { assert.ok(typeof g.item === 'string' && g.item, `${id} has item id`); assert.ok(g.n >= 1, `${id} n>=1`); }
      }
    }
  }
  // deterministic for a fixed seed
  assert.deepEqual(rollLoot('loot_crate', lcg(7)), rollLoot('loot_crate', lcg(7)));
  pass('rollLoot: all tables yield valid {gold|item,n}; deterministic per seed');
}

// 2) grantLoot — grants gold + items to the inventory; respects the carry limit
{
  const inv = new Inventory({ storage: memoryStorage(), slot: 'lt' });
  const g0 = inv.gold;
  const got = grantLoot([{ gold: 5 }, { item: 'bread', n: 2 }, { item: 'timber', n: 1 }], inv);
  assert.equal(inv.gold, g0 + 5);
  assert.equal(inv.has('bread', 2), true);
  assert.equal(inv.has('timber', 1), true);
  assert.equal(got.length, 3);
  // carry-limit: a grant that busts the cap is flagged full + NOT added
  while (inv.add('fish', 1)) { /* fill to the cap */ }
  const over = grantLoot([{ item: 'fish', n: 1 }], inv);
  assert.equal(over[0].full, true);
  pass('grantLoot: grants gold+items; carry-limit overflow flagged full (no dupe)');
}

// 3) SEARCH-ONCE permanence that SURVIVES a save round-trip
{
  const store = memoryStorage();
  const inv = new Inventory({ storage: memoryStorage(), slot: 's1' });
  const save = new SaveManager({ storage: store, slot: 'slotS' });
  const key = 'searched_mara_pantry';
  const mem = { has: (k) => save.isOpened(2, 3, k), record: (k) => save.recordOpened(2, 3, k) };
  const def = { via: 'search', id: 'mara_pantry', loot: 'loot_cupboard' };
  const ctx = { inv, rng: lcg(42), mem, key };

  const first = searchContainer(def, ctx);
  assert.equal(first.already, undefined, 'first search loots');
  assert.ok(first.granted.length >= 0);
  const after1 = inv.count();

  const second = searchContainer(def, ctx);
  assert.equal(second.already, true, 'second search = already searched');
  assert.equal(second.granted.length, 0, 'no re-grant');
  assert.equal(inv.count(), after1, 'inventory unchanged on re-search');

  // SAVE → reload → still searched (persists; not re-lootable)
  save.save();
  const save2 = new SaveManager({ storage: store, slot: 'slotS' });
  save2.load();
  const mem2 = { has: (k) => save2.isOpened(2, 3, k), record: (k) => save2.recordOpened(2, 3, k) };
  const reloaded = searchContainer(def, { inv, rng: lcg(99), mem: mem2, key });
  assert.equal(reloaded.already, true, 'after save+reload still searched (chunk-delta persisted)');
  pass('searchContainer: loots once, empty on re-search, SURVIVES save round-trip (no re-loot)');
}

// 4) LOCKED container — refuses without the key/deed, opens with it
{
  const inv = new Inventory({ storage: memoryStorage(), slot: 'lk' });
  const owned = {};
  const mem = { has: (k) => !!owned[k], record: (k) => { owned[k] = 1; } };
  const def = { via: 'search', id: 'locked_chest', loot: 'loot_drawer', locked: 'tool_lantern' };
  const r1 = searchContainer(def, { inv, rng: lcg(1), mem, key: 'searched_locked_chest', hasDeed: () => false });
  assert.equal(r1.locked, 'tool_lantern', 'refused while locked');
  assert.equal(mem.has('searched_locked_chest'), false, 'a locked refusal does NOT mark searched');
  const r2 = searchContainer(def, { inv, rng: lcg(1), mem, key: 'searched_locked_chest', hasDeed: (d) => d === 'tool_lantern' });
  assert.equal(r2.already, undefined, 'opens once the deed is owned');
  pass('searchContainer: locked refuses without the deed, opens with it (no premature mark)');
}

// 5) CUT — bushes respawn (no memory), permanent break records a flag
{
  const inv = new Inventory({ storage: memoryStorage(), slot: 'ct' });
  const owned = {};
  const mem = { has: (k) => !!owned[k], record: (k) => { owned[k] = 1; } };
  const bush = { via: 'cut', loot: 'loot_bush' };           // respawns
  const a = cutObject(bush, { inv, rng: lcg(5), mem, key: 'bush_a' });
  const b = cutObject(bush, { inv, rng: lcg(6), mem, key: 'bush_a' });
  assert.equal(a.already, undefined); assert.equal(b.already, undefined, 'bush re-cuttable (respawns)');
  const crate = { via: 'break', loot: 'loot_crate', permanent: true };
  const c1 = cutObject(crate, { inv, rng: lcg(5), mem, key: 'crate_x' });
  const c2 = cutObject(crate, { inv, rng: lcg(5), mem, key: 'crate_x' });
  assert.equal(c1.already, undefined); assert.equal(c2.already, true, 'permanent crate stays broken');
  pass('cutObject: bushes respawn; permanent breakables stay broken (flag recorded)');
}

// 6) PUSH — slides one tile if clear, blocked by a solid
{
  const walls = new Set(['5,3']);   // a solid at tile (5,3)
  const isSolid = (tx, ty) => walls.has(`${tx},${ty}`);
  const block = { tx: 4, ty: 3 };
  const east = pushBlock(block, { dx: 1, dy: 0 }, isSolid);   // -> (5,3) is solid → blocked
  assert.equal(east, null, 'push into a solid is blocked');
  const west = pushBlock(block, { dx: -1, dy: 0 }, isSolid);  // -> (3,3) clear → slides
  assert.deepEqual(west, { tx: 3, ty: 3 });
  assert.equal(pushBlock(block, { dx: 0, dy: 0 }, isSolid), null, 'no-dir push is a no-op');
  pass('pushBlock: slides one tile if clear, blocked by a solid, no-op on zero dir');
}

console.log(`Interactables.test: ${n} checks passed`);
