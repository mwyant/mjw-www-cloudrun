// Campaign wiring for the nine arcade sorties: routing identity (?sortie=...)
// against display order (the twelve-stage chain), progression through every
// arcade stage, timed clears, retry/replay, and the HUD counter.
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
  runInNewContext(
    'globalThis.__exported = { campaign: CAMPAIGN, total: CAMPAIGN_TOTAL, arcadeData: ARCADE_STAGE_DATA,'
    + ' arcadeSortie: ARCADE_SORTIE, label: stageLabel, resolve: resolveSortieEntry, countWord: countWord,'
    + ' controls: "Touch: slide on the left; hold Fire. Keyboard: WASD / arrows, Space / J / K." };',
    sandbox,
  );
  return sandbox;
}

const shared = loadModules();
const CAMPAIGN = shared.__exported.campaign;
const TOTAL = shared.__exported.total;
const ARCADE_DATA = shared.__exported.arcadeData;
const ARCADE_SORTIE = shared.__exported.arcadeSortie;
const stageLabel = shared.__exported.label;
const resolveEntry = shared.__exported.resolve;
const countWord = shared.__exported.countWord;
const CONTROLS_LINE = shared.__exported.controls;

const ARCADE_ENTRIES = CAMPAIGN.filter((entry) => entry.kind === 'arcade');

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
    fillRect() { return node; },
    strokeRect() { return node; },
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

  scene.add = makeAdd();
  scene.tweens = { killTweensOf() {}, add() { return {}; } };
  scene.actionState = { clear() {}, isHeld: () => false, requestStart() {}, onClear: () => () => {} };
  scene.touchControls = null;
  scene.time = { now: 0 };
  scene.cameras = { main: { flash() {}, shake() {} } };
  scene.cache = { json: { get: () => null } };
  scene.playerSprite = { setPosition() {}, destroy() {} };
  scene.bossBarFill = { width: 0, x: 0 };
  scene.bossBarGlow = { alpha: 0 };
  scene.bossBarTitle = { setText() { return this; } };
  scene.showOverlay = (title, summary, detail, button, options = {}) => {
    overlays.push({ title, summary, detail, button, ...options });
  };
  scene.hideOverlay = () => {};
  scene.startMusicPlayback = () => {};
  scene.updateAnnouncementDisplay = () => {};
  scene.showBossBar = () => {};
  scene.hideBossBar = () => {};
  scene.playSound = (name) => sounds.push(name);
  scene.spawnEnemy = (...args) => { spawned.push(args); return { sprite: null }; };
  scene.setupBackground = () => {};
  scene.setupHud = () => {};
  scene.setupOverlay = () => {};
  scene.setupInput = () => {};
  scene.setupAudioControls = () => {};
  // The HUD is recorded rather than drawn, so syncHud can run for real.
  scene.scoreText = makeNode('text', ['']);
  scene.livesText = makeNode('text', ['']);
  scene.weaponText = makeNode('text', ['']);
  scene.weaponTag = makeNode('text', ['']);
  scene.stageText = makeNode('text', ['']);
  scene.stageTag = makeNode('text', ['']);
  scene.livesPips = { getChildren: () => [] };
  scene.spawnScoreBurst = () => {};
  scene.pulseText = () => {};
  scene.showWeaponUpgradePulse = () => {};

  // resetGame runs for real, so every route builds its own stage data and
  // scenery plan the way the shipping scene does.
  const realReset = scene.resetGame.bind(scene);
  scene.resetGame = () => {
    resets.push({ sortie: scene.sortieIndex, arcade: scene.arcadeStageId, carried: scene.carriedScore });
    realReset();
  };

  return {
    scene,
    sandbox,
    overlays,
    resets,
    sounds,
    spawned,
    overlay: () => overlays[overlays.length - 1],
    boot: () => scene.create(),
  };
}

