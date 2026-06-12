// =============================================================================
// repairPacing — the PURE staged state-machine for a forced-door REPAIR.
// Given the moment the door was broken (tBreak), the current time, and the tuning
// floors, decide which STAGE the repair is in:
//
//   wait    — the break has happened but nobody has noticed yet (a beat).
//   travel  — the alarm went up; a joiner is WALKING to the door (visible approach).
//   work    — the joiner is AT the door, hammering through a long, visible job.
//   done     — the door is mended; the broken flag clears.
//
// Extracted from OverworldScene so the PACING is UNIT-TESTABLE. The 2nd-report
// regression was that the staged pacing collapsed (the worker teleported onto the
// door and the 6s day-phase finished it) while the old table still passed — because
// the table only asserted "worker present + hammering + restored", never a discovery
// DELAY, a TRAVEL stage, or a work-duration FLOOR. This function makes each stage a
// named [TUNE] floor whose boundaries the permanent test asserts by timestamp, so a
// future collapse turns the table RED.
//
// Purely TIME-BASED (a function of now - tBreak only) → deterministic and testable;
// the scene drives the worker's visible walk/hammer over the SAME stage boundaries.
//   stageAt(...)  -> 'wait' | 'travel' | 'work' | 'done'
//   stageBounds(...) -> the absolute ms timestamps each stage begins/ends (for tests + asserts)
// =============================================================================

// The ordered stages and the floor that GATES leaving each one (C = the REPAIR consts).
//   wait   lasts DISCOVERY_MS   (nobody notices instantly)
//   travel lasts TRAVEL_MS      (the joiner must actually cross ground to the door)
//   work   lasts WORK_MS        (a long, visible job — never an instant pop)
export function stageBounds(tBreak, C) {
  const tDiscover = tBreak + C.DISCOVERY_MS;     // wait -> travel: the alarm goes up, the joiner sets out
  const tArrive = tDiscover + C.TRAVEL_MS;       // travel -> work: the joiner reaches the door
  const tDone = tArrive + C.WORK_MS;             // work -> done: the door is mended
  return { tBreak, tDiscover, tArrive, tDone };
}

export function stageAt(tBreak, now, C) {
  const b = stageBounds(tBreak, C);
  if (now < b.tDiscover) return 'wait';
  if (now < b.tArrive) return 'travel';
  if (now < b.tDone) return 'work';
  return 'done';
}

// Travel progress 0..1 for interpolating the joiner's walk from START -> door.
// Clamped; 0 before travel begins, 1 once arrived.
export function travelProgress(tBreak, now, C) {
  const b = stageBounds(tBreak, C);
  if (now <= b.tDiscover) return 0;
  if (now >= b.tArrive) return 1;
  return (now - b.tDiscover) / C.TRAVEL_MS;
}
