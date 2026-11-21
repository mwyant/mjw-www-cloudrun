const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');

const jsDir = join(__dirname, '../public/void-lancer/js');
// Same order as index.html: stage data, the two sortie modules, then the game.
const MODULES = [
  'level1_stage_data.js',
  'level2_stage_data.js',
  'level3_stage_data.js',
  'arcade_stage_data.js',
  'graveyard-sortie.js',
  'solar-altar.js',
  'main.js',
];

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
  runInNewContext('globalThis.__exported = { altar: VoidLancerSolarAltar, graveyard: VoidLancerGraveyard, depth: DEPTH, width: GAME_WIDTH };', sandbox);
  return sandbox;
}

const shared = loadModules();
const A = shared.__exported.altar;
const DEPTH = shared.__exported.depth;
const GAME_WIDTH = shared.__exported.width;

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
    strokes: [],
    lines: [],
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
    setStrokeStyle(width, color, alpha) { node.strokes.push({ width, color, alpha }); return node; },
    setFillStyle() { return node; },
    setStroke() { return node; },
    setShadow() { return node; },
    setTint() { node.tinted = true; return node; },
    clearTint() { node.tinted = false; return node; },
    setTexture() { return node; },
    setFlipX() { return node; },
    setDisplaySize(width, height) { node.displayWidth = width; node.displayHeight = height; return node; },
    setText(value) { node.text = value; return node; },
    setColor(value) { node.color = value; return node; },
    fillStyle() { return node; },
    lineStyle(width, color, alpha) { node.lines.push({ width, color, alpha }); return node; },
    strokeCircle(x, y, radius) { node.lines.push({ circle: radius }); return node; },
    lineBetween(x1, y1, x2, y2) { node.lines.push({ segment: [x1, y1, x2, y2] }); return node; },
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
  const bossBars = [];

  scene.add = makeAdd();
  scene.tweens = { killTweensOf() {}, add() { return {}; } };
  scene.actionState = { clear() {}, isHeld: () => false, requestStart() {}, onClear: () => () => {} };
  scene.touchControls = null;
  scene.time = { now: 0 };
  scene.cameras = { main: { flash() {}, shake() {} } };
  scene.playerSprite = {
    setPosition() {}, setTexture() {}, setAlpha() {}, setRotation() {}, setX() {}, setY() {},
    destroy() {},
  };
  scene.bossBarFill = { width: 0, x: 0 };
  scene.bossBarGlow = { alpha: 0 };
  scene.bossBarTitle = {
    value: null,
    setText(value) { this.value = value; return this; },
  };
  scene.cache = { json: { get: () => null } };
  scene.showOverlay = (title, summary, detail, button, options = {}) => {
    overlays.push({ title, summary, detail, button, ...options });
  };
  scene.hideOverlay = () => {};
  scene.startMusicPlayback = () => {};
  scene.updateAnnouncementDisplay = () => {};
  scene.syncHud = () => {};
  scene.showBossBar = () => bossBars.push('show');
  scene.hideBossBar = () => bossBars.push('hide');
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
  scene.setupBackground = () => {};
  scene.setupHud = () => {};
  scene.setupOverlay = () => {};
  scene.setupInput = () => {};
  scene.setupAudioControls = () => {};

  // resetGame runs for real so the chain builds and tears down real scenery.
  const realReset = scene.resetGame.bind(scene);
  scene.resetGame = () => {
    resets.push({ sortie: scene.sortieIndex, carried: scene.carriedScore });
    realReset();
  };

  return {
    scene,
    sandbox,
    overlays,
    resets,
    sounds,
    spawned,
    shots,
    bossBars,
    altar: A,
    overlay: () => overlays[overlays.length - 1],
    boot: () => scene.create(),
  };
}

function altarScene() {
  const r = runtime({ search: '?sortie=3' });
  r.boot();
  r.scene.state.mode = 'playing';
  return r;
}

// --- Stage selection and the eligible chain --------------------------------

test('the ?sortie=3 preview opens the Solar Altar briefing and anything else stays put', () => {
  for (const [search, sortie, title] of [
    ['?sortie=3', 3, 'Solar Altar'],
    ['?sortie=altar', 3, 'Solar Altar'],
    ['?sortie=solar-altar', 3, 'Solar Altar'],
    ['?sortie=2', 2, 'Graveyard Lane'],
    ['?sortie=graveyard', 2, 'Graveyard Lane'],
    ['', 1, 'Launch Window Open'],
    ['?sortie=1', 1, 'Launch Window Open'],
    ['?sortie=9', 1, 'Launch Window Open'],
    ['nonsense', 1, 'Launch Window Open'],
  ]) {
    const r = runtime({ search });
    r.boot();
    assert.equal(r.scene.sortieIndex, sortie, search || '(no query)');
    assert.equal(r.overlay().title, title, search || '(no query)');
    assert.equal(r.overlay().button, 'Start Sortie');
  }
});

