// Data-only checks for the arcade stage-data module: no Phaser, no scene, no
// gameplay. The runtime contract (action types, enemy types, option keys,
// banner kinds, playfield size, sprite footprints) is read straight out of
// main.js, so this suite follows the runtime instead of restating it.
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');

const jsDir = join(__dirname, '../public/void-lancer/js');

function loadStageData() {
  const sandbox = { window: {} };
  const filename = join(jsDir, 'arcade_stage_data.js');
  runInNewContext(readFileSync(filename, 'utf8'), sandbox, { filename });
  return sandbox.window.VoidLancerArcadeStageData;
}

function sliceBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `main.js is missing ${JSON.stringify(startMarker)}`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, `main.js is missing ${JSON.stringify(endMarker)}`);
  return source.slice(start, end);
}

const mainSource = readFileSync(join(jsDir, 'main.js'), 'utf8');

const GAME_WIDTH = Number(/const GAME_WIDTH = (\d+);/.exec(mainSource)[1]);
const GAME_HEIGHT = Number(/const GAME_HEIGHT = (\d+);/.exec(mainSource)[1]);

// Action types the timeline dispatcher actually handles.
const SUPPORTED_ACTIONS = new Set(
  [...sliceBetween(mainSource, 'runTimelineAction(action) {', 'runEnvironmentAction(action) {').matchAll(/case '(\w+)'/g)].map(
    (match) => match[1]
  )
);

