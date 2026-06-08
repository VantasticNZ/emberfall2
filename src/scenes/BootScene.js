// BootScene — queue real art (if any) then hand off to the world scene.
import Phaser from 'phaser';
import { AssetLoader } from '../art/AssetLoader.js';

// Real LPC monster spritesheets (OpenGameArt, CC-BY-SA/GPL — see ASSET-LEDGER).
// 64px frames except the man-eater (128px). Each sheet is 4 rows = the 4 LPC
// directions (up/left/down/right, like characters); `cols` = frames per row.
export const MONSTER_SHEETS = [
  { key: 'snake', fw: 64, cols: 7 }, { key: 'bat', fw: 64, cols: 7 }, { key: 'big_worm', fw: 64, cols: 6 },
  { key: 'eyeball', fw: 64, cols: 7 }, { key: 'ghost', fw: 64, cols: 6 }, { key: 'slime', fw: 64, cols: 8 },
  { key: 'pumpking', fw: 64, cols: 6 }, { key: 'man_eater_flower', fw: 128, cols: 6 },
];
// LPC row order (same as the player Character's DIR_ROW): up=0, left=1, down=2, right=3.
const MON_DIR_ROW = { up: 0, left: 1, down: 2, right: 3 };

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
    // UI / feedback SFX (Kenney Interface, CC0) + region AMBIENT beds (OGA CC0) — the slice
    // audio layer ("no action without feedback" + region soundscape). Music beds pending Van.
    this.load.audio('sfx_pickup', 'audio/ui/pickup.wav');
    this.load.audio('sfx_confirm', 'audio/ui/ui_confirm.wav');
    this.load.audio('sfx_select', 'audio/ui/ui_select.wav');
    this.load.audio('sfx_deny', 'audio/ui/ui_deny.wav');
    this.load.audio('amb_birds', 'audio/ambient/birds_ambient.ogg');   // Greenhollow / foothill
    this.load.audio('amb_wind', 'audio/ambient/wind_ambient.ogg');     // Sundered Peaks
    this.load.audio('mus_green', 'audio/music/green.ogg');             // GH/belt music bed — "Peasant Theme" (nihilocrat, CC0)
    this.load.audio('mus_peaks', 'audio/music/peaks.ogg');             // Peaks music bed — "Cave Theme" (Brandon Morris, CC0)
    for (const m of MONSTER_SHEETS) this.load.spritesheet(`mon_${m.key}`, `art/monsters/${m.key}.png`, { frameWidth: m.fw, frameHeight: m.fw });
  }

  create() {
    // 4 DIRECTIONAL anims per monster (one per LPC row) so creatures turn to face
    // their movement/target, like the player. Each = the first 4 frames of its row.
    for (const m of MONSTER_SHEETS) {
      for (const [dir, row] of Object.entries(MON_DIR_ROW)) {
        const key = `mon_${m.key}_${dir}`;
        if (this.anims.exists(key)) continue;
        const frames = [0, 1, 2, 3].map((i) => row * m.cols + i);
        this.anims.create({ key, frames: this.anims.generateFrameNumbers(`mon_${m.key}`, { frames }), frameRate: 6, repeat: -1 });
      }
    }
    // Boot into the SEAMLESS OVERWORLD (world-migration): a fresh, normal session
    // starts IN the one continuous world — you walk out of Greenhollow westward through
    // the green belt into Ashen Marsh with no wall, no console command. The discrete
    // GreenhollowScene/MarshScene/PeaksScene stay registered as a FALLBACK (reachable
    // via scene.start in dev); HUD/dialogue polish on the overworld is the next pass.
    this.scene.start('Overworld');
  }
}
