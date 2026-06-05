// BootScene — queue real art (if any) then hand off to the world scene.
import Phaser from 'phaser';
import { AssetLoader } from '../art/AssetLoader.js';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    // Queues real files in ART_SOURCE==='real'; no-op in placeholder mode.
    AssetLoader.queue(this);
  }

  create() {
    this.scene.start('Greenhollow');
  }
}