// Drive update() without the scenery: only the mission clock, the wave queue
// and the banner queue stay live, which is where the timed clear sits.
function prepareLaneLoop(scene) {
  scene.bgStarfield = { tilePositionX: 0, tilePositionY: 0 };
  scene.bgNebula = { tilePositionX: 0, tilePositionY: 0 };
  scene.bgMegastructure = { tilePositionX: 0, tilePositionY: 0 };
  scene.bgForeground = { tilePositionX: 0, tilePositionY: 0 };
  for (const step of ['updateAtmosphereLayers', 'updateHazardLights', 'updateForegroundProps',
    'updateStageBackdropModules', 'updateEnvironmentPanels', 'updateOverlayMotion', 'updateHudEffects',
    'updatePlayer', 'updateEnvironmentTimeline', 'updateEnemies', 'updateBoss',
    'updateBullets', 'updatePowerUps', 'updateCollisions', 'updateFx', 'renderState']) {
    scene[step] = () => {};
  }
}

// --- Chain shape ------------------------------------------------------------

test('the campaign is twelve stages and routing identity never reuses a display slot', () => {
  assert.equal(TOTAL, 12, 'First Sortie + Graveyard + nine arcade sorties + finale');
  assert.equal(ARCADE_SORTIE, 0, 'an arcade route claims no authored sortie index');
  // Array.from keeps each result in this realm: arrays built inside the VM
  // sandbox carry that realm's Array prototype and deepStrictEqual rejects them.
  assert.deepEqual(Array.from(CAMPAIGN, (entry) => entry.displayIndex), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    'display slots are dense, unique and in chain order');
  assert.deepEqual(Array.from(CAMPAIGN, (entry) => entry.kind),
    ['first', 'graveyard', 'arcade', 'arcade', 'arcade', 'arcade', 'arcade', 'arcade', 'arcade', 'arcade', 'arcade', 'altar'],
    'the arcade block sits between the Graveyard and the finale');

  const ids = Array.from(CAMPAIGN, (entry) => entry.id);
  assert.equal(new Set(ids).size, ids.length, 'no two entries share a route id');

  // The two identities: the altar routes on 3 but displays on 12, and the
  // arcade block routes on stage ids while displaying on 3-11.
  const altar = CAMPAIGN[CAMPAIGN.length - 1];
  assert.equal(altar.sortieIndex, 3, '?sortie=3 still routes to the finale');
  assert.equal(altar.displayIndex, 12, 'while the finale displays as the twelfth stage');
  assert.deepEqual(Array.from(ARCADE_ENTRIES, (entry) => entry.sortieIndex), Array(9).fill(ARCADE_SORTIE));
  assert.deepEqual(Array.from(ARCADE_ENTRIES, (entry) => entry.displayIndex), [3, 4, 5, 6, 7, 8, 9, 10, 11]);
  assert.deepEqual(Array.from(ARCADE_ENTRIES, (entry) => entry.id), Array.from(ARCADE_DATA.provisionalOrder),
    'display order is the data file provisionalOrder, not the key order');

  // Slot collisions: a stage id that parsed as a legacy alias would take that
  // lane away from its public URL.
  const aliases = new Set(['1', '2', '3', 'first', 'graveyard', 'altar', 'solar', 'solar-altar', '']);
  for (const entry of ARCADE_ENTRIES) {
    assert.equal(aliases.has(entry.id), false, `${entry.id} collides with a public sortie alias`);
    assert.equal(aliases.has(entry.id.toLowerCase()), false, `${entry.id} collides once lower cased`);
  }
});

test('index.html loads the arcade stage data before the game', () => {
  const html = readFileSync(join(__dirname, '../public/void-lancer/index.html'), 'utf8');
  const dataTag = html.indexOf('./js/arcade_stage_data.js');
  const mainTag = html.indexOf('./js/main.js');
  assert.ok(dataTag !== -1, 'the arcade stage data is on the page');
  assert.ok(mainTag !== -1, 'the game is on the page');
  assert.ok(dataTag < mainTag, 'the campaign is built after the data that fills it');
});

