// repairPacing — locks the STAGED forced-door repair pacing (2nd-report regression: the staged pacing
// collapsed — worker teleported onto the door, the 6s frozen day-phase finished it — while the OLD table
// still passed because it only checked "worker present + hammering + restored", never a discovery DELAY,
// a TRAVEL stage, or a work-duration FLOOR). This is the PERMANENT case: every stage boundary asserted by
// timestamp, so a future collapse (instant grumble / no travel / instant finish) turns this RED.

import assert from 'node:assert';
import { stageAt, stageBounds, travelProgress } from './repairPacing.js';
import { REPAIR } from '../constants/standards.js';

// A synthetic tuning so the timeline math is independent of the live [TUNE] values.
const C = { DISCOVERY_MS: 2000, TRAVEL_MS: 2500, WORK_MS: 12000 };
const t0 = 100000; // an arbitrary break moment

// 1) THE FULL STAGED SEQUENCE — each stage holds for its whole window, in order ----------------
assert.equal(stageAt(t0, t0, C), 'wait', 'the instant the door breaks → wait (nobody has noticed yet)');
assert.equal(stageAt(t0, t0 + 1, C), 'wait', 'a beat after the break → still wait (NO instant grumble)');
assert.equal(stageAt(t0, t0 + C.DISCOVERY_MS - 1, C), 'wait', 'just before discovery → still wait');
assert.equal(stageAt(t0, t0 + C.DISCOVERY_MS, C), 'travel', 'at the discovery floor → travel (alarm up, joiner sets out)');
assert.equal(stageAt(t0, t0 + C.DISCOVERY_MS + 1, C), 'travel', 'the joiner is crossing ground → travel');
const tArrive = t0 + C.DISCOVERY_MS + C.TRAVEL_MS;
assert.equal(stageAt(t0, tArrive - 1, C), 'travel', 'just before arrival → still travel (NO teleport onto the door)');
assert.equal(stageAt(t0, tArrive, C), 'work', 'at the travel floor → work (the joiner is AT the door)');
assert.equal(stageAt(t0, tArrive + 1, C), 'work', 'hammering → work');
const tDone = tArrive + C.WORK_MS;
assert.equal(stageAt(t0, tDone - 1, C), 'work', 'just before the work floor → still work (NO instant finish)');
assert.equal(stageAt(t0, tDone, C), 'done', 'at the work floor → done (mended)');
assert.equal(stageAt(t0, tDone + 999999, C), 'done', 'long after → stays done');

// 2) STAGE BOUNDS are the cumulative floors, in strictly increasing order -----------------------
const b = stageBounds(t0, C);
assert.equal(b.tBreak, t0);
assert.equal(b.tDiscover, t0 + C.DISCOVERY_MS);
assert.equal(b.tArrive, t0 + C.DISCOVERY_MS + C.TRAVEL_MS);
assert.equal(b.tDone, t0 + C.DISCOVERY_MS + C.TRAVEL_MS + C.WORK_MS);
assert.ok(b.tBreak < b.tDiscover && b.tDiscover < b.tArrive && b.tArrive < b.tDone, 'stages are strictly ordered');

// 3) TRAVEL is a VISIBLE crossing — progresses 0→1 across the travel window (not a jump) --------
assert.equal(travelProgress(t0, t0 + C.DISCOVERY_MS, C), 0, 'travel starts at the door-START (progress 0)');
assert.equal(travelProgress(t0, t0 + C.DISCOVERY_MS + C.TRAVEL_MS / 2, C), 0.5, 'halfway through travel → halfway to the door');
assert.equal(travelProgress(t0, tArrive, C), 1, 'arrival → progress 1 (at the door)');
assert.equal(travelProgress(t0, t0, C), 0, 'before discovery → 0');
assert.equal(travelProgress(t0, tDone, C), 1, 'after arrival → clamped 1');

// 4) THE LIVE [TUNE] FLOORS EXIST and read as a real, paced job (the regression guard) ----------
assert.ok(REPAIR.DISCOVERY_MS >= 1000, 'a discovery beat exists (>=1s) — the break is NOT noticed instantly');
assert.ok(REPAIR.TRAVEL_MS >= 1000, 'a travel stage exists (>=1s) — the joiner WALKS, never teleports');
assert.ok(REPAIR.WORK_MS >= 8000, 'the work is a LONG visible job (>=8s) — never the old instant 6s pop');
assert.equal(stageAt(t0, t0 + REPAIR.DISCOVERY_MS - 1, REPAIR), 'wait', 'live floors: still wait just before discovery');
assert.equal(stageAt(t0, t0 + REPAIR.DISCOVERY_MS + REPAIR.TRAVEL_MS + REPAIR.WORK_MS, REPAIR), 'done', 'live floors: done only after every floor is paid');

console.log('repairPacing — ALL CHECKS PASSED ✅');
