// =============================================================================
// Self-test for PlayerCombat — the defensive abilities LOGIC (dodge i-frames,
// block reduction, parry window). Pure, clock-injected, so windows are exact.
// FEEL is Van's to judge in-game; THIS proves the rules. Plain Node + assert.
// =============================================================================

import assert from 'node:assert/strict';
import { PlayerCombat } from './Combat.js';

// deterministic tuning for exact-window tests
const CFG = {
  DODGE_DISTANCE: 100, DODGE_DURATION_MS: 200, DODGE_IFRAME_MS: 250, DODGE_COOLDOWN_MS: 600,
  DASH_DISTANCE: 240, DASH_DURATION_MS: 260, DASH_COOLDOWN_MS: 1400,
  NO_SHIELD_BLOCK: 0.75, PARRY_WINDOW_MS: 150, PARRY_STUN_MS: 800,   // bare-hand negates 75% here (test value)
};
let n = 0;
const pass = (m) => { n++; console.log('  ✓ ' + m); };
console.log('PlayerCombat (abilities) — self test\n');

// 1) DODGE i-frames: no damage DURING i-frames, full damage AFTER ------------
{
  const pc = new PlayerCombat(CFG);
  assert.equal(pc.dodge(0, 1, 0), true);                 // dash right
  assert.equal(pc.isInvulnerable(0), true);
  assert.equal(pc.isInvulnerable(240), true);            // still inside 250ms window
  assert.equal(pc.takeDamage(120, 14).taken, 0);         // a charge hit landing mid-dodge -> negated
  assert.equal(pc.takeDamage(120, 14).outcome, 'dodged');
  assert.equal(pc.isInvulnerable(260), false);           // window over
  assert.equal(pc.takeDamage(260, 14).taken, 14);        // now it lands in full
  assert.equal(pc.takeDamage(260, 14).outcome, 'hit');
  pass('DODGE i-frames negate damage during the window; full damage once it ends (beats the CHARGER)');
}

// 2) DODGE cooldown ----------------------------------------------------------
{
  const pc = new PlayerCombat(CFG);
  assert.equal(pc.dodge(0, 0, 1), true);
  assert.equal(pc.dodge(200, 0, 1), false);              // still on cooldown (<600)
  assert.equal(pc.dodgeReady(200), false);
  assert.equal(pc.dodge(600, 0, 1), true);               // ready again (dash DOWN)
  // burst velocity points in the dash direction (here: +y, x≈0)
  assert.ok(pc.dodgeVelocity().y > 0 && Math.abs(pc.dodgeVelocity().x) < 1e-6);
  pass('DODGE respects its cooldown; burst velocity points in the dash direction');
}

// 3) BLOCK (shield-scaled) reduces FRONTAL damage; back/flank hits are NOT blocked
{
  const pc = new PlayerCombat(CFG);                       // bare-hand negate = 0.75
  pc.setBlocking(0, true);
  const front = pc.takeDamage(300, 20, { fromFront: true });   // past the parry window
  assert.equal(front.outcome, 'blocked');
  assert.equal(front.taken, 5);                          // 20 * (1 - 0.75)
  const back = pc.takeDamage(300, 20, { fromFront: false });   // hit from behind/flank
  assert.equal(back.outcome, 'hit');
  assert.equal(back.taken, 20);                          // block doesn't cover the flank
  pc.setBlocking(400, false);
  assert.equal(pc.takeDamage(450, 20).taken, 20);        // not blocking -> full
  pass('BLOCK cuts frontal damage (shield-scaled); flank/back ignore the block; release -> full');
}

// 3b) SHIELD-SCALED block: better shield = less damage; best = full block ----
{
  const pc = new PlayerCombat(CFG); pc.setBlocking(0, true);
  pc.setShieldBlock(0.5);  assert.equal(pc.takeDamage(300, 20, { fromFront: true }).taken, 10); // a weak shield
  pc.setShieldBlock(0.9);  assert.equal(pc.takeDamage(300, 20, { fromFront: true }).taken, 2);  // a good shield
  pc.setShieldBlock(1.0);  assert.equal(pc.takeDamage(300, 20, { fromFront: true }).taken, 0);  // best shield = full block
  pass('SHIELD-SCALED: a better equipped shield blocks more (0.5->half, 1.0->full)');
}

// 3c) DASH is a SEPARATE traversal ability (its own cooldown; no i-frames) ----
{
  const pc = new PlayerCombat(CFG);
  assert.equal(typeof pc.dash, 'function');
  assert.equal(pc.dash(0, 1, 0), true);
  assert.equal(pc.isDashing(100), true);
  assert.equal(pc.isInvulnerable(100), false);           // dash gives NO i-frames (unlike the roll)
  assert.equal(pc.dash(500, 1, 0), false);               // longer cooldown than the roll
  assert.equal(typeof pc.dodgeRoll, 'function');         // the dodge-roll alias exists
  pass('DASH is a separate traversal ability (own cooldown, no i-frames); dodgeRoll alias present');
}

// 4) PARRY: a hit in the START window negates + flags a punish ---------------
{
  const pc = new PlayerCombat(CFG);
  pc.setBlocking(1000, true);                            // block begins -> parry window opens
  assert.equal(pc.inParryWindow(1100), true);            // within 150ms
  const r = pc.takeDamage(1100, 30, { fromFront: true });
  assert.equal(r.outcome, 'parried');
  assert.equal(r.taken, 0);                              // fully negated
  assert.equal(pc.consumeParry(), true);                 // the scene staggers the attacker...
  assert.equal(pc.consumeParry(), false);                // ...exactly once
  // a hit AFTER the parry window (still holding block) is a normal block
  assert.equal(pc.inParryWindow(1200), false);
  assert.equal(pc.takeDamage(1200, 30, { fromFront: true }).outcome, 'blocked');
  pass('PARRY: a frontal hit in the opening window is negated + flags a one-shot punish; later hits just block');
}

// 5) i-frames take precedence over block ------------------------------------
{
  const pc = new PlayerCombat(CFG);
  pc.dodge(0, 1, 0); pc.setBlocking(0, true);
  assert.equal(pc.takeDamage(100, 50).outcome, 'dodged');  // invuln wins over block
  pass('i-frames take precedence: a dodge negates even while also blocking');
}

console.log(`\nALL ${n} CHECKS PASSED ✅`);
