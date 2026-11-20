const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');

const mainPath = join(__dirname, '../public/void-lancer/js/main.js');
const manifestPath = join(__dirname, '../public/void-lancer/assets/data/runtime_asset_manifest.json');
const mainSource = readFileSync(mainPath, 'utf8');
const runtimeManifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

// boss_siege_carrier_base_1.webp is 1536x1024; the stub mirrors Phaser, where
// display size is scale multiplied by the native texture size.
const BOSS_TEXTURE = { width: 1536, height: 1024 };
const CARRIER_SIZE = [216, 144];

function assertClose(actual, expected, label) {
  assert.ok(Math.abs(actual - expected) < 1e-9, `${label}: expected ${expected}, got ${actual}`);
}

function makeScene(assetManifest) {
  let Scene;
  runInNewContext(mainSource, {
    window: {},
    document: { getElementById: () => ({ addEventListener() {} }), addEventListener() {} },
    Phaser: {
      Scene: class {},
      Game: class { constructor(config) { [Scene] = config.scene; } },
      Scale: {},
      Math: { Between: () => 0, Clamp: (x, min, max) => Math.max(min, Math.min(max, x)) },
    },
  }, { filename: mainPath });

  const sprite = () => ({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    get displayWidth() { return this.scaleX * BOSS_TEXTURE.width; },
    get displayHeight() { return this.scaleY * BOSS_TEXTURE.height; },
    setDisplaySize(width, height) {
      this.scaleX = width / BOSS_TEXTURE.width;
      this.scaleY = height / BOSS_TEXTURE.height;
      return this;
    },
    setScale(scaleX, scaleY = scaleX) {
      this.scaleX = scaleX;
      this.scaleY = scaleY;
      return this;
    },
    setDepth() { return this; },
    setTint() { return this; },
    clearTint() { return this; },
  });

  const scene = new Scene();
  scene.assetManifest = assetManifest || null;
  scene.add = { image: () => sprite() };
  scene.state = {
    time: 0,
    announcements: [],
    bullets: [],
    enemies: [],
    powerUps: [],
    player: { x: 80, y: 120, weaponLevel: 1, invuln: 0, bank: 0, fireKick: 0 },
  };
  scene.playerSprite = {
    setPosition() {}, setTexture() {}, setAlpha() {}, setRotation() {}, setX() {}, setY() {},
  };
  scene.bossBarFill = { width: 0, x: 0 };
  scene.bossBarGlow = { alpha: 0 };
  scene.showBossBar = scene.updateAnnouncementDisplay = scene.playSound = () => {};
  return scene;
}

function spawnCarrier(assetManifest) {
  const scene = makeScene(assetManifest);
  return { scene, boss: scene.spawnBoss() };
}

test('both manifests size the carrier at 216x144 and keep collision radius 58', () => {
  const fromRuntime = spawnCarrier(runtimeManifest);
  const fromDefault = spawnCarrier(null);

  for (const { boss } of [fromRuntime, fromDefault]) {
    assert.equal(boss.radius, 58);
    assertClose(boss.sprite.displayWidth, CARRIER_SIZE[0], 'display width');
    assertClose(boss.sprite.displayHeight, CARRIER_SIZE[1], 'display height');
  }

  assert.deepEqual(runtimeManifest.boss, { displaySize: CARRIER_SIZE, collisionRadius: 58 });
  assert.deepEqual(
    [fromRuntime.boss.sprite.displayWidth, fromRuntime.boss.sprite.displayHeight],
    [fromDefault.boss.sprite.displayWidth, fromDefault.boss.sprite.displayHeight]
  );
});

test('renderState holds the carrier at its configured size between hits', () => {
  const { scene, boss } = spawnCarrier(runtimeManifest);
  boss.corePulse = 0;

  scene.renderState();

  assertClose(boss.sprite.displayWidth, CARRIER_SIZE[0], 'idle display width');
  assertClose(boss.sprite.displayHeight, CARRIER_SIZE[1], 'idle display height');
  assert.equal(boss.radius, 58);
});

test('the hit pulse multiplies the configured carrier size instead of replacing it', () => {
  const { scene, boss } = spawnCarrier(runtimeManifest);
  boss.corePulse = 1;

  scene.renderState();

  assertClose(boss.sprite.displayWidth, CARRIER_SIZE[0] * 1.02, 'pulsed display width');
  assertClose(boss.sprite.displayHeight, CARRIER_SIZE[1] * 1.02, 'pulsed display height');

  assertClose(boss.corePulse, 0.94, 'decayed pulse');
  scene.renderState();
  assertClose(boss.sprite.displayWidth, CARRIER_SIZE[0] * (1 + 0.94 * 0.02), 'settling display width');
});