test('the chain runs First Sortie -> Graveyard -> nine arcade sorties -> Solar Altar -> replay', () => {
  const r = runtime();
  r.boot();
  r.scene.state.score = 1200;

  r.scene.finishGame(true);
  assert.equal(r.overlay().button, 'Continue to Graveyard');
  r.scene.startGame();
  assert.equal(r.scene.sortieIndex, 2);
  r.scene.startGame();
  assert.equal(r.scene.state.mode, 'playing');
  assert.equal(r.scene.state.score, 1200, 'the run score carries into the Graveyard');

  r.scene.state.score = 1900;
  r.scene.finishGame(true);
  assert.equal(r.overlay().button, 'Continue to Split Lane', 'the yard hands over to the first arcade sortie');
  assert.equal(r.overlay().tag, 'Two of Twelve Clear');

  // Graveyard -> nine arcade sorties -> Solar Altar: every hand-off stops on
  // the next briefing, and the run score rides along the whole way.
  const walked = [];
  while (r.scene.campaignEntry().kind !== 'altar') {
    r.scene.startGame();
    const entry = r.scene.campaignEntry();
    walked.push(entry.id);
    assert.equal(r.overlay().title, entry.kind === 'first' ? 'Launch Window Open' : entry.title,
      `${entry.id} stops on its own briefing`);
    assert.equal(r.overlay().button, 'Start Sortie');
    assert.equal(r.scene.state.mode, 'intro', 'nothing starts until the overlay action is pressed');

    r.scene.startGame();
    assert.equal(r.scene.state.mode, 'playing');
    assert.equal(r.scene.state.score, 1900 + (walked.length - 1) * 100, 'the run score carries through the block');
    r.scene.state.score += 100;
    r.scene.finishGame(true);
  }
  assert.deepEqual(walked, [
    'escalation-01',
    'escalation-02',
    'escalation-03',
    'escalation-04-drone-relay',
    'escalation-06-crossing-picket',
    'escalation-05-high-low-battery',
    'escalation-8-shifting-lanes',
    'escalation-7-turret-line',
    'escalation-9-final-proof',
    'solar-altar',
  ], 'the arcade block runs in provisionalOrder between the yard and the finale');

  assert.equal(r.overlay().button, 'Replay the Run');
  assert.equal(r.overlay().tag, 'Campaign Clear');
  r.scene.startGame();
  assert.equal(r.scene.sortieIndex, 1, 'a replay starts the run over');
  assert.equal(r.scene.state.mode, 'intro');
  assert.equal(r.scene.state.score, 0);
});

test('a Solar Altar deep link still replays the whole run from the First Sortie', () => {
  const r = runtime({ search: '?sortie=3' });
  r.boot();
  r.scene.state.mode = 'playing';
  r.scene.state.score = 800;

  r.scene.finishGame(true);
  assert.equal(r.overlay().button, 'Replay the Run');
  r.scene.startGame();
  assert.equal(r.scene.sortieIndex, 1);
  assert.equal(r.scene.state.score, 0);
});

test('dying in the Solar Altar retries the Solar Altar with the run score intact', () => {
  const r = runtime({ search: '?sortie=3' });
  r.boot();
  r.scene.state.mode = 'playing';
  r.scene.carriedScore = 1900;
  r.scene.state.score = 2400;

  r.scene.finishGame(false);
  assert.equal(r.overlay().button, 'Retry Solar Altar');
  assert.match(r.overlay().summary, /Altar Warden/);
  assert.ok(!/garden|fleet|wreckage/i.test(r.overlay().summary), 'a failed run never shows the clear payoff');

  r.scene.startGame();
  assert.equal(r.scene.sortieIndex, 3, 'a retry never falls back to another lane');
  assert.equal(r.scene.state.mode, 'playing');
  assert.equal(r.scene.state.score, 1900, 'the partial Solar Altar score is dropped, the run score is not');
});

// --- The bounded lane ------------------------------------------------------

