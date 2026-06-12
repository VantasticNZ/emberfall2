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
    // Ambient INTERACTION SFX (Kenney RPG Audio, CC0) — doors / coin / chop / knock / footstep (WS3 audio coverage).
    this.load.audio('sfx_door_open', 'audio/sfx/door_open.ogg');
    this.load.audio('sfx_door_close', 'audio/sfx/door_close.ogg');
    this.load.audio('sfx_coin', 'audio/sfx/coin.ogg');
    this.load.audio('sfx_chop', 'audio/sfx/chop.ogg');
    this.load.audio('sfx_knock', 'audio/sfx/knock.ogg');
    this.load.audio('sfx_footstep', 'audio/sfx/footstep.ogg');
    this.load.audio('amb_birds', 'audio/ambient/birds_ambient.ogg');   // Greenhollow / foothill
    this.load.audio('amb_wind', 'audio/ambient/wind_ambient.ogg');     // Sundered Peaks
    this.load.audio('mus_green', 'audio/music/green.ogg');             // GH/belt music bed — "Peasant Theme" (nihilocrat, CC0)
    this.load.audio('mus_peaks', 'audio/music/peaks.ogg');             // Peaks music bed — "Cave Theme" (Brandon Morris, CC0)
    this.load.audio('mus_marsh', 'audio/music/marsh.mp3');             // Ashen Marsh dread bed — "Spirits Forest" (HydroGene, royalty-free)
    // ⚑ LICENCE-UNVERIFIED beds (Van's Downloads — local/friends scope; debt tracked, resolved before any
    // wider release by the no-unverified-assets-at-ship gate). Mood-matched from the music audit.
    this.load.audio('mus_cemetery', 'audio/music/mus_cemetery.ogg');   // cemetery-eerie — "Old Cemitery"
    this.load.audio('mus_dungeon',  'audio/music/mus_dungeon.ogg');    // dungeon-tension — "Mysterious cavern"
    this.load.audio('mus_sacral',   'audio/music/mus_sacral.ogg');     // spire-sacral / chapel — "The Sage Den"
    this.load.audio('mus_ember',    'audio/music/mus_ember.ogg');      // ember-tension — "Old Ruins"
    this.load.audio('mus_coast',    'audio/music/mus_coast.ogg');      // coast-storm — "Submerged Ruins"
    this.load.audio('mus_town',     'audio/music/mus_town.ogg');       // settlement — "Plains (contrasting)"
    this.load.audio('mus_home',     'audio/music/mus_home.ogg');       // shared indoor-home bed — "Forest - Under The Great Tree"
    this.load.audio('mus_tavern',   'audio/music/mus_tavern.mp3');     // tavern — "Tea Time For Cats"
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
