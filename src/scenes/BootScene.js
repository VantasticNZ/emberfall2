// BootScene — queue real art (if any) then hand off to the world scene.
import Phaser from 'phaser';
import { AssetLoader } from '../art/AssetLoader.js';

// Real LPC monster spritesheets (OpenGameArt, CC-BY-SA/GPL — see ASSET-LEDGER).
// 64px frames except the man-eater (128px). Row 0 is a front-facing cycle.
export const MONSTER_SHEETS = [
  { key: 'snake', fw: 64 }, { key: 'bat', fw: 64 }, { key: 'big_worm', fw: 64 },
  { key: 'eyeball', fw: 64 }, { key: 'ghost', fw: 64 }, { key: 'slime', fw: 64 },
  { key: 'pumpking', fw: 64 }, { key: 'man_eater_flower', fw: 128 },
];

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    // Queue every real asset (LPC layer sheets + Kenney tiles/props) through
    // the single manifest path before the world scene starts.
    AssetLoader.queue(this);
    // Combat SFX (Kenney RPG Audio, CC0 — see docs/ASSET-LEDGER.md).
    this.load.audio('sfx_swing', 'audio/swing.ogg');
    this.load.audio('sfx_hit', 'audio/hit.ogg');
    this.load.audio('sfx_charge_impact', 'audio/charge_impact.ogg');
    for (const m of MONSTER_SHEETS) this.load.spritesheet(`mon_${m.key}`, `art/monsters/${m.key}.png`, { frameWidth: m.fw, frameHeight: m.fw });
  }

  create() {
    // a front-facing idle/move loop per monster (row 0, first 4 frames)
    for (const m of MONSTER_SHEETS) {
      const key = `mon_${m.key}_idle`;
      if (!this.anims.exists(key)) this.anims.create({ key, frames: this.anims.generateFrameNumbers(`mon_${m.key}`, { frames: [0, 1, 2, 3] }), frameRate: 6, repeat: -1 });
    }
    this.scene.start('Greenhollow');
  }
}
