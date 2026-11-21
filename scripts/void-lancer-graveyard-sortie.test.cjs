const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');

const jsDir = join(__dirname, '../public/void-lancer/js');
// Same order as index.html: stage data, then the graveyard module, then the game.
const MODULES = ['level1_stage_data.js', 'level2_stage_data.js', 'arcade_stage_data.js', 'graveyard-sortie.js', 'main.js'];

function loadModules() {
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
        Between: (min) => min,
        FloatBetween: (min) => min,
        Clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
      },
    },
    URLSearchParams,
    console,
  };
  for (const file of MODULES) {
    const filename = join(jsDir, file);
    runInNewContext(readFileSync(filename, 'utf8'), sandbox, { filename });
  }
  // Top-level const bindings live in the context's lexical scope rather than on
  // the global object, so pull out exactly what the assertions need.
  runInNewContext('globalThis.__exported = { graveyard: VoidLancerGraveyard, depth: DEPTH, sounds: SOUND_LIBRARY };', sandbox);
  return sandbox;
}

const shared = loadModules();
const G = shared.__exported.graveyard;
const DEPTH = shared.__exported.depth;

function makeNode(kind, args) {
  const node = {
    kind,
    args,
    x: args[0] ?? 0,
    y: args[1] ?? 0,
    rotation: 0,
    alpha: 1,
    visible: true,
    depth: 0,
    scale: 1,
    tilePositionX: 0,
    tilePositionY: 0,
    text: args[2],
    points: null,
    children: [],
    destroyed: false,
    setDepth(value) { node.depth = value; return node; },
    setAlpha(value) { node.alpha = value; return node; },
    setVisible(value) { node.visible = value; return node; },
    setOrigin() { return node; },
    setRotation(value) { node.rotation = value; return node; },
    setBlendMode() { return node; },
    setPosition(x, y) { node.x = x; node.y = y; return node; },
    setX(x) { node.x = x; return node; },
    setY(y) { node.y = y; return node; },
    setScale(value) { node.scale = value; return node; },
    setStrokeStyle() { return node; },
    setFillStyle() { return node; },
    setStroke() { return node; },
    setShadow() { return node; },
    setTint() { return node; },
    clearTint() { return node; },
    setTexture() { return node; },
    setFlipX() { return node; },
    setDisplaySize(width, height) { node.displayWidth = width; node.displayHeight = height; return node; },
    setText(value) { node.text = value; return node; },
    setColor(value) { node.color = value; return node; },
    fillStyle() { return node; },
    clear() { node.fills = []; return node; },
    fillPoints(points) {
      node.points = points;
      node.fills = (node.fills || []).concat([points]);
      return node;
    },
    getChildren() { return node.children; },
    add(child) {
      if (Array.isArray(child)) node.children.push(...child);
      else if (child) node.children.push(child);
      return node;
    },
    destroy() { node.destroyed = true; return node; },
  };
  return node;
}

function makeAdd() {
  const build = (kind) => (...args) => makeNode(kind, args);
  return {
    image: build('image'),
    rectangle: build('rectangle'),
    ellipse: build('ellipse'),
    circle: build('circle'),
    triangle: build('triangle'),
    text: build('text'),
    container: build('container'),
    graphics: build('graphics'),
    tileSprite: build('tileSprite'),
    group: build('group'),
  };
}

function emptyState(overrides = {}) {
  return {
    mode: 'intro',
    score: 0,
    time: 0,
    fx: [],
    bullets: [],
    enemies: [],
    powerUps: [],
    environmentPanels: [],
    announcements: [],
    boss: null,
    bossQueued: false,
    waves: [],
    environmentTimeline: [],
    player: {
      x: 150, y: 270, w: 72, h: 46, speed: 285, lives: 3,
      cooldown: 0, weaponLevel: 1, invuln: 0, fireKick: 0, bank: 0,
    },
    ...overrides,
  };
}

function runtime({ search = '' } = {}) {
  const sandbox = loadModules();
  sandbox.window.location.search = search;
  const scene = new sandbox.sceneClass();

  const overlays = [];
  const resets = [];
  const sounds = [];
  const spawned = [];
  const shots = [];

  scene.add = makeAdd();
  scene.tweens = { killTweensOf() {}, add() { return {}; } };
  scene.actionState = { clear() {}, isHeld: () => false, requestStart() {}, onClear: () => () => {} };
  scene.touchControls = null;
  scene.time = { now: 0 };
  scene.state = emptyState();
  scene.showOverlay = (title, summary, detail, button, options = {}) => {
    overlays.push({ title, summary, detail, button, ...options });
  };
  scene.hideOverlay = () => {};
  scene.startMusicPlayback = () => {};
  scene.updateAnnouncementDisplay = () => {};
  scene.playSound = (name) => sounds.push(name);
  scene.spawnEnemy = (...args) => { spawned.push(args); return { sprite: null }; };
  scene.spawnBullet = (...args) => {
    shots.push(args);
    const bullet = {
      owner: args[0], x: args[1], y: args[2], vx: args[3], vy: args[4],
      radius: args[5], damage: args[6], sprite: null,
    };
    scene.state.bullets.push(bullet);
    return bullet;
  };
  scene.resetGame = () => {
    resets.push({ sortie: scene.sortieIndex, carried: scene.carriedScore });
    scene.state = emptyState({ score: scene.carriedScore || 0, mode: 'intro' });
  };
  scene.setupBackground = () => {};
  scene.setupHud = () => {};
  scene.setupOverlay = () => {};
  scene.setupInput = () => {};
  scene.setupAudioControls = () => {};
  scene.cache = { json: { get: () => null } };

  return {
    scene,
    sandbox,
    overlays,
    resets,
    sounds,
    spawned,
    shots,
    overlay: () => overlays[overlays.length - 1],
    boot: () => scene.create(),
  };
}

