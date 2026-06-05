// BootScene — queue real art (if any) then hand off to the world scene.
import Phaser from 'phaser';
import { AssetLoader } from '../art/AssetLoader.js';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    // Queue every real asset (LPC layer sheets + Kenney tiles/props) through
    // the single manifest path before the world scene starts.
    AssetLoader.queue(this);
  }

  create() {
    this.scene.start('Greenhollow');
  }
}