// --- URL compatibility ------------------------------------------------------

test('the legacy ?sortie aliases keep their lanes and their display slots', () => {
  for (const [search, sortieIndex, arcadeStageId, title, displayIndex] of [
    ['', 1, null, 'Launch Window Open', 1],
    ['?sortie=1', 1, null, 'Launch Window Open', 1],
    ['?sortie=9', 1, null, 'Launch Window Open', 1],
    ['?sortie=%20', 1, null, 'Launch Window Open', 1],
    ['nonsense', 1, null, 'Launch Window Open', 1],
    ['?sortie=2', 2, null, 'Graveyard Lane', 2],
    ['?sortie=graveyard', 2, null, 'Graveyard Lane', 2],
    ['?sortie=3', 3, null, 'Solar Altar', 12],
    ['?sortie=altar', 3, null, 'Solar Altar', 12],
    ['?sortie=solar', 3, null, 'Solar Altar', 12],
    ['?sortie=solar-altar', 3, null, 'Solar Altar', 12],
  ]) {
    const label = `${String(displayIndex).padStart(2, '0')} / 12`;
    const r = runtime({ search });
    r.boot();
    assert.equal(r.scene.sortieIndex, sortieIndex, `${search || '(no query)'} routes to ${sortieIndex}`);
    assert.equal(r.scene.arcadeStageId, arcadeStageId, `${search || '(no query)'} carries no stage id`);
    assert.equal(r.overlay().title, title, `${search || '(no query)'} opens its own briefing`);
    assert.equal(r.overlay().button, 'Start Sortie');
    assert.equal(r.scene.campaignEntry().displayIndex, displayIndex, `${search || '(no query)'} displays on ${displayIndex}`);
    r.scene.syncHud();
    assert.equal(r.scene.stageText.text, label, `${search || '(no query)'} reads ${label} on the HUD`);
  }
});

test('every arcade stage has a stable practice URL by id', () => {
  for (const entry of ARCADE_ENTRIES) {
    const r = runtime({ search: `?sortie=${entry.id}` });
    r.boot();
    assert.equal(r.scene.sortieIndex, ARCADE_SORTIE, `${entry.id} is not an authored sortie index`);
    assert.equal(r.scene.arcadeStageId, entry.id, `${entry.id} routes by its own id`);
    assert.equal(r.overlay().title, ARCADE_DATA.stages[entry.id].title, `${entry.id} opens its own briefing`);
    assert.equal(r.overlay().detail, CONTROLS_LINE, 'the controls line is the shared one');
    assert.equal(r.scene.getLevelStageData().id, entry.id, 'the stage record is the runtime data');

    // The same link resolved without a page load: ids are case-insensitive in
    // the way the parser normalises every other value.
    assert.equal(resolveEntry(`?sortie=${entry.id.toUpperCase()}`).id, entry.id, `${entry.id} resolves upper case`);
    r.scene.syncHud();
    assert.equal(r.scene.stageText.text, `${String(entry.displayIndex).padStart(2, '0')} / 12`);
  }

  // An id-shaped value that is not a stage stays on the First Sortie.
  const r = runtime({ search: '?sortie=escalation-99' });
  r.boot();
  assert.equal(r.scene.sortieIndex, 1, 'an unknown stage id falls back to the First Sortie');
  assert.equal(r.overlay().title, 'Launch Window Open');
});

// --- Progression ------------------------------------------------------------