function laneData() {
  const r = runtime({ search: '?sortie=3' });
  r.boot();
  return r.scene.levelStageData;
}

// Every scheduled line in the lane, announcements from both action shapes.
function laneBanners(data) {
  const banners = [];
  for (const wave of data.waveTimeline || []) {
    for (const action of wave.actions || []) {
      if (action.type === 'announce') {
        banners.push({ time: wave.time, ttl: action.ttl ?? 2.4, kind: action.kind ?? 'notice', text: action.text });
      } else if (action.type === 'queueBossArrival') {
        banners.push({ time: wave.time, ttl: action.ttl ?? 2.4, kind: action.kind ?? 'notice', text: action.announcement });
      }
    }
  }
  return banners;
}

test('the Solar Altar lane is bounded by its waves and ends on the Warden, not a clock', () => {
  const data = laneData();

  assert.equal(data.missionDuration, undefined,
    'there is no timed clear: breaking the Warden is the only way out');
  assert.equal(data.environmentTimeline.length, 0,
    'the altar rings and repair faces are scenery, not hazards');

  const spawnTimes = Array.from(
    data.waveTimeline.filter((wave) => (wave.actions || []).some((action) => action.type === 'spawnEnemies')),
    (wave) => wave.time,
  );
  assert.deepEqual(spawnTimes, [1.5, 5, 9.5, 13, 18.5],
    'the lane stops spawning after 18.5s');

  const queue = data.waveTimeline.find((wave) =>
    (wave.actions || []).some((action) => action.type === 'queueBossArrival'));
  assert.ok(queue, 'the Warden is queued from the timeline');
  assert.ok(queue.time > spawnTimes[spawnTimes.length - 1],
    'the Warden arrives after the last wave, never during it');

  // Bounded even with a pacifist run: every hull the lane ships has to leave
  // it on its own, or a slow drifter would hold the Warden off the field.
  const cruise = { scout: 170, zigzag: 170, turret: 92, drone: 230 };
  const known = ['scout', 'zigzag', 'turret', 'drone'];
  for (const wave of data.waveTimeline) {
    const spawns = (wave.actions || []).filter((action) => action.type === 'spawnEnemies');
    for (const action of spawns) {
      assert.ok(wave.time < queue.time, `wave at ${wave.time}s lands before the Warden queue`);
      for (const enemy of action.enemies) {
        assert.ok(known.includes(enemy.type), `unknown enemy type ${enemy.type}`);
        const speed = enemy.options?.speed ?? cruise[enemy.type];
        const exit = wave.time + (enemy.x + 120) / speed;
        assert.ok(exit <= queue.time + 2,
          `${enemy.type} from ${enemy.x} at ${wave.time}s leaves at ${exit.toFixed(1)}s, before the Warden can be queued for good`);
      }
    }
  }
});

test('the Solar Altar banners teach the tell, land alone and fit the plate', () => {
  const data = laneData();
  const banners = laneBanners(data);

  assert.deepEqual(banners.map((banner) => banner.time), [0.6, 6, 13, 25]);
  assert.match(banners[0].text, /OBJECTIVE \/\/ BREAK THE ALTAR WARDEN/);
  assert.ok(banners.some((banner) => /EMBER CORE/.test(banner.text) && /TELEGRAPHED/.test(banner.text)),
    'the telegraph is taught in the lane before the Warden arrives');

  for (let i = 1; i < banners.length; i += 1) {
    const previous = banners[i - 1];
    assert.ok(previous.time + previous.ttl <= banners[i].time,
      `the ${previous.time}s banner clears before the ${banners[i].time}s one arrives`);
  }
  for (const banner of banners) {
    assert.ok(banner.text.length > 0 && banner.text.length <= 44,
      `"${banner.text}" is ${banner.text.length} characters on the announcement plate`);
    assert.ok(banner.ttl > 0 && banner.ttl <= 3, `ttl ${banner.ttl}s at ${banner.time}s`);
  }
});

