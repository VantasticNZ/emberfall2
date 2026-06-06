// =============================================================================
// PeaksScene — SUNDERED PEAKS, a THIN region on the RegionScene base. Supplies
// mountain DATA/theme + combat encounters + the M12 Cinder Keep grapple/boss
// hand-off (mirrors the Marsh's M9 lantern/boss). Wired to M11/M12 + SP1/SP3/SP5.
// =============================================================================

import { RegionScene } from './RegionScene.js';
import { PEAKS } from '../data/peaks.js';
import { SUNDERED_PEAKS, SUNDERED_PEAKS_SIDE } from '../data/quests/index.js';
import { Interaction } from '../systems/Interaction.js';
import { Movement } from '../systems/Movement.js';
import { DepthSort, DEPTH } from '../systems/DepthSort.js';
import { TILE } from '../data/assets.js';

const tileToPx = (t) => t * TILE + TILE / 2;

const STONE_THEME = {
  accent: 0xc8cede,
  hudW: 540, hudH: 84, hudFill: 0x161a24, hudAlpha: 0.86, hudX: 20,
  titleY: 16, titleSize: 19, titleColor: '#dfe4f0',
  helpY: 46, helpSize: 12, muted: '#a8b0c4', questY: 66,
  promptFg: '#161a24', promptBg: '#c8cede',
  dlgFill: 0x161a24, dlgAlpha: 0.95, portraitFill: 0x2a3040,
  nameColor: '#dfe4f0', bodyColor: '#eef1f8', hintColor: '#8a93aa',
  choiceBar: 0xc8cede, choiceSelFg: '#161a24',
  hpY: 100,
};

export class PeaksScene extends RegionScene {
  constructor() { super('Peaks'); }

  regionConfig() {
    return {
      key: 'Peaks',
      title: 'EMBERFALL 2 — Sundered Peaks',
      help: 'WASD move · J attack · Space dodge · C block · E talk · G back',
      quests: [...SUNDERED_PEAKS, ...SUNDERED_PEAKS_SIDE],
      faces: {
        Stonewright: { parts: PEAKS.stonewrightParts, expression: 'neutral' },
        Miner: { parts: PEAKS.minerParts, expression: 'neutral' },
        'Mike Hunt': { parts: PEAKS.huntParts, expression: 'neutral' },
        'Bounty-Master': { parts: PEAKS.bountyParts, expression: 'neutral' },
        'Desperate Stranger': { parts: PEAKS.strangerParts, expression: 'sad' },
      },
      questHud: { show: true, id: 'M11', label: 'The Sundered Peaks' },
      theme: STONE_THEME,
      bg: '#161a24',
      promptYOff: 140,
      devModifiers: false,
      world: {
        widthTiles: PEAKS.widthTiles, heightTiles: PEAKS.heightTiles,
        ground: { base: PEAKS.ground.base, rects: PEAKS.ground.rects, tint: PEAKS.tint.ground },
        decalLayers: [
          { cfg: PEAKS.rubble, originY: 0.5, depth: DEPTH.FLOOR + 1, tint: PEAKS.tint.decal },
          { cfg: PEAKS.decals, originY: 1, depth: DEPTH.FLOOR + 2, tint: PEAKS.tint.decal },
        ],
        props: PEAKS.props, propTreeTint: PEAKS.tint.tree,
        npcs: PEAKS.npcs, player: PEAKS.player,
      },
      // The terraced stone town (the miners' quarter) is a SAFE hub — no aggro there.
      combat: { enabled: true, adult: true, spawn: PEAKS.combatSpawn, enemies: PEAKS.enemies, safe: { tx: 21, ty: 18, r: 7 } },
    };
  }

