// =============================================================================
// questObjective — PURE resolution for physical, walk-to-and-do quest OBJECTIVES (the engine core for
// SPEC-CHILDHOOD §4). QUEST-AGNOSTIC: a quest STEP may carry
//     objective: { type:'reach'|'interact'|'talk', tx, ty, range?, prop? }
// (tx/ty = ABSOLUTE world tiles, like NpcLife schedules). Given the player's tile (+ an interact pulse), this
// decides whether the current step is satisfied; the SCENE then advance()s the quest and points the objective
// arrow/marker at the LOCATION (not just the giver NPC). This is the reusable mechanism — M2's chore
// conversion + the placed coop/hen prop land with the approved childhood build, which consumes this.
//
// Built quest-agnostic (and left unwired to any live quest) deliberately: the only intended consumer (the
// chicken free-roam) is childhood-coupled and the childhood spec is still PROPOSED. The `advance:`/`complete:`
// dialogue commands (already shipped) + this module are the foundation that build will wire.
// =============================================================================

/** The objective for a quest def's CURRENT step (or null if the step has none). */
export function stepObjective(def, stepIndex) {
  const st = ((def && def.steps) || [])[stepIndex];
  return (st && st.objective) || null;
}

/** Is the player's tile within `radius` (default 1) tiles of the objective tile? */
export function withinObjective(obj, ptx, pty) {
  if (!obj || obj.tx == null) return false;
  const r = obj.range == null ? 1 : obj.range;
  return Math.abs(ptx - obj.tx) <= r && Math.abs(pty - obj.ty) <= r;
}

/**
 * Is the objective satisfied THIS frame?
 *   reach    — standing within range
 *   interact — within range AND the interact pulse fired this frame
 *   talk     — resolved by the dialogue path (always false here)
 */
export function objectiveSatisfied(obj, ptx, pty, didInteract = false) {
  if (!obj) return false;
  if (obj.type === 'reach') return withinObjective(obj, ptx, pty);
  if (obj.type === 'interact') return !!didInteract && withinObjective(obj, ptx, pty);
  return false;   // 'talk' handled by the dialogue/advance path, not by position
}

/**
 * The arrow/marker target for an active quest's current step:
 *   a LOCATION objective if the step has one, else fall back to the giver NPC (today's behaviour).
 *   -> { kind:'loc', tx, ty } | { kind:'npc' } | null
 */
export function objectiveArrowTarget(obj, hasNpc) {
  if (obj && obj.tx != null) return { kind: 'loc', tx: obj.tx, ty: obj.ty };
  if (hasNpc) return { kind: 'npc' };
  return null;
}