test('every HUD and overlay label uses numeric letter spacing so Phaser paints it', () => {
  // Pre-existing trap this feature walked into: Phaser passes a string letter
  // spacing straight to the canvas painter, where '1px' * character count is
  // NaN, the label's text canvas comes out zero wide and the text draws as
  // nothing. The Warden's name plate and this lane's briefing subtitle are
  // both built from those styles, so the whole file is checked.
  const source = readFileSync(join(__dirname, '../public/void-lancer/js/main.js'), 'utf8');
  const stringSpacing = Array.from(source.matchAll(/letterSpacing:\s*'([^']*)'/g), (match) => match[1]);
  assert.deepEqual(stringSpacing, [], 'no style may pass a string letter spacing');

  const numericSpacing = Array.from(source.matchAll(/letterSpacing:\s*([0-9.]+)/g), (match) => Number(match[1]));
  assert.ok(numericSpacing.length >= 6, `the working labels keep numeric spacing (${numericSpacing.length})`);
  assert.ok(numericSpacing.every((value) => Number.isFinite(value) && value >= 0));
});

test('the Solar Altar briefing and debrief keep the objective, the tell and the payoff', () => {
  const r = runtime({ search: '?sortie=3' });
  r.boot();
  const brief = r.scene.sortieBriefing();

  assert.match(brief.summary, /^Objective:/, 'the briefing opens with the objective');
  assert.match(brief.summary, /break the Altar Warden/);
  assert.match(brief.summary, /ember core flares before every radial burst/i);
  assert.ok(brief.summary.length <= 170, `the briefing wraps to three lines (${brief.summary.length} chars)`);
  assert.equal(brief.detail, 'Touch: slide on the left; hold Fire. Keyboard: WASD / arrows, Space / J / K.',
    'the controls line is untouched');
  assert.equal(brief.button, 'Start Sortie');

  r.scene.state.mode = 'playing';
  r.scene.state.score = 2400;
  r.scene.finishGame(true);
  const won = r.overlay();

  assert.match(won.summary, /garden world/);
  assert.match(won.summary, /homes, tools/);
  assert.match(won.summary, /society, not a fleet/);
  assert.equal(won.detail, 'Score: 2400');
  assert.ok(won.summary.length <= 170, `the debrief wraps to three lines (${won.summary.length} chars)`);

  const everything = [brief.summary, won.summary].join(' ').toLowerCase();
  for (const phrase of ['crafting', 'scavenge', 'scavenging', 'loot', 'contract', 'hired', 'allegiance', 'employer', 'paid by']) {
    assert.ok(!everything.includes(phrase), `the Solar Altar copy never invents "${phrase}"`);
  }
});

// --- The Altar Warden boss tell -------------------------------------------

test('the ember core charges in silence, then fires one evenly spaced ring', () => {
  const attack = A.createAttack();
  assert.equal(attack.mode, 'rest');
  assert.equal(A.chargeRatio(attack), 0, 'a quiet core draws no telegraph');

  let chargeStarts = 0;
  let burst = null;
  let frames = 0;
  let sawRisingFlare = false;
  while (!burst && frames < 400) {
    const events = A.updateAttack(attack, 0.1);
    if (events.chargeStart) chargeStarts += 1;
    if (events.burst) burst = events.burst;
    if (attack.mode === 'charging' && A.chargeRatio(attack) > 0) sawRisingFlare = true;
    frames += 1;
  }

  assert.equal(chargeStarts, 1, 'exactly one telegraph per ring');
  assert.ok(sawRisingFlare, 'the flare rises while charging');
  assert.ok(burst, 'the ring eventually fires');
  assert.ok(frames >= 19, 'the rest beat runs before the first charge');

  const angles = Array.from(burst.angles);
  assert.equal(angles.length, 10);
  assert.equal(burst.speed, A.DEFAULTS.bulletSpeed);
  const sorted = [...angles].sort((x, y) => x - y);
  for (let i = 0; i < sorted.length; i += 1) {
    const delta = sorted[(i + 1) % sorted.length] - sorted[i];
    const wrapped = i === sorted.length - 1 ? delta + Math.PI * 2 : delta;
    assert.ok(Math.abs(wrapped - (Math.PI * 2) / sorted.length) < 1e-9,
      'every gap in the ring is the same size, so the whole circle is covered');
  }

  assert.equal(attack.mode, 'rest', 'the core goes quiet again after the ring');
  assert.equal(attack.charge, 0);
  assert.ok(attack.timer > 0, 'and the next charge waits its rest beat');
});

