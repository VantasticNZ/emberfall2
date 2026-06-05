// =============================================================================
// SYSTEM: Dialogue  (Bible Part 1 — DIALOGUE; data-driven nodes + choices)
// Minimal plumbing (NOT dialogue content): a node graph the quest data carries.
// A node = { speaker, text, options:[option] }. An option can branch (`to`),
// record a deed, apply a quest choice, set a flag, or end the conversation.
//   option = { label, to, deed, meta, choice:{quest,id}, set, end }
// The runner threads through the SAME Karma + QuestEngine, so dialogue choices
// move karma/deeds + advance quests with no bespoke code.
// =============================================================================

export class Dialogue {
  /**
   * @param {object} graph { start, nodes: { id: {speaker,text,options[]} } }
   * @param {object} [ctx] { karma, engine, onSet }
   */
  constructor(graph, ctx = {}) {
    this.graph = graph;
    this.ctx = ctx;
    this.nodeId = graph.start;
    this.done = false;
  }

  node() { return this.done ? null : this.graph.nodes[this.nodeId]; }
  options() { return this.node()?.options || []; }

  /** Select an option by index; applies its effects + returns the next node (or null at end). */
  select(i) {
    const opt = this.options()[i];
    if (!opt) return this.node();
    if (opt.deed && this.ctx.karma) this.ctx.karma.recordDeed(opt.deed, opt.meta || {});
    if (opt.choice && this.ctx.engine) this.ctx.engine.choose(opt.choice.quest, opt.choice.id);
    if (opt.set && this.ctx.onSet) this.ctx.onSet(opt.set);
    if (opt.end || !opt.to) { this.done = true; this.nodeId = null; return null; }
    this.nodeId = opt.to;
    return this.node();
  }
}
