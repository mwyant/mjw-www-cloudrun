const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');

function makeScene() {
  let Scene;
  const mainPath = join(__dirname, '../public/void-lancer/js/main.js');
  runInNewContext(readFileSync(mainPath, 'utf8'), {
    window: {},
    document: { getElementById: () => ({ addEventListener() {} }), addEventListener() {} },
    Phaser: {
      Scene: class {},
      Game: class { constructor(config) { [Scene] = config.scene; } },
      Scale: {},
      Math: { Between: () => 0, Clamp: (x, min, max) => Math.max(min, Math.min(max, x)) },
    },
  }, { filename: mainPath });

  const scene = new Scene();
  const shape = (kind) => (x, y, width, height, fill) => ({
    kind, width, height, fill,
    setStrokeStyle(lineWidth, color) { this.stroke = { lineWidth, color }; return this; },
  });
  scene.add = {
    rectangle: shape('rectangle'),
    ellipse: shape('ellipse'),
    container: (x, y, children) => ({ children, setDepth() { return this; } }),
  };
  scene.state = { time: 0, bullets: [], player: { x: 80, y: 120, cooldown: 0, invuln: 0, weaponLevel: 1 } };
  scene.actionState = { isHeld: (action) => action === 'fire' };
  scene.playSound = scene.primePlayerRecoil = scene.spawnHitSpark = () => {};
  return scene;
}

function checkShot(shot, { owner, body, highlight, outline, kind, width, height, vx, vy, radius, damage }) {
  assert.deepEqual([shot.owner, shot.vx, shot.vy, shot.radius, shot.damage], [owner, vx, vy, radius, damage]);
  const [glow, shape, core] = shot.sprite.children;
  assert.equal(glow.fill, body);
  assert.deepEqual([shape.kind, shape.width, shape.height, shape.fill], [kind, width, height, body]);
  assert.deepEqual(shape.stroke, { lineWidth: 2, color: outline });
  assert.equal(core.fill, highlight);
}

const player = { owner: 'player', body: 0x28afff, highlight: 0xc5efff, outline: 0x062944, kind: 'rectangle' };
const enemy = { owner: 'enemy', body: 0xe92350, highlight: 0xffa4b4, outline: 0x430814, kind: 'ellipse', damage: 1 };

test('the basic shot and both upgraded side shots are cerulean streaks', () => {
  const scene = makeScene();
  const main = { ...player, width: 20, height: 6, vx: 560, vy: 0, radius: 4, damage: 8 };
  scene.updatePlayer(0);
  assert.equal(scene.state.bullets.length, 1);
  assert.equal(scene.state.player.cooldown, 0.18);
  checkShot(scene.state.bullets.pop(), main);

  Object.assign(scene.state.player, { weaponLevel: 2, cooldown: 0 });
  scene.updatePlayer(0);
  assert.equal(scene.state.bullets.length, 3);
  assert.equal(scene.state.player.cooldown, 0.14);
  const [center, upper, lower] = scene.state.bullets;
  const pulse = { ...player, width: 24, height: 7, vx: 520, radius: 3, damage: 6 };
  checkShot(center, main);
  checkShot(upper, { ...pulse, vy: -90 });
  checkShot(lower, { ...pulse, vy: 90 });
});

test('turret, Carrier spread, Carrier burst and vent hazards all fire crimson pellets', () => {
  const scene = makeScene();
  const standard = { ...enemy, width: 13, height: 10 };
  const burst = { ...enemy, width: 16, height: 16 };
  scene.state.enemies = [{ type: 'turret', x: 500, y: 120, life: 0, speed: 0, phase: 0, fireCooldown: 0, radius: 21, hp: 3 }];
  scene.updateEnemies(0);
  assert.equal(scene.state.bullets.length, 1);
  checkShot(scene.state.bullets.pop(), { ...standard, vx: -280, vy: 0, radius: 5 });

  scene.state.boss = { active: true, x: 820, y: 270, hp: 100, maxHp: 100, phase: 1, pulse: 0,
    fireCooldown: 0, burstCooldown: 0, summonCooldown: 0 };
  scene.updateBoss(0);
  const carrierShots = scene.state.bullets.splice(0);
  assert.equal(carrierShots.length, 8);
  [-24, 0, 24].forEach((vy, i) => checkShot(carrierShots[i], { ...standard, vx: -330, vy, radius: 6 }));
  [-180, -90, 0, 90, 180].forEach((vy, i) => checkShot(carrierShots[i + 3], { ...burst, vx: -260, vy, radius: 5 }));

  scene.triggerPanelVent({ x: 500, y: 150, width: 40, ventBurst: 3, phaseBoost: 0, flash: 0 });
  assert.equal(scene.state.bullets.length, 3);
  scene.state.bullets.forEach((shot, i) => checkShot(shot, { ...burst, vx: -250 - i * 18, vy: (i - 1) * 11 * 2.8, radius: 4 }));
});