test('phase 2 overdrives: a shorter charge, a wider ring, every gap moved', () => {
  const attack = A.createAttack();
  assert.equal(A.phaseForRatio(attack, 1), 1);
  assert.equal(A.phaseForRatio(attack, 0.49), 2);

  A.setPhase(attack, 2);
  assert.equal(attack.phase, 2);
  assert.ok(A.chargeSecondsFor(attack) < A.DEFAULTS.chargeSeconds, 'the flare is shorter under overdrive');
  assert.ok(A.restSecondsFor(attack) < A.DEFAULTS.restSeconds, 'and the core comes back sooner');
  assert.equal(A.burstCountFor(attack), 14);

  const phase2 = Array.from(A.burstAngles(attack));
  assert.equal(phase2.length, 14);
  assert.ok(Math.abs(phase2[0] - Math.PI / 14) < 1e-9, 'the ring opens on the half-step');

  A.setPhase(attack, 1);
  const phase1 = Array.from(A.burstAngles(attack));
  assert.equal(phase1.length, 10);
  assert.notEqual(phase1[0], phase2[0], 'every gap the pilot learned has moved');
});

test('the Warden hovers, holds the tell and fires the ring from its own core', () => {
  const r = altarScene();
  const scene = r.scene;
  const boss = scene.spawnBoss();

  assert.equal(boss.kind, 'altarWarden');
  assert.equal(boss.radius, A.DEFAULTS.collisionRadius);
  assert.equal(boss.maxHp, A.DEFAULTS.hp);
  assert.equal(r.bossBars[r.bossBars.length - 1], 'show');
  assert.equal(scene.bossBarTitle.value, 'ALTAR WARDEN');
  assert.equal(scene.state.announcements[0].text, 'ALTAR WARDEN // EMBER CORE EXPOSED');
  assert.ok(boss.sprite.depth > DEPTH.player, 'the Warden draws in front of the Lancer');
  assert.ok(boss.sprite.depth > DEPTH.bullets, 'and behind nothing the shots need to clear');

  // The intro slide runs for real: the Warden comes in from off-lane and
  // anchors in front of the altar rings before it starts fighting.
  let guard = 0;
  while (boss.intro && guard < 600) {
    scene.state.time += 0.1;
    scene.updateBoss(0.1);
    guard += 1;
  }
  assert.equal(boss.intro, false, 'the Warden finishes its intro slide');
  assert.ok(Math.abs(boss.x - boss.targetX) < 3, 'and holds its anchor in front of the altar');

  let sawSilentCharge = false;
  let frames = 0;
  while (r.shots.length === 0 && frames < 400) {
    scene.state.time += 0.1;
    scene.updateBoss(0.1);
    if (boss.attack.mode === 'charging' && r.shots.length === 0) sawSilentCharge = true;
    frames += 1;
  }

  assert.equal(sawSilentCharge, true, 'the telegraph runs for a full beat with nothing in the air');
  assert.equal(r.shots.length, 10, 'one ring, ten pellets, from a single charge');
  assert.equal(scene.state.bullets.length, 10);

  const { x: cx, y: cy } = boss;
  const angles = [];
  for (const shot of r.shots) {
    assert.equal(shot[0], 'enemy', 'the ring is enemy fire, so it reads crimson');
    assert.equal(shot[6], 1);
    assert.ok(Math.abs(Math.hypot(shot[1] - cx, shot[2] - cy) - 40) < 1e-6,
      'pellets leave the core, not the hull edge');
    const speed = Math.hypot(shot[3], shot[4]);
    assert.ok(Math.abs(speed - A.DEFAULTS.bulletSpeed) < 1e-6, 'every pellet flies at the ring speed');
    angles.push(Math.atan2(shot[4], shot[3]));
  }
  const sorted = [...angles].sort((x, y) => x - y);
  for (let i = 0; i < sorted.length; i += 1) {
    const delta = sorted[(i + 1) % sorted.length] - sorted[i];
    const wrapped = i === sorted.length - 1 ? delta + Math.PI * 2 : delta;
    assert.ok(Math.abs(wrapped - (Math.PI * 2) / sorted.length) < 1e-9, 'the drawn ring is the fired ring');
  }

  const y1 = boss.y;
  scene.state.time += 0.4;
  scene.updateBoss(0.4);
  assert.notEqual(boss.y, y1, 'the Warden breathes on station instead of drifting down-lane');
  assert.ok(Math.abs(boss.x - boss.targetX) < 3, 'and holds its anchor in front of the altar');
});

