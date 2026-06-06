// =============================================================================
// GreenhollowScene — the childhood-village slice, now a THIN region on the shared
// RegionScene base. Supplies DATA (world/quests/faces/theme) + the DEV-TEST combat
// arena. Its charger is now an EnemyController encounter (a real LPC monster, same
// as the marsh) — NOT the old bespoke humanoid path. All rendering/dialogue/combat
// is the base's. M1 "A Greenhollow Morning" plays through the shared dialogue.
// =============================================================================

import { RegionScene } from './RegionScene.js';
import { WORLD } from '../data/world.js';
import { GREENHOLLOW_CHILDHOOD } from '../data/quests/index.js';
import { DEPTH } from '../systems/DepthSort.js';

const GREEN_THEME = {
  accent: 0xffe9c2,
  hudW: 558, hudH: 84, hudFill: 0x14121c, hudAlpha: 0.84, hudX: 20,
  titleY: 16, titleSize: 20, titleColor: '#ffe9c2',
  helpY: 46, helpSize: 12, muted: '#cfc6e6', questY: 66,
  promptFg: '#1c1422', promptBg: '#ffe9c2',
  dlgFill: 0x14121c, dlgAlpha: 0.95, portraitFill: 0x2a2440,
  nameColor: '#ffe9c2', bodyColor: '#f3ecff', hintColor: '#9b93b0',
  choiceBar: 0xffe9c2, choiceSelFg: '#1c1422',
  hpY: 100,
};

export class GreenhollowScene extends RegionScene {
  constructor() { super('Greenhollow'); }

  regionConfig() {
    return {
      key: 'Greenhollow',
      title: 'EMBERFALL 2 — Greenhollow',
      help: 'WASD move  Shift run  J attack  Space dodge-roll  C block  E talk  Esc settings',
      quests: GREENHOLLOW_CHILDHOOD,
      faces: { Mara: { parts: WORLD.maraParts, expression: 'happy' }, Bram: { parts: WORLD.bramParts, expression: 'neutral' } },
      questHud: { show: true, id: 'M1', label: 'A Greenhollow Morning' },
      theme: GREEN_THEME,
      promptYOff: 110,
      devModifiers: true,        // dev: big-head etc. ON (toggle in the options menu)
      world: {
        widthTiles: WORLD.widthTiles, heightTiles: WORLD.heightTiles,
        ground: { base: WORLD.ground.base, rects: WORLD.ground.rects },
        water: { pond: WORLD.pond },
        decalLayers: [
          { cfg: WORLD.dirt, originY: 0.5, depth: DEPTH.FLOOR + 1 },
          { cfg: WORLD.decals, originY: 1, depth: DEPTH.FLOOR + 2 },
          { cfg: WORLD.ferns, originY: 1, depth: DEPTH.FLOOR + 2 },
        ],
        props: WORLD.props,
        npcs: WORLD.npcs, player: WORLD.player,
      },
      // SAFE VILLAGE (no monsters in settlements — see QUALITY-BIBLE). The childhood
      // act has no combat anyway; combat begins in the wilds (Marsh/Peaks). A dev can
      // press 0 to spawn a test charger for feel-testing — see onCreateExtra.
      combat: { enabled: true, adult: true, spawn: { tx: 17, ty: 19 }, safeZone: true,
        devNote: '[SAFE VILLAGE] press 0 = spawn a dev-test charger (dev only)' },
    };
  }

  onCreateExtra() {
    // dev navigation + debug overlay + wheel zoom
    this.input.keyboard.addKey('M').on('down', () => { if (!this._dlg) this.scene.start('Marsh'); });   // -> Ashen Marsh (W)
    this.input.keyboard.addKey('N').on('down', () => { if (!this._dlg) this.scene.start('Peaks'); });   // -> Sundered Peaks (N road)
    this.input.keyboard.addKey('B').on('down', () => this._toggleDebug());
    // DEV ONLY: spawn a test charger to feel-test combat in the (otherwise safe) village
    this.input.keyboard.addKey('ZERO').on('down', () => { if (!this._dlg && this.combat.live.length === 0) this.combat.spawn('charger', { tx: 22, ty: 28 }); });
    this.input.on('wheel', (_p, _o, _dx, dy) => this._stepZoom(dy > 0 ? -1 : +1));
    this._buildDebug();
  }

  _buildDebug() {
    this.debugOn = false;
    this.physics.world.createDebugGraphic();
    this.physics.world.debugGraphic.setDepth(DEPTH.OVERLAY + 1).setVisible(false);
    this.physics.world.drawDebug = false;
  }
  _toggleDebug() {
    this.debugOn = !this.debugOn;
    this.physics.world.drawDebug = this.debugOn;
    this.physics.world.debugGraphic.setVisible(this.debugOn);
    if (!this.debugOn) this.physics.world.debugGraphic.clear();
  }
}