function graveyardScene() {
  const r = runtime();
  r.scene.sortieIndex = 2;
  r.scene.state = emptyState({ mode: 'playing' });
  r.scene.setupGraveyardSortie();
  return r;
}

function pointAt(originX, originY, angle, distance) {
  return { x: originX + Math.cos(angle) * distance, y: originY + Math.sin(angle) * distance };
}

test('the ?sortie=2 preview opens the Graveyard briefing and anything else stays on sortie 1', () => {
  for (const [search, sortie, title] of [
    ['?sortie=2', 2, 'Graveyard Lane'],
    ['?sortie=graveyard', 2, 'Graveyard Lane'],
    ['', 1, 'Launch Window Open'],
    ['?sortie=1', 1, 'Launch Window Open'],
    ['?sortie=9', 1, 'Launch Window Open'],
    ['?sortie=%20', 1, 'Launch Window Open'],
    ['nonsense', 1, 'Launch Window Open'],
  ]) {
    const r = runtime({ search });
    r.boot();
    assert.equal(r.scene.sortieIndex, sortie, search || '(no query)');
    assert.equal(r.overlay().title, title, search || '(no query)');
    assert.equal(r.overlay().button, 'Start Sortie');
  }
});

test('Carrier victory offers Continue to Graveyard instead of starting it', () => {
  const r = runtime();
  r.scene.state.score = 1200;
  r.scene.finishGame(true);

  assert.equal(r.scene.state.mode, 'victory');
  assert.equal(r.overlay().button, 'Continue to Graveyard');
  assert.equal(r.overlay().tag, 'Mission Clear');
  assert.equal(r.resets.length, 0, 'nothing starts until the overlay action is pressed');
  assert.equal(r.scene.sortieIndex, 1);

  r.scene.startGame(); // the same entry the keyboard, touch pad and canvas button use
  assert.equal(r.scene.sortieIndex, 2);
  assert.equal(r.scene.state.mode, 'intro', 'continue lands on the Graveyard briefing');
  assert.equal(r.overlay().title, 'Graveyard Lane');
  assert.equal(r.overlay().button, 'Start Sortie');

  r.scene.startGame();
  assert.equal(r.scene.state.mode, 'playing');
  assert.equal(r.scene.sortieIndex, 2);
  assert.equal(r.resets.length, 2);
  assert.equal(r.scene.state.score, 1200, 'the run score carries into the lane');
});

test('dying in the Graveyard retries only the Graveyard, clearing it continues the chain', () => {
  const r = runtime();
  r.scene.state.score = 1200;
  r.scene.finishGame(true);
  r.scene.startGame();
  r.scene.startGame();
  assert.equal(r.scene.state.mode, 'playing');

  r.scene.state.score = 400;
  r.scene.finishGame(false);
  assert.equal(r.scene.state.mode, 'gameover');
  assert.equal(r.overlay().button, 'Retry Graveyard');
  assert.ok(!/worklight|alarm|patrol/i.test(r.overlay().summary),
    'the failure copy never claims an alarm that may not have fired');

  r.scene.startGame();
  assert.equal(r.scene.sortieIndex, 2, 'a retry never falls back to sortie 1');
  assert.equal(r.scene.state.mode, 'playing');
  assert.equal(r.scene.state.score, 1200, 'the partial Graveyard score is dropped, the run score is not');

  r.scene.state.score = 1900;
  r.scene.finishGame(true);
  assert.equal(r.overlay().button, 'Continue to Split Lane');
  assert.equal(r.overlay().tag, 'Two of Twelve Clear');
  assert.equal(r.overlay().title, 'Graveyard Secured', 'the intermediate debrief never reads as a finish line');

  r.scene.startGame();
  assert.equal(r.scene.sortieIndex, 0, 'an arcade route carries no authored sortie index');
  assert.equal(r.scene.arcadeStageId, 'escalation-01', 'a cleared Graveyard offers the first arcade sortie');
  assert.equal(r.scene.state.mode, 'intro');
  assert.equal(r.overlay().title, 'Split Lane');
  assert.equal(r.overlay().button, 'Start Sortie');
  assert.equal(r.scene.state.score, 1900, 'the run score carries into the arcade block');
  assert.equal(r.scene.campaignEntry().displayIndex, 3, 'the first arcade sortie is stage 3 of 12');

  r.scene.startGame();
  assert.equal(r.scene.arcadeStageId, 'escalation-01');
  assert.equal(r.scene.state.mode, 'playing');
});