  // shard counter in the HUD (counts shard_* deeds, 0..5)
  _updateQuestHud() {
    if (!this.cfg.questHud?.show || !this.questHud) return;
    const shards = ['shard_1', 'shard_2', 'shard_3', 'shard_4', 'shard_5'].filter((d) => this.karma.hasDeed(d)).length;
    const st = this.quests.status('M11') || 'available';
    const m = this.karma.get('morality');
    this.questHud.setText(`M11: ${st.toUpperCase()}    Shards: ${shards}/5    Morality: ${m >= 0 ? '+' : ''}${m}`);
  }

  onCreateExtra() {
    // chain state (demo): arriving from the completed marsh, you already hold Shard #1,
    // so claiming Shard #2 here reads 2/5 (the real game carries this in the save).
    this.karma.recordDeed('shard_1');
    this._updateQuestHud();
    this.input.keyboard.addKey('G').on('down', () => { if (!this._dlg) this.scene.start('Greenhollow'); });  // dev nav back
    this._buildKeep();
    this._buildRecords();
  }

  _buildKeep() {
    const k = PEAKS.keep; const x = tileToPx(k.tx), y = tileToPx(k.ty);
    const marker = this.physics.add.sprite(x, y, 'prop_sign').setTint(0x6a7080);  // FLAG: a real keep-gate tile is wanted
    marker.body.enable = false; DepthSort.track(marker, 8);
    Interaction.register({
      x, y: y + 8, prompt: `Enter ${k.name}`, onInteract: () => {
        if (this.quests.status('M12') === 'complete') return this._startGreeting('', ['The Keep is silent now — the Sentinel down, the second shard yours.']);
        if (this.quests.status('M11') !== 'complete') return this._banner('Take a side in the town’s dispute first (talk to the Miner — M11).');
        this._startQuestDialogue('M12');
      },
    });
  }

  _buildRecords() {
    const r = PEAKS.records; const x = tileToPx(r.tx), y = tileToPx(r.ty);
    const marker = this.physics.add.sprite(x, y, 'prop_sign').setTint(0x9a8f6a);
    marker.body.enable = false; DepthSort.track(marker, 8);
    Interaction.register({
      x, y: y + 8, prompt: `Read ${r.name}`, onInteract: () => {
        const st = this.quests.status('SP1');
        if (st === 'complete') return this._startGreeting('', ['The Order’s records, read and damning.']);
        if (st === 'available') return this._startQuestDialogue('SP1');
        return this._banner('The records are sealed until the town trusts you (stand with the miners — M11).');
      },
    });
  }

  // M12: advancing past the boss beat starts the REAL Keep Sentinel fight (grapple trick)
  onDialogueConfirm(wasNode) {
    if (this._activeQuest === 'M12' && wasNode === 'boss') { this._startBossFight(); return true; }
    return false;
  }
  playerAttackTool() { return this._bossActive ? 'tool_grapple' : null; }   // grapple hauls the Sentinel off-balance

  _startBossFight() {
    this.dialogue.setVisible(false); this._optTexts.forEach((t) => t.destroy()); this._optTexts = [];
    Movement.stop(this.player);
    this._bossActive = true;
    const bs = PEAKS.bossSpawn;
    this.boss = this.combat.spawn('keep_sentinel', { boss: true, tx: bs.tx, ty: bs.ty });
    this.player.x = tileToPx(bs.tx); this.player.y = tileToPx(bs.ty + 4); this.player.body.reset(this.player.x, this.player.y);
    this._banner('THE KEEP SENTINEL — grapple it off-balance, then strike. At half armour it rampages.', 4500);
  }
  _onBossDefeated() {
    this._bossActive = false; this.boss = null;
    if (this._dlg) { this.dialogue.setVisible(true); this._renderNode(); }   // back to the records-vault (truth) beat
    this._banner('The Sentinel topples. The records vault lies open.', 3200);
  }
  onPlayerDownExtra() {
    if (this._bossActive && this.boss) { this.boss.alive = false; this.boss.spr.destroy(); this.boss = null; this._bossActive = false; if (this._dlg) this._closeDialogue(); }
  }
}
