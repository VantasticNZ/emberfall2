// Emberfall 2 — entry point. Phaser game config + scene registration.
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { GreenhollowScene } from './scenes/GreenhollowScene.js';

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
  roundPixels: true,
  scale: {
    // ENVELOP fills the whole window (no black letterbox bars) — scales to cover
    // and crops only the overflow; identical to FIT on a 16:9 window.
    mode: Phaser.Scale.ENVELOP,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },   // top-down: no gravity
      debug: false,              // toggled live with the B key (Gate B overlay)
    },
  },
  scene: [BootScene, GreenhollowScene],
};

const game = new Phaser.Game(config);

// Dev aid: expose the game for live verification / gate testing in the browser.
if (import.meta.env.DEV) window.__EMBER = game;