test('First Sortie failure still restarts the First Sortie', () => {
  const r = runtime();
  r.scene.finishGame(false);
  assert.equal(r.overlay().button, 'Restart Mission');
  assert.equal(r.overlay().subtitle, 'Try a cleaner run');
  r.scene.startGame();
  assert.equal(r.scene.sortieIndex, 1);
  assert.equal(r.scene.state.mode, 'playing');
});

test('the First Sortie keeps its stage data and the Graveyard uses its own short lane', () => {
  const r = runtime();
  r.scene.sortieIndex = 1;
  const first = r.scene.getLevelStageData();
  assert.ok(first.waveTimeline.some((wave) => wave.actions.some((action) => action.type === 'queueBossArrival')),
    'the siege carrier is still queued at the end of the First Sortie');

  r.scene.sortieIndex = 2;
  const grave = r.scene.getLevelStageData();
  assert.equal(grave.missionDuration, 30);
  assert.ok(grave.missionDuration >= 25 && grave.missionDuration <= 40, 'the lane runs 25-40 seconds');
  const known = ['scout', 'zigzag', 'turret', 'drone'];
  let tagged = 0;
  for (const wave of grave.waveTimeline) {
    assert.ok(wave.time < grave.missionDuration, `wave at ${wave.time}s lands inside the run`);
    for (const action of wave.actions) {
      if (action.type !== 'spawnEnemies') continue;
      for (const enemy of action.enemies) {
        assert.ok(known.includes(enemy.type), `unknown enemy type ${enemy.type}`);
        if (enemy.options && enemy.options.patrolTag === 'graveyard') tagged += 1;
      }
    }
  }
  assert.equal(tagged, 1, 'exactly one alarm-linked patrol turret, spawned from the timeline');
  assert.equal(grave.environmentTimeline.length, 0, 'no vent hazards in the Graveyard lane');
});

function withHud(scene) {
  const recorder = () => ({
    value: null,
    setText(value) { this.value = value; return this; },
    setColor() { return this; },
  });
  const stageText = recorder();
  const stageTag = recorder();
  scene.scoreText = recorder();
  scene.livesText = recorder();
  scene.weaponText = recorder();
  scene.weaponTag = recorder();
  scene.stageText = stageText;
  scene.stageTag = stageTag;
  scene.livesPips = { getChildren: () => [] };
  scene.uiState = { lastScore: 0, lastWeaponLevel: 1, lastAnnouncementKey: '', lastBossRatio: 1 };
  scene.state = emptyState();
  scene.spawnScoreBurst = () => {};
  scene.showWeaponUpgradePulse = () => {};
  scene.pulseText = () => {};
  return { stageText, stageTag };
}

test('the HUD stage counter follows the active sortie across the twelve-stage chain', () => {
  const r = runtime();
  const { stageText, stageTag } = withHud(r.scene);

  r.scene.sortieIndex = 1;
  r.scene.syncHud();
  assert.equal(stageText.value, '01 / 12');
  assert.equal(stageTag.value, 'OPENING LANE');

  r.scene.sortieIndex = 2;
  r.scene.syncHud();
  assert.equal(stageText.value, '02 / 12');
  assert.equal(stageTag.value, 'GRAVEYARD LANE');

  // Routing identity 3 is still the Solar Altar; only its display slot moved.
  r.scene.sortieIndex = 3;
  r.scene.syncHud();
  assert.equal(stageText.value, '12 / 12');
  assert.equal(stageTag.value, 'ALTAR LANE');
});

test('the worklight sweep, lock, grace and alarm follow one continuous contact', () => {
  const det = G.createDetection();
  det.originX = 600;
  det.originY = 300;
  const target = { x: 380, y: 300 }; // dead ahead of the lamp, inside range

  for (let i = 0; i < 12; i += 1) G.updateDetection(det, 0.1, { x: 940, y: 300 });
  assert.ok(Math.abs(det.angle - Math.PI) > 1e-3, 'nobody is in the beam, so it keeps sweeping');
  assert.equal(det.holding, false);

  det.sweepPhase = 0;
  const first = G.updateDetection(det, 0.1, target);
  assert.equal(first.contactStart, true);
  assert.equal(det.holding, true);
  const locked = det.angle;
  assert.equal(locked, Math.atan2(target.y - det.originY, target.x - det.originX));

  for (let i = 0; i < 8; i += 1) G.updateDetection(det, 0.1, target);
  assert.equal(det.angle, locked, 'the beam holds direction instead of sweeping');
  assert.equal(det.graceExpired, true, 'the grace beat elapsed while contact held');
  assert.equal(det.alarm, false, 'not long enough for the alarm yet');

  let alarmAt = null;
  for (let i = 0; i < 10 && alarmAt === null; i += 1) {
    if (G.updateDetection(det, 0.1, target).alarm) alarmAt = i;
  }
  assert.notEqual(alarmAt, null, 'continuous contact eventually alarms');
  assert.equal(det.alarm, true);
  assert.ok(det.contactSeconds >= det.alarmSeconds);
});

