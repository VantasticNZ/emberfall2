// =============================================================================
// GreenhollowScene — builds the proof slice ENTIRELY from data (world.js) using
// the write-once systems (Movement, Collision, DepthSort, Interaction). The
// scene contains no per-actor behaviour: it wires data into systems.
// =============================================================================

import Phaser from 'phaser';
import { WORLD } from '../data/world.js';
import { ASSETS, ART_SOURCE } from '../data/assets.js';
import { AssetLoader } from '../art/AssetLoader.js';
import { Movement } from '../systems/Movement.js';
import { Collision } from '../systems/Collision.js';
import { DepthSort, DEPTH } from '../systems/DepthSort.js';
import { Interaction } from '../systems/Interaction.js';

const T = WORLD.tile;
const tileToPx = (t) => t * T + T / 2; // centre of a tile

export class GreenhollowScene extends Phaser.Scene {
  constructor() { super('Greenhollow'); }

  create() {
    // 0) realise all art (placeholder synth + animation registration)
    AssetLoader.build(this);
    DepthSort.reset();
    Interaction.reset();

    const worldW = WORLD.widthTiles * T;
    const worldH = WORLD.heightTiles * T;
    this.physics.world.setBounds(0, 0, worldW, worldH);

    this._buildGround(worldW, worldH);
    this.solids = this.add.group();
    this.actors = this.add.group();
    this._buildProps();
    this._buildNPCs();
    this._buildPlayer();

    // 1) wire collision relationships once
    Collision.wire(this, this.actors, this.solids);

    // 2) camera follows + clamps to the world (never shows off-map)
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.startFollow(this.player, true, 0.18, 0.18);
    this.cameras.main.setRoundPixels(true);

    this._buildInput();
    this._buildUI();
    this._buildDebug();
  }

  // ---- GROUND ---------------------------------------------------------------
  _buildGround(worldW, worldH) {
    const base = this.add.tileSprite(0, 0, worldW, worldH, WORLD.ground.base).setOrigin(0, 0);
    DepthSort.pinFloor(base);
    for (const [key, tx, ty, w, h] of WORLD.ground.rects) {
      const ts = this.add.tileSprite(tx * T, ty * T, w * T, h * T, key).setOrigin(0, 0);
      DepthSort.pinFloor(ts);
    }
  }

  // ---- PROPS ----------------------------------------------------------------
  _buildProps() {
    for (const p of WORLD.props) {
      const d = ASSETS[p.key];
      const spr = this.physics.add.sprite(tileToPx(p.tx), tileToPx(p.ty), p.key);
      spr.setOrigin(0.5, 0.5);
      if (p.solid) { Collision.makeSolid(spr, d.footprint); this.solids.add(spr); }
      DepthSort.track(spr, d.footprint ? d.footprint.offY : 0);

      if (p.interact) {
        Interaction.register({
          x: spr.x, y: spr.y + (d.footprint ? d.footprint.offY : 0), radius: 30,
          prompt: p.interact.prompt,
          onInteract: () => this._openDialogue(p.interact.name, p.interact.lines),
        });
      }
    }
  }

  // ---- NPCS (actors that are also solid + interactable) ---------------------
  _buildNPCs() {
    for (const n of WORLD.npcs) {
      const d = ASSETS[n.key];
      const spr = this.physics.add.sprite(tileToPx(n.tx), tileToPx(n.ty), n.key);
      spr.assetKey = n.key;
      spr.facing = n.facing || 'down';
      Collision.makeSolid(spr, d.footprint); // NPCs don't walk through / aren't pushed
      this.solids.add(spr);
      DepthSort.track(spr, d.footprint.offY);
      Movement.animate(spr, 'idle');

      Interaction.register({
        x: spr.x, y: spr.y + d.footprint.offY, radius: 34, prompt: 'Talk',
        onInteract: () => { spr.facing = this._faceToward(spr, this.player); Movement.animate(spr, 'idle');
          this._openDialogue(n.name, n.lines); },
      });
    }
  }

  // ---- PLAYER ---------------------------------------------------------------
  _buildPlayer() {
    const pd = WORLD.player;
    const d = ASSETS[pd.key];
    const spr = this.physics.add.sprite(tileToPx(pd.tx), tileToPx(pd.ty), pd.key);
    spr.assetKey = pd.key;
    spr.moveSpeed = pd.speed;
    spr.facing = pd.facing || 'down';
    Collision.makeActorBody(spr, d.footprint);
    this.actors.add(spr);
    DepthSort.track(spr, d.footprint.offY);
    Movement.animate(spr, 'idle');
    this.player = spr;
  }