test('the drawn tell is chargeRatio: no ring at rest, a rising ring while charging', () => {
  const r = altarScene();
  const scene = r.scene;
  const boss = scene.spawnBoss();
  boss.intro = false;

  scene.renderState();
  assert.equal(boss.telegraph.alpha, 0, 'no flare, no ring');
  const restingGlow = boss.coreGlow.alpha;
  const restingCore = boss.core.alpha;
  assert.ok(boss.core.args[2] <= 12,
    'the overlay is a compact hotspot, so the artwork keeps its own furnace visible');

  boss.attack.mode = 'charging';
  boss.attack.charge = boss.attack.chargeSeconds * 0.5;
  scene.renderState();
  assert.ok(boss.telegraph.alpha > 0.3, 'the ring appears with the charge');
  assert.ok(boss.telegraph.scale > 1, 'and grows as the charge builds');
  assert.ok(boss.coreGlow.alpha > restingGlow, 'the glow outshines its resting value');
  assert.ok(boss.core.alpha > restingCore && boss.core.alpha <= 1, 'the core flares with the charge');
  assert.ok(boss.seams.every((seam) => seam.alpha > 0.3), 'the seams heat up with it');
  assert.ok(boss.telegraph.strokes.length > 0, 'the ring is a stroked shape, readable without colour alone');

  const charged = boss.telegraph.alpha;
  boss.attack.charge = boss.attack.chargeSeconds * 0.95;
  scene.renderState();
  assert.ok(boss.telegraph.alpha > charged, 'the tell keeps rising right up to the burst');
  assert.ok(boss.hitFlash >= 0 && boss.corePulse >= 0, 'the hit pulse still decays');
});

// --- Runtime art integration ----------------------------------------------

// The two frames the pack ships, read straight from their WebP headers so a
// re-export cannot quietly change the lane's aspect or the hull's canvas.
function webpSize(file) {
  const bytes = readFileSync(join(__dirname, '../public/void-lancer/assets/void_lancer_pack', file));
  assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF', `${file} is a RIFF container`);
  assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP', `${file} is a WebP`);
  const chunk = bytes.subarray(12, 16).toString('ascii');
  if (chunk === 'VP8 ') {
    // Lossy: frame tag, sync code, then the 14-bit width and height.
    return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff, bytes: bytes.length };
  }
  if (chunk === 'VP8L') {
    const bits = bytes.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1, bytes: bytes.length };
  }
  if (chunk === 'VP8X') {
    // Extended (alpha): the canvas size is 24-bit and one less than the real.
    return { width: bytes.readUIntLE(24, 3) + 1, height: bytes.readUIntLE(27, 3) + 1, bytes: bytes.length };
  }
  throw new Error(`${file} has an unexpected WebP chunk ${chunk}`);
}

test('both Solar Altar frames ship in the pack and are the ones the scene loads', () => {
  const lane = webpSize('bg_altar_lane_1.webp');
  assert.deepEqual([lane.width, lane.height], [1008, 567],
    'the lane frame is the non-tiling 16:9 backdrop');
  assert.ok(lane.bytes > 20 * 1024, 'the lane frame carries real pixels');

  const warden = webpSize('altar_warden_1.webp');
  assert.equal(warden.width, warden.height,
    'the hull is a square canvas with the furnace eye centred, so setDisplaySize keeps its aspect');
  assert.ok(warden.bytes > 20 * 1024, 'the hull carries real pixels');

  const source = readFileSync(join(__dirname, '../public/void-lancer/js/main.js'), 'utf8');
  assert.match(source, /this\.load\.image\('bgAltarLane', 'void_lancer_pack\/bg_altar_lane_1\.webp'\)/,
    'the lane frame goes through the existing preload hook');
  assert.match(source, /this\.load\.image\('altarWarden', 'void_lancer_pack\/altar_warden_1\.webp'\)/,
    'the hull goes through the existing preload hook');
  assert.equal(A.DEFAULTS.displaySize, 176, 'the art lands at the size the fight was tuned for');
  assert.equal(A.DEFAULTS.collisionRadius, 72, 'and the hitbox is untouched');
});

