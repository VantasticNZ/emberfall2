// =============================================================================
// SYSTEM: Social  (CHARISMA / TRUST / DECEPTION — written once, layered on top).
// Pure functions over the EXISTING systems (Karma deeds, Inventory CHA/skills) —
// no rewrite of dialogue/economy/karma. See docs/SOCIAL-SYSTEM-DESIGN.md.
//
//   - CHA price multipliers (hooked by Economy).
//   - trust(karma): derived over the deed-memory (NOT a new karma axis).
//   - resolve(check, ctx): a dialogue option's skill check (cha/intimidate/charm/
//     insight/trust) -> pass/fail.
//   - state(opt, ctx): how to render a checked option (shown/pass/locked/hidden).
//   - tag(opt): the Fallout-style bracket label ("[Charisma 7] ", "[Insight] ").
// ctx = { inv, karma } (read live).
// =============================================================================

const BASE_CHA = 5;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Deeds that earn / lose trust (good dealings vs betrayals). Reused from the
// deed-memory; absent deeds simply don't count.
export const POSITIVE_DEEDS = ['coin_returned', 'mercy_shown', 'bogfolk_kind', 'lean_workers', 'first_impression', 'faction_workers', 'faction_peace', 'stranger_rescued', 'hagga_believed'];
export const BETRAYAL_DEEDS = ['chicken_kicked', 'bogfolk_cruel', 'lean_owner', 'faction_owner', 'stranger_used', 'hagga_reported'];

/** Buy-price multiplier (higher CHA = cheaper, clamped ±30%). */
export function chaBuyMult(cha = BASE_CHA) { return clamp(1 - (cha - BASE_CHA) * 0.03, 0.7, 1.3); }
/** Sell-price multiplier (higher CHA = more, clamped ±30%). */
export function chaSellMult(cha = BASE_CHA) { return clamp(1 + (cha - BASE_CHA) * 0.03, 0.7, 1.3); }

/** TRUST derived from karma + the deed-memory (0+). A `check` may add target deeds. */
export function trust(karma, check = {}) {
  if (!karma) return 0;
  let t = Math.floor((karma.get('morality') || 0) / 25);          // -4..+4 from morality
  for (const d of POSITIVE_DEEDS) if (karma.hasDeed(d)) t += 1;
  for (const d of BETRAYAL_DEEDS) if (karma.hasDeed(d)) t -= 2;    // betrayal closes doors
  for (const d of (check.deeds || [])) if (karma.hasDeed(d)) t += 1; // per-target good dealings
  return Math.max(0, t);
}

export function hasInsight(ctx) { return !!(ctx && ctx.inv && ctx.inv.hasSkill('insight')); }
function cha(ctx) { return ctx && ctx.inv ? ctx.inv.attr('cha') : 0; }

/** Resolve a dialogue option's check -> pass/fail. */
export function resolve(check, ctx) {
  if (!check) return true;
  switch (check.type) {
    case 'cha': case 'persuade': case 'charm': return cha(ctx) >= (check.dc || 0);
    case 'intimidate': return cha(ctx) >= (check.dc || 0);                 // (STR may factor later)
    case 'insight': return hasInsight(ctx) || cha(ctx) >= (check.dc ?? 99); // the skill, or a high CHA read
    case 'trust': return trust(ctx.karma, check) >= (check.dc || 1);
    default: return true;
  }
}

/** Render state for an option: 'shown' (no check) | 'pass' | 'locked' | 'hidden'. */
export function state(opt, ctx) {
  const c = opt.check; if (!c) return 'shown';
  if (c.type === 'insight') return hasInsight(ctx) ? 'pass' : 'hidden';   // no skill -> you don't even see the lie-catch
  if (c.type === 'trust') return resolve(c, ctx) ? 'pass' : 'hidden';      // exclusive option appears only when trusted
  return resolve(c, ctx) ? 'pass' : 'locked';                             // cha/etc: shown, but greyed if unmet (Fallout)
}

const LABELS = { cha: 'Charisma', persuade: 'Persuade', charm: 'Charm', intimidate: 'Intimidate', insight: 'Insight', trust: 'Trust' };
/** Fallout-style bracket tag for a checked option, or '' for a plain option. */
export function tag(opt) {
  const c = opt && opt.check; if (!c) return '';
  const name = LABELS[c.type] || c.type;
  return c.dc ? `[${name} ${c.dc}] ` : `[${name}] `;
}

export const Social = { chaBuyMult, chaSellMult, trust, hasInsight, resolve, state, tag, POSITIVE_DEEDS, BETRAYAL_DEEDS };