test('leaving the beam resets the read before the alarm can land', () => {
  const det = G.createDetection();
  det.originX = 600;
  det.originY = 300;
  const target = { x: 380, y: 300 };
  G.updateDetection(det, 0.1, target);
  G.updateDetection(det, 0.1, target);
  assert.ok(det.contactSeconds > 0);

  const events = G.updateDetection(det, 0.1, { x: 600, y: 120 });
  assert.equal(events.contactEnd, true);
  assert.equal(det.contact, false);
  assert.equal(det.contactSeconds, 0);
  assert.equal(det.graceExpired, false);
  assert.equal(det.alarm, false);
  assert.equal(det.holding, false);
  assert.notEqual(det.angle, det.holdAngle, 'the cone goes back to sweeping');
});

test('the alarm latches once, so re-entering the beam never rings a second siren', () => {
  const det = G.createDetection();
  det.originX = 600;
  det.originY = 300;
  const target = { x: 380, y: 300 };
  let alarms = 0;
  for (let i = 0; i < 30; i += 1) {
    if (G.updateDetection(det, 0.1, target).alarm) alarms += 1;
  }
  assert.equal(alarms, 1);
  assert.equal(det.alarm, true);

  G.updateDetection(det, 0.1, { x: 600, y: 120 }); // break contact
  det.sweepPhase = 0; // park the sweep back on the target
  const again = G.updateDetection(det, 0.1, target);
  assert.equal(again.contactStart, true, 'the light can still catch the Lancer');
  assert.equal(again.alarm, false, 'but the alarm stays latched');
  assert.equal(alarms, 1);
});

test('the drawn cone and the contact test are the same shape', () => {
  const det = G.createDetection();
  det.originX = 400;
  det.originY = 260;
  det.angle = 2.1;

  const [apex, edgeA, edgeB] = G.beamLocalTriangle(det);
  assert.equal(apex.x, 0);
  assert.equal(apex.y, 0);

  // The scene puts the apex on the lamp and rotates the triangle by
  // geometry.angle, so each far corner sits at range, angle +/- halfWidth.
  for (const edge of [edgeA, edgeB]) {
    const localAngle = Math.atan2(edge.y, edge.x);
    assert.ok(Math.abs(Math.abs(localAngle) - det.halfWidth) < 1e-9, 'edge opens at halfWidth');
    assert.ok(Math.abs(Math.hypot(edge.x, edge.y) - det.range) < 1e-9, 'edge reaches the full range');

    const edgePoint = pointAt(det.originX, det.originY, det.angle + localAngle, det.range * 0.9);
    const delta = Math.atan2(edgePoint.y - det.originY, edgePoint.x - det.originX) - det.angle;
    assert.ok(Math.abs(Math.abs(delta) - det.halfWidth) < 1e-9, 'the drawn edge is the contact cutoff');

    const inside = pointAt(det.originX, det.originY, det.angle + localAngle * 0.9, det.range * 0.9);
    const outside = pointAt(det.originX, det.originY, det.angle + localAngle + Math.sign(localAngle) * 0.02, det.range * 0.9);
    assert.equal(G.inBeam(det, inside.x, inside.y), true, 'inside the drawn edge counts');
    assert.equal(G.inBeam(det, outside.x, outside.y), false, 'outside the drawn edge does not');
  }

  const ahead = pointAt(det.originX, det.originY, det.angle, det.range * 0.9);
  const pastRange = pointAt(det.originX, det.originY, det.angle, det.range + 8);
  assert.equal(G.inBeam(det, ahead.x, ahead.y), true);
  assert.equal(G.inBeam(det, pastRange.x, pastRange.y), false, 'beyond the cone length does not');
  assert.equal(G.beamGeometry(det).angle, det.angle);
  assert.equal(G.beamGeometry(det).halfWidth, det.halfWidth);
  assert.equal(G.beamGeometry(det).range, det.range);
});