test('the chain walks First Sortie -> Graveyard -> nine arcade sorties -> Solar Altar -> replay', () => {
  const r = runtime();
  r.boot();
  r.scene.state.score = 1200;

  const walk = [];
  for (const entry of CAMPAIGN) {
    const current = r.scene.campaignEntry();
    assert.deepEqual([current.id, current.displayIndex], [entry.id, entry.displayIndex],
      `the live route is ${entry.id} at slot ${entry.displayIndex}`);
    assert.equal(r.overlay().title, entry.kind === 'first' ? 'Launch Window Open' : entry.kind === 'altar' ? 'Solar Altar' : entry.title,
      `${entry.id} opens its own briefing`);
    assert.equal(r.scene.stageText.text, `${String(entry.displayIndex).padStart(2, '0')} / 12`,
      `the counter reads ${entry.displayIndex} of 12 before the run`);

    r.scene.state.mode = 'playing';
    r.scene.state.score += 100;
    r.scene.finishGame(true);
    walk.push({ id: entry.id, button: r.overlay().button, tag: r.overlay().tag });
    r.scene.startGame(); // the next briefing, never the next lane mid-overlay
    assert.equal(r.scene.state.mode, 'intro', `${entry.id} stops on its successor's briefing`);
  }

  assert.deepEqual(walk.map((step) => step.button), [
    'Continue to Graveyard',
    'Continue to Split Lane',
    'Continue to The Crossing',
    'Continue to Gun Line',
    'Continue to Relay Run',
    'Continue to Crossing Picket',
    'Continue to High-Low Battery',
    'Continue to Shifting Lanes',
    'Continue to Turret Line',
    'Continue to Final Proof',
    'Continue to Solar Altar', // the last arcade sortie hands over to the finale
    'Replay the Run',
  ], 'each debrief offers the entry that follows it, and the finale offers the replay');

  assert.equal(walk[10].tag, 'Eleven of Twelve Clear', 'the last arcade slot still reads as a step, not the finish');
  assert.equal(walk[11].tag, 'Campaign Clear');
  assert.equal(walk[1].tag, 'Two of Twelve Clear', 'the Graveyard debrief counts twelve, not three');
  assert.equal(walk[2].tag, 'Three of Twelve Clear');

  // Replay: the run starts over at slot 1 with the score reset.
  assert.equal(r.scene.campaignEntry().displayIndex, 1, 'a replay starts the run over');
  assert.equal(r.overlay().title, 'Launch Window Open');
  assert.equal(r.scene.state.score, 0, 'the replay drops the carried run score');
  assert.equal(r.resets.length, 13, 'one reset at boot plus one per entry walked');

  // Score carried through every hand-off above, including into the finale.
  assert.equal(r.scene.carriedScore, 0, 'only the replay resets the carried score');
});

test('score carries into the first arcade sortie and the finale keeps it', () => {
  const r = runtime({ search: '?sortie=2' });
  r.boot();
  r.scene.carriedScore = 1900;
  r.scene.state.score = 1900;
  r.scene.state.mode = 'playing';

  r.scene.finishGame(true);
  assert.equal(r.overlay().button, `Continue to ${ARCADE_ENTRIES[0].title}`);
  r.scene.startGame();
  assert.equal(r.scene.arcadeStageId, ARCADE_ENTRIES[0].id, 'the Graveyard hands over to the first arcade sortie');
  assert.equal(r.overlay().title, ARCADE_ENTRIES[0].title);
  assert.equal(r.scene.state.score, 1900, 'the run score carries into the arcade block');
  assert.equal(r.scene.carriedScore, 1900, 'only a replay back to slot 1 zeroes it');
});

test('the MK III loadout carries across arcade lanes but not into the Solar Altar finale', () => {
  const r = runtime();
  r.boot();
  r.scene.enterSortie(ARCADE_ENTRIES[0]);
  r.scene.state.player.weaponLevel = 3;

  r.scene.enterSortie(ARCADE_ENTRIES[1]);
  assert.equal(r.scene.state.player.weaponLevel, 3, 'later arcade armor does not revoke the earned counterweapon');

  r.scene.enterSortie(CAMPAIGN[CAMPAIGN.length - 1]);
  assert.equal(r.scene.sortieIndex, 3, 'the legacy finale route remains unchanged');
  assert.equal(r.scene.state.player.weaponLevel, 1, 'the arcade weapon does not alter the story finale loadout');
});

