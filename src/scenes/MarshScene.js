// =============================================================================
// MarshScene — ASHEN MARSH, now a THIN region on the shared RegionScene base.
// Supplies DATA (world/quests/faces/theme) + combat encounters + the M9 shrine
// boss hand-off. All rendering/dialogue/interaction/combat is the base's.
// =============================================================================

import { RegionScene } from './RegionScene.js';
import { MARSH } from '../data/marsh.js';
import { ASHEN_MARSH } from '../data/quests/index.js';
import { Interaction } from '../systems/Interaction.js';
import { Movement } from '../systems/Movement.js';
import { DepthSort, DEPTH } from '../systems/DepthSort.js';
import { TILE } from '../data/assets.js';

const tileToPx = (t) => t * TILE + TILE / 2;

const MARSH_THEME = {
  accent: 0x9fd0c2,
  hudW: 470, hudH: 62, hudFill: 0x10171a, hudAlpha: 0.86, hudX: 18,
  titleY: 14, titleSize: 18, titleColor: '#cfeee2',
  helpY: 42, helpSize: 11, muted: '#9fc0b6', questY: 0,
  promptFg: '#102018', promptBg: '#bfe6c2',
  dlgFill: 0x10171a, dlgAlpha: 0.96, portraitFill: 0x223028,
  nameColor: '#cfeee2', bodyColor: '#eaf6ef', hintColor: '#7fae9f',
  choiceBar: 0xbfe6c2, choiceSelFg: '#102018',
  hpY: 78,
};

export class MarshScene extends RegionScene {
  constructor() { super('Marsh'); }

  regionConfig() {
    return {
      key: 'Marsh',
      title: 'EMBERFALL 2 — Ashen Marsh',
      help: 'WASD move · J attack · Space dodge · C block · E talk · G back',
      quests: ASHEN_MARSH,
      faces: { 'Elder Yssa': { parts: MARSH.yssaParts, expression: 'sad' }, Hagga: { parts: MARSH.haggaParts, expression: 'neutral' } },
      questHud: { show: false },
      theme: MARSH_THEME,
      bg: '#14201c',
      promptYOff: 140,
      devModifiers: false,
      world: {
        widthTiles: MARSH.widthTiles, heightTiles: MARSH.heightTiles,
        ground: { base: MARSH.ground.base, tint: MARSH.tint.ground },
        water: { pools: MARSH.pools, tint: MARSH.tint.water },
        decalLayers: [
          { cfg: MARSH.mud, originY: 0.5, depth: DEPTH.FLOOR + 1, tint: MARSH.tint.decal },
          { cfg: MARSH.decals, originY: 1, depth: DEPTH.FLOOR + 2, tint: MARSH.tint.decal },
        ],
        props: MARSH.props, propTreeTint: MARSH.tint.tree,
        npcs: MARSH.npcs, player: MARSH.player,
      },
      // Mirefen (the bog-folk town around Elder Yssa) is a SAFE hub — no aggro there.
      combat: { enabled: true, adult: true, spawn: MARSH.combatSpawn, enemies: MARSH.enemies, safe: { tx: 20, ty: 17, r: 6 } },
    };
  }

  onCreateExtra() {
    this.input.keyboard.addKey('G').on('down', () => { if (!this._dlg) this.scene.start('Greenhollow'); });  // dev nav back
    this._buildShrine();
  }

  _buildShrine() {
    const sh = MARSH.shrine; if (!sh) return;
    const x = tileToPx(sh.tx), y = tileToPx(sh.ty);
    const marker = this.physics.add.sprite(x, y, 'prop_sign').setTint(0x6a8a9a);  // FLAG: a real shrine-arch tile is wanted
    marker.body.enable = false; DepthSort.track(marker, 8);
    Interaction.register({
      x, y: y + 8, prompt: `Enter ${sh.name}`, onInteract: () => {
        if (this.quests.status('M9') === 'complete') return this._startGreeting('', ['The shrine is silent now — the Guardian gone, the shard claimed.']);
        if (this.quests.status('M8') !== 'complete') return this._banner('Speak with Elder Yssa, then cross to Hagga (M8) first.');
        this._startQuestDialogue('M9');
      },
    });
  }

  // M9: choosing "Raise the Lantern" at the guardian beat starts the REAL boss fight
  onDialogueConfirm(wasNode) {
    if (this._activeQuest === 'M9' && wasNode === 'guardian') { this._startBossFight(); return true; }
    return false;
  }
  playerAttackTool() { return this._bossActive ? 'tool_lantern' : null; }   // lantern strips the Guardian's shroud

  _startBossFight() {
    this.dialogue.setVisible(false); this._optTexts.forEach((t) => t.destroy()); this._optTexts = [];
    Movement.stop(this.player);
    this._bossActive = true;
    const bs = MARSH.bossSpawn;
    this.boss = this.combat.spawn('drowned_guardian', { boss: true, tx: bs.tx, ty: bs.ty });
    this.player.x = tileToPx(bs.tx); this.player.y = tileToPx(bs.ty + 4); this.player.body.reset(this.player.x, this.player.y);
    this._banner('THE DROWNED GUARDIAN — your lantern strips its shroud, then strike. At half HP it rampages.', 4500);
  }
  _onBossDefeated() {
    this._bossActive = false; this.boss = null;
    if (this._dlg) { this._dlg.nodeId = 'claim'; this._dlg.done = false; this.dialogue.setVisible(true); this._renderNode(); }
    this._banner('The Guardian sinks. Something warm waits in the still water…', 3200);
  }
  onPlayerDownExtra() {
    if (this._bossActive && this.boss) { this.boss.alive = false; this.boss.spr.destroy(); this.boss = null; this._bossActive = false; if (this._dlg) this._closeDialogue(); }
  }
}
