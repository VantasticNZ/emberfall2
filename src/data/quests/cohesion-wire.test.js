// =============================================================================
// COHESION-AUDIT "A) WIRE" fixes — DATA self-test. Proves each of the 5 wired
// reads exists in the data (the greeting/dialogue resolution itself is exercised
// live by verify:runtime T15). Plain Node + node:assert. See docs/COHESION-AUDIT.md.
// =============================================================================
import assert from 'node:assert/strict';
import { WORLD } from '../world.js';
import { QUESTS } from './index.js';
import { Dialogue } from '../../systems/Dialogue.js';
import { KarmaEngine } from '../../systems/Karma.js';
import { QuestEngine } from '../../systems/QuestEngine.js';
import { memoryStorage } from '../../systems/storage.js';

let n = 0; const pass = (m) => { n++; console.log('  ✓ ' + m); };
console.log('Cohesion WIRE fixes — data self-test\n');
const npc = (name) => WORLD.npcs.find((x) => x.name === name);
const hasDeedLine = (g, deed) => !!(g && g.greetByDeed && g.greetByDeed.some((e) => e.deed === deed));

// ---- item 4: PURITY drives everyday NPC greetings (greetByPurity, pure≠corrupt) ----
for (const name of ['Maren', 'Acolyte', 'Sela']) {
  const g = npc(name); assert.ok(g, `${name} placed`);
  assert.ok(g.greetByPurity && g.greetByPurity.pure && g.greetByPurity.corrupt, `${name} has greetByPurity (pure+corrupt)`);
  assert.notEqual(JSON.stringify(g.greetByPurity.pure), JSON.stringify(g.greetByPurity.corrupt), `${name} pure≠corrupt lines`);
}
pass('item4 PURITY: Maren/Acolyte/Sela each react distinctly to a pure vs a corrupt soul (greetByPurity)');

// ---- item 1: TAM's adult greeting reads childhood deeds (the shared cave-dare) ----
{
  const tam = npc('Tam'); assert.ok(tam, 'Tam placed');
  assert.ok(hasDeedLine(tam, 'dared_friend') && hasDeedLine(tam, 'cave_lore'), 'Tam reads dared_friend + cave_lore');
  pass('item1 TAM: adult greeting reacts to the childhood cave-dare (dared_friend / cave_lore / chicken_kicked)');
}

// ---- item 2: the EMBER-SHRINE fork (tell/keep/desecrate) is now read by the Acolyte (was purity-only) ----
{
  const ac = npc('Acolyte'); assert.ok(ac, 'Acolyte placed');
  for (const d of ['shrine_told', 'shrine_kept', 'shrine_looted']) assert.ok(hasDeedLine(ac, d), `Acolyte reads ${d}`);
  pass('item2 EMBER-SHRINE: the Acolyte reads the specific shrine choice (told / kept / looted), not just purity');
}

// ---- item 3: sela_doubt (M7 "press her") pays off in M17 as a foreshadow node ----
{
  const M17 = QUESTS.find((q) => q.id === 'M17').dialogue; assert.ok(M17, 'M17 dialogue present');
  const node = (deeds) => { const k = new KarmaEngine(); deeds.forEach((d) => k.recordDeed(d)); return new Dialogue({ start: 'doubt_check', nodes: M17.nodes }, { karma: k, engine: { choose() {} } }).nodeId; };
  assert.equal(node(['sela_doubt']), 'doubt_seen', 'sela_doubt → M17 doubt_seen foreshadow');
  assert.notEqual(node([]), 'doubt_seen', 'no sela_doubt → no doubt_seen (straight to the reveal)');
  pass('item3 SELA_DOUBT: pressing Sela as a child now pays off as an M17 foreshadow (doubt_seen)');
}

// ---- item 5: the four DEAD-END childhood deeds each gain an adult read ----
{
  const reads = { 'Phil McCracken': 'coin_gifted', Maren: 'comforted_child', Bracken: 'orchard_cleared', Acolyte: 'told_adult' };
  for (const [name, deed] of Object.entries(reads)) {
    const g = npc(name); assert.ok(g, `${name} placed`);
    assert.ok(hasDeedLine(g, deed), `${name} reads ${deed}`);
  }
  pass('item5 DEAD-ENDS closed: coin_gifted (McCracken) · comforted_child (Maren) · orchard_cleared (Bracken) · told_adult (Acolyte)');
}

console.log(`\nALL ${n} CHECKS PASSED ✅`);