// --- Timed clears -----------------------------------------------------------

test('every arcade stage clears on its missionDuration with its waves fired', () => {
  const issues = [];
  for (const entry of ARCADE_ENTRIES) {
    const stage = ARCADE_DATA.stages[entry.id];
    const r = runtime({ search: `?sortie=${entry.id}` });
    r.boot();
    const scene = r.scene;
    scene.state.mode = 'playing';
    prepareLaneLoop(scene);

    let frames = 0;
    for (; frames < 600 && scene.state.mode === 'playing'; frames += 1) {
      scene.time.now += 100;
      scene.update(0, 100);
    }

    if (scene.state.mode !== 'victory') issues.push(`${entry.id}: never cleared`);
    if (scene.state.time > stage.missionDuration + 0.11) {
      issues.push(`${entry.id}: cleared at ${scene.state.time}s, past ${stage.missionDuration}s`);
    }
    if (scene.state.time < stage.missionDuration) {
      issues.push(`${entry.id}: cleared early at ${scene.state.time}s`);
    }
    if (scene.state.waves.some((wave) => !wave.done)) issues.push(`${entry.id}: a wave never fired`);
    if (scene.state.boss || scene.state.bossQueued) issues.push(`${entry.id}: the clock lane queued a boss`);

    const next = CAMPAIGN[entry.displayIndex]; // displayIndex is 1-based, so this is the successor
    const expected = next.kind === 'altar' ? 'Continue to Solar Altar' : `Continue to ${next.title}`;
    if (r.overlay().button !== expected) issues.push(`${entry.id}: cleared to "${r.overlay().button}"`);
    const expectedTag = `${countWord(entry.displayIndex)} of ${countWord(TOTAL)} Clear`;
    if (r.overlay().tag !== expectedTag) issues.push(`${entry.id}: tag ${r.overlay().tag}, expected ${expectedTag}`);
  }
  assert.deepEqual(issues, []);
});

test('an arcade stage that loses hull time does not clear on the clock that frame', () => {
  const entry = ARCADE_ENTRIES[0];
  const stage = ARCADE_DATA.stages[entry.id];
  const r = runtime({ search: `?sortie=${entry.id}` });
  r.boot();
  const scene = r.scene;
  scene.state.mode = 'playing';
  prepareLaneLoop(scene);
  scene.state.time = stage.missionDuration; // the clear would land this frame
  scene.updateCollisions = () => scene.finishGame(false); // and so does the hull

  scene.time.now += 100;
  scene.update(0, 100);

  assert.equal(scene.state.mode, 'gameover', 'the loss stands; the timer must not override it');
  assert.equal(r.overlay().button, `Retry ${entry.title}`);
});

// --- Retry and replay -------------------------------------------------------

test('an arcade loss retries the same stage with the run score intact', () => {
  const entry = ARCADE_ENTRIES[3];
  const r = runtime({ search: `?sortie=${entry.id}` });
  r.boot();
  r.scene.carriedScore = 1900;
  r.scene.state.score = 2400;
  r.scene.state.mode = 'playing';

  r.scene.finishGame(false);
  assert.equal(r.overlay().button, `Retry ${entry.title}`);
  assert.equal(r.overlay().tag, 'Mission Failed');
  assert.ok(!/secured|continues|next stop/i.test(r.overlay().summary), 'a loss never reads as progress');
  assert.equal(r.overlay().detail, 'Score: 2400');

  r.scene.startGame();
  assert.equal(r.scene.arcadeStageId, entry.id, 'a retry never falls back to another lane');
  assert.equal(r.scene.state.mode, 'playing');
  assert.equal(r.scene.state.score, 1900, 'the partial score is dropped, the run score is not');
  assert.equal(r.scene.campaignEntry().displayIndex, entry.displayIndex, 'the retry keeps its display slot');
});

// --- Briefings --------------------------------------------------------------