test('the contact test stops at the drawn triangle, not a circular arc', () => {
  const det = G.createDetection();
  det.originX = 300;
  det.originY = 200;
  det.angle = 0; // beam along +x, so the world frame and the beam frame line up
  const reach = G.beamReach(det);

  const [, edgeA] = G.beamLocalTriangle(det);
  assert.ok(Math.abs(edgeA.x - reach) < 1e-9, 'the drawn far edge sits at the reach the test uses');
  assert.ok(reach < det.range, 'the straight edge is inside the corner radius');

  // Straight ahead at the full range: inside a circular sector, past the
  // triangle's straight far edge.
  assert.equal(G.inBeam(det, det.originX + det.range, det.originY), false);
  // Just short of that straight edge on the axis: inside.
  assert.equal(G.inBeam(det, det.originX + reach - 1, det.originY), true);
  // Behind the lamp: outside.
  assert.equal(G.inBeam(det, det.originX - 40, det.originY), false);
  // Inside the circle but beyond the straight side, near the corner.
  const beyondSide = pointAt(det.originX, det.originY, det.halfWidth * 0.5, det.range);
  assert.equal(G.inBeam(det, beyondSide.x, beyondSide.y), false);
  // Inside the straight sides a little short of the far edge.
  const inside = pointAt(det.originX, det.originY, det.halfWidth * 0.9, det.range * 0.99);
  assert.equal(G.inBeam(det, inside.x, inside.y), true);
  // Just past the side: outside.
  const outside = pointAt(det.originX, det.originY, det.halfWidth + 0.02, det.range * 0.9);
  assert.equal(G.inBeam(det, outside.x, outside.y), false);
});

test('the Graveyard scene draws the cone the detection state describes', () => {
  const r = graveyardScene();
  const yard = r.scene.state.graveyard;

  assert.ok(yard.beam.depth < DEPTH.player && yard.beam.depth < DEPTH.bullets,
    'the worklight sits behind the Lancer and its shots');
  assert.ok(yard.salvager.container.depth < DEPTH.player && yard.salvager.container.depth < DEPTH.bullets,
    'the workboat sits behind the Lancer and its shots');

  for (let i = 0; i < 14; i += 1) {
    r.scene.state.time += 0.1;
    r.scene.updateGraveyard(0.1);
  }
  const detection = yard.detection;
  const [apex, edgeA, edgeB] = yard.beam.fills[0];
  assert.equal(apex.x, detection.originX, 'the drawn cone starts on the lamp');
  assert.equal(apex.y, detection.originY, 'the drawn cone starts on the lamp');
  for (const edge of [edgeA, edgeB]) {
    const reach = Math.hypot(edge.x - apex.x, edge.y - apex.y);
    const delta = Math.atan2(edge.y - apex.y, edge.x - apex.x) - detection.angle;
    const wrapped = Math.atan2(Math.sin(delta), Math.cos(delta));
    assert.ok(Math.abs(reach - detection.range) < 1e-6, 'the drawn edge reaches the detection range');
    assert.ok(Math.abs(Math.abs(wrapped) - detection.halfWidth) < 1e-6, 'the drawn edge opens at the detection halfWidth');
  }

  const inside = pointAt(detection.originX, detection.originY, detection.angle + detection.halfWidth * 0.5, detection.range * 0.8);
  const outside = pointAt(detection.originX, detection.originY, detection.angle + detection.halfWidth + 0.05, detection.range * 0.8);
  assert.equal(G.inBeam(detection, inside.x, inside.y), true);
  assert.equal(G.inBeam(detection, outside.x, outside.y), false);
});

test('holding the worklight rings one siren, raises the banner and spawns nothing', () => {
  const r = graveyardScene();
  const yard = r.scene.state.graveyard;
  r.scene.state.player.x = yard.detection.originX - 300;
  r.scene.state.player.y = yard.detection.originY;

  for (let i = 0; i < 24; i += 1) {
    r.scene.state.time += 0.1;
    r.scene.updateGraveyard(0.1);
  }

  assert.equal(yard.detection.alarm, true);
  assert.deepEqual(r.sounds, ['graveyardSiren'], 'exactly one siren for the alarm');
  assert.equal(r.spawned.length, 0, 'the alarm never spawns enemies');
  assert.equal(r.shots.length, 0, 'the salvager never fires');
  const banner = r.scene.state.announcements.find((item) => item.kind === 'warning');
  assert.ok(banner && banner.text.includes('WORKLIGHT ALARM'), 'the alarm is visible as well as audible');
  assert.equal(yard.alertText.text, 'ALARM // IMPERIAL PATROL ALERTED');
  assert.equal(yard.alertText.visible, true);
  assert.equal(yard.alertChevron.visible, true, 'the alert carries a shape, not just a colour');
});

test('the salvager uses a distinct workboat sprite and never shoots', () => {
  const r = graveyardScene();
  const yard = r.scene.state.graveyard;
  const kinds = yard.salvager.container.children.map((child) => child.kind);
  assert.equal(kinds.filter((kind) => kind === 'image').length, 1, 'the workboat has one hull sprite');
  assert.equal(kinds.includes('graphics'), false, 'the beam is not part of the hull');
  for (const field of ['fireCooldown', 'hp', 'score', 'patrolTag']) {
    assert.equal(field in yard.salvager, false, `the workboat has no ${field}`);
  }

  for (let i = 0; i < 10; i += 1) {
    r.scene.state.time += 0.1;
    r.scene.updateGraveyard(0.1);
  }
  assert.equal(r.shots.length, 0, 'updating the salvager produces no shots');
  assert.ok(yard.salvager.x < 1040, 'the workboat drifts through the yard');
});

