// =============================================================================
// SYSTEM: Dialogue  (Bible Part 1 — DIALOGUE; data-driven nodes + choices)
// Minimal plumbing (NOT dialogue content): a node graph the quest data carries.
// A node = { speaker, text, options:[option] }. An option can branch (`to`),
// record a deed, apply a quest choice, set a flag, or end the conversation.
//   option = { label, to, deed, meta, choice:{quest,id}, set, end }
// The runner threads through the SAME Karma + QuestEngine, so dialogue choices
// move karma/deeds + advance quests with no bespoke code.
//
// REACTIVE ROUTER NODES (the world remembers): a node may instead carry
//   { route: [ { when:(ctx)=>bool, to }, ... ] }
// On entry the runner auto-jumps (no player input) to the first branch whose
// when(ctx) is true (or a default branch with no `when`) — so dialogue can
// branch on karma/deeds, e.g. a karma-reactive village welcome. `when` reads
// ctx (which carries the live Karma engine). Added for M7's reactive return.
// =============================================================================

export class Dialogue {
  /**
   * @param {object} graph { start, nodes: { id: {speaker,text,options[]} | {route[]} } }
   * @param {object} [ctx] { karma, engine, onSet }
   */
  constructor(graph, ctx = {}) {
    this.graph = graph;
    this.ctx = ctx;
    this.nodeId = graph.start;
    this.done = false;
    this._route(); // the entry node may itself be a reactive router
  }

  node() { return this.done ? null : this.graph.nodes[this.nodeId]; }
  options() { return this.node()?.options || []; }

  // Auto-advance through reactive `route` nodes until a normal (player) node.
  _route() {
    let guard = 0;
    while (!this.done && guard++ < 64) {
      const node = this.graph.nodes[this.nodeId];
      if (!node || !node.route) break;
      const branch = node.route.find((b) => !b.when || b.when(this.ctx));
      if (!branch || !branch.to) { this.done = true; this.nodeId = null; break; }
      this.nodeId = branch.to;
    }
  }

  /** Select an option by index; applies its effects + returns the next node (or null at end). */
  select(i) {
    const opt = this.options()[i];
    if (!opt) return this.node();
    // L6 ACTION-BASED KARMA: a `defer:true` option ANNOUNCES intent — its choice/deed must fire when the action
    // actually happens in the world, not on this line. In the SCENE (ctx.onPledge present) the option is handed
    // to the pledge handler, which sets an objective + fires the choice later from the action handler. In a
    // unit-test ctx (no onPledge) it falls through to the normal immediate path, so the engine tests are
    // unaffected. Non-deferred options keep firing on the line (action-at-site + speech-acts).
    if (opt.defer && this.ctx.onPledge) { this.ctx.onPledge(opt); if (opt.end || !opt.to) { this.done = true; this.nodeId = null; return null; } this.nodeId = opt.to; this._route(); return this.node(); }
    if (opt.deed && this.ctx.karma) this.ctx.karma.recordDeed(opt.deed, opt.meta || {});
    if (opt.choice && this.ctx.engine) this.ctx.engine.choose(opt.choice.quest, opt.choice.id);
    if (opt.set && this.ctx.onSet) this.ctx.onSet(opt.set);
    // SOCIAL CHECK (attempt): a CHA/persuade/etc option with onPass/onFail routes by
    // the resolved result + records the outcome deed. (Gated insight/trust options are
    // only ever shown when they pass, so they take the normal `to`.) See Social.js.
    if (opt.check && (opt.check.onPass || opt.check.onFail) && this.ctx.social) {
      const pass = this.ctx.social.resolve(opt.check, this.ctx);
      const od = pass ? opt.check.onPassDeed : opt.check.onFailDeed;
      if (od && this.ctx.karma) this.ctx.karma.recordDeed(od);
      const target = pass ? (opt.check.onPass || opt.to) : (opt.check.onFail || opt.to);
      if (opt.end || !target) { this.done = true; this.nodeId = null; return null; }
      this.nodeId = target; this._route(); return this.node();
    }
    if (opt.end || !opt.to) { this.done = true; this.nodeId = null; return null; }
    this.nodeId = opt.to;
    this._route(); // the target may be a reactive router
    return this.node();
  }
}