test('the lane frame replaces the procedural dressing instead of stacking on it', () => {
  const r = runtime({ search: '?sortie=3' });
  r.scene.textures = { exists: (key) => key === 'bgAltarLane' || key === 'altarWarden' };
  r.boot();
  const altar = r.scene.state.altar;

  assert.ok(altar.backdrop, 'the illustration frame is the lane');
  assert.equal(altar.backdrop.image.kind, 'image');
  assert.equal(altar.backdrop.image.depth, DEPTH.altarScenery - 0.5,
    'it sits behind the Lancer and its shots');
  assert.equal(altar.rings, null, 'no procedural rings over the illustration');
  assert.equal(altar.glows.length, 0, 'no ember pools over the illustration');
  assert.equal(altar.faces.length, 0, 'no repair faces over the illustration');
  assert.equal(r.scene.altarObjects.length, 1, 'the frame is the only thing the lane adds');

  const half = webpSize('bg_altar_lane_1.webp').width / 2;
  const seen = [];
  for (const time of [0, 7.5, 15, 22.5, 30, 45, 90]) {
    r.scene.state.time = time;
    r.scene.updateAltar(0.1);
    seen.push(altar.backdrop.image.x);
  }
  for (const x of seen) {
    assert.ok(x - half <= 0 && x + half >= GAME_WIDTH,
      `the frame still covers the whole playfield at x=${x}`);
  }
  assert.ok(seen[0] > seen[seen.length - 1], 'the frame pans down-lane');
  assert.equal(seen[seen.length - 1], seen[seen.length - 2], 'then parks instead of repeating');
});

test('without the illustration frame the lane falls back to the procedural dressing', () => {
  const r = runtime({ search: '?sortie=3' });
  r.boot(); // no texture manager at all, exactly like a frame that is not shipped
  const altar = r.scene.state.altar;

  assert.equal(altar.backdrop, null);
  assert.ok(altar.rings, 'the rings come back');
  assert.equal(altar.glows.length, 3, 'and the ember pools');
  assert.equal(altar.faces.length, 3, 'and the repair faces');
  assert.equal(r.scene.altarObjects.length, 7, 'dressing only, never both layers at once');
});

test('the art hook swaps in an altar-warden sprite without moving the core', () => {
  const withSprite = altarScene();
  withSprite.scene.textures = { exists: (key) => key === 'altarWarden' };
  const swapped = withSprite.scene.buildWardenSprite(120, 240);

  assert.equal(swapped.hull.kind, 'image', 'the loaded texture becomes the hull');
  assert.equal(swapped.hull.displayWidth, A.DEFAULTS.displaySize);
  assert.equal(swapped.hull.displayHeight, A.DEFAULTS.displaySize);
  assert.equal(swapped.seams.length, 0, 'the artwork brings its own seams');
  const kinds = swapped.container.children.map((child) => child.kind);
  assert.ok(kinds.includes('circle'), 'the additive ember core stays on top');
  assert.equal(swapped.container.depth, DEPTH.boss);

  const procedural = altarScene();
  const fallback = procedural.scene.buildWardenSprite(120, 240);
  assert.equal(fallback.hull.kind, 'container', 'without the texture the plates are procedural');
  assert.equal(fallback.seams.length, 12, 'one crimson seam between every plate pair');
  assert.ok(fallback.hull.children.length > 12, 'the hull is a stack of readable parts, not one block');
});

// --- Clear, reset and the garden-world payoff ------------------------------

test('breaking the Warden clears the run with the garden-world payoff', () => {
  const r = altarScene();
  const scene = r.scene;
  const boss = scene.spawnBoss();
  boss.intro = false;
  boss.hp = 0;

  scene.updateBoss(0.1);

  assert.equal(scene.state.mode, 'victory');
  assert.equal(scene.state.boss, null);
  assert.equal(boss.active, false);
  assert.equal(boss.sprite.destroyed, true, 'the hull leaves the field with the kill');
  assert.equal(r.bossBars[r.bossBars.length - 1], 'hide');
  assert.equal(scene.state.score, 3500, 'the Warden bounty lands on the run score');
  assert.ok(r.sounds.includes('bossExplosion'));

  const won = r.overlay();
  assert.equal(won.title, 'Solar Altar Secured');
  assert.equal(won.button, 'Replay the Run');
  assert.equal(won.tag, 'Campaign Clear');
  assert.equal(won.accent, 16766554, 'the debrief closes on gold');
});