  // ---- INPUT ----------------------------------------------------------------
  _buildInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      up: 'W', down: 'S', left: 'A', right: 'D',
      interact: 'E', debug: 'B', hud: 'H',
    });
    this.keys.interact.on('down', () => {
      if (this.dialogue.visible) { this._advanceDialogue(); return; }
      if (Interaction.active) Interaction.tryInteract();
    });
    this.keys.debug.on('down', () => this._toggleDebug());
    this.keys.hud.on('down', () => { this.hud.visible = !this.hud.visible; });
  }

  // ---- UI (scroll-fixed overlay) --------------------------------------------
  _buildUI() {
    const W = this.scale.width;
    this.hud = this.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY);
    const title = this.add.text(6, 5, 'EMBERFALL 2 — Greenhollow proof slice',
      { fontFamily: 'monospace', fontSize: '10px', color: '#ffe9c2' }).setScrollFactor(0);
    const help = this.add.text(6, 18, 'Move WASD/Arrows  ·  E interact  ·  B colliders  ·  H hud',
      { fontFamily: 'monospace', fontSize: '8px', color: '#bfb7d0' }).setScrollFactor(0);
    const banner = this.add.text(W - 6, 5,
      ART_SOURCE === 'placeholder' ? 'ART: PLACEHOLDER (license-safe)' : 'ART: real',
      { fontFamily: 'monospace', fontSize: '8px', color: '#ff9d9d' }).setOrigin(1, 0).setScrollFactor(0);
    this.hud.add([title, help, banner]);

    // interaction prompt (appears when an interactable is in reach)
    this.prompt = this.add.text(W / 2, this.scale.height - 70, '', {
      fontFamily: 'monospace', fontSize: '10px', color: '#1c1422',
      backgroundColor: '#ffe9c2', padding: { x: 6, y: 3 },
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(DEPTH.OVERLAY).setVisible(false);

    // dialogue box — sized so wrapped text always fits (Gate A)
    const boxW = 360, boxH = 64, bx = (W - boxW) / 2, by = this.scale.height - boxH - 6;
    this.dialogue = this.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY).setVisible(false);
    const panel = this.add.rectangle(bx, by, boxW, boxH, 0x1c1422, 0.92).setOrigin(0, 0).setStrokeStyle(2, 0xffe9c2);
    this.dlgName = this.add.text(bx + 10, by + 6, '', { fontFamily: 'monospace', fontSize: '10px', color: '#ffe9c2' });
    this.dlgBody = this.add.text(bx + 10, by + 22, '', {
      fontFamily: 'monospace', fontSize: '10px', color: '#f3ecff',
      wordWrap: { width: boxW - 20 }, lineSpacing: 2,
    });
    this.dlgHint = this.add.text(bx + boxW - 10, by + boxH - 6, 'E ▸', { fontFamily: 'monospace', fontSize: '8px', color: '#9b93b0' }).setOrigin(1, 1);
    this.dialogue.add([panel, this.dlgName, this.dlgBody, this.dlgHint]);
  }

  _buildDebug() {
    this.debugOn = false;
    this.physics.world.createDebugGraphic();     // draws collider bodies (Gate B overlay)
    this.physics.world.debugGraphic.setDepth(DEPTH.OVERLAY + 1).setVisible(false);
    this.physics.world.drawDebug = false;
  }

  _toggleDebug() {
    this.debugOn = !this.debugOn;
    this.physics.world.drawDebug = this.debugOn;
    this.physics.world.debugGraphic.setVisible(this.debugOn);
    if (!this.debugOn) this.physics.world.debugGraphic.clear();
  }

  // ---- DIALOGUE -------------------------------------------------------------
  _openDialogue(name, lines) {
    this._dlgLines = lines; this._dlgIndex = 0;
    this.dlgName.setText(name);
    this.dlgBody.setText(lines[0]);
    this.dialogue.setVisible(true);
    this.prompt.setVisible(false);
    Movement.stop(this.player);
  }

  _advanceDialogue() {
    this._dlgIndex++;
    if (this._dlgIndex >= this._dlgLines.length) { this.dialogue.setVisible(false); return; }
    this.dlgBody.setText(this._dlgLines[this._dlgIndex]);
  }

  _faceToward(from, to) {
    const dx = to.x - from.x, dy = to.y - from.y;
    if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? 'left' : 'right';
    return dy < 0 ? 'up' : 'down';
  }

  // ---- LOOP -----------------------------------------------------------------
  update() {
    if (this.dialogue.visible) { Movement.stop(this.player); DepthSort.update(); return; }

    // input vector -> Movement system (same path any actor would use)
    let dx = 0, dy = 0;
    if (this.cursors.left.isDown || this.keys.left.isDown) dx -= 1;
    if (this.cursors.right.isDown || this.keys.right.isDown) dx += 1;
    if (this.cursors.up.isDown || this.keys.up.isDown) dy -= 1;
    if (this.cursors.down.isDown || this.keys.down.isDown) dy += 1;
    Movement.drive(this.player, dx, dy);

    DepthSort.update();

    const active = Interaction.update(this.player);
    if (active) { this.prompt.setText(`${active.prompt}  (E)`).setVisible(true); }
    else this.prompt.setVisible(false);
  }
}