// Enemy types the runtime knows how to draw and move, with half-footprints
// taken from the same manifest spawnEnemy sizes sprites with.
const manifestSource = sliceBetween(mainSource, 'const DEFAULT_ASSET_MANIFEST = {', 'const FX_LIBRARY = {');
const enemiesBlock = sliceBetween(manifestSource, 'enemies: {', 'boss: {');
const SUPPORTED_ENEMIES = new Set([...enemiesBlock.matchAll(/(\w+): \{/g)].map((match) => match[1]));
const ENEMY_HALF_SIZE = new Map(
  [...enemiesBlock.matchAll(/(\w+): \{ displaySize: \[(\d+), (\d+)\]/g)].map((match) => [
    match[1],
    [Number(match[2]) / 2, Number(match[3]) / 2],
  ])
);

// Per-enemy option keys spawnEnemy reads off `options`.
const SUPPORTED_OPTIONS = new Set(
  [
    ...sliceBetween(mainSource, 'spawnEnemy(type, x, y, options = {}) {', 'spawnBullet(owner,').matchAll(
      /options\.(\w+)/g
    ),
  ].map((match) => match[1])
);

// Banner styles showAnnouncementBanner can draw, plus its notice default.
const bannerSource = sliceBetween(
  mainSource,
  "showAnnouncementBanner(text, kind = 'notice') {",
  'updateOverlayMotion(dt) {'
);
const SUPPORTED_KINDS = new Set([
  ...[...bannerSource.matchAll(/kind === '(\w+)'/g)].map((match) => match[1]),
  /kind = '(\w+)'/.exec(bannerSource)[1],
]);

// A stage record only carries fields the runtime reads.
const STAGE_KEYS = new Set([
  'id',
  'title',
  'briefing',
  'missionDuration',
  'waveTimeline',
  'backdropCues',
  'environmentTimeline',
]);

// Spawned sprites keep at least this far inside the top and bottom edges so a
// wave never arrives already clipped by the playfield.
const EDGE_MARGIN = 16;

const data = loadStageData();
const stages = Object.entries(data.stages);

function eachSpawn(stage, visit) {
  for (const wave of stage.waveTimeline) {
    for (const action of wave.actions) {
      if (action.type === 'spawnEnemies') {
        for (const enemy of action.enemies) visit(enemy, wave, action);
      }
    }
  }
}

function eachBanner(stage, visit) {
  for (const wave of stage.waveTimeline) {
    for (const action of wave.actions) {
      if (action.type === 'announce') visit(action, wave);
    }
  }
}

test('nine unique stages, and a provisional order that covers each exactly once', () => {
  assert.ok(data && typeof data === 'object', 'window.VoidLancerArcadeStageData is an object');
  assert.deepEqual(Object.keys(data).sort(), ['provisionalOrder', 'stages']);
  assert.equal(stages.length, 9, 'nine reviewed stages');
  assert.equal(new Set(stages.map(([id]) => id)).size, 9, 'stage ids are unique');

  const order = data.provisionalOrder;
  assert.ok(Array.isArray(order) && order.length > 0, 'provisionalOrder is a non-empty array');
  assert.equal(new Set(order).size, order.length, 'the order lists no id twice');
  assert.deepEqual([...order].sort(), stages.map(([id]) => id).sort(), 'the order covers every stage');
  for (const id of order) {
    assert.equal(data.stages[id].id, id, `${id} resolves to the stage that owns that id`);
  }
});

test('stage schema and merged runtime-supported actions and options', () => {
  const issues = [];
  for (const [id, stage] of stages) {
    if (stage.id !== id) issues.push(`${id}: record id ${stage.id} disagrees with its key`);
    for (const key of Object.keys(stage)) {
      if (!STAGE_KEYS.has(key)) issues.push(`${id}: unknown stage field ${key}`);
    }
    if (typeof stage.title !== 'string' || !stage.title.trim()) issues.push(`${id}: missing title`);
    if (typeof stage.briefing !== 'string' || !stage.briefing.trim()) issues.push(`${id}: missing briefing`);
    if (!Number.isFinite(stage.missionDuration) || stage.missionDuration <= 0) {
      issues.push(`${id}: missionDuration must be a positive number`);
    }
    if (!Array.isArray(stage.waveTimeline) || !stage.waveTimeline.length) {
      issues.push(`${id}: waveTimeline must be a non-empty array`);
      continue;
    }
    for (const wave of stage.waveTimeline) {
      if (!Number.isFinite(wave.time)) issues.push(`${id}: wave without a finite time`);
      if (!Array.isArray(wave.actions) || !wave.actions.length) {
        issues.push(`${id}: wave at ${wave.time} has no actions`);
        continue;
      }
      for (const action of wave.actions) {
        if (!SUPPORTED_ACTIONS.has(action.type)) {
          issues.push(`${id}: action type ${action.type} is not handled by runTimelineAction`);
          continue;
        }
        if (action.type === 'spawnEnemies') {
          if (!Array.isArray(action.enemies) || !action.enemies.length) {
            issues.push(`${id}: spawnEnemies at ${wave.time} has no enemies`);
            continue;
          }
          for (const enemy of action.enemies) {
            if (!SUPPORTED_ENEMIES.has(enemy.type)) issues.push(`${id}: unknown enemy type ${enemy.type}`);
            const yIsSafe = enemy.y && typeof enemy.y === 'object' && enemy.y.mode === 'safeEnemyY';
            if (!Number.isFinite(enemy.x)) issues.push(`${id}: ${enemy.type} spawn without a finite x`);
            if (!Number.isFinite(enemy.y) && !yIsSafe) issues.push(`${id}: ${enemy.type} spawn without a numeric y`);
            for (const key of Object.keys(enemy.options || {})) {
              if (!SUPPORTED_OPTIONS.has(key)) issues.push(`${id}: ${enemy.type} option ${key} is ignored by spawnEnemy`);
            }
          }
        }
        if (action.type === 'announce') {
          if (typeof action.text !== 'string' || !action.text.trim()) issues.push(`${id}: announce without text`);
          if (!Number.isFinite(action.ttl) || action.ttl <= 0) issues.push(`${id}: announce without a positive ttl`);
          if (!SUPPORTED_KINDS.has(action.kind)) issues.push(`${id}: banner kind ${action.kind} has no style`);
        }
      }
    }
  }
  assert.deepEqual(issues, []);
});

test('waves are ordered and all fire before the clear, with banners never overlapping', () => {
  const issues = [];
  for (const [id, stage] of stages) {
    const times = stage.waveTimeline.map((wave) => wave.time);
    for (let i = 1; i < times.length; i++) {
      if (times[i] <= times[i - 1]) issues.push(`${id}: wave times are not strictly increasing at ${times[i]}`);
    }
    const lastWave = times[times.length - 1];
    if (lastWave >= stage.missionDuration) {
      issues.push(`${id}: last wave at ${lastWave}s does not fire before the clear at ${stage.missionDuration}s`);
    }

    // The announcement queue ticks every banner's ttl together, so a banner
    // still alive when the next arrives would cut the earlier one off.
    const banners = [];
    eachBanner(stage, (action, wave) => banners.push({ time: wave.time, ttl: action.ttl, text: action.text }));
    for (let i = 1; i < banners.length; i++) {
      const previous = banners[i - 1];
      const next = banners[i];
      if (previous.time + previous.ttl > next.time) {
        issues.push(`${id}: "${previous.text}" is still up when "${next.text}" arrives at ${next.time}s`);
      }
    }
    const lastBanner = banners[banners.length - 1];
    if (lastBanner && lastBanner.time + lastBanner.ttl > stage.missionDuration) {
      issues.push(`${id}: "${lastBanner.text}" runs past the clear at ${stage.missionDuration}s`);
    }
  }
  assert.deepEqual(issues, []);
});

test('every enemy enters the playfield whole, inside the vertical band', () => {
  const issues = [];
  for (const [id, stage] of stages) {
    eachSpawn(stage, (enemy, wave) => {
      if (!Number.isFinite(enemy.x)) return; // the schema test owns bad coordinates
      const half = ENEMY_HALF_SIZE.get(enemy.type);
      if (!half) {
        issues.push(`${id}: ${enemy.type} has no footprint in the asset manifest`);
        return;
      }
      const [halfWidth, halfHeight] = half;

      // Off the right edge at spawn, whole, so the sprite slides in instead of
      // popping half-formed - and close enough that it arrives promptly.
      const lead = enemy.x - halfWidth - GAME_WIDTH;
      if (lead < 0) {
        issues.push(`${id}: ${enemy.type} at ${wave.time}s spawns ${-lead}px inside the right edge`);
      } else if (lead > GAME_WIDTH / 2) {
        issues.push(`${id}: ${enemy.type} at ${wave.time}s spawns ${lead}px off-screen, over half a screen wide`);
      }

      // Mirrors spawnEnemy defaults. Include the far half of the sprite and
      // leave at least a second to react before the timed clear.
      const speed = enemy.options?.speed ?? (enemy.type === 'turret' ? 92 : enemy.type === 'drone' ? 230 : 170);
      const fullEntry = wave.time + (enemy.x + halfWidth - GAME_WIDTH) / speed;
      if (!(speed > 0) || fullEntry > stage.missionDuration - 1) {
        issues.push(`${id}: ${enemy.type} at ${wave.time}s has less than a second fully on-screen before clear`);
      }

      // A safeEnemyY spawn lets the runtime choose its height, so only
      // authored heights are checked against the vertical band.
      if (!Number.isFinite(enemy.y)) return;
      if (enemy.y - halfHeight < EDGE_MARGIN) {
        issues.push(`${id}: ${enemy.type} at ${wave.time}s spawns ${enemy.y - halfHeight}px from the top edge`);
      }
      if (enemy.y + halfHeight > GAME_HEIGHT - EDGE_MARGIN) {
        issues.push(`${id}: ${enemy.type} at ${wave.time}s spawns ${GAME_HEIGHT - enemy.y - halfHeight}px from the bottom edge`);
      }
    });
  }
  assert.deepEqual(issues, []);
});

test('reordering the provisional order leaves every stage id untouched', () => {
  const idsBefore = stages.map(([id]) => id);
  const recordsBefore = JSON.stringify(data.stages);
  const orderBefore = [...data.provisionalOrder];

  // What a difficulty pass does: resequence, never rename.
  data.provisionalOrder.reverse();
  data.provisionalOrder.push(data.provisionalOrder.shift());

  assert.deepEqual(Object.keys(data.stages), idsBefore, 'stage lookup keeps its ids and its order');
  assert.equal(JSON.stringify(data.stages), recordsBefore, 'stage records are unchanged by resequencing');
  assert.equal(new Set(data.provisionalOrder).size, idsBefore.length, 'no id was dropped or duplicated');
  assert.deepEqual([...data.provisionalOrder].sort(), [...idsBefore].sort(), 'coverage survives the reorder');

  data.provisionalOrder.length = 0;
  data.provisionalOrder.push(...orderBefore);
  // Spread first: the module's array lives in the VM realm, so comparing it
  // straight against a host array trips deepStrictEqual's prototype check.
  assert.deepEqual([...data.provisionalOrder], orderBefore, 'the provisional order is restored');
});