test('resetting clears the altar scenery and the next run starts it cold', () => {
  const r = altarScene();
  const scene = r.scene;
  const altar = scene.state.altar;

  assert.ok(altar, 'the briefing already stands in the altar lane');
  assert.ok(altar.rings.depth > DEPTH.background && altar.rings.depth < DEPTH.player,
    'the rings sit behind the Lancer and its shots');
  assert.ok(altar.faces.every((face) => face.container.depth < DEPTH.bullets),
    'repair faces never draw over the fight');
  assert.equal(scene.state.powerUps.length, 0, 'the altar scenery spawns no pickups');
  assert.equal(scene.state.enemies.length, 0, 'and no targets');

  const beforeX = altar.faces.map((face) => face.x);
  scene.state.time = 5;
  scene.updateAltar(1);
  assert.ok(altar.rings.rotation > 0, 'the defense rings turn');
  assert.ok(altar.faces.every((face, index) => face.x < beforeX[index]), 'and the repair faces drift down-lane');
  assert.equal(r.shots.length, 0, 'updating the altar fires nothing');

  scene.destroyDynamicObjects();
  assert.equal(scene.state.altar, null);
  assert.equal(scene.altarObjects.length, 0);
  assert.equal(altar.rings.destroyed, true);
  assert.ok(altar.faces.every((face) => face.container.destroyed));

  scene.state = emptyState({ mode: 'playing' });
  scene.setupAltarSortie();
  const fresh = scene.state.altar;
  assert.notEqual(fresh.rings, altar.rings, 'a retry rebuilds the lane');
  assert.equal(fresh.rings.rotation, 0, 'and starts with a cold altar');
  assert.ok(fresh.faces.every((face) => face.x > 960), 'repair faces start off-screen right');

  scene.state = emptyState({ mode: 'playing', altar: null });
  scene.state.graveyard = { detection: { alarm: true } };
  scene.destroyDynamicObjects();
  assert.equal(scene.state.graveyard, null, 'the teardown path clears whichever lane was loaded');
});

// Drive update() with only the scenery and the player stubbed: waves, the
// Warden queue and the kill stay live, which is where the stage transition is.
function prepareAltarLoop(scene) {
  scene.bgStarfield = { tilePositionX: 0, tilePositionY: 0 };
  scene.bgNebula = { tilePositionX: 0, tilePositionY: 0 };
  scene.bgMegastructure = { tilePositionX: 0, tilePositionY: 0 };
  scene.bgForeground = { tilePositionX: 0, tilePositionY: 0 };
  for (const step of ['updateAtmosphereLayers', 'updateHazardLights', 'updateForegroundProps',
    'updateStageBackdropModules', 'updateEnvironmentPanels', 'updateOverlayMotion', 'updateHudEffects',
    'updatePlayer', 'updateBullets', 'updatePowerUps', 'updateCollisions', 'updateFx', 'renderState']) {
    scene[step] = () => {};
  }
}

test('the Solar Altar lane runs to the Warden and clears on the kill', () => {
  const r = altarScene();
  const scene = r.scene;
  prepareAltarLoop(scene);

  // Real wave spawns: the lane has to reach the Warden on its own schedule.
  const spawned = [];
  const spawnEnemy = Object.getPrototypeOf(scene).spawnEnemy;
  scene.spawnEnemy = (...args) => {
    spawned.push(args);
    return spawnEnemy.apply(scene, args);
  };

  const banners = [];
  let current = null;
  let wardenSeen = false;
  for (let i = 0; i < 700 && scene.state.mode === 'playing'; i += 1) {
    scene.time.now += 100;
    scene.update(0, 100);
    const banner = scene.state.announcements[0]?.text ?? null;
    if (banner && banner !== current) {
      current = banner;
      banners.push(banner);
    }
    if (scene.state.boss?.kind === 'altarWarden') {
      wardenSeen = true;
      // The pilot lands the killing volley the moment the Warden is in range.
      scene.state.boss.intro = false;
      scene.state.boss.x = scene.state.boss.targetX;
      scene.state.boss.hp = 0;
    }
  }

  assert.equal(wardenSeen, true, 'the lane reaches the Warden');
  assert.equal(scene.state.mode, 'victory');
  assert.ok(scene.state.time > 25, `the Warden queued at 25s and the run ended at ${scene.state.time.toFixed(1)}s`);
  assert.ok(scene.state.time < 35, 'the bounded lane plus the kill stays inside 35 seconds');
  assert.deepEqual(banners, [
    'OBJECTIVE // BREAK THE ALTAR WARDEN',
    'EMBER CORE // EVERY BURST IS TELEGRAPHED',
    'ALTAR LINE // HOLD THE APPROACH',
    'WARDEN INBOUND // BREAK THE CORE',
    'ALTAR WARDEN // EMBER CORE EXPOSED',
    'WARDEN CORE // OVERDRIVE',
  ], 'the lane says what it scheduled, in order, and the core overdrives on the killing blow');
  assert.equal(r.overlay().button, 'Replay the Run');
  assert.equal(spawned.length, 16, 'every wave in the lane spawned once');
});