test('arcade briefings are concise, objective-first and readable', () => {
  const issues = [];
  for (const entry of ARCADE_ENTRIES) {
    const stage = ARCADE_DATA.stages[entry.id];
    const r = runtime({ search: `?sortie=${entry.id}` });
    r.boot();
    const brief = r.scene.sortieBriefing();
    const summary = brief.summary;

    if (!summary.startsWith('Objective:')) issues.push(`${entry.id}: briefing does not open with the objective`);
    if (summary.length > 170) issues.push(`${entry.id}: briefing is ${summary.length} characters (wraps past three lines)`);
    if (summary.includes('Touch:')) issues.push(`${entry.id}: the briefing repeats the controls line`);
    if (summary === summary.toUpperCase()) issues.push(`${entry.id}: briefing is unreadable all caps`);
    if (summary !== summary.charAt(0).toUpperCase() + summary.slice(1)) issues.push(`${entry.id}: briefing is not sentence case`);
    if (!summary.includes(`Survive ${stage.missionDuration} seconds`)) {
      issues.push(`${entry.id}: the briefing never says the lane clears on the clock`);
    }
    if (brief.detail !== CONTROLS_LINE) issues.push(`${entry.id}: the controls line changed`);
    if (brief.button !== 'Start Sortie' || brief.tag !== 'Mission Briefing') issues.push(`${entry.id}: briefing chrome changed`);
    if (brief.title !== entry.title) issues.push(`${entry.id}: the briefing is titled for another stage`);
    if (brief.subtitle !== `VOID LANCER // ${entry.title.toUpperCase()} SORTIE`) issues.push(`${entry.id}: subtitle changed`);

    r.scene.state.mode = 'playing';
    r.scene.state.score = 500;
    r.scene.finishGame(true);
    const won = r.overlay();
    if (won.title !== `${entry.title} Secured`) issues.push(`${entry.id}: debrief title ${won.title}`);
    if (won.summary.length > 170) issues.push(`${entry.id}: debrief is ${won.summary.length} characters`);
    if (!won.summary.includes(won.button.replace('Continue to ', ''))) {
      issues.push(`${entry.id}: the debrief never names the next stop`);
    }
    if (won.subtitle !== `${String(entry.displayIndex).padStart(2, '0')} / 12 secured`) {
      issues.push(`${entry.id}: the debrief subtitle drops the progress read`);
    }
  }
  assert.deepEqual(issues, []);
});

// --- HUD order --------------------------------------------------------------

test('the HUD counts display order across the whole chain', () => {
  const r = runtime();
  r.boot();
  const seen = [];
  for (const entry of CAMPAIGN) {
    r.scene.applyRoute(entry);
    r.scene.state.boss = null;
    r.scene.state.bossQueued = false;
    r.scene.syncHud();
    seen.push({
      label: r.scene.stageText.text,
      tag: r.scene.stageTag.text,
      sortie: r.scene.sortieIndex,
      arcade: r.scene.arcadeStageId,
    });
  }

  assert.deepEqual(seen.map((row) => row.label),
    ['01 / 12', '02 / 12', '03 / 12', '04 / 12', '05 / 12', '06 / 12', '07 / 12', '08 / 12', '09 / 12', '10 / 12', '11 / 12', '12 / 12'],
    'the counter follows display order, not the routing index');
  assert.deepEqual(seen.map((row) => row.tag), [
    'OPENING LANE',
    'GRAVEYARD LANE',
    'SPLIT LANE',
    'THE CROSSING',
    'GUN LINE',
    'RELAY RUN',
    'CROSSING PICKET',
    'HIGH-LOW BATTERY',
    'SHIFTING LANES',
    'TURRET LINE',
    'FINAL PROOF',
    'ALTAR LANE',
  ], 'an arcade lane shows the stage it is live on');
  assert.equal(seen[11].sortie, 3, 'the finale still routes as sortie 3');
  assert.equal(seen[11].arcade, null);
  assert.equal(stageLabel(CAMPAIGN[11]), '12 / 12');
});
