// Emberfall 2 — entry point. Phaser game config + scene registration.
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { GreenhollowScene } from './scenes/GreenhollowScene.js';
import { MarshScene } from './scenes/MarshScene.js';
import { PeaksScene } from './scenes/PeaksScene.js';
import { OptionsScene } from './scenes/OptionsScene.js';
import { PrototypeScene } from './scenes/PrototypeScene.js';   // ⚠ THROWAWAY world-migration Phase-0 prototype (NOT in the boot flow; start via scene.start('Prototype'))
import { AssetSpikeScene } from './scenes/AssetSpikeScene.js'; // ⚠ THROWAWAY asset-load spike (NOT in the boot flow; start via scene.start('AssetSpike'))
import { OverworldScene } from './scenes/OverworldScene.js';   // world-migration Phase 1 foundation (additive; NOT in boot flow; start via scene.start('Overworld'))
import { TitleScene } from './scenes/TitleScene.js';           // game-start shell: title → char-select → intro → Overworld

// Native render resolution; the canvas is FIT-scaled up to the window with
// crisp pixels. Wide framing (24x13.5 tiles of 32px) so a 64px hero reads as a
// sensible ~15% of screen height — Zelda/Stardew-style — and more world shows.
// World is larger than this viewport so camera-clamp is testable.
export const VIEW = { width: 768, height: 432 };

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: VIEW.width,
  height: VIEW.height,
  backgroundColor: '#1a1726',
  pixelArt: true,
  roundPixels: false,   // smooth camera follow (no pixel-snap judder); see the scene's cover-zoom
  scale: {
    // RESIZE: the canvas matches the window exactly — NO letterbox bars AND no
    // ENVELOP-style cropping of content (which was decapitating edge trees). The
    // scene applies a cover-zoom so the world always fills the view (no black
    // beyond the world bounds) and reflows the camera/UI on resize.
    mode: Phaser.Scale.RESIZE,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },   // top-down: no gravity
      debug: false,              // toggled live with the B key (Gate B overlay)
    },
  },
  input: { gamepad: true },      // Xbox controller (primary device) — see src/constants/controls.js
  scene: [BootScene, TitleScene, GreenhollowScene, MarshScene, PeaksScene, OptionsScene, PrototypeScene, AssetSpikeScene, OverworldScene],
};

const game = new Phaser.Game(config);

// Dev aid: expose the game for live verification / gate testing in the browser.
if (import.meta.env.DEV) window.__EMBER = game;

// STALE-SCENE PREVENTATIVE (dev only) — Phaser scenes do NOT hot-reload; a long-lived tab would keep
// running OLD code while Vite re-injects a fresh build stamp (PROCESS-RETRO: "new stamp, old world").
// Force a FULL page reload on ANY HMR update so the running scene is ALWAYS recreated from the current
// build — you can never silently run a stale scene. (No effect in a production build.)
if (import.meta.hot) {
  import.meta.hot.on('vite:afterUpdate', () => window.location.reload());
  import.meta.hot.accept(() => window.location.reload());
}
