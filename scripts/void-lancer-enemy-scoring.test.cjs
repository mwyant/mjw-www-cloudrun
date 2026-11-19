const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');

const mainPath = join(__dirname, '../public/void-lancer/js/main.js');
const mainSource = readFileSync(mainPath, 'utf8');

function runBulletPass(...otherEnemies) {
  let Scene;
  const effects = { sparks: 0, explosions: 0, rolls: 0, pickups: 0 };
  // Capture the real scene without starting Phaser or rendering.
  runInNewContext(mainSource, {
    window: {},
    document: {
      getElementById: () => ({ addEventListener() {} }),
      addEventListener() {},
    },
    Phaser: {
      Scene: class {},
      Game: class { constructor(config) { [Scene] = config.scene; } },
      Scale: {},
    },
    Math: Object.assign(Object.create(Math), {
      random: () => { effects.rolls++; return 0.5; },
    }),
  }, { filename: mainPath });

  const scene = new Scene();
  const turret = { type: 'turret', x: 200, y: 100, radius: 21, hp: 3, score: 220 };
  const bullet = { owner: 'player', x: 191.25, y: 100, vx: 560, vy: 0, radius: 4, damage: 8 };
  scene.state = {
    player: { x: 60, y: 100, w: 50, h: 30, weaponLevel: 1 },
    score: 0,
    enemies: [turret, ...otherEnemies],
    bullets: [{ ...bullet }, { ...bullet }],
  };
  scene.spawnHitSpark = () => effects.sparks++;
  scene.spawnExplosionFx = () => effects.explosions++;
  scene.spawnPowerUp = () => effects.pickups++;
  scene.playSound = scene.syncHud = () => {};

  scene.updateBullets(1 / 64);
  return { score: scene.state.score, remainingBullets: scene.state.bullets.length, ...effects };
}

test('two bullets hitting one turret in one frame award a single kill', () => {
  assert.deepEqual(runBulletPass(), {
    score: 220, remainingBullets: 1, sparks: 1, explosions: 1, rolls: 1, pickups: 1,
  });
});

test('the second bullet can hit a live enemy behind the dead turret in the collision list', () => {
  const scout = { type: 'scout', x: 210, y: 100, radius: 18, hp: 1, score: 100 };
  assert.deepEqual(runBulletPass(scout), {
    score: 320, remainingBullets: 0, sparks: 2, explosions: 2, rolls: 1, pickups: 1,
  });
  assert.ok(scout.hp <= 0);
});