test('the Graveyard backdrop pans without tiling and salvage tags are scenery', () => {
  const r = graveyardScene();
  const yard = r.scene.state.graveyard;
  const initialX = yard.backdrop.x;
  assert.equal(yard.backdrop.kind, 'image');
  assert.ok(yard.markers.every((marker) => marker.x > 960));
  r.scene.state.time = 16;
  r.scene.updateGraveyard(0);
  assert.ok(yard.backdrop.x < initialX && yard.backdrop.x >= 460);
  assert.ok(yard.markers[0].x < 960);
  assert.equal(r.scene.state.powerUps.length, 0);
  r.scene.destroyGraveyardObjects();
  assert.ok(yard.backdrop.destroyed && yard.markers.every((marker) => marker.destroyed));
});

test('the tagged patrol holds fire on station and fires faster once alarmed', () => {
  const r = runtime();
  const patrol = {
    type: 'turret', x: 700, y: 200, speed: 0, phase: 0, life: 0,
    fireCooldown: 0.9, radius: 21, hp: 3, maxHp: 3, score: 220,
    patrolTag: 'graveyard', sprite: { destroy() {} },
  };
  const standby = {
    type: 'turret', x: 760, y: 380, speed: 0, phase: 0, life: 0,
    fireCooldown: 1.4, radius: 21, hp: 3, maxHp: 3, score: 220,
    patrolTag: null, sprite: { destroy() {} },
  };
  r.scene.state = emptyState({ mode: 'playing', enemies: [patrol, standby] });
  const patrolShots = () => r.shots.filter((shot) => shot[1] < 700).length;
  const standbyShots = () => r.shots.filter((shot) => shot[1] >= 700).length;

  let ordinaryGap = 0;
  for (let i = 0; i < 40; i += 1) {
    r.scene.updateEnemies(0.1);
    if (ordinaryGap === 0 && standbyShots() === 1) ordinaryGap = i + 1;
  }
  assert.equal(patrolShots(), 0, 'silent on station without the alarm');
  assert.ok(standbyShots() >= 1, 'the untagged turret keeps its ordinary behaviour');
  assert.equal(ordinaryGap, 14, 'the ordinary turret interval is untouched');

  r.scene.state.graveyard = { detection: { alarm: true } };
  let frames = 0;
  while (patrolShots() === 0 && frames < 60) {
    r.scene.updateEnemies(0.1);
    frames += 1;
  }
  assert.ok(frames <= 5, `the alarm wakes the patrol quickly (took ${frames} frames)`);

  let gap = 0;
  while (patrolShots() < 2 && gap < 60) {
    r.scene.updateEnemies(0.1);
    gap += 1;
  }
  assert.ok(gap > 0 && gap <= 10, `accelerated interval (took ${gap} frames, ordinary is 14)`);
});

// Drive update() without the scenery: only the worklight read and the mission
// clock stay live, which is where the timed clear and the alarm sit.
function prepareLaneLoop(scene) {
  scene.levelStageData = scene.getLevelStageData();
  scene.bgStarfield = { tilePositionX: 0, tilePositionY: 0 };
  scene.bgNebula = { tilePositionX: 0, tilePositionY: 0 };
  scene.bgMegastructure = { tilePositionX: 0, tilePositionY: 0 };
  scene.bgForeground = { tilePositionX: 0, tilePositionY: 0 };
  for (const step of ['updateAtmosphereLayers', 'updateHazardLights', 'updateForegroundProps',
    'updateStageBackdropModules', 'updateEnvironmentPanels', 'updateOverlayMotion', 'updateHudEffects',
    'updatePlayer', 'updateEnvironmentTimeline', 'updateWaves', 'updateEnemies', 'updateBoss',
    'updateBullets', 'updatePowerUps', 'updateCollisions', 'updateFx', 'updateAnnouncements', 'renderState']) {
    scene[step] = () => {};
  }
}

test('the run ends on the Graveyard timer and offers the first arcade sortie', () => {
  const r = graveyardScene();
  const scene = r.scene;
  // Keep the crossing clean: the Lancer stays outside the worklight cone.
  scene.state.player.x = 500;
  scene.state.player.y = 520;
  scene.state.graveyard.salvager.speed = 0;
  prepareLaneLoop(scene);

  for (let i = 0; i < 300 && scene.state.mode === 'playing'; i += 1) {
    scene.time.now += 100;
    scene.update(0, 100);
  }

  assert.equal(scene.state.mode, 'victory');
  assert.equal(r.overlay().button, 'Continue to Split Lane');
  assert.ok(scene.state.time <= 30.1, `the lane cleared at ${scene.state.time.toFixed(1)}s`);
  assert.equal(r.sounds.length, 0, 'a clean crossing stays quiet');
});

