const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');

const jsDir = join(__dirname, '../public/void-lancer/js');

function loadGame() {
  const sandbox = {
    window: { location: { search: '', pathname: '/void-lancer/', origin: 'http://localhost' } },
    document: {
      getElementById: () => ({ addEventListener() {} }),
      addEventListener() {},
    },
    Phaser: {
      Scene: class {},
      Game: class { constructor(config) { sandbox.sceneClass = config.scene[0]; } },
      Scale: {},
      BlendModes: { ADD: 1 },
      Math: {
        FloatBetween: (min) => min,
        Between: (min) => min,
        Clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
      },
    },
    URLSearchParams,
    console,
  };

  for (const file of [
    'level1_stage_data.js',
    'level2_stage_data.js',
    'arcade_stage_data.js',
    'graveyard-sortie.js',
    'main.js',
  ]) {
    const filename = join(jsDir, file);
    runInNewContext(readFileSync(filename, 'utf8'), sandbox, { filename });
  }
  runInNewContext(`globalThis.__enemyFire = {
    level1: window.VoidLancerLevel1StageData,
    level2: window.VoidLancerLevel2StageData,
    arcade: window.VoidLancerArcadeStageData,
    Scene: MockupLevelScene
  };`, sandbox);
  return sandbox.__enemyFire;
}

const game = loadGame();

function makeScene() {
  const scene = Object.create(game.Scene.prototype);
  const shots = [];
  scene.add = {
    image: () => ({
      setDisplaySize() { return this; },
      setDepth() { return this; },
      destroy() {},
    }),
  };
  scene.state = {
    player: { x: 160, y: 270 },
    enemies: [],
    bullets: [],
    graveyard: null,
  };
  scene.spawnBullet = (...args) => shots.push(args);
  scene.playSound = () => {};
  return { scene, shots };
}

function firstTimelineSpawn(stage, predicate) {
  for (const wave of stage.waveTimeline) {
    for (const action of wave.actions || []) {
      const enemy = action.type === 'spawnEnemies' && action.enemies.find(predicate);
      if (enemy) return { time: wave.time, enemy };
    }
  }
  return null;
}

test('selected fighters in both opening levels and armored arcade craft have firing encounters', () => {
  for (const [label, stage] of [['Level 1', game.level1], ['Level 2', game.level2]]) {
    const first = firstTimelineSpawn(stage, (enemy) =>
      ['scout', 'zigzag', 'drone'].includes(enemy.type) && enemy.options?.fireCooldown !== undefined);
    assert.ok(first, `${label} schedules an aimed fighter`);
    assert.ok(first.time <= 2, `${label} schedules its first armed fighter by ${first.time}s`);
    const shooterWaves = stage.waveTimeline.filter((wave) =>
      wave.actions.some((action) => action.type === 'spawnEnemies'
        && action.enemies.some((enemy) =>
          ['scout', 'zigzag', 'drone'].includes(enemy.type) && enemy.options?.fireCooldown !== undefined)));
    assert.ok(shooterWaves.length >= 3, `${label} sustains shooter-capable fighter waves beyond the opener`);
  }

  const firstArcade = game.arcade.stages['escalation-01'];
  const interceptor = firstTimelineSpawn(firstArcade, (enemy) => enemy.type === 'interceptor');
  assert.ok(interceptor);
  assert.equal(interceptor.time, 19.5, 'the first two-hit fighter still has a long encounter window');
  const secondArcade = game.arcade.stages['escalation-02'];
  const rotary = firstTimelineSpawn(secondArcade, (enemy) => enemy.type === 'rotary');
  assert.equal(rotary.time, 18.5, 'the first three-hit emplacement arrives before the final crossing');
  const firstFullyVisible = rotary.time + (rotary.enemy.x + 40 - 960) / rotary.enemy.options.speed;
  assert.ok(secondArcade.missionDuration - firstFullyVisible >= 7,
    'the rotary has at least seven seconds fully on-screen before the clear');
});

test('fighter shots travel directly toward the Lancer while stock non-shooters stay silent', () => {
  for (const type of ['scout', 'zigzag', 'drone', 'interceptor']) {
    const { scene, shots } = makeScene();
    const options = type === 'interceptor' ? { speed: 0 } : { speed: 0, fireCooldown: 0.5 };
    const enemy = scene.spawnEnemy(type, 620, 170, options);
    const originalHp = enemy.hp;

    for (let i = 0; i < 16 && shots.length === 0; i += 1) scene.updateEnemies(0.1);

    assert.equal(shots.length, 1, `${type} fires once in the first 1.6 seconds`);
    const [owner, shotX, shotY, vx, vy] = shots[0];
    assert.equal(owner, 'enemy');
    assert.ok(Math.hypot(vx, vy) >= 279.9 && Math.hypot(vx, vy) <= 280.1);
    const targetX = scene.state.player.x - shotX;
    const targetY = scene.state.player.y - shotY;
    assert.ok(Math.abs(vx * targetY - vy * targetX) < 1e-7, `${type} aims at the Lancer's current position`);
    assert.ok(vx < 0, `${type} fires from its forward side toward the Lancer`);
    assert.ok(Number.isFinite(shotY));
    assert.equal(enemy.hp, originalHp, 'adding fire does not alter enemy durability');
  }

  const { scene, shots } = makeScene();
  scene.spawnEnemy('scout', 620, 170, { speed: 0 });
  for (let i = 0; i < 30; i += 1) scene.updateEnemies(0.1);
  assert.equal(shots.length, 0, 'unmarked stock scouts retain their silent behavior');
});
