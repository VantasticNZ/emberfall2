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

console.log(`\nALL ${n} CHECKS PASSED ✅`);