test('a same-frame hull loss beats the Graveyard timer and silences the worklight', () => {
  const r = graveyardScene();
  const scene = r.scene;
  prepareLaneLoop(scene);
  scene.state.time = scene.levelStageData.missionDuration; // the clear lands this frame
  scene.updateCollisions = () => scene.finishGame(false); // and so does the hull

  scene.time.now += 100;
  scene.update(0, 100);

  assert.equal(scene.state.mode, 'gameover', 'the loss stands; the timer must not override it');
  assert.equal(r.overlay().button, 'Retry Graveyard');
  assert.deepEqual(r.sounds, [], 'no alarm siren after death');
  assert.equal(scene.state.graveyard.detection.alarm, false, 'the worklight read never ran');
  assert.equal(scene.state.graveyard.salvager.x, 1040, 'the salvager did not advance either');
});

test('resetting clears the worklight objects and the alarm state with them', () => {
  const r = graveyardScene();
  const yard = r.scene.state.graveyard;
  yard.detection.alarm = true;

  r.scene.destroyDynamicObjects();

  assert.equal(r.scene.state.graveyard, null);
  assert.equal(r.scene.graveyardObjects.length, 0);
  assert.equal(r.scene.graveyardDebris, null);
  assert.equal(yard.beam.destroyed, true);
  assert.equal(yard.salvager.container.destroyed, true);
  assert.equal(yard.alertText.destroyed, true);

  r.scene.state = emptyState({ mode: 'playing' });
  r.scene.setupGraveyardSortie();
  assert.equal(r.scene.state.graveyard.detection.alarm, false, 'a retry starts with a cold worklight');
  assert.equal(r.scene.state.graveyard.salvager.x, 1040);
});

test('the siren is the existing bossWarning preset with its frequencies swept up', () => {
  const r = graveyardScene();
  const sounds = r.sandbox.__exported.sounds;
  assert.ok(sounds.graveyardSiren, 'the siren preset is installed by the scene');
  const siren = sounds.graveyardSiren;
  const base = sounds.bossWarning;
  assert.equal(siren.layers.length, base.layers.length);
  siren.layers.forEach((layer, index) => {
    assert.equal(layer.type, base.layers[index].type, 'layer type comes from the existing preset');
    assert.equal(layer.gain, base.layers[index].gain, 'layer gain comes from the existing preset');
    assert.equal(layer.filterCutoff, base.layers[index].filterCutoff, 'filter comes from the existing preset');
    assert.ok(layer.endFrequency > layer.startFrequency, 'the siren rises instead of falling');
  });
  assert.equal(siren.duration, base.duration);
  assert.equal(siren.volume, base.volume);
});

// --- Level 2 close, copy and clear ----------------------------------------

function level2Lane() {
  const r = runtime();
  r.scene.sortieIndex = 2;
  r.scene.levelStageData = r.scene.getLevelStageData();
  return r;
}

// Every `announce` action in the lane, in timeline order.
function level2Banners(data) {
  const banners = [];
  for (const wave of data.waveTimeline || []) {
    for (const action of wave.actions || []) {
      if (action.type === 'announce') {
        banners.push({ time: wave.time, ttl: action.ttl ?? 2.4, kind: action.kind ?? 'notice', text: action.text });
      }
    }
  }
  return banners;
}

test('the Graveyard keeps its tested wave pacing and bounds the exit beat', () => {
  const data = level2Lane().scene.levelStageData;

  // Array.from keeps the result in this realm: arrays built inside the VM
  // sandbox carry that realm's Array prototype and deepStrictEqual rejects them.
  const spawnTimes = Array.from(
    data.waveTimeline.filter((wave) => (wave.actions || []).some((action) => action.type === 'spawnEnemies')),
    (wave) => wave.time,
  );
  assert.deepEqual(spawnTimes, [0, 3, 8.5, 12, 16, 21, 25.5],
    'the early waves are untouched and 25.5s is still the last wave of the lane');

  assert.equal(data.missionDuration, 30, 'the crossing stays a 30 second run');
  const gap = data.missionDuration - spawnTimes[spawnTimes.length - 1];
  assert.ok(gap >= 4, `the exit beat has ${gap}s to land once the last wave is in`);
});

test('each Graveyard banner is readable on the plate and lands alone', () => {
  const data = level2Lane().scene.levelStageData;
  const banners = level2Banners(data);

  assert.deepEqual(banners.map((banner) => banner.time), [0.6, 5.5, 12, 25.5, 28]);
  assert.deepEqual(banners.map((banner) => banner.kind), ['notice', 'notice', 'notice', 'warning', 'notice']);
  for (let i = 1; i < banners.length; i += 1) {
    const previous = banners[i - 1];
    // The queue ticks every banner's ttl together, so overlapping entries
    // would show the later one for only what is left of its life.
    assert.ok(previous.time + previous.ttl <= banners[i].time,
      `the ${previous.time}s banner clears before the ${banners[i].time}s one arrives`);
  }

  const last = banners[banners.length - 1];
  assert.ok(last.time + last.ttl <= data.missionDuration, 'the payoff never outlives the run');
  assert.ok(data.missionDuration - last.time >= 1.5, 'the payoff has time to read before the clear');

  for (const banner of banners) {
    assert.ok(banner.text.length > 0 && banner.text.length <= 44,
      `"${banner.text}" is ${banner.text.length} characters on the announcement plate`);
    assert.ok(banner.ttl > 0 && banner.ttl <= 3, `ttl ${banner.ttl}s at ${banner.time}s`);
  }
});

test('the Level 2 copy names the objective, both parties and the Solar Altar without a deal between them', () => {
  const r = level2Lane();
  const brief = r.scene.sortieBriefing();
  const won = r.scene.sortieEndCopy(true);

  assert.match(brief.summary, /^Objective:/, 'the briefing opens with the objective');
  assert.match(brief.summary, /cross the yard/);
  assert.match(brief.summary, /mercenary salvager.*worklight/i);
  assert.match(brief.summary, /break contact.*before it alerts the Imperial patrol/i,
    'the worklight and the Imperial patrol are distinct and the alarm cost is clear');
  assert.ok(brief.summary.length <= 170, `the briefing summary wraps to three lines (${brief.summary.length} chars)`);

  assert.match(won.summary, /route record/i);
  assert.match(won.summary, /amber markers/i);
  assert.match(won.summary, /through the defense lanes to the Solar Altar/i,
    'the payoff names the altar as the finale the arcade block leads to, not as the next stop');
  assert.ok(!/Next stop: the Solar Altar/i.test(won.summary),
    'the intermediate debrief never points at the final battle as what comes next');
  assert.equal(won.button, 'Continue to Split Lane', 'the button offers the leg that actually follows the yard');
  assert.equal(won.tag, 'Two of Twelve Clear');
  assert.equal(won.title, 'Graveyard Secured');
  assert.ok(won.summary.length <= 170, `the debrief wraps to three lines (${won.summary.length} chars)`);

  const banners = level2Banners(r.scene.levelStageData).map((banner) => banner.text);
  assert.equal(banners.filter((text) => /SOLAR ALTAR/.test(text)).length, 2,
    'the markers and the route record both name the Solar Altar');
  const mercenaryBanner = banners.find((text) => /MERCENARY/.test(text));
  assert.ok(mercenaryBanner, 'a banner names the salvagers in the lane');
  assert.ok(!/IMPERIAL/.test(mercenaryBanner), 'the mercenary banner never tags the salvagers as Imperial');

  const everything = [brief.summary, won.summary, ...banners].join(' ').toLowerCase();
  for (const phrase of ['contract', 'hired', 'allegiance', 'employer', 'employed', 'retainer', 'working for', 'paid by']) {
    assert.ok(!everything.includes(phrase), `no Level 2 copy invents "${phrase}"`);
  }
});

// Waves and announcements stay live here: only the scenery, the player and the
// collisions are stubbed out, so the lane says what it scheduled and when.
test('the banners play in order and the route record is up when the run clears', () => {
  const r = graveyardScene();
  const scene = r.scene;
  // Keep the crossing clean: the Lancer stays outside the worklight cone.
  scene.state.player.x = 500;
  scene.state.player.y = 520;
  scene.state.graveyard.salvager.speed = 0;

  const liveWaves = scene.updateWaves;
  const liveAnnouncements = scene.updateAnnouncements;
  prepareLaneLoop(scene);
  scene.updateWaves = liveWaves;
  scene.updateAnnouncements = liveAnnouncements;
  scene.state.waves = scene.buildWavePlan();

  const scheduled = level2Banners(scene.levelStageData);
  const shown = [];
  let current = null;
  for (let i = 0; i < 320 && scene.state.mode === 'playing'; i += 1) {
    scene.time.now += 100;
    scene.update(0, 100);
    const banner = scene.state.announcements[0]?.text ?? null;
    if (banner && banner !== current) {
      current = banner;
      shown.push({ time: scene.state.time, text: banner });
    }
  }

  assert.equal(scene.state.mode, 'victory');
  assert.deepEqual(shown.map((banner) => banner.text), scheduled.map((banner) => banner.text),
    'the lane says exactly what it scheduled, in order');
  shown.forEach((banner, index) => {
    assert.ok(Math.abs(banner.time - scheduled[index].time) <= 0.11,
      `"${banner.text}" shown at ${banner.time.toFixed(1)}s, scheduled for ${scheduled[index].time}s`);
  });
  const last = shown[shown.length - 1];
  assert.ok(scene.state.time - last.time >= 1.9,
    `the route record is on screen for ${(scene.state.time - last.time).toFixed(1)}s before the clear`);
  assert.equal(r.sounds.length, 0, 'a clean crossing stays quiet');
});
