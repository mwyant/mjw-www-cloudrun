const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const DEPTH = {
  background: 0,
  backgroundFx: 10,
  atmosphereFar: 14,
  graveyardScenery: 16,
  altarScenery: 16,
  altarRings: 17,
  atmosphereMid: 18,
  foregroundProps: 20,
  graveyardBeam: 22,
  graveyardBoat: 24,
  player: 30,
  entities: 40,
  bullets: 50,
  particles: 60,
  hud: 70,
  graveyardAlert: 74,
  overlay: 80,
  boss: 90,
};

const COLORS = {
  gold: 0xffd65a,
  orange: 0xffa25a,
  cyan: 0x7ae7ff,
  red: 0xff697b,
  mint: 0x90ffc9,
  violet: 0x9fa8ff,
  white: 0xffffff,
  panel: 0x08111f,
};

const PROJECTILE_COLORS = {
  player: { body: 0x28afff, highlight: 0xc5efff, outline: 0x062944 },
  enemy: { body: 0xe92350, highlight: 0xffa4b4, outline: 0x430814 },
};

const SOUND_STORAGE_KEY = 'voidLancerSoundEnabled';
const MUSIC_TRACK_URL = './assets/music/lyria_rtype_test_loopable.mp3';

function getMusicUrl() {
  let path = window.location.pathname;
  if (!path.endsWith('/')) path += '/';
  return window.location.origin + path + 'assets/music/lyria_rtype_test_loopable.mp3';
}

const SOUND_LIBRARY = {
  playerFire: { layers: [{ type: 'triangle', startFrequency: 920, endFrequency: 640, gain: 0.22 }, { type: 'sine', startFrequency: 1840, endFrequency: 1220, gain: 0.06 }], duration: 0.09, attack: 0.002, release: 0.045, volume: 0.26 },
  enemyFire: { layers: [{ type: 'square', startFrequency: 250, endFrequency: 172, gain: 0.16 }, { type: 'triangle', startFrequency: 128, endFrequency: 96, gain: 0.05 }], duration: 0.095, attack: 0.002, release: 0.05, volume: 0.2 },
  pickup: { layers: [{ type: 'sine', startFrequency: 680, endFrequency: 1320, gain: 0.18 }, { type: 'triangle', startFrequency: 960, endFrequency: 1680, gain: 0.08 }], duration: 0.12, attack: 0.003, release: 0.06, volume: 0.22 },
  explosionSmall: { layers: [{ type: 'sawtooth', startFrequency: 240, endFrequency: 82, gain: 0.22, filterCutoff: 1100 }, { type: 'triangle', startFrequency: 120, endFrequency: 48, gain: 0.08, filterCutoff: 800 }], duration: 0.18, attack: 0.001, release: 0.09, volume: 0.24 },
  explosionMedium: { layers: [{ type: 'sawtooth', startFrequency: 180, endFrequency: 52, gain: 0.26, filterCutoff: 880 }, { type: 'triangle', startFrequency: 96, endFrequency: 34, gain: 0.1, filterCutoff: 640 }], duration: 0.26, attack: 0.001, release: 0.12, volume: 0.28 },
  bossExplosion: { layers: [{ type: 'sawtooth', startFrequency: 132, endFrequency: 36, gain: 0.28, filterCutoff: 760 }, { type: 'square', startFrequency: 72, endFrequency: 24, gain: 0.12, filterCutoff: 420 }], duration: 0.42, attack: 0.002, release: 0.18, volume: 0.32 },
  bossWarning: { layers: [{ type: 'sine', startFrequency: 92, endFrequency: 58, gain: 0.2, filterCutoff: 360 }, { type: 'triangle', startFrequency: 184, endFrequency: 116, gain: 0.08, filterCutoff: 520 }], duration: 0.7, attack: 0.02, release: 0.22, volume: 0.18 },
  bossHit: { layers: [{ type: 'triangle', startFrequency: 420, endFrequency: 240, gain: 0.14, filterCutoff: 1200 }, { type: 'sine', startFrequency: 1180, endFrequency: 760, gain: 0.06, filterCutoff: 1700 }], duration: 0.11, attack: 0.002, release: 0.05, volume: 0.18 },
};

const DEFAULT_ASSET_MANIFEST = {
  player: { displaySize: [72, 46], collisionRadius: 22 },
  enemies: {
    scout: { displaySize: [60, 42], collisionRadius: 18 },
    zigzag: { displaySize: [64, 46], collisionRadius: 18 },
    turret: { displaySize: [74, 52], collisionRadius: 21 },
    drone: { displaySize: [52, 52], collisionRadius: 14 },
  },
  boss: { displaySize: [216, 144], collisionRadius: 58 },
  pickup: { displaySize: [30, 30], collisionRadius: 13 },
  bullet: {
    player: { radius: 4 },
    weaponLevel1: { radius: 3 },
    enemy: { radius: 5 },
  },
};

const FX_LIBRARY = {
  hitSpark: {
    duration: 0.22,
    baseScale: 0.45,
    peakScale: 1.05,
    fadeStart: 0.48,
    burstDistance: 26,
    spin: 8,
    shardCount: 4,
    shardLength: [14, 26],
    shardThickness: [2, 4],
    smokeCount: 0,
    coreRadius: [3, 5],
    glowRadius: [18, 28],
    ringRadius: [14, 20],
    palette: [COLORS.white, COLORS.cyan, COLORS.gold],
  },
  playerDamage: {
    duration: 0.36,
    baseScale: 0.75,
    peakScale: 1.35,
    fadeStart: 0.5,
    burstDistance: 34,
    spin: 5,
    shardCount: 6,
    shardLength: [16, 32],
    shardThickness: [3, 5],
    smokeCount: 1,
    coreRadius: [6, 8],
    glowRadius: [24, 36],
    ringRadius: [22, 32],
    palette: [0xfff1e8, COLORS.red, COLORS.orange],
  },
  smallExplosion: {
    duration: 0.32,
    baseScale: 0.7,
    peakScale: 1.15,
    fadeStart: 0.46,
    burstDistance: 34,
    spin: 5,
    shardCount: 5,
    shardLength: [14, 28],
    shardThickness: [3, 5],
    smokeCount: 1,
    coreRadius: [6, 8],
    glowRadius: [24, 34],
    ringRadius: [20, 30],
    palette: [0xfff0c4, COLORS.gold, COLORS.orange],
  },
  mediumExplosion: {
    duration: 0.45,
    baseScale: 0.88,
    peakScale: 1.5,
    fadeStart: 0.56,
    burstDistance: 52,
    spin: 6,
    shardCount: 8,
    shardLength: [16, 34],
    shardThickness: [3, 6],
    smokeCount: 2,
    coreRadius: [7, 10],
    glowRadius: [32, 48],
    ringRadius: [28, 40],
    palette: [0xfff2b0, COLORS.orange, COLORS.red],
  },
  bossExplosion: {
    duration: 0.72,
    baseScale: 1.1,
    peakScale: 2.1,
    fadeStart: 0.62,
    burstDistance: 82,
    spin: 7,
    shardCount: 12,
    shardLength: [20, 42],
    shardThickness: [3, 6],
    smokeCount: 4,
    coreRadius: [10, 16],
    glowRadius: [56, 88],
    ringRadius: [44, 72],
    palette: [COLORS.gold, COLORS.orange, COLORS.red],
  },
};

const DEFAULT_STAGE_DATA = { waveTimeline: [], backdropCues: [], environmentTimeline: [] };
const LEVEL_1_STAGE_DATA = window.VoidLancerLevel1StageData || DEFAULT_STAGE_DATA;
const LEVEL_2_STAGE_DATA = window.VoidLancerLevel2StageData || DEFAULT_STAGE_DATA;
const LEVEL_3_STAGE_DATA = window.VoidLancerLevel3StageData || DEFAULT_STAGE_DATA;
const ARCADE_STAGE_DATA = window.VoidLancerArcadeStageData || { stages: {}, provisionalOrder: [] };

// --- Campaign chain: routing identity vs display order ---------------------
//
// Two different questions, answered by two different things and never mixed:
//
//   Routing identity - what the URL asked for. `sortieIndex` keeps its three
//     authored values (1 First Sortie, 2 Graveyard, 3 Solar Altar), so the
//     public ?sortie=2 and ?sortie=3 / altar aliases still open exactly the
//     lanes they always opened. An arcade stage is routed by its own id in
//     `arcadeStageId` instead, and while one is live `sortieIndex` is
//     ARCADE_SORTIE - a value no authored lane claims, so every authored
//     lane-specific branch below stays out of the arcade path.
//
//   Display order - where a sortie sits in the twelve-stage chain the HUD
//     counts and the Continue button walks: First Sortie 1, Graveyard 2, the
//     nine arcade stages 3-11 in arcade_stage_data.js provisionalOrder, the
//     Solar Altar finale 12. It lives on each entry as `displayIndex` and is
//     never used for routing.
//
// That split is what keeps the finale playable by practice link after it
// moved: ?sortie=3 and its aliases still route to the Solar Altar while its
// stage counter reads 12 / 12.
const ARCADE_SORTIE = 0;

// Progress tags read as words ("Two of Twelve Clear"), so the numbers are
// words too - and both the position and the total come from the data.
const COUNT_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
const countWord = (value) => (COUNT_WORDS[value] ?? String(value));

function buildCampaignEntries(arcade) {
  const entries = [
    // The First Sortie's debrief has always offered "Continue to Graveyard",
    // not "... Graveyard Lane". Keep that public copy.
    { kind: 'first', id: 'first-sortie', sortieIndex: 1, title: 'First Sortie', nextLabel: 'Graveyard' },
    { kind: 'graveyard', id: 'graveyard', sortieIndex: 2, title: 'Graveyard Lane' },
  ];
  // The arcade block sits between the Graveyard and the finale, in the order
  // the data pass left it. Ids are the lookup, so a re-sequencing pass only
  // moves these entries; it never renumbers anything else.
  for (const id of arcade.provisionalOrder || []) {
    const stage = arcade.stages ? arcade.stages[id] : null;
    if (!stage || entries.some((entry) => entry.id === stage.id)) continue;
    entries.push({ kind: 'arcade', id: stage.id, sortieIndex: ARCADE_SORTIE, title: stage.title });
  }
  entries.push({ kind: 'altar', id: 'solar-altar', sortieIndex: 3, title: 'Solar Altar' });

  entries.forEach((entry, index) => {
    entry.displayIndex = index + 1;
    entry.stageId = entry.kind === 'arcade' ? entry.id : null;
    const next = entries[(index + 1) % entries.length];
    // The finale continues nowhere: its debrief offers the replay instead.
    if (entry.kind !== 'altar' && entry.nextLabel == null) entry.nextLabel = next.title;
  });
  return entries;
}

const CAMPAIGN = buildCampaignEntries(ARCADE_STAGE_DATA);
const CAMPAIGN_TOTAL = CAMPAIGN.length;

function stageLabel(entry) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(entry.displayIndex)} / ${pad(CAMPAIGN_TOTAL)}`;
}

function campaignNext(entry) {
  return CAMPAIGN[entry.displayIndex % CAMPAIGN_TOTAL];
}

function findArcadeEntry(stageId) {
  return CAMPAIGN.find((entry) => entry.kind === 'arcade' && entry.id === stageId) || null;
}

// The arcade practice links are ?sortie=<stage id>, e.g. ?sortie=escalation-01.
// Arcade ids are matched before the legacy aliases are read, because the
// legacy parser answers 1 for anything it does not recognise - and no stage id
// may collide with an alias ('1', '2', '3', 'graveyard', 'altar', ...).
function resolveSortieEntry(search) {
  if (typeof search === 'string' && search !== '') {
    try {
      const flag = new URLSearchParams(search).get('sortie');
      const value = flag == null ? '' : String(flag).trim().toLowerCase();
      const arcade = value ? findArcadeEntry(value) : null;
      if (arcade) return arcade;
    } catch (error) {
      // Malformed query: the legacy parser below handles it the way it always has.
    }
  }
  const index = VoidLancerGraveyard.readSortieIndex(search);
  return CAMPAIGN.find((entry) => entry.kind !== 'arcade' && entry.sortieIndex === index) || CAMPAIGN[0];
}

const STAGE_BACKGROUND_MODULE_LAYOUT = [
  { kind: 'towerCluster', x: GAME_WIDTH + 40, y: 96, speed: 13, scale: 1.0, alpha: 0.24, wobbleAmount: 1.0, wobbleSpeed: 0.58, recycleGap: 220 },
  { kind: 'railSection', x: GAME_WIDTH + 260, y: 128, speed: 14, scale: 0.96, alpha: 0.2, wobbleAmount: 0.7, wobbleSpeed: 0.52, recycleGap: 210 },
  { kind: 'craneArm', x: GAME_WIDTH + 520, y: 88, speed: 11, scale: 0.9, alpha: 0.2, wobbleAmount: 1.5, wobbleSpeed: 0.76, recycleGap: 250 },
  { kind: 'deadPlatformSilhouette', x: GAME_WIDTH + 800, y: 104, speed: 9, scale: 1.24, alpha: 0.2, wobbleAmount: 0.45, wobbleSpeed: 0.34, recycleGap: 260 },
  { kind: 'towerCluster', x: GAME_WIDTH + 1080, y: 442, speed: 12, scale: 1.04, alpha: 0.24, wobbleAmount: 0.9, wobbleSpeed: 0.6, recycleGap: 230 },
  { kind: 'railSection', x: GAME_WIDTH + 1320, y: 418, speed: 13, scale: 0.96, alpha: 0.2, wobbleAmount: 0.7, wobbleSpeed: 0.5, recycleGap: 210 },
  { kind: 'craneArm', x: GAME_WIDTH + 1570, y: 450, speed: 10, scale: 0.9, alpha: 0.18, wobbleAmount: 1.4, wobbleSpeed: 0.72, recycleGap: 240 },
  { kind: 'deadPlatformSilhouette', x: GAME_WIDTH + 1840, y: 430, speed: 8, scale: 1.3, alpha: 0.2, wobbleAmount: 0.45, wobbleSpeed: 0.32, recycleGap: 260 },
];

// Sortie 2 reuses the same scenery builders as the First Sortie, just slower,
// sparser and dimmer so the lane stays quiet enough to learn the worklight.
const GRAVEYARD_STAGE_MODULE_LAYOUT = [
  { kind: 'deadPlatformSilhouette', x: GAME_WIDTH + 140, y: 116, speed: 7, scale: 1.36, alpha: 0.15, wobbleAmount: 0.35, wobbleSpeed: 0.3, recycleGap: 320 },
  { kind: 'railSection', x: GAME_WIDTH + 520, y: 436, speed: 6, scale: 1.0, alpha: 0.12, wobbleAmount: 0.5, wobbleSpeed: 0.36, recycleGap: 300 },
  { kind: 'towerCluster', x: GAME_WIDTH + 960, y: 92, speed: 6, scale: 1.12, alpha: 0.15, wobbleAmount: 0.8, wobbleSpeed: 0.42, recycleGap: 320 },
  { kind: 'craneArm', x: GAME_WIDTH + 1440, y: 452, speed: 7, scale: 1.0, alpha: 0.13, wobbleAmount: 1.2, wobbleSpeed: 0.5, recycleGap: 300 },
  { kind: 'machineryPass', x: GAME_WIDTH + 1900, y: 296, speed: 5, scale: 0.9, alpha: 0.11, wobbleAmount: 0.6, wobbleSpeed: 0.4, recycleGap: 280 },
];

// Warm work-light amber: kept separate from player cyan and enemy crimson so
// the yard reads as civilian lighting rather than a hazard telegraph.
const WORK_LIGHT_COLOR = 0xffd9a0;

// Solar Altar reuses the same scenery builders again, slower and sparser than
// the First Sortie and leaning on altar gold, so the subdued-gold defense
// backdrop stays quiet enough to read the Warden's ember core against it. The
// lane itself is the altar illustration (bg_altar_lane_1): one authored frame
// that pans inside its own edges and never repeats, exactly like the Graveyard
// lane. The rings, ember pools and repair faces are the fallback dressing for
// when that frame is not in the pack yet.
const ALTAR_STAGE_MODULE_LAYOUT = [
  { kind: 'deadPlatformSilhouette', x: GAME_WIDTH + 160, y: 104, speed: 7, scale: 1.3, alpha: 0.15, wobbleAmount: 0.35, wobbleSpeed: 0.3, recycleGap: 320 },
  { kind: 'lightShaft', x: GAME_WIDTH + 540, y: 58, speed: 6, scale: 0.95, alpha: 0.24, beamWidth: 18, beamHeight: 300, color: COLORS.gold, wobbleAmount: 0.5, wobbleSpeed: 0.4, recycleGap: 200 },
  { kind: 'machineryPass', x: GAME_WIDTH + 980, y: 434, speed: 6, scale: 0.9, alpha: 0.16, wobbleAmount: 0.6, wobbleSpeed: 0.4, recycleGap: 280 },
  { kind: 'railSection', x: GAME_WIDTH + 1420, y: 424, speed: 7, scale: 1.0, alpha: 0.14, wobbleAmount: 0.5, wobbleSpeed: 0.36, recycleGap: 300 },
  { kind: 'lightShaft', x: GAME_WIDTH + 1880, y: 452, speed: 6, scale: 0.9, alpha: 0.2, beamWidth: 16, beamHeight: 280, color: COLORS.gold, wobbleAmount: 0.4, wobbleSpeed: 0.36, recycleGap: 210 },
];

// The lane frame is 1008px wide against a 960px playfield, so a short pan has
// exactly this much slack before an edge would show. It runs over 30s - the
// Graveyard lane's crossing length - and then parks, so nothing ever repeats.
const ALTAR_LANE_PAN = { start: GAME_WIDTH / 2 + 20, span: 40, seconds: 30 };

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}

function easeInQuad(t) {
  return t * t;
}



class MockupLevelScene extends Phaser.Scene {
  constructor() {
    super('MockupLevel');
    this.assetManifest = null;
    this.levelStageData = LEVEL_1_STAGE_DATA;
    // Routing identity, not display order: resolved when the scene boots.
    // ?sortie=2 opens the Graveyard, ?sortie=3 (or an altar alias) the Solar
    // Altar, ?sortie=<stage id> an arcade stage, and anything else the First
    // Sortie. `displayIndex` on campaignEntry() is what the HUD counts instead.
    this.sortieIndex = 1;
    this.arcadeStageId = null;
    this.carriedScore = 0;
    this.graveyardObjects = [];
    this.graveyardDebris = null;
    this.altarObjects = [];
    this.soundEnabled = true;
    this.soundToggleButton = null;
    this.audioContext = null;
    this.audioMasterGain = null;
    this.musicElement = null;
    this.musicStarted = false;
    this.stageBackdropModules = [];
    this.stageBackdropCues = [];
    this.stageBackdropCueIndex = 0;
    this.stageBackdropTimeline = 0;
    this.environmentTimeline = [];
    this.uiState = {
      lastScore: 0,
      lastWeaponLevel: 1,
      lastAnnouncementKey: '',
      lastBossRatio: 1,
    };
  }

  preload() {
    // Determine absolute base path for assets to resolve loading issues
    // We use the current path but ensure it ends with /void-lancer/assets/
    let path = window.location.pathname;
    if (!path.endsWith('/')) path += '/';
    
    // If the path doesn't contain void-lancer (e.g. root), we add it
    // but usually it will be /void-lancer/
    this.load.setBaseURL(window.location.origin + path + 'assets/');

    this.load.json('runtimeAssetManifest', 'data/runtime_asset_manifest.json');

    this.load.image('bgPlatformFar', 'void_lancer_pack/bg_platform_far_1.webp');
    this.load.image('bgPlatformMid', 'void_lancer_pack/bg_platform_mid_1.webp');
    this.load.image('bgPlatformNear', 'void_lancer_pack/bg_platform_near_1.webp');
    this.load.image('bgPlatformForeground', 'void_lancer_pack/bg_platform_foreground_sheet_1.webp');
    this.load.image('bgDebrisStrip', 'void_lancer_pack/bg_debris_strip_1.webp');
    this.load.image('bgGraveyardLane', 'void_lancer_pack/bg_graveyard_lane_1.webp');
    this.load.image('bgAltarLane', 'void_lancer_pack/bg_altar_lane_1.webp');
    this.load.image('graveyardSalvager', 'void_lancer_pack/graveyard_salvager_1.webp');
    this.load.image('altarWarden', 'void_lancer_pack/altar_warden_1.webp');
    this.load.image('bgMegaStructureNear', 'void_lancer_pack/bg_megastructure_near_1.webp');
    this.load.image('playerShip', 'void_lancer_pack/player_ship_idle_1.webp');
    this.load.image('playerShipPulse', 'void_lancer_pack/player_ship_pulse_plus_1.webp');
    this.load.image('enemyScout', 'void_lancer_pack/enemy_scout_idle_1.webp');
    this.load.image('enemyZigzag', 'void_lancer_pack/enemy_zigzag_idle_1.webp');
    this.load.image('enemyTurret', 'void_lancer_pack/enemy_turret_idle_1.webp');
    this.load.image('enemyDrone', 'void_lancer_pack/enemy_drone_idle_1.webp');
    this.load.image('bossShip', 'void_lancer_pack/boss_siege_carrier_base_1.webp');
    this.load.image('playerBulletBasic', 'void_lancer_pack/player_bullet_basic_1.webp');
    this.load.image('playerBulletPulse', 'void_lancer_pack/player_bullet_pulse_plus_1.webp');
    this.load.image('pickupPulse', 'void_lancer_pack/pickup_pulse_plus_1.webp');
    this.load.image('uiHudFrame', 'void_lancer_pack/ui_hud_frame_1.webp');
    this.load.image('bossBarFrame', 'void_lancer_pack/ui_boss_bar_frame_1.webp');
    this.load.image('overlayPanel', 'void_lancer_pack/ui_overlay_panel_1.webp');
    this.load.image('titleLogo', 'void_lancer_pack/ui_title_logo_1.webp');

    this.load.on('loaderror', (fileObj) => {
      console.error('Asset failed to load:', fileObj.key, fileObj.src);
    });
  }

  create() {
    this.applyRoute(resolveSortieEntry(window.location?.search));
    this.assetManifest = this.cache.json.get('runtimeAssetManifest') || DEFAULT_ASSET_MANIFEST;

    this.setupAudioControls();
    this.setupBackground();
    this.setupHud();
    this.setupOverlay();
    this.setupInput();
    this.resetGame();
    this.showIntro();
  }

  resetGame() {
    this.destroyDynamicObjects();

    const am = this.assetManifest;
    this.levelStageData = this.getLevelStageData();
    this.state = {
      mode: 'intro',
      score: this.carriedScore || 0,
      time: 0,
      fx: [],
      bullets: [],
      enemies: [],
      powerUps: [],
      environmentPanels: [],
      announcements: [],
      boss: null,
      bossQueued: false,
      waves: this.buildWavePlan(),
      environmentTimeline: this.buildEnvironmentPlan(),
      player: {
        x: 150,
        y: GAME_HEIGHT / 2,
        w: am.player.displaySize[0],
        h: am.player.displaySize[1],
        speed: 285,
        lives: 3,
        cooldown: 0,
        weaponLevel: 1,
        invuln: 0,
        fireKick: 0,
        bank: 0,
      }
    };

    this.uiState.lastScore = this.state.score;
    this.uiState.lastWeaponLevel = this.state.player.weaponLevel;
    this.uiState.lastAnnouncementKey = '';
    this.uiState.lastBossRatio = 1;

    this.playerSprite = this.add.image(this.state.player.x, this.state.player.y, 'playerShip')
      .setDisplaySize(am.player.displaySize[0], am.player.displaySize[1])
      .setFlipX(true)
      .setDepth(DEPTH.player);

    this.setupStageBackdropModules();
    if (this.sortieIndex === 2) this.setupGraveyardSortie();
    if (this.sortieIndex === 3) this.setupAltarSortie();

    this.syncHud();
    this.hideBossBar();
    this.updateAnnouncementDisplay();
  }

  // One place sets the routing identity, so the display order can never leak
  // into it: an entry carries kind/id/sortieIndex, never a bare display slot.
  applyRoute(entry) {
    const next = entry || CAMPAIGN[0];
    this.sortieIndex = next.sortieIndex;
    this.arcadeStageId = next.stageId;
    return next;
  }

  // The live entry in campaign order, derived from the routing identity so a
  // caller that sets sortieIndex directly still reads the right position.
  campaignEntry() {
    if (this.arcadeStageId) {
      const arcade = findArcadeEntry(this.arcadeStageId);
      if (arcade) return arcade;
    }
    return CAMPAIGN.find((entry) => entry.kind !== 'arcade' && entry.sortieIndex === this.sortieIndex)
      || CAMPAIGN[0];
  }

  arcadeStage() {
    return this.arcadeStageId ? (ARCADE_STAGE_DATA.stages[this.arcadeStageId] || null) : null;
  }

  getLevelStageData() {
    // An arcade route is its own stage record: same fields the runtime reads
    // (waveTimeline, missionDuration, backdrop cues), no separate level file.
    const arcade = this.arcadeStage();
    if (arcade) return arcade;
    if (this.sortieIndex === 3) return LEVEL_3_STAGE_DATA;
    return this.sortieIndex === 2 ? LEVEL_2_STAGE_DATA : LEVEL_1_STAGE_DATA;
  }

  setupAudioControls() {
    this.soundToggleButton = document.getElementById('soundToggleBtn');
    this.soundEnabled = this.readSoundPreference();
    this.ensureMusicElement();
    this.refreshSoundToggleButton();

    if (this.soundToggleButton) {
      this.soundToggleButton.addEventListener('click', () => {
        this.toggleSound();
      });
    }
  }

  readSoundPreference() {
    try {
      const params = new URLSearchParams(window.location.search);
      const queryValue = params.get('sound') ?? params.get('audio');
      if (queryValue != null) {
        return !/^(0|off|false|mute|no)$/i.test(queryValue);
      }

      const stored = window.localStorage?.getItem(SOUND_STORAGE_KEY);
      if (stored != null) return stored !== 'off';
    } catch (error) {
      console.warn('Sound preference unavailable', error);
    }

    return true;
  }

  persistSoundPreference() {
    try {
      window.localStorage?.setItem(SOUND_STORAGE_KEY, this.soundEnabled ? 'on' : 'off');
    } catch (error) {
      console.warn('Sound preference could not be saved', error);
    }
  }

  refreshSoundToggleButton() {
    if (!this.soundToggleButton) return;
    this.soundToggleButton.textContent = this.soundEnabled ? 'Sound: On' : 'Sound: Off';
    this.soundToggleButton.setAttribute('aria-pressed', this.soundEnabled ? 'true' : 'false');
  }

  toggleSound() {
    this.setSoundEnabled(!this.soundEnabled);
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = Boolean(enabled);
    this.persistSoundPreference();
    this.refreshSoundToggleButton();

    if (this.audioMasterGain) {
      this.audioMasterGain.gain.setValueAtTime(this.soundEnabled ? 0.18 : 0.0001, this.audioContext.currentTime);
    }

    if (this.musicElement) {
      this.musicElement.muted = !this.soundEnabled;
      this.musicElement.volume = this.soundEnabled ? 0.44 : 0;
      if (this.soundEnabled && this.musicStarted && this.musicElement.paused) {
        this.musicElement.play().catch((error) => console.warn('Music resume failed', error));
      }
    }

    if (this.soundEnabled) this.unlockAudio();
  }

  ensureMusicElement() {
    if (this.musicElement) return this.musicElement;

    const musicUrl = getMusicUrl();
    const audio = new Audio(musicUrl);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = this.soundEnabled ? 0.44 : 0;
    audio.muted = !this.soundEnabled;
    this.musicElement = audio;
    return audio;
  }

  startMusicPlayback() {
    const audio = this.ensureMusicElement();
    if (!audio || this.musicStarted) return;
    this.musicStarted = true;
    audio.currentTime = 0;
    audio.play().catch((error) => console.warn('Music start failed', error));
  }

  ensureAudioContext() {
    if (!this.soundEnabled) return null;

    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;

    if (!this.audioContext) {
      this.audioContext = new AudioCtor();
      this.audioMasterGain = this.audioContext.createGain();
      this.audioMasterGain.gain.value = 0.18;
      this.audioMasterGain.connect(this.audioContext.destination);
    }

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch((error) => console.warn('Audio context resume failed', error));
    }

    return this.audioContext;
  }

  unlockAudio() {
    const context = this.ensureAudioContext();
    if (!context) return;
    if (context.state === 'suspended') {
      context.resume().catch((error) => console.warn('Audio context unlock failed', error));
    }
  }

  playSound(name, options = {}) {
    if (!this.soundEnabled) return;

    const preset = SOUND_LIBRARY[name];
    if (!preset) return;

    const context = this.ensureAudioContext();
    if (!context || !this.audioMasterGain) return;

    const now = context.currentTime;
    const duration = options.duration ?? preset.duration ?? 0.1;
    const attack = options.attack ?? preset.attack ?? 0.002;
    const release = options.release ?? preset.release ?? 0.05;
    const volume = options.volume ?? preset.volume ?? 0.18;
    const layers = options.layers ?? preset.layers ?? [preset];

    for (const layer of layers) {
      const oscillator = context.createOscillator();
      oscillator.type = layer.type || 'sine';

      const layerGain = context.createGain();
      const filter = layer.filterCutoff ? context.createBiquadFilter() : null;
      if (filter) {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(layer.filterCutoff, now);
        filter.Q.setValueAtTime(layer.filterQ ?? 0.8, now);
      }

      const startFrequency = options.frequency ?? layer.startFrequency ?? preset.startFrequency ?? 440;
      const endFrequency = options.endFrequency ?? layer.endFrequency ?? preset.endFrequency ?? startFrequency;
      oscillator.frequency.setValueAtTime(Math.max(20, startFrequency), now);
      if (endFrequency !== startFrequency) {
        oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), now + duration);
      }

      if (options.detune || layer.detune) {
        oscillator.detune.setValueAtTime(options.detune ?? layer.detune, now);
      }

      layerGain.gain.setValueAtTime(0.0001, now);
      layerGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * (layer.gain ?? 1)), now + attack);
      layerGain.gain.exponentialRampToValueAtTime(0.0001, now + duration + release);

      if (filter) {
        oscillator.connect(filter);
        filter.connect(layerGain);
      } else {
        oscillator.connect(layerGain);
      }

      layerGain.connect(this.audioMasterGain);
      oscillator.start(now);
      oscillator.stop(now + duration + release + 0.02);
    }
  }

  queueHeavyImpactShake(intensity = 0.006, duration = 120) {
    if (this.cameras?.main) {
      this.cameras.main.shake(duration, intensity);
    }
  }

  primePlayerRecoil() {
    if (!this.state?.player) return;
    this.state.player.fireKick = Math.min(1, (this.state.player.fireKick || 0) + 0.66);
  }

  primeBossHit() {
    if (!this.state?.boss) return;
    this.state.boss.hitFlash = Math.min(1, (this.state.boss.hitFlash || 0) + 0.95);
    this.state.boss.corePulse = Math.min(1, (this.state.boss.corePulse || 0) + 0.8);
  }

  destroyDynamicObjects() {
    this.destroyStageBackdropModules();
    this.destroyGraveyardObjects();
    this.destroyAltarObjects();
    const pools = ['bullets', 'enemies', 'powerUps', 'fx', 'environmentPanels'];
    if (this.state) {
      for (const pool of pools) {
        for (const item of this.state[pool]) {
          if (item.sprite) item.sprite.destroy();
          if (item.container) item.container.destroy();
        }
      }
      if (this.state.boss && this.state.boss.sprite) this.state.boss.sprite.destroy();
    }
    if (this.playerSprite) this.playerSprite.destroy();
  }

  sortieBriefing() {
    // An arcade route shares no sortieIndex value with the authored lanes, so
    // it must be handled here rather than falling through to the First Sortie.
    const entry = this.campaignEntry();
    if (entry.kind === 'arcade') {
      const stage = this.arcadeStage();
      // Objective first, the lane's own read second, then the clock: an arcade
      // stage clears on missionDuration rather than on a boss, and the player
      // has to know which one of those the run is waiting for.
      const clock = stage && Number.isFinite(stage.missionDuration)
        ? ` Survive ${stage.missionDuration} seconds to clear.`
        : '';
      return {
        title: entry.title,
        summary: (stage?.briefing || `Objective: hold the ${entry.title} lane to the clock.`) + clock,
        detail: 'Touch: slide on the left; hold Fire. Keyboard: WASD / arrows, Space / J / K.',
        button: 'Start Sortie',
        tag: 'Mission Briefing',
        accent: COLORS.cyan,
        subtitle: `VOID LANCER // ${entry.title.toUpperCase()} SORTIE`,
      };
    }
    if (this.sortieIndex === 3) {
      return {
        title: 'Solar Altar',
        // Objective first, then the one mechanic the Warden is built around:
        // the ember core flares for a full beat before any ring leaves it.
        summary: 'Objective: cross the altar lane and break the Altar Warden. Its ember core flares before every radial burst. Read the flare, then commit.',
        detail: 'Touch: slide on the left; hold Fire. Keyboard: WASD / arrows, Space / J / K.',
        button: 'Start Sortie',
        tag: 'Mission Briefing',
        accent: COLORS.cyan,
        subtitle: 'VOID LANCER // SOLAR ALTAR SORTIE',
      };
    }
    if (this.sortieIndex === 2) {
      return {
        title: 'Graveyard Lane',
        // Objective first, then who owns the light and what holding contact
        // costs: the salvager is an independent mercenary, the patrol is the
        // Imperial survivors, and no arrangement between them is claimed.
        summary: 'Objective: cross the yard. Break contact with the mercenary salvager’s worklight before it alerts the Imperial patrol.',
        detail: 'Touch: slide on the left; hold Fire. Keyboard: WASD / arrows, Space / J / K.',
        button: 'Start Sortie',
        tag: 'Mission Briefing',
        accent: COLORS.cyan,
        subtitle: 'VOID LANCER // GRAVEYARD SORTIE',
      };
    }
    return {
      title: 'Launch Window Open',
      summary: 'Escort corridor zero is hot. Survive the opening waves, grab the pulse upgrade, and break the siege carrier at the end of the lane.',
      detail: 'Touch: slide on the left; hold Fire. Keyboard: WASD / arrows, Space / J / K.',
      button: 'Start Sortie',
      tag: 'Mission Briefing',
      accent: COLORS.cyan,
      subtitle: 'VOID LANCER // FIRST SORTIE',
    };
  }

  showIntro() {
    this.state.mode = 'intro';
    const brief = this.sortieBriefing();
    this.showOverlay(brief.title, brief.summary, brief.detail, brief.button, brief);
  }

  startGame() {
    this.actionState.clear();
    this.startMusicPlayback();
    if (this.state?.mode === 'victory') {
      // A cleared sortie never starts the next one by itself: the overlay
      // offers the next entry (or a full replay) and its briefing follows.
      // The chain is the campaign order, so the Graveyard leads into the nine
      // arcade sorties, the last of them into the Solar Altar, and the finale
      // wraps back to the First Sortie.
      this.enterSortie(campaignNext(this.campaignEntry()));
      return;
    }
    this.beginSortie();
  }

  beginSortie() {
    this.resetGame();
    this.state.mode = 'playing';
    this.hideOverlay();
  }

  enterSortie(entry) {
    const next = entry || CAMPAIGN[0];
    // Score carries across a run; replaying the run starts it over.
    this.carriedScore = next.displayIndex === 1 ? 0 : (this.state?.score || 0);
    this.applyRoute(next);
    this.resetGame();
    this.showIntro();
  }

  sortieEndCopy(victory) {
    const score = `Score: ${this.state.score}`;
    const entry = this.campaignEntry();
    if (victory && this.sortieIndex === 3) {
      return {
        title: 'Solar Altar Secured',
        // Campaign payoff: the wreckage stops being a war economy and becomes
        // somewhere to live. No salvage loop, no allegiance claim - just the
        // visible aftermath the campaign asks for.
        summary: 'The Warden and the last organized Imperial force are gone. Survivors strip the wreckage for a garden world: homes, tools, a society, not a fleet.',
        detail: score,
        button: 'Replay the Run',
        tag: 'Campaign Clear',
        accent: COLORS.gold,
        subtitle: 'Corridor free // garden world founded',
      };
    }
    if (victory && this.sortieIndex === 2) {
      const arcadeCount = CAMPAIGN.filter((item) => item.kind === 'arcade').length;
      return {
        // Two of twelve: the run is still going, so neither the title nor the
        // tag may read as a finish line, and the altar is the finale rather
        // than the next stop.
        title: 'Graveyard Secured',
        // Payoff in the order the lane taught it - route record, amber markers
        // - then the leg the button actually offers: the arcade block that now
        // stands between the yard and the altar. With no arcade data loaded the
        // chain really is Graveyard -> Solar Altar, and the old copy is the
        // honest one there.
        summary: arcadeCount
          ? 'Graveyard crossed. The amber markers match the Carrier’s route record. Follow it through the defense lanes to the Solar Altar.'
          : 'Graveyard crossed. The amber markers match the Carrier’s route record. Next stop: the Solar Altar.',
        detail: score,
        button: `Continue to ${entry.nextLabel}`,
        tag: `${countWord(entry.displayIndex)} of ${countWord(CAMPAIGN_TOTAL)} Clear`,
        accent: COLORS.gold,
        subtitle: 'First Sortie and Graveyard secured',
      };
    }
    if (victory && entry.kind === 'arcade') {
      return {
        title: `${entry.title} Secured`,
        // Wiring-layer debrief: the lane cleared on its clock and the chain
        // moves on. No new narrative beats belong to this pass.
        summary: `${entry.title} held to the clock. Next stop: ${entry.nextLabel}.`,
        detail: score,
        button: `Continue to ${entry.nextLabel}`,
        tag: `${countWord(entry.displayIndex)} of ${countWord(CAMPAIGN_TOTAL)} Clear`,
        accent: COLORS.gold,
        subtitle: `${stageLabel(entry)} secured`,
      };
    }
    if (victory) {
      return {
        title: 'Sortie Complete',
        summary: 'The siege carrier is burning out behind you. First lane secured.',
        detail: score,
        button: `Continue to ${entry.nextLabel}`,
        tag: 'Mission Clear',
        accent: COLORS.gold,
        subtitle: 'Carrier neutralized',
      };
    }
    if (this.sortieIndex === 3) {
      return {
        title: 'Mission Failed',
        summary: 'The Altar Warden still holds the corridor. The lane is waiting for another run.',
        detail: score,
        button: 'Retry Solar Altar',
        tag: 'Mission Failed',
        accent: COLORS.red,
        subtitle: 'The altar still stands',
      };
    }
    if (this.sortieIndex === 2) {
      return {
        title: 'Mission Failed',
        summary: 'Hull lost in the graveyard lane. The route record stays open for another run.',
        detail: score,
        button: 'Retry Graveyard',
        tag: 'Mission Failed',
        accent: COLORS.red,
        subtitle: 'Graveyard lane still hostile',
      };
    }
    if (entry.kind === 'arcade') {
      return {
        title: 'Mission Failed',
        summary: `Hull lost in the ${entry.title} lane. The run is ready for another pass.`,
        detail: score,
        button: `Retry ${entry.title}`,
        tag: 'Mission Failed',
        accent: COLORS.red,
        subtitle: `${entry.title} still hostile`,
      };
    }
    return {
      title: 'Mission Failed',
      summary: 'The corridor chewed you up. The lane is still hostile.',
      detail: score,
      button: 'Restart Mission',
      tag: 'Mission Failed',
      accent: COLORS.red,
      subtitle: 'Try a cleaner run',
    };
  }

  finishGame(victory) {
    this.state.mode = victory ? 'victory' : 'gameover';
    this.actionState.clear();
    const end = this.sortieEndCopy(victory);
    this.showOverlay(end.title, end.summary, end.detail, end.button, end);
  }

  showOverlay(title, summary, detail, buttonLabel, options = {}) {
    const accent = options.accent ?? COLORS.cyan;
    const subtitle = options.subtitle ?? '';
    const tag = options.tag ?? '';

    this.overlayDim.setVisible(true);
    this.overlayPanel.setVisible(true);
    // The legacy wordmark includes “First Sortie”; omit it on arcade lanes and the finale.
    this.overlayLogo.setVisible(this.sortieIndex !== 3 && this.sortieIndex !== ARCADE_SORTIE);
    this.overlayLogoGlow.setVisible(true);
    this.overlayMotionLayer.setVisible(true);
    this.overlayTag.setVisible(Boolean(tag));
    this.overlayTitle.setText(title).setVisible(true);
    this.overlayTitle.setColor(`#${accent.toString(16).padStart(6, '0')}`);
    this.overlaySummary.setText(summary).setVisible(true);
    this.overlaySummary.setColor('#eef5ff');
    this.overlayControls.setText(detail).setVisible(true);
    this.overlayControls.setColor('#8ea6cd');
    this.overlayButton.setText(buttonLabel).setVisible(true);
    this.touchControls?.setOverlay(buttonLabel);
    this.overlayButton.setPadding(18, 10, 18, 10);
    this.overlayButton.setBackgroundColor(`#${accent.toString(16).padStart(6, '0')}`);
    this.overlayButton.setColor(accent === COLORS.red ? '#ffffff' : '#07111f');
    this.overlayTag.setText(tag);
    this.overlaySubtitle.setText(subtitle).setVisible(Boolean(subtitle));
    this.overlayLogo.setTint(accent);
    this.overlayLogoGlow.setFillStyle(accent, 0.12);
    this.overlayTitle.setShadow(0, 0, '#000000', 8, false, true);
    this.overlayPanel.setTint(0xffffff);
    this.overlayPanel.setAlpha(1);
    this.overlayLogo.setScale(0.96).setAlpha(0);
    this.overlayPanel.setScale(0.98);
    this.overlayTag.setAlpha(0).setScale(0.98);
    this.overlaySubtitle.setAlpha(0.9);
    this.tweens.killTweensOf(this.overlayPanel);
    this.tweens.killTweensOf(this.overlayLogo);
    this.tweens.killTweensOf(this.overlayTag);
    this.tweens.add({ targets: this.overlayPanel, scale: 1, duration: 280, ease: 'Cubic.easeOut' });
    this.tweens.add({ targets: this.overlayLogo, alpha: 1, scale: 1, duration: 360, ease: 'Back.easeOut' });
    this.tweens.add({ targets: this.overlayTag, alpha: 1, scale: 1, duration: 240, delay: 80, ease: 'Sine.easeOut' });
  }

  hideOverlay() {
    this.overlayDim.setVisible(false);
    this.overlayPanel.setVisible(false);
    this.overlayLogo.setVisible(false);
    this.overlayLogoGlow.setVisible(false);
    this.overlayMotionLayer.setVisible(false);
    this.overlayTag.setVisible(false);
    this.overlayTitle.setVisible(false);
    this.overlaySummary.setVisible(false);
    this.overlaySubtitle.setVisible(false);
    this.overlayControls.setVisible(false);
    this.overlayButton.setVisible(false);
    this.touchControls?.setOverlay(null);
  }

  // --- Graveyard Sortie (sortie 2) ---------------------------------------

  setupGraveyardSortie() {
    if (!SOUND_LIBRARY.graveyardSiren) {
      // Derived from the existing bossWarning preset: same layers, swept up.
      SOUND_LIBRARY.graveyardSiren = VoidLancerGraveyard.sirenPreset(SOUND_LIBRARY.bossWarning);
    }

    const detection = VoidLancerGraveyard.createDetection();
    const salvager = {
      x: 1040,
      baseY: 300,
      speed: 26,
      bobSpeed: 0.6,
      bobAmount: 20,
      phase: 0.8,
      lampOffsetX: 20,
      lampOffsetY: -36,
    };
    detection.originX = salvager.x + salvager.lampOffsetX;
    detection.originY = salvager.baseY + salvager.lampOffsetY;

    this.graveyardObjects = [];
    // The yard illustration has authored edges. Pan inside it, never wrap it.
    const backdrop = this.add.image(GAME_WIDTH / 2 + 20, GAME_HEIGHT / 2, 'bgGraveyardLane')
      .setDepth(DEPTH.graveyardScenery - 0.5);
    this.graveyardObjects.push(backdrop);
    this.graveyardDebris = this.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'bgDebrisStrip')
      .setAlpha(0.14)
      .setDepth(DEPTH.graveyardScenery);
    this.graveyardObjects.push(this.graveyardDebris);

    const markers = [465, 447, 476].map((y) => this.buildSalvageMarker(y));
    this.graveyardObjects.push(...markers);

    salvager.container = this.buildSalvagerBoat(salvager);
    this.graveyardObjects.push(salvager.container);

    const beam = this.buildWorklightBeam();
    this.graveyardObjects.push(beam);

    const alertText = this.add.text(GAME_WIDTH / 2, 502, '', {
      fontFamily: 'Arial',
      fontSize: '23px',
      color: '#ffe7c4',
      fontStyle: 'bold',
      letterSpacing: 1,
    }).setOrigin(0.5).setVisible(false).setDepth(DEPTH.graveyardAlert);
    alertText.setStroke('#160c05', 4);
    const alertChevron = this.add.triangle(GAME_WIDTH / 2, 476, 0, 0, 16, 0, 8, 13, 0xffb45a)
      .setVisible(false)
      .setDepth(DEPTH.graveyardAlert);
    this.graveyardObjects.push(alertText, alertChevron);

    this.state.graveyard = { detection, salvager, backdrop, markers, beam, alertText, alertChevron };
  }

  buildSalvagerBoat(salvager) {
    const container = this.add.container(salvager.x, salvager.baseY).setDepth(DEPTH.graveyardBoat);
    const { lampOffsetX: x, lampOffsetY: y } = salvager;
    const lampPool = this.add.ellipse(x - 19, y + 9, 49, 19, WORK_LIGHT_COLOR, 0.16)
      .setBlendMode(Phaser.BlendModes.ADD);
    const parts = [
      this.add.image(0, -1, 'graveyardSalvager').setDisplaySize(96, 96 * 73 / 192),
      // Hood and lens stay at the same world-space origin as the lookout cone.
      this.add.rectangle(x + 4, y + 12, 4, 19, 0x647285),
      this.add.rectangle(x + 4, y, 15, 10, 0x283341),
      lampPool,
      this.add.rectangle(x, y, 5, 6, 0xffe4ba),
    ];
    container.add(parts);
    salvager.lampPool = lampPool;
    return container;
  }

  // Amber lamps mounted on cut trusses. Scenery only, never a pickup or target.
  buildSalvageMarker(y) {
    const marker = this.add.container(GAME_WIDTH + 32, y).setDepth(DEPTH.graveyardScenery + 1);
    marker.add([
      this.add.rectangle(0, 0, 43, 9, 0x334458),
      this.add.rectangle(-16, 5, 5, 15, 0x334458),
      this.add.rectangle(16, 5, 5, 15, 0x334458),
      this.add.rectangle(0, -7, 15, 4, 0x58351e),
      this.add.rectangle(0, -8, 10, 4, 0xe5a559),
    ]);
    return marker;
  }

  // The cone is rebuilt from the detection triangle in world space each frame,
  // so the drawn sight line and inBeam() cannot drift apart.
  buildWorklightBeam() {
    const beam = this.add.graphics();
    beam.setBlendMode(Phaser.BlendModes.ADD);
    beam.setDepth(DEPTH.graveyardBeam);
    return beam;
  }

  renderWorklightBeam(beam, detection) {
    const cone = VoidLancerGraveyard.beamLocalTriangle(detection);
    const cos = Math.cos(detection.angle);
    const sin = Math.sin(detection.angle);
    const layer = (scale) => cone.map((point) => {
      const localX = point.x * scale;
      const localY = point.y * scale;
      return {
        x: detection.originX + localX * cos - localY * sin,
        y: detection.originY + localX * sin + localY * cos,
      };
    });

    beam.clear();
    beam.fillStyle(WORK_LIGHT_COLOR, 0.07);
    beam.fillPoints(layer(1), true);
    beam.fillStyle(WORK_LIGHT_COLOR, 0.09);
    beam.fillPoints(layer(0.72), true);
    beam.fillStyle(WORK_LIGHT_COLOR, 0.1);
    beam.fillPoints(layer(0.42), true);
  }

  destroyGraveyardObjects() {
    for (const object of this.graveyardObjects || []) {
      if (object && typeof object.destroy === 'function') object.destroy();
    }
    this.graveyardObjects = [];
    this.graveyardDebris = null;
    if (this.state) this.state.graveyard = null;
  }

  updateGraveyard(dt) {
    const yard = this.state.graveyard;
    if (!yard) return;
    const salvager = yard.salvager;

    salvager.x -= salvager.speed * dt;
    salvager.y = salvager.baseY + Math.sin(this.state.time * salvager.bobSpeed + salvager.phase) * salvager.bobAmount;
    if (salvager.container) {
      salvager.container.x = salvager.x;
      salvager.container.y = salvager.y;
    }
    yard.backdrop.x = GAME_WIDTH / 2 + 20 - 40 * Math.min(1, this.state.time / LEVEL_2_STAGE_DATA.missionDuration);
    for (let i = 0; i < yard.markers.length; i += 1) {
      yard.markers[i].x = GAME_WIDTH + 32 + 142 * i - 43 * Math.max(0, this.state.time - 11);
    }
    if (this.graveyardDebris) this.graveyardDebris.tilePositionX += 16 * dt;

    const detection = yard.detection;
    detection.originX = salvager.x + salvager.lampOffsetX;
    detection.originY = salvager.y + salvager.lampOffsetY;

    const events = VoidLancerGraveyard.updateDetection(detection, dt, this.state.player);
    if (events.alarm) this.triggerGraveyardAlarm();

    this.renderGraveyard(detection, yard);
  }

  renderGraveyard(detection, yard) {
    const salvager = yard.salvager;
    if (yard.beam) {
      this.renderWorklightBeam(yard.beam, detection);
      // Brighter while the lock is held: the freeze plus this step is the cue.
      yard.beam.setAlpha(detection.alarm ? 1 : detection.contact ? 0.92 : 0.75);
    }
    if (salvager.lampPool) {
      const pulse = 0.14 + Math.sin(this.state.time * 3.2) * 0.03;
      salvager.lampPool.setAlpha(detection.contact ? pulse + 0.12 : pulse);
    }
    this.updateGraveyardAlert(detection, yard);
  }

  // Text and chevron carry the alert, so it never reads by colour alone.
  updateGraveyardAlert(detection, yard) {
    const label = detection.alarm
      ? 'ALARM // IMPERIAL PATROL ALERTED'
      : detection.contact
        ? (detection.graceExpired ? 'CONTACT // STAND BY' : 'CONTACT // BREAK OFF')
        : '';
    const visible = label !== '';
    if (yard.alertText.visible !== visible) {
      yard.alertText.setVisible(visible);
      yard.alertChevron.setVisible(visible);
    }
    if (!visible) {
      yard.alertLabel = '';
      return;
    }
    if (yard.alertLabel !== label) {
      yard.alertLabel = label;
      yard.alertText.setText(label);
    }
    const flash = 0.72 + Math.sin(this.state.time * (detection.alarm ? 16 : 9)) * 0.28;
    yard.alertText.setAlpha(flash);
    yard.alertChevron.setAlpha(flash);
    yard.alertChevron.setScale(detection.alarm ? 1 + Math.sin(this.state.time * 16) * 0.12 : 1);
  }

  triggerGraveyardAlarm() {
    if (!this.state.graveyard) return;
    // One siren and one banner. The tagged patrol already on station starts
    // firing through its own alarm check; nothing is spawned from here.
    this.playSound('graveyardSiren');
    this.state.announcements.push({ text: 'WORKLIGHT ALARM // IMPERIAL PATROL ALERTED', ttl: 2.6, kind: 'warning' });
    this.updateAnnouncementDisplay();
  }

  // --- Solar Altar scenery (sortie 3) -------------------------------------
  //
  // The lane is the altar illustration: one authored frame that pans inside its
  // own edges and never repeats, exactly like the Graveyard backdrop, so the
  // quiet centre band stays quiet. The procedural rings, ember pools and repair
  // faces are the fallback dressing for when that frame is not in the pack yet
  // - one or the other, never stacked. Pure scenery either way: no pickups, no
  // targets, no hazards, and nothing that fires.
  setupAltarSortie() {
    this.altarObjects = [];
    const backdrop = this.buildAltarBackdrop();
    this.state.altar = { backdrop, rings: null, glows: [], faces: [] };
    if (!backdrop) this.buildAltarProceduralDressing();
  }

  // Null when the frame is missing: the caller dresses the lane procedurally
  // instead of leaving a hole.
  buildAltarBackdrop() {
    if (!this.textures?.exists?.('bgAltarLane')) return null;
    const image = this.add.image(ALTAR_LANE_PAN.start, GAME_HEIGHT / 2, 'bgAltarLane')
      .setDepth(DEPTH.altarScenery - 0.5);
    this.altarObjects.push(image);
    return { image, pan: ALTAR_LANE_PAN };
  }

  buildAltarProceduralDressing() {
    // The altar itself: concentric defense rings parked where the Warden holds
    // station, so the boss reads as sitting in front of the thing it guards.
    const rings = this.add.graphics().setDepth(DEPTH.altarRings);
    const ringSpecs = [
      { radius: 132, width: 3, alpha: 0.16 },
      { radius: 176, width: 2, alpha: 0.11 },
      { radius: 224, width: 2, alpha: 0.07 },
    ];
    for (const spec of ringSpecs) {
      rings.lineStyle(spec.width, COLORS.gold, spec.alpha);
      rings.strokeCircle(0, 0, spec.radius);
    }
    for (let i = 0; i < 24; i += 1) {
      const angle = (Math.PI * 2 * i) / 24;
      const inner = i % 3 === 0 ? 124 : 130;
      const outer = i % 3 === 0 ? 142 : 136;
      rings.lineStyle(2, COLORS.gold, i % 3 === 0 ? 0.2 : 0.1);
      rings.lineBetween(Math.cos(angle) * inner, Math.sin(angle) * inner, Math.cos(angle) * outer, Math.sin(angle) * outer);
    }
    rings.setPosition(GAME_WIDTH - 236, GAME_HEIGHT / 2);
    this.altarObjects.push(rings);

    // Ember pools: warm light leaking from the altar deck, additive and slow.
    const glows = [
      { x: 300, y: 430, w: 260, h: 70, alpha: 0.07, speed: 1.1 },
      { x: 640, y: 120, w: 300, h: 84, alpha: 0.06, speed: 0.8 },
      { x: 830, y: 380, w: 220, h: 62, alpha: 0.08, speed: 1.4 },
    ].map((config) => {
      const glow = this.add.ellipse(config.x, config.y, config.w, config.h, COLORS.orange, config.alpha)
        .setDepth(DEPTH.altarScenery)
        .setBlendMode(Phaser.BlendModes.ADD);
      return { ...config, glow, baseAlpha: config.alpha, phase: Phaser.Math.FloatBetween(0, Math.PI * 2) };
    });
    this.altarObjects.push(...glows.map((item) => item.glow));

    // Repair faces: patched deck plating drifting down-lane. Scenery only.
    const faces = [0, 1, 2].map((index) => this.buildAltarRepairFace(GAME_WIDTH + 160 + index * 340, index));
    this.altarObjects.push(...faces.map((face) => face.container));

    this.state.altar.rings = rings;
    this.state.altar.glows = glows;
    this.state.altar.faces = faces;
  }

  buildAltarRepairFace(x, index) {
    const baseY = [148, 372, 236][index];
    const container = this.add.container(x, baseY).setDepth(DEPTH.altarScenery + 1);
    const width = [116, 138, 96][index];
    const plate = this.add.rectangle(0, 0, width, 40, 0x1b2432, 0.92).setStrokeStyle(2, 0x3d4c60, 0.7);
    const seam = this.add.rectangle(0, 0, width - 26, 3, COLORS.gold, 0.34);
    const lamp = this.add.circle(-width * 0.36, -12, 5, COLORS.gold, 0.7);
    const lampGlow = this.add.circle(-width * 0.36, -12, 16, COLORS.gold, 0.14).setBlendMode(Phaser.BlendModes.ADD);
    container.add([plate, seam, lampGlow, lamp]);
    return { container, x, baseY, speed: 16 + index * 4, width };
  }

  destroyAltarObjects() {
    for (const object of this.altarObjects || []) {
      if (object && typeof object.destroy === 'function') object.destroy();
    }
    this.altarObjects = [];
    if (this.state) this.state.altar = null;
  }

  // Scenery only, so it keeps moving behind the briefing and the debrief
  // exactly like the stage backdrop modules do.
  updateAltar(dt) {
    const altar = this.state?.altar;
    if (!altar) return;

    if (altar.backdrop) {
      // Bounded pan: the frame spends its own slack and then parks, so an edge
      // never shows and nothing ever repeats. state.time only advances while
      // the lane is live, which holds the frame still behind the overlays.
      const progress = this.clamp(this.state.time / altar.backdrop.pan.seconds, 0, 1);
      altar.backdrop.image.x = altar.backdrop.pan.start - altar.backdrop.pan.span * progress;
      return;
    }

    altar.rings.rotation += dt * 0.05;
    for (const glow of altar.glows) {
      glow.glow.setAlpha(glow.baseAlpha + Math.sin(this.state.time * glow.speed + glow.phase) * 0.02);
    }
    for (const face of altar.faces) {
      face.x -= face.speed * dt;
      if (face.x < -(face.width + 80)) face.x = GAME_WIDTH + Phaser.Math.Between(160, 380);
      face.container.x = face.x;
      face.container.y = face.baseY + Math.sin(this.state.time * 0.6 + face.x * 0.01) * 6;
    }
  }


  buildWavePlan() {
    return (this.levelStageData?.waveTimeline || []).map((event) => ({
      time: event.time,
      done: false,
      action: () => this.runWaveTimelineEvent(event),
    }));
  }

  buildEnvironmentPlan() {
    return (this.levelStageData?.environmentTimeline || []).map((event) => ({
      time: event.time,
      done: false,
      action: () => this.runEnvironmentTimelineEvent(event),
    }));
  }

  runWaveTimelineEvent(event) {
    for (const action of event.actions || []) {
      this.runTimelineAction(action);
    }
  }

  runEnvironmentTimelineEvent(event) {
    for (const action of event.actions || []) {
      this.runEnvironmentAction(action);
    }
  }

  runTimelineAction(action) {
    switch (action.type) {
      case 'spawnEnemies':
        for (const enemy of action.enemies || []) {
          this.spawnEnemy(
            enemy.type,
            enemy.x,
            enemy.y?.mode === 'safeEnemyY' ? this.safeEnemyY() : enemy.y,
            enemy.options || {}
          );
        }
        break;
      case 'spawnPickup':
        this.spawnPowerUp(action.x, action.y);
        break;
      case 'queueBossArrival':
        this.state.bossQueued = true;
        this.state.announcements.push({ text: action.announcement, ttl: action.ttl, kind: action.kind });
        this.updateAnnouncementDisplay();
        break;
      case 'announce':
        this.state.announcements.push({ text: action.text, ttl: action.ttl ?? 2.4, kind: action.kind ?? 'notice' });
        this.updateAnnouncementDisplay();
        break;
      default:
        break;
    }
  }

  runEnvironmentAction(action) {
    switch (action.type) {
      case 'spawnPanelCluster':
        this.spawnPanelCluster(action.panel || action);
        break;
      default:
        break;
    }
  }

  spawnEnemy(type, x, y, options = {}) {
    const manifest = this.assetManifest?.enemies?.[type] || DEFAULT_ASSET_MANIFEST.enemies[type] || DEFAULT_ASSET_MANIFEST.enemies.scout;
    const textureKey = {
      scout: 'enemyScout',
      zigzag: 'enemyZigzag',
      turret: 'enemyTurret',
      drone: 'enemyDrone',
    }[type] || 'enemyScout';
    const baseHp = options.hp ?? (type === 'turret' ? 3 : type === 'drone' ? 2 : 1);
    const enemy = {
      type,
      x,
      y,
      speed: options.speed ?? (type === 'turret' ? 92 : type === 'drone' ? 230 : 170),
      phase: options.phase ?? Phaser.Math.FloatBetween(0, Math.PI * 2),
      fireCooldown: options.fireCooldown ?? (type === 'turret' ? Phaser.Math.FloatBetween(0.5, 1.2) : 0),
      // A tagged patrol stays on station and silent until the worklight alarm.
      patrolTag: options.patrolTag || null,
      life: 0,
      radius: options.radius ?? manifest.collisionRadius,
      hp: baseHp,
      maxHp: baseHp,
      score: options.score ?? (type === 'turret' ? 220 : type === 'drone' ? 180 : type === 'zigzag' ? 150 : 100),
      sprite: this.add.image(x, y, textureKey)
        .setDisplaySize(manifest.displaySize[0], manifest.displaySize[1])
        .setDepth(DEPTH.entities),
    };
    this.state.enemies.push(enemy);
    return enemy;
  }

  spawnBullet(owner, x, y, vx, vy, radius, damage, variant) {
    const isPlayer = owner === 'player';
    const { body, highlight, outline } = isPlayer ? PROJECTILE_COLORS.player : PROJECTILE_COLORS.enemy;
    let children;

    if (isPlayer) {
      const isPulse = variant === 'pulse';
      const glow = this.add.ellipse(0, 0, isPulse ? 34 : 26, isPulse ? 16 : 12, body, 0.28);
      const streak = this.add.rectangle(0, 0, isPulse ? 24 : 20, isPulse ? 7 : 6, body)
        .setStrokeStyle(2, outline);
      const core = this.add.rectangle(2, 0, isPulse ? 16 : 12, 2, highlight);
      children = [glow, streak, core];
    } else {
      const isBurst = variant === 'burst';
      const glow = this.add.ellipse(0, 0, isBurst ? 26 : 22, isBurst ? 26 : 16, body, 0.3);
      const pellet = this.add.ellipse(0, 0, isBurst ? 16 : 13, isBurst ? 16 : 10, body)
        .setStrokeStyle(2, outline);
      const core = this.add.ellipse(isBurst ? 0 : 2, 0, isBurst ? 7 : 5, isBurst ? 7 : 4, highlight);
      children = [glow, pellet, core];
    }
    const sprite = this.add.container(x, y, children).setDepth(DEPTH.bullets);

    const bullet = {
      owner,
      x,
      y,
      vx,
      vy,
      radius,
      damage,
      dead: false,
      sprite,
    };
    this.state.bullets.push(bullet);
    return bullet;
  }

  spawnPowerUp(x, y) {
    const manifest = this.assetManifest?.pickup || DEFAULT_ASSET_MANIFEST.pickup;
    const powerUp = {
      x,
      y,
      radius: manifest.collisionRadius,
      dead: false,
      sprite: this.add.image(x, y, 'pickupPulse')
        .setDisplaySize(manifest.displaySize[0], manifest.displaySize[1])
        .setTint(COLORS.cyan)
        .setDepth(DEPTH.entities + 1),
    };
    this.state.powerUps.push(powerUp);
    return powerUp;
  }

  spawnBoss() {
    if (this.sortieIndex === 3) return this.spawnAltarWarden();
    const manifest = this.assetManifest?.boss || DEFAULT_ASSET_MANIFEST.boss;
    const hp = 360;
    const boss = {
      active: true,
      intro: true,
      x: GAME_WIDTH + 220,
      y: GAME_HEIGHT / 2,
      targetX: GAME_WIDTH - 220,
      pulse: 0,
      phase: 1,
      phaseState: 1,
      maxHp: hp,
      hp,
      radius: manifest.collisionRadius,
      fireCooldown: 1.2,
      burstCooldown: 2.8,
      summonCooldown: 4.8,
      hitFlash: 0,
      corePulse: 0,
      sprite: this.add.image(GAME_WIDTH + 220, GAME_HEIGHT / 2, 'bossShip')
        .setDisplaySize(manifest.displaySize[0], manifest.displaySize[1])
        .setDepth(DEPTH.boss),
    };
    this.state.boss = boss;
    this.showBossBar();
    this.bossBarTitle?.setText('SIEGE CARRIER');
    this.state.announcements.unshift({ text: 'BOSS INBOUND // SIEGE CARRIER DETECTED', ttl: 2.5, kind: 'warning' });
    this.updateAnnouncementDisplay();
      this.playSound('bossWarning', { volume: 0.16 });
    return boss;
  }

  // --- Solar Altar Sortie (sortie 3) --------------------------------------

  spawnAltarWarden() {
    const tuning = VoidLancerSolarAltar.DEFAULTS;
    const built = this.buildWardenSprite(GAME_WIDTH + 220, GAME_HEIGHT / 2);
    const boss = {
      kind: 'altarWarden',
      active: true,
      intro: true,
      x: GAME_WIDTH + 220,
      y: GAME_HEIGHT / 2,
      targetX: GAME_WIDTH - 236,
      pulse: 0,
      phase: 1,
      maxHp: tuning.hp,
      hp: tuning.hp,
      radius: tuning.collisionRadius,
      hitFlash: 0,
      corePulse: 0,
      // The attack module owns the telegraph timing and the ring pattern; the
      // scene only reads chargeRatio() to draw the flare and fires on burst.
      attack: VoidLancerSolarAltar.createAttack(),
      sprite: built.container,
      hull: built.hull,
      core: built.core,
      coreGlow: built.coreGlow,
      coreHalo: built.coreHalo,
      seams: built.seams,
      telegraph: built.telegraph,
    };
    this.state.boss = boss;
    this.showBossBar();
    this.bossBarTitle?.setText('ALTAR WARDEN');
    this.state.announcements.unshift({ text: 'ALTAR WARDEN // EMBER CORE EXPOSED', ttl: 2.5, kind: 'warning' });
    this.updateAnnouncementDisplay();
    this.playSound('bossWarning', { volume: 0.16 });
    return boss;
  }

  // ART HOOK: the altar-warden frame ships in the pack and this builder picks
  // it up on its own; the procedural plates below are the fallback for a pack
  // without it. Either way the additive ember core, halo and telegraph ring are
  // drawn on top here, centred on the furnace eye the cutout is registered to,
  // so the charge reads the same. Nothing else in the scene draws the Warden;
  // restyle only this method and buildWardenProceduralHull().
  buildWardenSprite(x, y) {
    const container = this.add.container(x, y).setDepth(DEPTH.boss);
    const size = VoidLancerSolarAltar.DEFAULTS.displaySize;
    const spriteReady = Boolean(this.textures?.exists?.('altarWarden'));

    const hull = spriteReady
      ? this.add.image(0, 0, 'altarWarden').setDisplaySize(size, size)
      : this.buildWardenProceduralHull();
    container.add(hull);

    // Core stack: the artwork already carries the furnace, so this only adds
    // the charge read on top of it - a compact hot centre, halo and glow, all
    // additive. Kept small on purpose: at rest the art's own eye shows through,
    // and the flare is what grows with the charge.
    const coreGlow = this.add.circle(0, 0, 40, 0xff8a4c, 0.12).setBlendMode(Phaser.BlendModes.ADD);
    const coreHalo = this.add.circle(0, 0, 24, COLORS.gold, 0.16).setBlendMode(Phaser.BlendModes.ADD);
    const core = this.add.circle(0, 0, 11, 0xfff1e0, 0.35).setBlendMode(Phaser.BlendModes.ADD);

    // Telegraph ring: transparent fill with a stroke, scaled by chargeRatio().
    const telegraph = this.add.circle(0, 0, 56, 0x000000, 0)
      .setStrokeStyle(3, COLORS.orange, 0.9)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0);

    container.add([coreGlow, coreHalo, core, telegraph]);

    return {
      container,
      hull,
      core,
      coreGlow,
      coreHalo,
      telegraph,
      // The sprite path gets its seams from the artwork; the procedural path
      // draws crimson slits that flare with the charge.
      seams: spriteReady ? [] : hull.seams || [],
    };
  }

  // Fallback gunmetal-and-gold guardian, used only when the pack has no
  // altar-warden frame: plates fanning from one exposed core, in the Empire
  // capital-ship family without cloning the Carrier's stacked prow. Readable at
  // phone width: one round silhouette, one hot eye.
  buildWardenProceduralHull() {
    const hull = this.add.container(0, 0);
    const seams = [];
    const plateCount = 12;

    const body = this.add.circle(0, 0, 64, 0x161d28, 0.96).setStrokeStyle(2, 0x38445a, 0.9);
    const innerRing = this.add.circle(0, 0, 44, 0x000000, 0)
      .setStrokeStyle(6, 0x2a3442, 0.95);

    const plates = [];
    for (let i = 0; i < plateCount; i += 1) {
      const angle = (Math.PI * 2 * i) / plateCount;
      const plate = this.add.rectangle(Math.cos(angle) * 50, Math.sin(angle) * 50, 36, 26, 0x232d3b, 1)
        .setStrokeStyle(2, 0x59687c, 0.85)
        .setRotation(angle);
      plates.push(plate);

      // Seam between the plates: crimson heat, brightest while the core charges.
      const seamAngle = angle + Math.PI / plateCount;
      const seam = this.add.rectangle(Math.cos(seamAngle) * 42, Math.sin(seamAngle) * 42, 34, 3, 0xff5a3c, 0.3)
        .setRotation(seamAngle)
        .setBlendMode(Phaser.BlendModes.ADD);
      seams.push(seam);
    }

    // Subdued ceremonial gold, edge only: quieter than the core so hazard
    // telegraphs can outshine it.
    const trim = this.add.circle(0, 0, 76, 0x000000, 0)
      .setStrokeStyle(3, COLORS.gold, 0.42);
    const trimInner = this.add.circle(0, 0, 34, 0x000000, 0)
      .setStrokeStyle(2, COLORS.gold, 0.3);

    hull.add([body, innerRing, ...seams, ...plates, trim, trimInner]);
    hull.seams = seams;
    return hull;
  }

  updateAltarWarden(dt) {
    const boss = this.state.boss;
    // A round guardian holds station in front of the altar and breathes instead
    // of weaving: the pattern is the threat, not the movement.
    boss.y = GAME_HEIGHT / 2 + Math.sin(this.state.time * 0.7) * 58;
    boss.y = this.clamp(boss.y, 140, GAME_HEIGHT - 140);

    const nextPhase = VoidLancerSolarAltar.phaseForRatio(boss.attack, boss.hp / boss.maxHp);
    if (nextPhase !== boss.attack.phase) {
      VoidLancerSolarAltar.setPhase(boss.attack, nextPhase);
      if (nextPhase === 2) {
        this.state.announcements.unshift({ text: 'WARDEN CORE // OVERDRIVE', ttl: 2, kind: 'warning' });
        this.updateAnnouncementDisplay();
        this.playSound('bossWarning', { volume: 0.18 });
      }
    }

    const events = VoidLancerSolarAltar.updateAttack(boss.attack, dt);
    // Same two existing presets the Carrier uses: the warn on the flare, the
    // crimson pellet on release. No new audio asset.
    if (events.chargeStart) this.playSound('bossWarning', { volume: 0.14 });
    if (events.burst) {
      const { angles, speed } = events.burst;
      for (const angle of angles) {
        this.spawnBullet(
          'enemy',
          boss.x + Math.cos(angle) * 40,
          boss.y + Math.sin(angle) * 40,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          5,
          1,
          'burst',
        );
      }
      this.playSound('enemyFire', { volume: 0.18, detune: -40 });
    }

    if (boss.hp <= 0) this.defeatBoss(boss, { score: 3500, ember: true });
  }

  // One death sequence for both bosses: the Carrier's timing and sounds, plus
  // the Warden's ember flare when the exposed core finally goes.
  defeatBoss(boss, options = {}) {
    this.spawnExplosionFx(boss.x, boss.y, 'boss', {
      baseScale: 1.2,
      peakScale: 2.35,
      burstDistance: 96,
      shards: 14,
      smokeCount: 5,
    });
    if (options.ember) {
      this.spawnExplosionFx(boss.x, boss.y, 'medium', {
        baseScale: 1.0,
        peakScale: 1.8,
        burstDistance: 78,
        shards: 12,
        smokeCount: 2,
        palette: [0xfff1e0, COLORS.gold, COLORS.orange],
      });
    }
    this.spawnExplosionFx(boss.x - 50, boss.y - 18, 'medium', { baseScale: 0.9, peakScale: 1.35, burstDistance: 56 });
    this.spawnExplosionFx(boss.x + 54, boss.y + 16, 'medium', { baseScale: 0.9, peakScale: 1.35, burstDistance: 56 });
    this.spawnExplosionFx(boss.x, boss.y, 'small', { baseScale: 0.8, peakScale: 1.0, burstDistance: 42, shards: 6 });
    this.cameras.main.flash(180, 255, 228, 160);
    this.playSound('bossExplosion', { volume: 0.32 });
    this.queueHeavyImpactShake(0.012, 180);
    this.state.score += options.score ?? 3000;
    this.syncHud();
    boss.active = false;
    if (boss.sprite) boss.sprite.destroy();
    this.state.boss = null;
    this.hideBossBar();
    this.finishGame(true);
  }

  spawnPanelCluster(options = {}) {
    const width = options.width ?? 154;
    const height = options.height ?? 54;
    const hp = options.hp ?? 3;
    const cluster = {
      kind: 'panelCluster',
      x: options.x ?? GAME_WIDTH + 120,
      y: options.y ?? Phaser.Math.Between(120, 396),
      speed: options.speed ?? 22,
      width,
      height,
      hp,
      maxHp: hp,
      radius: options.radius ?? Math.max(width, height) * 0.42,
      baseVentInterval: options.ventInterval ?? 4.6,
      ventCooldown: Phaser.Math.FloatBetween(1.2, options.ventInterval ?? 4.6),
      ventChargeDuration: options.ventChargeDuration ?? 0.5,
      ventCharge: 0,
      ventBurst: options.ventBurst ?? 1,
      bossLinked: Boolean(options.bossLinked),
      phaseBoost: 0,
      flash: 0,
      collapse: 0,
      dead: false,
      sparkFade: 0,
      warningPulse: 0,
    };

    const container = this.add.container(cluster.x, cluster.y).setDepth(DEPTH.foregroundProps + 3);
    const shell = this.add.rectangle(0, 0, width, height, 0x253547, 0.94)
      .setStrokeStyle(2, 0x6d8aa4, 0.35);
    const braceTop = this.add.rectangle(0, -height * 0.28, width - 20, 5, COLORS.cyan, 0.1)
      .setBlendMode(Phaser.BlendModes.ADD);
    const braceBottom = this.add.rectangle(0, height * 0.28, width - 30, 4, COLORS.orange, 0.1)
      .setBlendMode(Phaser.BlendModes.ADD);
    const ventGlow = this.add.ellipse(width * 0.28, 0, 52, 28, COLORS.gold, 0.12)
      .setBlendMode(Phaser.BlendModes.ADD);
    const warningLamp = this.add.circle(-width * 0.34, -height * 0.22, 5, COLORS.orange, 0.88)
      .setBlendMode(Phaser.BlendModes.ADD);
    const warningHalo = this.add.circle(-width * 0.34, -height * 0.22, 15, COLORS.orange, 0.12)
      .setBlendMode(Phaser.BlendModes.ADD);
    const seamA = this.add.rectangle(-width * 0.08, -2, width * 0.68, 2, 0x4c6072, 0.42);
    const seamB = this.add.rectangle(width * 0.1, 10, width * 0.48, 2, 0x7088a2, 0.24);
    const crackA = this.add.rectangle(-width * 0.16, -10, width * 0.42, 2, COLORS.red, 0.0)
      .setBlendMode(Phaser.BlendModes.ADD);
    const crackB = this.add.rectangle(-width * 0.02, 6, width * 0.28, 2, COLORS.red, 0.0)
      .setBlendMode(Phaser.BlendModes.ADD);
    const support = this.add.rectangle(width * 0.28, 0, 10, height + 10, 0x111c27, 0.4);

    container.add([shell, braceTop, braceBottom, ventGlow, warningHalo, warningLamp, seamA, seamB, crackA, crackB, support]);

    cluster.container = container;
    cluster.shell = shell;
    cluster.ventGlow = ventGlow;
    cluster.warningLamp = warningLamp;
    cluster.warningHalo = warningHalo;
    cluster.crackA = crackA;
    cluster.crackB = crackB;
    cluster.shellBaseAlpha = 0.94;

    this.state.environmentPanels.push(cluster);
    return cluster;
  }

  spawnFx(kind, x, y, options = {}) {
    const config = FX_LIBRARY[kind];
    if (!config) return null;

    const palette = options.palette || config.palette;
    const primary = palette[0];
    const secondary = palette[1] ?? primary;
    const accent = palette[2] ?? secondary;
    const container = this.add.container(x, y).setDepth(options.depth ?? DEPTH.particles);
    const fx = {
      kind,
      x,
      y,
      age: 0,
      duration: options.duration ?? config.duration,
      baseScale: options.baseScale ?? config.baseScale,
      peakScale: options.peakScale ?? config.peakScale,
      fadeStart: options.fadeStart ?? config.fadeStart,
      burstDistance: options.burstDistance ?? config.burstDistance,
      spin: (options.spin ?? config.spin) * (Math.random() > 0.5 ? 1 : -1),
      container,
      ring: null,
      glow: null,
      core: null,
      shards: [],
      smoke: [],
    };

    const glowRadius = Phaser.Math.Between(config.glowRadius[0], config.glowRadius[1]);
    const coreRadius = Phaser.Math.Between(config.coreRadius[0], config.coreRadius[1]);
    const ringRadius = Phaser.Math.Between(config.ringRadius[0], config.ringRadius[1]);

    fx.glow = this.add.ellipse(0, 0, glowRadius * 2.2, glowRadius * 1.5, primary, 0.2)
      .setBlendMode(Phaser.BlendModes.ADD);
    fx.ring = this.add.ellipse(0, 0, ringRadius * 2, ringRadius * 2, 0x000000, 0)
      .setStrokeStyle(2, secondary, 0.85)
      .setBlendMode(Phaser.BlendModes.ADD);
    fx.core = this.add.circle(0, 0, coreRadius, accent, 0.95)
      .setBlendMode(Phaser.BlendModes.ADD);

    container.add([fx.glow, fx.ring, fx.core]);

    const shardCount = options.shards ?? config.shardCount;
    for (let i = 0; i < shardCount; i += 1) {
      const angle = (Math.PI * 2 * i) / shardCount + Phaser.Math.FloatBetween(-0.18, 0.18);
      const length = Phaser.Math.Between(config.shardLength[0], config.shardLength[1]);
      const thickness = Phaser.Math.Between(config.shardThickness[0], config.shardThickness[1]);
      const shard = this.add.rectangle(0, 0, length, thickness, i % 2 === 0 ? secondary : accent, 0.95)
        .setBlendMode(Phaser.BlendModes.ADD);
      shard.fxAngle = angle;
      shard.fxDistance = Phaser.Math.FloatBetween(config.burstDistance * 0.55, config.burstDistance);
      shard.fxSpin = Phaser.Math.FloatBetween(-7, 7);
      shard.fxBaseRotation = angle + Phaser.Math.FloatBetween(-0.2, 0.2);
      shard.fxStretch = Phaser.Math.FloatBetween(0.85, 1.25);
      fx.shards.push(shard);
      container.add(shard);
    }

    const smokeCount = options.smokeCount ?? config.smokeCount;
    for (let i = 0; i < smokeCount; i += 1) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const smoke = this.add.circle(0, 0, Phaser.Math.Between(7, 13), secondary, 0.26)
        .setBlendMode(Phaser.BlendModes.ADD);
      smoke.fxAngle = angle;
      smoke.fxDistance = Phaser.Math.FloatBetween(config.burstDistance * 0.3, config.burstDistance * 0.8);
      smoke.fxSpin = Phaser.Math.FloatBetween(-2, 2);
      smoke.fxBaseScale = Phaser.Math.FloatBetween(0.9, 1.25);
      fx.smoke.push(smoke);
      container.add(smoke);
    }

    this.state.fx.push(fx);
    return fx;
  }

  spawnHitSpark(x, y, options = {}) {
    return this.spawnFx('hitSpark', x, y, options);
  }

  spawnPlayerDamageBurst(x, y, options = {}) {
    return this.spawnFx('playerDamage', x, y, options);
  }

  spawnExplosionFx(x, y, size = 'small', options = {}) {
    const kind = size === 'boss' ? 'bossExplosion' : size === 'medium' ? 'mediumExplosion' : 'smallExplosion';
    return this.spawnFx(kind, x, y, options);
  }

  triggerPanelVent(panel) {
    if (!panel || panel.dead) return;

    const burstCount = panel.ventBurst + (panel.phaseBoost > 0 ? 1 : 0);
    const ventOriginX = panel.x - panel.width * 0.42;
    const ventOriginY = panel.y + Phaser.Math.Between(-8, 8);

    for (let i = 0; i < burstCount; i += 1) {
      const offsetY = (i - (burstCount - 1) / 2) * 11;
      this.spawnBullet('enemy', ventOriginX, ventOriginY + offsetY, -250 - i * 18, offsetY * 2.8, 4, 1, 'burst');
    }

    this.spawnHitSpark(ventOriginX + 6, ventOriginY, {
      baseScale: 0.5,
      peakScale: 0.9,
      burstDistance: 20,
      shardCount: 4,
      smokeCount: 0,
      palette: [COLORS.gold, COLORS.cyan, COLORS.white],
    });
    panel.flash = Math.max(panel.flash, 0.22);
    panel.sparkFade = 0.26;
  }

  boostBossLinkedPanels() {
    if (!this.state?.environmentPanels?.length) return;

    this.state.announcements.unshift({
      text: 'CARRIER UPLINK // PANEL VENTS GO HOT',
      ttl: 1.7,
      kind: 'warning',
    });
    this.updateAnnouncementDisplay();

    for (const panel of this.state.environmentPanels) {
      if (panel.dead) continue;
      panel.phaseBoost = 0.7;
      panel.ventCooldown = Math.min(panel.ventCooldown, panel.bossLinked ? 0.75 : 1.15);
      panel.flash = Math.max(panel.flash, panel.bossLinked ? 0.32 : 0.16);
    }
  }

  syncHud() {
    const score = this.state.score;
    const scoreChanged = score !== this.uiState.lastScore;
    const weaponChanged = this.state.player.weaponLevel !== this.uiState.lastWeaponLevel;

    this.scoreText.setText(score.toString().padStart(6, '0'));
    this.livesText.setText(this.state.player.lives.toString().padStart(2, '0'));
    this.weaponText.setText(this.state.player.weaponLevel > 1 ? 'PULSE+' : 'PULSE');
    this.weaponTag.setText(this.state.player.weaponLevel > 1 ? 'MK II' : 'MK I');
    // The counter reads display order, never the routing identity: the finale
    // shows 12 / 12 while ?sortie=3 still routes to it for practice.
    const entry = this.campaignEntry();
    this.stageText.setText(stageLabel(entry));
    if (entry.kind === 'arcade') {
      // An arcade stage has no boss queue and no warden to telegraph, so the
      // tag just names the lane that is live.
      this.stageTag.setText(entry.title.toUpperCase());
      this.stageTag.setColor('#8ea6cd');
    } else if (this.sortieIndex === 3) {
      this.stageTag.setText(this.state.boss ? 'WARDEN ENGAGED' : this.state.bossQueued ? 'CORE LOCKED' : 'ALTAR LANE');
      this.stageTag.setColor(this.state.boss || this.state.bossQueued ? '#ffd65a' : '#8ea6cd');
    } else if (this.sortieIndex === 2) {
      this.stageTag.setText('GRAVEYARD LANE');
      this.stageTag.setColor('#8ea6cd');
    } else {
      this.stageTag.setText(this.state.boss ? 'BOSS LANE' : this.state.bossQueued ? 'SIGNAL LOCKED' : 'OPENING LANE');
      this.stageTag.setColor(this.state.boss || this.state.bossQueued ? '#ffd65a' : '#8ea6cd');
    }

    this.livesPips.getChildren().forEach((pip, index) => {
      pip.setAlpha(index < this.state.player.lives ? 0.96 : 0.2);
      pip.setScale(index < this.state.player.lives ? 1 : 0.82);
    });

    if (scoreChanged) {
      const delta = score - this.uiState.lastScore;
      this.spawnScoreBurst(delta);
      this.pulseText(this.scoreText, COLORS.cyan, 1.14, 180);
      this.uiState.lastScore = score;
    }

    if (weaponChanged) {
      this.showWeaponUpgradePulse(this.state.player.weaponLevel);
      this.uiState.lastWeaponLevel = this.state.player.weaponLevel;
    }
  }

  updateAnnouncementDisplay() {
    const current = this.state.announcements[0];
    const visible = Boolean(current);
    this.announcementBg.setVisible(visible);
    this.announcementGlow.setVisible(visible);
    this.announcementText.setVisible(visible);
    this.announcementSubtext.setVisible(visible);
    if (!visible) {
      this.uiState.lastAnnouncementKey = '';
      return;
    }
    if (visible) {
      const key = `${current.kind || 'notice'}:${current.text}`;
      if (key !== this.uiState.lastAnnouncementKey) {
        this.uiState.lastAnnouncementKey = key;
        this.showAnnouncementBanner(current.text, current.kind || 'notice');
      }
      this.announcementText.setText(current.text);
      this.announcementSubtext.setText(current.kind === 'warning' ? 'WARNING // HIGH THREAT' : current.kind === 'upgrade' ? 'SYSTEM // LOADOUT UPDATED' : 'SYSTEM // STATUS');
    }
  }

  showBossBar() {
    this.bossBarFill.setVisible(true);
    this.bossBarFrame.setVisible(true);
    this.bossBarBack.setVisible(true);
    this.bossBarGlow.setVisible(true);
    this.bossBarTitle.setVisible(true);
    this.bossBarText.setVisible(true);
    this.uiState.lastBossRatio = 1;
  }

  hideBossBar() {
    this.bossBarFill.setVisible(false);
    this.bossBarFrame.setVisible(false);
    this.bossBarBack.setVisible(false);
    this.bossBarGlow.setVisible(false);
    this.bossBarTitle.setVisible(false);
    this.bossBarText.setVisible(false);
  }

  pulseText(textObject, tint, scale = 1.1, duration = 180) {
    if (!textObject) return;
    textObject.setTint(tint);
    this.tweens.killTweensOf(textObject);
    this.tweens.add({
      targets: textObject,
      scale,
      duration,
      yoyo: true,
      ease: 'Sine.easeOut',
      onComplete: () => {
        textObject.clearTint();
        textObject.setScale(1);
      },
    });
  }

  spawnScoreBurst(delta) {
    if (!delta) return;
    this.scorePulseText.setText(`${delta > 0 ? '+' : ''}${delta}`);
    this.scorePulseText.setColor(delta >= 0 ? '#7ae7ff' : '#ff697b');
    this.scorePulseText.setVisible(true).setAlpha(1).setScale(1);
    this.scorePulseText.y = 28;
    this.scorePulseText.setShadow(0, 0, '#000000', 6, false, true);
    this.tweens.killTweensOf(this.scorePulseText);
    this.tweens.add({
      targets: this.scorePulseText,
      y: 14,
      alpha: 0,
      duration: 720,
      ease: 'Sine.easeOut',
      onComplete: () => this.scorePulseText.setVisible(false),
    });
  }

  showWeaponUpgradePulse(level) {
    const upgradeText = level > 1 ? 'PULSE+' : 'PULSE';
    this.weaponTag.setText(level > 1 ? 'MK II' : 'MK I');
    this.weaponGlow.setFillStyle(level > 1 ? COLORS.gold : COLORS.cyan, 0.14);
    this.weaponGlow.setAlpha(0.0);
    this.pulseText(this.weaponText, level > 1 ? COLORS.gold : COLORS.cyan, 1.16, 220);
    this.tweens.killTweensOf(this.weaponGlow);
    this.tweens.add({
      targets: this.weaponGlow,
      alpha: level > 1 ? 0.22 : 0.16,
      scaleX: 1.12,
      scaleY: 1.12,
      duration: 240,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
    this.weaponText.setText(upgradeText);
  }

  showAnnouncementBanner(text, kind = 'notice') {
    const style = kind === 'warning'
      ? { bg: 0x2a1115, fill: COLORS.red, glow: COLORS.red, text: '#fff1f4', subColor: '#ffb3bf', sub: 'WARNING // BOSS SIGNAL' }
      : kind === 'upgrade'
        ? { bg: 0x0c1f1d, fill: COLORS.mint, glow: COLORS.mint, text: '#f3fff9', subColor: '#9fffd2', sub: 'SYSTEM // LOADOUT UPDATED' }
        : { bg: 0x08111f, fill: COLORS.cyan, glow: COLORS.cyan, text: '#eef5ff', subColor: '#9fdfff', sub: 'SYSTEM // STATUS' };

    this.announcementBg.setFillStyle(style.bg, 0.88);
    this.announcementBg.setStrokeStyle(1, style.fill, 0.22);
    this.announcementGlow.setFillStyle(style.glow, 0.12);
    this.announcementText.setColor(style.text);
    this.announcementSubtext.setColor(style.subColor);
    this.announcementSubtext.setText(style.sub);
    this.announcementText.setText(text);
    this.announcementText.setVisible(true);
    this.announcementSubtext.setVisible(true);
    this.announcementBg.setScale(0.96);
    this.announcementGlow.setScale(0.92);
    this.announcementBg.setAlpha(0.0);
    this.announcementGlow.setAlpha(0.0);
    this.announcementText.setAlpha(0.35);
    this.announcementSubtext.setAlpha(0.22);
    this.tweens.killTweensOf(this.announcementBg);
    this.tweens.killTweensOf(this.announcementGlow);
    this.tweens.killTweensOf(this.announcementText);
    this.tweens.killTweensOf(this.announcementSubtext);
    this.tweens.add({ targets: this.announcementBg, alpha: 1, scale: 1, duration: 180, ease: 'Sine.easeOut' });
    this.tweens.add({ targets: this.announcementGlow, alpha: 1, scale: 1, duration: 260, ease: 'Sine.easeOut' });
    this.tweens.add({ targets: this.announcementText, alpha: 1, duration: 140, delay: 20 });
    this.tweens.add({ targets: this.announcementSubtext, alpha: 1, duration: 140, delay: 50 });
  }

  updateOverlayMotion(dt) {
    if (!this.overlayMotionLayer || !this.overlayMotionLayer.visible) return;
    for (const [index, item] of this.overlayMotionOrbs.entries()) {
      if (index < 2) {
        item.x = item.baseX + Math.sin(this.time.now * 0.00012 + index) * 8;
        item.y = item.baseY + Math.cos(this.time.now * 0.00015 + index) * 6;
      } else {
        item.x = item.baseX + Math.sin(this.time.now * 0.00018) * 18;
      }
    }
    this.overlayLogoGlow.rotation = Math.sin(this.time.now * 0.0008) * 0.02;
  }

  updateHudEffects(dt) {
    if (this.hudGlow) {
      this.hudGlow.alpha = 0.06 + Math.sin(this.time.now * 0.004) * 0.01;
    }

    if (this.hudSweep) {
      this.hudSweep.x = GAME_WIDTH / 2 + Math.sin(this.time.now * 0.0018) * 14;
      this.hudSweep.alpha = 0.14 + Math.sin(this.time.now * 0.006) * 0.02;
    }

    if (this.weaponGlow) {
      this.weaponGlow.rotation += dt * 0.18;
      this.weaponGlow.alpha = Phaser.Math.Clamp(this.weaponGlow.alpha + Math.sin(this.time.now * 0.005) * 0.001, 0, 0.22);
    }

    if (this.announcementBg && this.announcementBg.visible) {
      const wobble = Math.sin(this.time.now * 0.006) * 0.01;
      this.announcementBg.setRotation(wobble);
      this.announcementGlow.rotation = -wobble * 0.6;
    }

    if (this.state?.boss && this.state.boss.active && this.bossBarFill && this.bossBarFill.visible) {
      const ratio = Phaser.Math.Clamp(this.state.boss.hp / this.state.boss.maxHp, 0, 1);
      this.uiState.lastBossRatio = lerp(this.uiState.lastBossRatio, ratio, 0.16);
      const width = 240 * this.uiState.lastBossRatio;
      this.bossBarFill.width = width;
      this.bossBarFill.x = 660;
      this.bossBarGlow.alpha = 0.16 + (1 - this.uiState.lastBossRatio) * 0.18;
      this.bossBarText.setText(`${Math.max(0, Math.ceil(this.state.boss.hp))} / ${this.state.boss.maxHp}`);
      this.bossBarText.setColor(this.uiState.lastBossRatio < 0.3 ? '#ff697b' : '#8ea6cd');
      this.bossBarTitle.setAlpha(0.9 + Math.sin(this.time.now * 0.009) * 0.06);
    }
  }

  safeEnemyY() {
    return Phaser.Math.FloatBetween(70, GAME_HEIGHT - 70);
  }

  clamp(value, min, max) {
    return Phaser.Math.Clamp(value, min, max);
  }

  circleHit(ax, ay, ar, bx, by, br) {
    const dx = ax - bx;
    const dy = ay - by;
    return dx * dx + dy * dy <= (ar + br) * (ar + br);
  }

  rectCircleHit(rect, cx, cy, radius) {
    const testX = this.clamp(cx, rect.x, rect.x + rect.w);
    const testY = this.clamp(cy, rect.y, rect.y + rect.h);
    const dx = cx - testX;
    const dy = cy - testY;
    return dx * dx + dy * dy <= radius * radius;
  }

  playerRect() {
    return {
      x: this.state.player.x - this.state.player.w / 2,
      y: this.state.player.y - this.state.player.h / 2,
      w: this.state.player.w,
      h: this.state.player.h,
    };
  }

  update(time, deltaMs) {
    const dt = Math.min(deltaMs, 120) / 1000;

    this.bgStarfield.tilePositionX += 10 * dt;
    this.bgNebula.tilePositionX += 18 * dt;
    this.bgMegastructure.tilePositionX += 30 * dt;
    this.bgForeground.tilePositionX += 68 * dt;
    this.bgNebula.tilePositionY = Math.sin(this.time.now * 0.00018) * 8;
    this.bgMegastructure.tilePositionY = Math.sin(this.time.now * 0.00032) * 5;
    this.bgForeground.tilePositionY = Math.sin(this.time.now * 0.0007) * 10;
    this.updateAtmosphereLayers(dt);
    this.updateHazardLights(dt);
    this.updateForegroundProps(dt);
    this.updateStageBackdropModules(dt);
    this.updateAltar(dt);
    this.updateEnvironmentPanels(dt);
    this.updateOverlayMotion(dt);
    this.updateHudEffects(dt);

    if (this.state.mode !== 'playing') {
      return;
    }

    this.state.time += dt;
    this.updatePlayer(dt);
    this.updateEnvironmentTimeline();
    this.updateWaves();
    this.updateEnemies(dt);
    this.updateBoss(dt);
    this.updateBullets(dt);
    this.updatePowerUps(dt);
    this.updateCollisions();
    this.updateFx(dt);
    this.updateAnnouncements(dt);
    // updateBullets/updateCollisions can end the run inside this same frame, so
    // the worklight read and the timed clear only run while the lane is live.
    // The clock clears any lane that declares a missionDuration - the Graveyard
    // crossing and the nine arcade stages. The First Sortie and the Solar Altar
    // declare none and end on their boss instead.
    if (this.state.mode === 'playing') {
      if (this.sortieIndex === 2) this.updateGraveyard(dt);
      const duration = this.levelStageData?.missionDuration;
      if (duration && this.state.time >= duration) this.finishGame(true);
    }
    this.renderState();
  }

  updatePlayer(dt) {
    const p = this.state.player;
    let dx = 0;
    let dy = 0;

    if (this.actionState.isHeld('moveUp')) dy -= 1;
    if (this.actionState.isHeld('moveDown')) dy += 1;
    if (this.actionState.isHeld('moveLeft')) dx -= 1;
    if (this.actionState.isHeld('moveRight')) dx += 1;

    const len = Math.hypot(dx, dy) || 1;
    p.x += (dx / len) * p.speed * dt;
    p.y += (dy / len) * p.speed * dt;
    p.x = this.clamp(p.x, 50, GAME_WIDTH - 100);
    p.y = this.clamp(p.y, 40, GAME_HEIGHT - 40);
    p.cooldown = Math.max(0, p.cooldown - dt);
    p.invuln = Math.max(0, p.invuln - dt);

    const firing = this.actionState.isHeld('fire');
    if (firing && p.cooldown <= 0) {
      p.cooldown = p.weaponLevel > 1 ? 0.14 : 0.18;
      this.spawnBullet('player', p.x + 24, p.y, 560, 0, 4, 8);
      if (p.weaponLevel > 1) {
        this.spawnBullet('player', p.x + 16, p.y - 10, 520, -90, 3, 6, 'pulse');
        this.spawnBullet('player', p.x + 16, p.y + 10, 520, 90, 3, 6, 'pulse');
      }
      this.playSound('playerFire', { volume: p.weaponLevel > 1 ? 0.22 : 0.18 });
      this.primePlayerRecoil();
    }

    p.fireKick = Math.max(0, (p.fireKick || 0) - dt * 5.4);
    p.bank = lerp(p.bank || 0, Phaser.Math.Clamp(dx * 0.09, -0.09, 0.09), 0.14);
  }

  updateWaves() {
    for (const wave of this.state.waves) {
      if (!wave.done && this.state.time >= wave.time) {
        wave.done = true;
        wave.action();
      }
    }
    if (this.state.bossQueued && !this.state.boss && this.state.enemies.length === 0) {
      this.state.bossQueued = false;
      this.spawnBoss();
    }
  }

  updateEnvironmentTimeline() {
    for (const event of this.state.environmentTimeline || []) {
      if (!event.done && this.state.time >= event.time) {
        event.done = true;
        event.action();
      }
    }
  }

  updateEnemies(dt) {
    for (const enemy of this.state.enemies) {
      enemy.life += dt;
      if (enemy.type === 'scout') {
        enemy.x -= enemy.speed * dt;
      } else if (enemy.type === 'zigzag') {
        enemy.x -= enemy.speed * dt;
        enemy.y += Math.sin(enemy.life * 4 + enemy.phase) * 90 * dt;
      } else if (enemy.type === 'turret') {
        enemy.x -= enemy.speed * dt;
        enemy.y += Math.sin(enemy.life * 2.4 + enemy.phase) * 40 * dt;
        const onStation = Boolean(enemy.patrolTag);
        const alarmed = !onStation || Boolean(this.state.graveyard?.detection?.alarm);
        if (!alarmed) {
          // Tagged patrol: silent and held ready on station until the alarm lands.
          enemy.fireCooldown = 0.45;
        } else {
          enemy.fireCooldown -= dt * (onStation ? 1.6 : 1);
          if (enemy.fireCooldown <= 0) {
            enemy.fireCooldown = 1.4;
            const dy = this.state.player.y - enemy.y;
            const aim = this.clamp(dy * 1.2, -180, 180);
            this.spawnBullet('enemy', enemy.x - enemy.radius, enemy.y, -280, aim, 5, 1);
            this.playSound('enemyFire', { volume: enemy.type === 'turret' ? 0.14 : 0.12, detune: enemy.type === 'turret' ? 0 : -20 });
          }
        }
      } else if (enemy.type === 'drone') {
        enemy.x -= enemy.speed * dt;
        enemy.y += Math.cos(enemy.life * 5 + enemy.phase) * 130 * dt;
      }
    }

    this.state.enemies = this.state.enemies.filter((enemy) => {
      const keep = enemy.x > -120 && enemy.hp > 0;
      if (!keep && enemy.sprite) enemy.sprite.destroy();
      return keep;
    });
  }

  updateBoss(dt) {
    const boss = this.state.boss;
    if (!boss || !boss.active) return;

    boss.pulse += dt;
    if (boss.intro) {
      boss.x += (boss.targetX - boss.x) * 0.035;
      if (Math.abs(boss.x - boss.targetX) < 3) boss.intro = false;
      return;
    }

    if (boss.kind === 'altarWarden') {
      this.updateAltarWarden(dt);
      return;
    }

    boss.y += Math.sin(this.state.time * 1.6) * 55 * dt;
    boss.y = this.clamp(boss.y, 110, GAME_HEIGHT - 110);
    const nextPhase = boss.hp < boss.maxHp * 0.45 ? 2 : 1;
    if (nextPhase !== boss.phase) {
      boss.phase = nextPhase;
      if (boss.phase === 2 && boss.phaseState !== 2) {
        boss.phaseState = 2;
        this.boostBossLinkedPanels();
      }
    }
    boss.fireCooldown -= dt;
    boss.burstCooldown -= dt;
    boss.summonCooldown -= dt;

    if (boss.fireCooldown <= 0) {
      boss.fireCooldown = boss.phase === 1 ? 1.1 : 0.7;
      const spreads = boss.phase === 1 ? [-0.16, 0, 0.16] : [-0.28, -0.1, 0.1, 0.28];
      for (const spread of spreads) {
        this.spawnBullet('enemy', boss.x - 54, boss.y + spread * 180, -330, spread * 150, 6, 1);
      }
      this.playSound('enemyFire', { volume: boss.phase === 1 ? 0.16 : 0.18, detune: -60 });
    }

    if (boss.burstCooldown <= 0) {
      boss.burstCooldown = boss.phase === 1 ? 3.2 : 2.3;
      for (let i = -2; i <= 2; i += 1) {
        this.spawnBullet('enemy', boss.x - 40, boss.y, -260, i * 90, 5, 1, 'burst');
      }
    }

    if (boss.phase === 2 && boss.summonCooldown <= 0) {
      boss.summonCooldown = 5.5;
      this.spawnEnemy('drone', GAME_WIDTH + 40, boss.y - 60, { speed: 240 });
      this.spawnEnemy('drone', GAME_WIDTH + 110, boss.y + 60, { speed: 240 });
    }

    if (boss.hp <= 0) {
      this.defeatBoss(boss);
    }
  }

  hitPlayer() {
    const p = this.state.player;
    if (p.invuln > 0) return;
    p.lives -= 1;
    p.invuln = 1.6;
    this.spawnPlayerDamageBurst(p.x, p.y, { baseScale: 0.8, peakScale: 1.4, burstDistance: 42 });
    this.syncHud();
    if (p.lives <= 0) this.finishGame(false);
  }

  updateBullets(dt) {
    const pRect = this.playerRect();
    for (const bullet of this.state.bullets) {
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;

      if (bullet.owner === 'player') {
        if (!bullet.dead && this.state.environmentPanels?.length) {
          for (const panel of this.state.environmentPanels) {
            if (panel.dead) continue;
            if (this.circleHit(bullet.x, bullet.y, bullet.radius, panel.x, panel.y, panel.radius)) {
              bullet.dead = true;
              panel.hp -= bullet.damage;
              panel.flash = Math.max(panel.flash, 0.22);
              panel.sparkFade = Math.max(panel.sparkFade, 0.18);
              panel.ventCharge = 0;
              panel.ventCooldown = Math.max(0.9, panel.baseVentInterval * 0.72);
              this.spawnHitSpark(bullet.x, bullet.y, { baseScale: 0.48, peakScale: 1.0, burstDistance: 24, shardCount: 4 });
              if (panel.hp <= 0) {
                panel.dead = true;
                panel.collapse = 0.35;
                this.spawnExplosionFx(panel.x, panel.y, 'small', { baseScale: 0.72, peakScale: 1.18, burstDistance: 34, shards: 6 });
                this.state.score += 75;
                this.syncHud();
              }
              break;
            }
          }
        }

        if (!bullet.dead) {
          for (const enemy of this.state.enemies) {
          if (enemy.hp > 0 && this.circleHit(bullet.x, bullet.y, bullet.radius, enemy.x, enemy.y, enemy.radius)) {
            bullet.dead = true;
            enemy.hp -= bullet.damage;
            this.spawnHitSpark(bullet.x, bullet.y, { baseScale: 0.5, peakScale: 1.1, burstDistance: 22 });
            if (enemy.hp <= 0) {
              this.state.score += enemy.score;
              this.playSound(enemy.type === 'turret' || enemy.type === 'drone' ? 'explosionMedium' : 'explosionSmall');
              this.spawnExplosionFx(
                enemy.x,
                enemy.y,
                enemy.type === 'turret' || enemy.type === 'drone' ? 'medium' : 'small',
                enemy.type === 'turret' || enemy.type === 'drone'
                  ? { baseScale: 0.85, peakScale: 1.45, burstDistance: 52 }
                  : { baseScale: 0.72, peakScale: 1.1, burstDistance: 34 }
              );
              this.syncHud();
              if (enemy.type === 'turret' && this.state.player.weaponLevel === 1 && Math.random() > 0.4) {
                this.spawnPowerUp(enemy.x, enemy.y);
              }
            }
            break;
          }
        }
        }

        if (!bullet.dead && this.state.boss && this.state.boss.active) {
          if (this.circleHit(bullet.x, bullet.y, bullet.radius, this.state.boss.x, this.state.boss.y, this.state.boss.radius)) {
            bullet.dead = true;
            this.state.boss.hp -= bullet.damage;
            this.spawnHitSpark(bullet.x, bullet.y, { baseScale: 0.7, peakScale: 1.2, burstDistance: 28, shards: 5 });
            this.playSound('bossHit', { volume: 0.14 });
            this.primeBossHit();
            this.queueHeavyImpactShake(0.0045, 70);
          }
        }
      } else if (this.rectCircleHit(pRect, bullet.x, bullet.y, bullet.radius)) {
        bullet.dead = true;
        this.hitPlayer();
      }
    }

    this.state.bullets = this.state.bullets.filter((bullet) => {
      const keep = !bullet.dead && bullet.x > -50 && bullet.x < GAME_WIDTH + 50 && bullet.y > -50 && bullet.y < GAME_HEIGHT + 50;
      if (!keep && bullet.sprite) bullet.sprite.destroy();
      return keep;
    });
  }

  updateCollisions() {
    const pRect = this.playerRect();
    for (const enemy of this.state.enemies) {
      if (this.rectCircleHit(pRect, enemy.x, enemy.y, enemy.radius)) {
        enemy.hp = 0;
        this.hitPlayer();
      }
    }
    if (this.state.boss && this.state.boss.active && this.rectCircleHit(pRect, this.state.boss.x, this.state.boss.y, this.state.boss.radius - 10)) {
      this.hitPlayer();
    }
    for (const power of this.state.powerUps) {
      if (this.rectCircleHit(pRect, power.x, power.y, power.radius)) {
        power.dead = true;
        this.state.player.weaponLevel = 2;
        this.state.score += 250;
        this.state.announcements.push({ text: 'Pulse upgrade online', ttl: 1.8, kind: 'upgrade' });
        this.updateAnnouncementDisplay();
        this.spawnExplosionFx(power.x, power.y, 'small', { palette: [0x90ffc9, 0x7ff0b8, 0xeafff4], baseScale: 0.5, peakScale: 0.85, burstDistance: 24, shards: 4, smokeCount: 0 });
        this.playSound('pickup', { volume: 0.18 });
        this.syncHud();
      }
    }
  }

  updatePowerUps(dt) {
    for (const power of this.state.powerUps) {
      power.x -= 120 * dt;
      power.y += Math.sin(this.state.time * 4 + power.x * 0.02) * 35 * dt;
    }
    this.state.powerUps = this.state.powerUps.filter((power) => {
      const keep = !power.dead && power.x > -30;
      if (!keep && power.sprite) power.sprite.destroy();
      return keep;
    });
  }

  updateFx(dt) {
    for (const fx of this.state.fx) {
      fx.age += dt;
      const t = this.clamp(fx.age / fx.duration, 0, 1);
      const rise = easeOutCubic(this.clamp(t / 0.24, 0, 1));
      const settle = easeOutQuad(this.clamp((t - 0.24) / 0.28, 0, 1));
      const fade = t < fx.fadeStart ? 1 : 1 - easeInQuad(this.clamp((t - fx.fadeStart) / Math.max(0.001, 1 - fx.fadeStart), 0, 1));
      const scale = fx.baseScale * (lerp(0.25, fx.peakScale, rise) * lerp(1, 0.94, settle));

      fx.container.setScale(scale);
      fx.container.setAlpha(fade);
      fx.container.rotation += fx.spin * dt * 0.06;

      const burst = easeOutCubic(this.clamp(t / 0.4, 0, 1));
      const sparkBurst = fx.kind === 'hitSpark' ? 1.1 : 1;

      fx.glow.alpha = fade * (fx.kind === 'bossExplosion' ? 0.26 : 0.18);
      fx.glow.scaleX = 1 + burst * (fx.kind === 'bossExplosion' ? 1.3 : 0.8);
      fx.glow.scaleY = 1 + burst * (fx.kind === 'bossExplosion' ? 0.9 : 0.6);
      fx.ring.alpha = fade * 0.9;
      fx.ring.scaleX = 0.6 + burst * (fx.kind === 'bossExplosion' ? 2.4 : 1.2);
      fx.ring.scaleY = 0.6 + burst * (fx.kind === 'bossExplosion' ? 2.2 : 1.1);
      fx.ring.rotation += dt * 0.35 * fx.spin * 0.1;
      fx.core.alpha = fade;
      fx.core.scaleX = 0.75 + burst * 0.9;
      fx.core.scaleY = 0.75 + burst * 0.9;

      for (const shard of fx.shards) {
        const shardTravel = burst * shard.fxDistance * sparkBurst;
        shard.x = Math.cos(shard.fxAngle) * shardTravel;
        shard.y = Math.sin(shard.fxAngle) * shardTravel;
        shard.rotation = shard.fxBaseRotation + fx.age * shard.fxSpin * 0.15;
        shard.scaleX = shard.fxStretch * (0.88 + burst * 0.45);
        shard.scaleY = 0.85 + burst * 0.2;
        shard.alpha = fade * (1 - t * 0.3);
      }

      for (const smoke of fx.smoke) {
        const drift = burst * smoke.fxDistance;
        smoke.x = Math.cos(smoke.fxAngle) * drift;
        smoke.y = Math.sin(smoke.fxAngle) * drift;
        smoke.scale = smoke.fxBaseScale * (0.7 + burst * 1.3);
        smoke.alpha = fade * (fx.kind === 'bossExplosion' ? 0.2 : 0.12) * (1 - t * 0.45);
        smoke.rotation += dt * smoke.fxSpin;
      }
    }

    this.state.fx = this.state.fx.filter((fx) => {
      const keep = fx.age < fx.duration;
      if (!keep && fx.container) fx.container.destroy();
      return keep;
    });
  }

  updateAnnouncements(dt) {
    for (const item of this.state.announcements) item.ttl -= dt;
    this.state.announcements = this.state.announcements.filter((item) => item.ttl > 0);
    this.updateAnnouncementDisplay();
  }

  updateEnvironmentPanels(dt) {
    if (!this.state?.environmentPanels?.length) return;

    const survivingPanels = [];

    for (const panel of this.state.environmentPanels) {
      panel.x -= panel.speed * dt;
      panel.warningPulse = Math.max(0, (panel.warningPulse || 0) - dt);
      panel.flash = Math.max(0, (panel.flash || 0) - dt * 1.7);
      panel.sparkFade = Math.max(0, (panel.sparkFade || 0) - dt * 1.3);

      if (!panel.dead) {
        panel.ventCooldown -= dt;
        if (panel.ventCooldown <= 0) {
          panel.ventCharge = panel.ventChargeDuration;
          const cooldownScale = panel.phaseBoost > 0 ? 0.72 : 1;
          panel.ventCooldown = panel.baseVentInterval * cooldownScale + Phaser.Math.FloatBetween(0.3, 0.85);
          panel.warningPulse = 0.35 + (panel.phaseBoost || 0) * 0.18;
        }

        if (panel.ventCharge > 0) {
          panel.ventCharge = Math.max(0, panel.ventCharge - dt);
          if (panel.ventCharge <= 0) {
            this.triggerPanelVent(panel);
          }
        }
      } else {
        panel.collapse = Math.max(0, panel.collapse - dt);
      }

      const wobble = Math.sin(this.state.time * 4 + panel.x * 0.01) * 1.5;
      if (panel.container) {
        panel.container.x = panel.x;
        panel.container.y = panel.y + wobble + (panel.collapse > 0 ? Math.sin(panel.collapse * 18) * 4 : 0);
        panel.container.rotation = panel.dead ? Math.sin(this.state.time * 6) * 0.012 : Math.sin(this.state.time * 2.2 + panel.x * 0.004) * 0.006;
        panel.container.setScale(1 + (panel.flash || 0) * 0.03);
      }

      const lifeRatio = Phaser.Math.Clamp(panel.hp / panel.maxHp, 0, 1);
      const chargeRatio = Phaser.Math.Clamp((panel.ventCharge || 0) / panel.ventChargeDuration, 0, 1);
      const lampPulse = panel.dead ? 0.25 : 0.62 + (1 - lifeRatio) * 0.2 + (panel.warningPulse || 0) * 0.4;
      panel.shell.setAlpha(panel.shellBaseAlpha * (panel.dead ? 0.74 : 0.82 + lifeRatio * 0.18));
      panel.ventGlow.setAlpha(panel.dead ? 0.06 : 0.08 + (1 - chargeRatio) * 0.22 + (panel.phaseBoost || 0) * 0.12);
      panel.warningLamp.setAlpha(lampPulse);
      panel.warningHalo.setAlpha(lampPulse * 0.22 + (panel.flash || 0) * 0.12);
      panel.crackA.setAlpha(panel.dead ? 0.0 : (1 - lifeRatio) * 0.8 + (panel.flash || 0) * 0.35);
      panel.crackB.setAlpha(panel.dead ? 0.0 : (1 - lifeRatio) * 0.6 + (panel.sparkFade || 0) * 0.2);

      if (panel.x < -(panel.width + 120)) {
        if (panel.container) panel.container.destroy();
        continue;
      }

      if (panel.dead && panel.collapse <= 0) {
        if (panel.container) panel.container.destroy();
        continue;
      }

      survivingPanels.push(panel);
    }

    this.state.environmentPanels = survivingPanels;
  }

  renderState() {
    const p = this.state.player;
    this.playerSprite.setPosition(p.x, p.y);
    this.playerSprite.setTexture(p.weaponLevel > 1 ? 'playerShipPulse' : 'playerShip');
    this.playerSprite.setAlpha(p.invuln > 0 && Math.floor(p.invuln * 10) % 2 === 0 ? 0.55 : 1);
    this.playerSprite.setRotation((p.bank || 0) * 0.6 - (p.fireKick || 0) * 0.08);
    this.playerSprite.setX(p.x + (p.bank || 0) * 4 - (p.fireKick || 0) * 2);
    this.playerSprite.setY(p.y + Math.sin(this.state.time * 8) * 0.35);

    for (const bullet of this.state.bullets) {
      bullet.sprite.x = bullet.x;
      bullet.sprite.y = bullet.y;
      bullet.sprite.rotation = Math.atan2(bullet.vy, bullet.vx || 0.0001);
    }

    for (const enemy of this.state.enemies) {
      enemy.sprite.x = enemy.x;
      enemy.sprite.y = enemy.y;
    }

    for (const power of this.state.powerUps) {
      power.sprite.x = power.x;
      power.sprite.y = power.y;
      power.sprite.rotation += 0.04;
    }

    if (this.state.boss && this.state.boss.active) {
      const boss = this.state.boss;
      this.syncBossBar(boss);
      if (boss.kind === 'altarWarden') {
        this.renderWarden(boss);
      } else {
        boss.sprite.x = boss.x;
        boss.sprite.y = boss.y;
        const bossFlash = boss.hitFlash || 0;
        const bossPulse = boss.corePulse || 0;
        if (bossFlash > 0) boss.sprite.setTint(0xffffff);
        else boss.sprite.clearTint();
        const { displaySize } = this.assetManifest?.boss || DEFAULT_ASSET_MANIFEST.boss;
        const pulseScale = 1 + bossPulse * 0.02;
        boss.sprite.setDisplaySize(displaySize[0] * pulseScale, displaySize[1] * pulseScale);
        boss.hitFlash = Math.max(0, bossFlash - 0.08);
        boss.corePulse = Math.max(0, bossPulse - 0.06);
      }
    }
  }

  // The health plate is shared by both bosses; only the hull below it differs.
  syncBossBar(boss) {
    const ratio = Phaser.Math.Clamp(boss.hp / boss.maxHp, 0, 1);
    this.bossBarFill.width = 240 * this.uiState.lastBossRatio;
    this.bossBarFill.x = 660;
    this.bossBarGlow.alpha = 0.16 + (1 - ratio) * 0.18 + (boss.corePulse || 0) * 0.22;
  }

  // Everything charge-driven on the Warden reads from the one number the
  // burst timing uses, so the drawn flare and the fired ring cannot drift.
  renderWarden(boss) {
    const charge = VoidLancerSolarAltar.chargeRatio(boss.attack);
    const flash = boss.hitFlash || 0;
    const pulse = boss.corePulse || 0;

    boss.sprite.x = boss.x;
    boss.sprite.y = boss.y;
    boss.sprite.setScale(1 + pulse * 0.02 + charge * 0.03 + flash * 0.02);

    if (boss.hull && typeof boss.hull.setTint === 'function') {
      if (flash > 0) boss.hull.setTint(0xffffff);
      else boss.hull.clearTint();
    }

    boss.core.setAlpha(0.35 + charge * 0.5);
    boss.core.setScale(1 + charge * 0.3);
    boss.coreHalo.setAlpha(0.16 + charge * 0.4);
    boss.coreGlow.setAlpha(0.12 + charge * 0.5);
    boss.coreGlow.setScale(1 + charge);

    for (const seam of boss.seams) seam.setAlpha(0.3 + charge * 0.6);

    // The telegraph ring only exists while the core is charging: it expands
    // with the charge and vanishes the frame the ring fires.
    boss.telegraph.setAlpha(charge > 0 ? 0.3 + charge * 0.6 : 0);
    boss.telegraph.setScale(0.5 + charge * 1.9);

    boss.hitFlash = Math.max(0, flash - 0.08);
    boss.corePulse = Math.max(0, pulse - 0.06);
  }

  setupHud() {
    this.hudBackdrop = this.add.rectangle(GAME_WIDTH / 2, 38, GAME_WIDTH - 24, 78, 0x06101c, 0.5)
      .setStrokeStyle(1, COLORS.cyan, 0.16)
      .setDepth(DEPTH.hud - 2);
    this.hudGlow = this.add.ellipse(GAME_WIDTH / 2, 40, 640, 74, COLORS.cyan, 0.08)
      .setDepth(DEPTH.hud - 1)
      .setBlendMode(Phaser.BlendModes.ADD);
    if (this.textures.exists('uiHudFrame')) {
      this.hudFrame = this.add.image(GAME_WIDTH / 2, 38, 'uiHudFrame')
        .setDisplaySize(920, 76)
        .setDepth(DEPTH.hud);
    } else {
      this.hudFrame = this.add.rectangle(GAME_WIDTH / 2, 38, 920, 76, 0x0a1625, 0.14)
        .setStrokeStyle(1, COLORS.cyan, 0.2)
        .setDepth(DEPTH.hud);
    }
    this.hudSweep = this.add.rectangle(GAME_WIDTH / 2, 64, 820, 2, COLORS.cyan, 0.18)
      .setDepth(DEPTH.hud + 1)
      .setBlendMode(Phaser.BlendModes.ADD);

    const hudTextStyle = { fontFamily: 'Arial', fontSize: '17px', color: '#eef5ff', fontStyle: 'bold' };
    // Letter spacing has to be a number: Phaser hands a string straight to the
    // canvas painter, where '1px' * character count is NaN and the label's
    // text canvas comes out zero wide - drawn as nothing. Numeric spacing is
    // what the working Graveyard alert and announcement plates already use.
    const hudLabelStyle = { fontFamily: 'Arial', fontSize: '11px', color: '#8ea6cd', letterSpacing: 1 };
    this.scoreLabel = this.add.text(42, 17, 'SCORE', hudLabelStyle).setDepth(DEPTH.hud + 2);
    this.scoreText = this.add.text(42, 34, '000000', { fontFamily: 'Arial', fontSize: '24px', color: '#ffffff', fontStyle: 'bold' }).setDepth(DEPTH.hud + 2);
    this.scoreText.setShadow(0, 0, '#000000', 8, false, true);
    this.scorePulseText = this.add.text(160, 28, '', { fontFamily: 'Arial', fontSize: '16px', color: '#7ae7ff', fontStyle: 'bold' })
      .setVisible(false)
      .setDepth(DEPTH.hud + 3);

    this.livesLabel = this.add.text(222, 17, 'HULL', hudLabelStyle).setDepth(DEPTH.hud + 2);
    this.livesText = this.add.text(222, 34, '03', { fontFamily: 'Arial', fontSize: '24px', color: '#fff1e8', fontStyle: 'bold' }).setDepth(DEPTH.hud + 2);
    this.livesPips = this.add.group();
    for (let i = 0; i < 3; i += 1) {
      const pip = this.add.circle(304 + i * 16, 40, 5, COLORS.red, 0.9).setDepth(DEPTH.hud + 2);
      this.livesPips.add(pip);
    }

    this.weaponLabel = this.add.text(352, 17, 'WEAPON', hudLabelStyle).setDepth(DEPTH.hud + 2);
    this.weaponText = this.add.text(352, 34, 'PULSE', { fontFamily: 'Arial', fontSize: '24px', color: '#eef5ff', fontStyle: 'bold' }).setDepth(DEPTH.hud + 2);
    this.weaponTag = this.add.text(470, 34, 'MK I', { fontFamily: 'Arial', fontSize: '14px', color: '#7ae7ff', fontStyle: 'bold' })
      .setDepth(DEPTH.hud + 2);
    this.weaponGlow = this.add.ellipse(432, 38, 182, 34, COLORS.cyan, 0.0)
      .setDepth(DEPTH.hud + 1)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.stageLabel = this.add.text(606, 17, 'STAGE', hudLabelStyle).setDepth(DEPTH.hud + 2);
    this.stageText = this.add.text(606, 34, stageLabel(CAMPAIGN[0]), { fontFamily: 'Arial', fontSize: '24px', color: '#eef5ff', fontStyle: 'bold' }).setDepth(DEPTH.hud + 2);
    this.stageTag = this.add.text(718, 34, 'OPENING LANE', { fontFamily: 'Arial', fontSize: '14px', color: '#8ea6cd', fontStyle: 'bold' }).setDepth(DEPTH.hud + 2);

    this.bossBarFrame = this.add.image(780, 104, 'bossBarFrame').setDisplaySize(304, 58).setVisible(false).setDepth(DEPTH.hud + 2);
    this.bossBarFill = this.add.rectangle(660, 104, 0, 16, COLORS.red).setOrigin(0, 0.5).setVisible(false).setDepth(DEPTH.hud + 1);
    this.bossBarBack = this.add.rectangle(782, 104, 244, 16, 0x12070d, 0.85).setOrigin(0.5).setVisible(false).setDepth(DEPTH.hud);
    this.bossBarGlow = this.add.rectangle(780, 104, 242, 20, COLORS.gold, 0.0).setVisible(false).setDepth(DEPTH.hud + 1).setBlendMode(Phaser.BlendModes.ADD);
    this.bossBarTitle = this.add.text(640, 84, 'SIEGE CARRIER', { fontFamily: 'Arial', fontSize: '12px', color: '#ffd65a', fontStyle: 'bold', letterSpacing: 1 })
      .setVisible(false)
      .setDepth(DEPTH.hud + 2);
    this.bossBarText = this.add.text(918, 84, 'LOCKED', { fontFamily: 'Arial', fontSize: '12px', color: '#8ea6cd', fontStyle: 'bold' })
      .setOrigin(1, 0)
      .setVisible(false)
      .setDepth(DEPTH.hud + 2);

    this.announcementBg = this.add.rectangle(GAME_WIDTH / 2, 116, 470, 34, COLORS.panel, 0.0)
      .setStrokeStyle(1, COLORS.cyan, 0.18)
      .setVisible(false)
      .setDepth(DEPTH.hud);
    this.announcementGlow = this.add.ellipse(GAME_WIDTH / 2, 116, 520, 42, COLORS.cyan, 0.0)
      .setVisible(false)
      .setDepth(DEPTH.hud - 1)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.announcementText = this.add.text(GAME_WIDTH / 2, 116, '', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#eef5ff',
      fontStyle: 'bold',
      letterSpacing: 0.5,
    }).setOrigin(0.5).setVisible(false).setDepth(DEPTH.hud + 3);
    this.announcementText.setStroke('#04101a', 4);
    this.announcementText.setShadow(0, 0, '#000000', 8, true, true);
    this.announcementSubtext = this.add.text(GAME_WIDTH / 2, 136, '', {
      fontFamily: 'Arial',
      fontSize: '11px',
      color: '#8ea6cd',
      letterSpacing: 1.2,
    }).setOrigin(0.5).setVisible(false).setDepth(DEPTH.hud + 3);
    this.announcementSubtext.setStroke('#04101a', 3);
    this.announcementSubtext.setShadow(0, 0, '#000000', 6, true, true);
  }

  setupOverlay() {
    this.overlayDim = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x020710, 0.8).setVisible(false).setDepth(DEPTH.overlay);
    this.overlayMotionLayer = this.add.container(0, 0).setVisible(false).setDepth(DEPTH.overlay + 1);
    this.overlayMotionOrbs = [
      this.add.ellipse(160, 132, 260, 140, COLORS.cyan, 0.08).setBlendMode(Phaser.BlendModes.ADD),
      this.add.ellipse(820, 390, 280, 160, COLORS.violet, 0.08).setBlendMode(Phaser.BlendModes.ADD),
      this.add.rectangle(480, 88, 820, 3, COLORS.gold, 0.12).setBlendMode(Phaser.BlendModes.ADD),
    ];
    this.overlayMotionOrbs[0].baseX = 160;
    this.overlayMotionOrbs[0].baseY = 132;
    this.overlayMotionOrbs[1].baseX = 820;
    this.overlayMotionOrbs[1].baseY = 390;
    this.overlayMotionOrbs[2].baseX = 480;
    this.overlayMotionOrbs[2].baseY = 88;
    for (const item of this.overlayMotionOrbs) this.overlayMotionLayer.add(item);

    this.overlayPanel = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'overlayPanel').setDisplaySize(660, 370).setVisible(false).setDepth(DEPTH.overlay + 2);
    this.overlayLogoGlow = this.add.ellipse(GAME_WIDTH / 2, 152, 360, 120, COLORS.cyan, 0.12).setVisible(false).setDepth(DEPTH.overlay + 2).setBlendMode(Phaser.BlendModes.ADD);
    this.overlayLogo = this.add.image(GAME_WIDTH / 2, 148, 'titleLogo').setDisplaySize(372, 102).setVisible(false).setDepth(DEPTH.overlay + 3);
    this.overlayTag = this.add.text(GAME_WIDTH / 2, 92, '', { fontFamily: 'Arial', fontSize: '12px', color: '#7ae7ff', fontStyle: 'bold', letterSpacing: 2 }).setOrigin(0.5).setVisible(false).setDepth(DEPTH.overlay + 3);
    this.overlaySubtitle = this.add.text(GAME_WIDTH / 2, 194, '', { fontFamily: 'Arial', fontSize: '15px', color: '#8ea6cd', letterSpacing: 1 }).setOrigin(0.5).setVisible(false).setDepth(DEPTH.overlay + 3);
    this.overlayTitle = this.add.text(GAME_WIDTH / 2, 232, '', { fontFamily: 'Arial', fontSize: '34px', color: '#eef5ff', fontStyle: 'bold' }).setOrigin(0.5).setVisible(false).setDepth(DEPTH.overlay + 3);
    this.overlaySummary = this.add.text(GAME_WIDTH / 2, 282, '', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#eef5ff',
      wordWrap: { width: 500 },
      align: 'center',
    }).setOrigin(0.5).setVisible(false).setDepth(DEPTH.overlay + 3);
    this.overlayControls = this.add.text(GAME_WIDTH / 2, 336, '', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#8ea6cd',
      wordWrap: { width: 520 },
      align: 'center',
    }).setOrigin(0.5).setVisible(false).setDepth(DEPTH.overlay + 3);
    this.overlayButton = this.add.text(GAME_WIDTH / 2, 398, 'Start Sortie', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#07111f',
      backgroundColor: '#71e7ff',
      padding: { left: 18, right: 18, top: 10, bottom: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setVisible(false).setDepth(DEPTH.overlay + 3);
    this.overlayButton.on('pointerup', () => this.actionState.requestStart());
  }

  getControlContext() {
    const mode = this.state?.mode;
    if (mode === 'playing') return 'play';
    if (mode === 'intro' || mode === 'victory' || mode === 'gameover') return 'overlay';
    return null;
  }

  setupInput() {
    this.actionState = VoidLancerInput.createActionState(() => {
      if (this.getControlContext() === 'overlay') this.startGame();
    });
    const keyboard = VoidLancerInput.attachKeyboard(window, document, this.actionState, () => this.getControlContext());
    const playfield = document.getElementById('playfield');
    const touch = playfield && VoidLancerInput.attachTouch(
      playfield, this.actionState, () => this.getControlContext(), window,
    );
    this.touchControls = touch;
    window.voidLancerControls = keyboard.mapping;
    const cleanup = () => {
      keyboard.destroy();
      touch?.destroy();
      if (window.voidLancerControls === keyboard.mapping) delete window.voidLancerControls;
      this.events.off('shutdown', cleanup);
      this.events.off('destroy', cleanup);
    };
    this.events.once('shutdown', cleanup);
    this.events.once('destroy', cleanup);
  }

  setupBackground() {
    this.bgBase = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x06101d).setOrigin(0.5).setDepth(DEPTH.background);
    this.bgStarfield = this.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'bgPlatformFar').setAlpha(0.92).setDepth(DEPTH.background + 1);
    this.bgNebula = this.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'bgPlatformMid').setAlpha(0.68).setDepth(DEPTH.background + 2);
    this.bgMegastructure = this.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'bgPlatformNear').setAlpha(0.68).setDepth(DEPTH.background + 3);
    this.bgForeground = this.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'bgPlatformForeground').setAlpha(0.24).setDepth(DEPTH.backgroundFx + 1);
    this.setupAtmosphereLayers();
    this.setupDistantSpaceLayers();
    this.setupHazardLights();
    this.setupForegroundProps();
  }

  setupAtmosphereLayers() {
    this.atmosphereFar = [];
    this.atmosphereMid = [];
    this.occlusionPasses = [];
    this.distantSignals = [];

    const farConfigs = [
      { x: 180, y: 120, w: 420, h: 180, color: COLORS.cyan, alpha: 0.045, speed: 4.5, drift: 7 },
      { x: 760, y: 178, w: 360, h: 150, color: COLORS.violet, alpha: 0.04, speed: 3.8, drift: 6 },
      { x: 520, y: 408, w: 520, h: 210, color: COLORS.orange, alpha: 0.03, speed: 2.6, drift: 5 },
    ];

    for (const config of farConfigs) {
      const glow = this.add.ellipse(config.x, config.y, config.w, config.h, config.color, config.alpha)
        .setDepth(DEPTH.atmosphereFar)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.atmosphereFar.push({ ...config, glow, baseX: config.x, baseY: config.y, phase: Phaser.Math.FloatBetween(0, Math.PI * 2) });
    }

    const midConfigs = [
      { x: 220, y: 86, w: 280, h: 2, color: COLORS.cyan, alpha: 0.09, speed: 12 },
      { x: 640, y: 142, w: 220, h: 2, color: COLORS.gold, alpha: 0.08, speed: 10 },
      { x: 840, y: 392, w: 300, h: 2, color: COLORS.violet, alpha: 0.065, speed: 8 },
    ];

    for (const config of midConfigs) {
      const streak = this.add.rectangle(config.x, config.y, config.w, config.h, config.color, config.alpha)
        .setDepth(DEPTH.atmosphereMid)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.atmosphereMid.push({ ...config, streak, baseX: config.x, phase: Phaser.Math.FloatBetween(0, Math.PI * 2) });
    }

    const occlusionConfigs = [
      { x: 180, y: 210, w: 210, h: 820, rotation: -0.18, alpha: 0.08, speed: 16 },
      { x: 760, y: 300, w: 160, h: 760, rotation: 0.12, alpha: 0.065, speed: 13 },
    ];

    for (const config of occlusionConfigs) {
      const band = this.add.rectangle(config.x, config.y, config.w, config.h, 0x020710, config.alpha)
        .setDepth(DEPTH.foregroundProps - 1)
        .setRotation(config.rotation);
      this.occlusionPasses.push({ ...config, band, baseX: config.x, phase: Phaser.Math.FloatBetween(0, Math.PI * 2) });
    }

    for (let i = 0; i < 10; i += 1) {
      const signal = this.add.circle(GAME_WIDTH + i * 120, Phaser.Math.Between(88, GAME_HEIGHT - 92), Phaser.Math.Between(2, 4), Phaser.Utils.Array.GetRandom([COLORS.cyan, COLORS.gold, COLORS.violet]), 0.0)
        .setDepth(DEPTH.atmosphereMid + 1)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.distantSignals.push({
        signal,
        x: signal.x,
        y: signal.y,
        speed: Phaser.Math.FloatBetween(18, 36),
        baseAlpha: Phaser.Math.FloatBetween(0.08, 0.18),
        pulse: Phaser.Math.FloatBetween(0, Math.PI * 2),
      });
    }
  }

  setupDistantSpaceLayers() {
    this.distantStars = [];
    this.nebulaClouds = [];

    const starBands = [
      { yMin: 56, yMax: 182, count: 10, speedMin: 2.5, speedMax: 6.5, alphaMin: 0.12, alphaMax: 0.22, radiusMin: 1, radiusMax: 2.4 },
      { yMin: 198, yMax: 332, count: 8, speedMin: 2.0, speedMax: 5.2, alphaMin: 0.1, alphaMax: 0.18, radiusMin: 1, radiusMax: 2.1 },
      { yMin: 352, yMax: 478, count: 8, speedMin: 1.6, speedMax: 4.6, alphaMin: 0.09, alphaMax: 0.16, radiusMin: 1, radiusMax: 1.9 },
    ];

    for (const band of starBands) {
      for (let i = 0; i < band.count; i += 1) {
        const radius = Phaser.Math.FloatBetween(band.radiusMin, band.radiusMax);
        const star = this.add.circle(
          Phaser.Math.Between(0, GAME_WIDTH),
          Phaser.Math.Between(band.yMin, band.yMax),
          radius,
          Phaser.Utils.Array.GetRandom([COLORS.white, COLORS.cyan, COLORS.violet, COLORS.gold]),
          Phaser.Math.FloatBetween(band.alphaMin, band.alphaMax)
        ).setDepth(DEPTH.background + 2).setBlendMode(Phaser.BlendModes.ADD);

        this.distantStars.push({
          star,
          baseX: star.x,
          baseY: star.y,
          speed: Phaser.Math.FloatBetween(band.speedMin, band.speedMax),
          drift: Phaser.Math.FloatBetween(0.4, 1.6),
          phase: Phaser.Math.FloatBetween(0, Math.PI * 2),
          baseAlpha: star.alpha,
          twinkleSpeed: Phaser.Math.FloatBetween(0.9, 2.2),
        });
      }
    }

    const nebulaConfigs = [
      { x: 128, y: 118, w: 320, h: 170, color: 0x4d7dff, alpha: 0.055, drift: 3.8, speed: 0.55 },
      { x: 610, y: 88, w: 420, h: 210, color: 0x9a78ff, alpha: 0.048, drift: 5.2, speed: 0.42 },
      { x: 770, y: 390, w: 380, h: 190, color: 0xffb66b, alpha: 0.044, drift: 4.1, speed: 0.34 },
    ];

    for (const config of nebulaConfigs) {
      const cloud = this.add.ellipse(config.x, config.y, config.w, config.h, config.color, config.alpha)
        .setDepth(DEPTH.background + 1)
        .setBlendMode(Phaser.BlendModes.ADD);
      const core = this.add.ellipse(config.x + 26, config.y - 12, config.w * 0.58, config.h * 0.54, COLORS.white, config.alpha * 0.24)
        .setDepth(DEPTH.background + 2)
        .setBlendMode(Phaser.BlendModes.ADD);

      this.nebulaClouds.push({
        cloud,
        core,
        baseX: config.x,
        baseY: config.y,
        width: config.w,
        height: config.h,
        alpha: config.alpha,
        drift: config.drift,
        speed: config.speed,
        phase: Phaser.Math.FloatBetween(0, Math.PI * 2),
      });
    }
  }

  updateAtmosphereLayers(dt) {
    for (const haze of this.atmosphereFar) {
      haze.baseX -= haze.speed * dt;
      if (haze.baseX < -haze.w * 0.6) haze.baseX = GAME_WIDTH + haze.w * 0.55;
      haze.glow.x = haze.baseX + Math.sin(this.stageBackdropTimeline * 0.32 + haze.phase) * haze.drift;
      haze.glow.y = haze.baseY + Math.cos(this.stageBackdropTimeline * 0.24 + haze.phase) * (haze.drift * 0.55);
      haze.glow.alpha = haze.alpha + Math.sin(this.time.now * 0.00042 + haze.phase) * 0.008;
    }

    for (const streak of this.atmosphereMid) {
      streak.baseX -= streak.speed * dt;
      if (streak.baseX < -streak.w * 0.65) streak.baseX = GAME_WIDTH + streak.w * 0.55;
      streak.streak.x = streak.baseX;
      streak.streak.alpha = streak.alpha + Math.sin(this.time.now * 0.0012 + streak.phase) * 0.02;
      streak.streak.scaleX = 1 + Math.sin(this.time.now * 0.0009 + streak.phase) * 0.08;
    }

    for (const band of this.occlusionPasses) {
      band.baseX -= band.speed * dt;
      if (band.baseX < -band.w) band.baseX = GAME_WIDTH + band.w;
      band.band.x = band.baseX + Math.sin(this.time.now * 0.00033 + band.phase) * 18;
      band.band.alpha = band.alpha + Math.sin(this.time.now * 0.0007 + band.phase) * 0.012;
    }

    for (const item of this.distantSignals) {
      item.x -= item.speed * dt;
      if (item.x < -20) {
        item.x = GAME_WIDTH + Phaser.Math.Between(40, 140);
        item.y = Phaser.Math.Between(88, GAME_HEIGHT - 92);
        item.speed = Phaser.Math.FloatBetween(18, 36);
        item.baseAlpha = Phaser.Math.FloatBetween(0.08, 0.18);
      }
      item.signal.x = item.x;
      item.signal.y = item.y + Math.sin(this.time.now * 0.0011 + item.pulse) * 3;
      item.signal.alpha = item.baseAlpha + Math.sin(this.time.now * 0.0034 + item.pulse) * 0.04;
    }

    for (const star of this.distantStars) {
      star.baseX -= star.speed * dt;
      if (star.baseX < -20) {
        star.baseX = GAME_WIDTH + Phaser.Math.Between(20, 120);
        star.baseY = Phaser.Math.Between(56, GAME_HEIGHT - 64);
        star.speed = Phaser.Math.FloatBetween(1.6, 6.5);
        star.baseAlpha = Phaser.Math.FloatBetween(0.09, 0.22);
      }
      star.star.x = star.baseX + Math.sin(this.time.now * 0.00045 + star.phase) * star.drift;
      star.star.y = star.baseY + Math.cos(this.time.now * 0.00038 + star.phase) * (star.drift * 0.62);
      star.star.alpha = star.baseAlpha + Math.sin(this.time.now * 0.0018 * star.twinkleSpeed + star.phase) * 0.05;
    }

    for (const cloud of this.nebulaClouds) {
      cloud.baseX -= cloud.speed * dt;
      if (cloud.baseX < -cloud.width * 0.55) {
        cloud.baseX = GAME_WIDTH + cloud.width * 0.32;
        cloud.baseY = Phaser.Math.Between(70, GAME_HEIGHT - 84);
      }
      cloud.cloud.x = cloud.baseX + Math.sin(this.stageBackdropTimeline * 0.18 + cloud.phase) * cloud.drift;
      cloud.cloud.y = cloud.baseY + Math.cos(this.stageBackdropTimeline * 0.13 + cloud.phase) * (cloud.drift * 0.48);
      cloud.cloud.alpha = cloud.alpha + Math.sin(this.time.now * 0.00022 + cloud.phase) * 0.008;
      cloud.core.x = cloud.cloud.x + 26;
      cloud.core.y = cloud.cloud.y - 12;
      cloud.core.alpha = cloud.alpha * 0.22 + Math.sin(this.time.now * 0.00026 + cloud.phase) * 0.004;
    }
  }

  setupHazardLights() {
    this.hazardLights = [];
    let nextX = 140;
    for (let i = 0; i < 6; i += 1) {
      const color = Phaser.Utils.Array.GetRandom([COLORS.gold, COLORS.orange, COLORS.cyan]);
      const strip = this.add.rectangle(0, 0, 48, 4, color, 0.12)
        .setDepth(DEPTH.backgroundFx)
        .setBlendMode(Phaser.BlendModes.ADD);
      const glow = this.add.ellipse(0, 0, 140, 34, color, 0.08)
        .setDepth(DEPTH.backgroundFx - 1)
        .setBlendMode(Phaser.BlendModes.ADD);
      const light = { strip, glow, color };
      this.resetHazardLight(light, nextX);
      nextX = light.x + Phaser.Math.Between(150, 240);
      this.hazardLights.push(light);
    }
  }

  resetHazardLight(light, x) {
    const y = Phaser.Utils.Array.GetRandom([92, 132, 188, 356, 414, 458]) + Phaser.Math.Between(-8, 8);
    const width = Phaser.Math.Between(40, 84);
    light.x = x;
    light.y = y;
    light.width = width;
    light.speed = Phaser.Math.FloatBetween(28, 42);
    light.baseAlpha = Phaser.Math.FloatBetween(0.05, 0.11);
    light.phase = Phaser.Math.FloatBetween(0, Math.PI * 2);
    light.flickerCooldown = Phaser.Math.FloatBetween(0.7, 2.8);
    light.flickerTime = 0;
    light.flickerDuration = 0.18;
    light.strip.width = width;
    light.strip.x = x;
    light.strip.y = y;
    light.glow.width = width * 2.6;
    light.glow.x = x;
    light.glow.y = y;
  }

  updateHazardLights(dt) {
    for (const light of this.hazardLights) {
      light.x -= light.speed * dt;
      light.flickerCooldown -= dt;

      if (light.flickerCooldown <= 0) {
        light.flickerCooldown = Phaser.Math.FloatBetween(1.2, 4.2);
        light.flickerTime = Phaser.Math.FloatBetween(0.1, 0.3);
        light.flickerDuration = light.flickerTime;
      }

      if (light.flickerTime > 0) light.flickerTime = Math.max(0, light.flickerTime - dt);

      if (light.x < -120) {
        const nextX = this.hazardLights.reduce((max, item) => Math.max(max, item.x), GAME_WIDTH) + Phaser.Math.Between(150, 260);
        this.resetHazardLight(light, nextX);
      }

      const shimmer = (Math.sin(this.state.time * 1.5 + light.phase) + 1) * 0.012;
      let flicker = 0;
      if (light.flickerTime > 0 && light.flickerDuration > 0) {
        const progress = 1 - light.flickerTime / light.flickerDuration;
        flicker = Math.sin(progress * Math.PI * 5) * 0.09 + 0.05;
      }
      const stripAlpha = light.baseAlpha + shimmer + Math.max(0, flicker);
      light.strip.x = light.x;
      light.strip.y = light.y;
      light.strip.alpha = stripAlpha;
      light.glow.x = light.x;
      light.glow.y = light.y;
      light.glow.alpha = stripAlpha * 0.72;
    }
  }

  setupForegroundProps() {
    this.foregroundProps = [];
    let nextX = GAME_WIDTH + 120;
    const types = ['debris', 'drone', 'debris', 'debris', 'drone'];
    for (const type of types) {
      const key = type === 'drone' ? 'enemyDrone' : 'bgDebrisStrip';
      const sprite = this.add.image(0, 0, key).setDepth(DEPTH.foregroundProps);
      sprite.setTint(type === 'drone' ? 0x98b9ce : 0x7e93a8);
      const prop = { type, sprite, x: 0, y: 0, width: 0, life: 0 };
      this.resetForegroundProp(prop, nextX);
      nextX = prop.x + Phaser.Math.Between(190, 310);
      this.foregroundProps.push(prop);
    }
  }

  resetForegroundProp(prop, x) {
    const yBands = prop.type === 'drone' ? [116, 196, 342, 422] : [84, 146, 270, 394, 458];
    prop.x = x;
    prop.baseY = Phaser.Utils.Array.GetRandom(yBands) + Phaser.Math.Between(-18, 18);
    prop.y = prop.baseY;
    prop.life = Phaser.Math.FloatBetween(0, Math.PI * 2);
    prop.phase = Phaser.Math.FloatBetween(0, Math.PI * 2);
    prop.speed = prop.type === 'drone' ? Phaser.Math.FloatBetween(128, 168) : Phaser.Math.FloatBetween(146, 210);
    prop.floatSpeed = prop.type === 'drone' ? Phaser.Math.FloatBetween(1.4, 2.2) : Phaser.Math.FloatBetween(0.7, 1.2);
    prop.floatAmplitude = prop.type === 'drone' ? Phaser.Math.FloatBetween(8, 16) : Phaser.Math.FloatBetween(5, 12);
    prop.rotationSwing = prop.type === 'drone' ? Phaser.Math.FloatBetween(0.08, 0.18) : Phaser.Math.FloatBetween(0.04, 0.12);

    if (prop.type === 'drone') {
      const size = Phaser.Math.Between(34, 46);
      prop.width = size;
      prop.alpha = Phaser.Math.FloatBetween(0.18, 0.28);
      prop.baseRotation = Phaser.Math.FloatBetween(-0.35, 0.35);
      prop.sprite.setDisplaySize(size, size);
    } else {
      const width = Phaser.Math.Between(120, 200);
      const height = Phaser.Math.Between(28, 52);
      prop.width = width;
      prop.alpha = Phaser.Math.FloatBetween(0.12, 0.24);
      prop.baseRotation = Phaser.Math.FloatBetween(-0.22, 0.22);
      prop.sprite.setDisplaySize(width, height);
      prop.sprite.setFlipY(Math.random() > 0.5);
    }

    prop.sprite.x = prop.x;
    prop.sprite.y = prop.y;
    prop.sprite.alpha = prop.alpha;
    prop.sprite.rotation = prop.baseRotation;
  }

  updateForegroundProps(dt) {
    for (const prop of this.foregroundProps) {
      prop.life += dt;
      prop.x -= prop.speed * dt;
      prop.y = prop.baseY + Math.sin(prop.life * prop.floatSpeed + prop.phase) * prop.floatAmplitude;
      prop.sprite.x = prop.x;
      prop.sprite.y = prop.y;
      prop.sprite.rotation = prop.baseRotation + Math.sin(prop.life * (prop.floatSpeed + 0.45)) * prop.rotationSwing;

      if (prop.x < -prop.width * 0.7) {
        const nextX = this.foregroundProps.reduce((max, item) => Math.max(max, item.x), GAME_WIDTH) + Phaser.Math.Between(180, 320);
        this.resetForegroundProp(prop, nextX);
      }
    }
  }

  destroyStageBackdropModules() {
    if (this.stageBackdropModules) {
      for (const module of this.stageBackdropModules) {
        if (module.container) module.container.destroy();
      }
    }
    this.stageBackdropModules = [];
    this.stageBackdropCues = [];
    this.stageBackdropCueIndex = 0;
    this.stageBackdropTimeline = 0;
  }

  setupStageBackdropModules() {
    this.destroyStageBackdropModules();
    this.stageBackdropCues = (this.levelStageData?.backdropCues || []).map((cue) => ({
      ...cue,
      triggered: false,
    }));

    const layout = this.sortieIndex === 3
      ? ALTAR_STAGE_MODULE_LAYOUT
      : this.sortieIndex === 2
        ? GRAVEYARD_STAGE_MODULE_LAYOUT
        : STAGE_BACKGROUND_MODULE_LAYOUT;
    for (const def of layout) {
      this.spawnStageBackdropModule(def.kind, def.x, def.y, def);
    }
  }

  updateStageBackdropModules(dt) {
    if (!this.stageBackdropModules?.length) return;

    this.stageBackdropTimeline += dt;
    if (this.state?.mode === 'playing') {
      while (this.stageBackdropCueIndex < this.stageBackdropCues.length) {
        const cue = this.stageBackdropCues[this.stageBackdropCueIndex];
        if (this.state.time < cue.time) break;
        this.spawnStageBackdropMoment(cue);
        cue.triggered = true;
        this.stageBackdropCueIndex += 1;
      }
    }

    let furthestX = this.stageBackdropModules.reduce((max, module) => Math.max(max, module.x), GAME_WIDTH + 200);

    for (const module of this.stageBackdropModules) {
      module.x -= module.speed * dt;
      module.container.x = module.x;
      module.container.y = module.baseY + Math.sin(this.stageBackdropTimeline * module.wobbleSpeed + module.wobblePhase) * module.wobbleAmount;
      module.container.rotation = module.baseRotation + Math.sin(this.stageBackdropTimeline * module.rotationSpeed + module.wobblePhase) * module.rotationAmount;
      const depthFade = module.homeY < GAME_HEIGHT * 0.26 ? 0.82 : module.homeY > GAME_HEIGHT * 0.7 ? 1.08 : 0.96;
      const atmosPulse = 1 + Math.sin(this.stageBackdropTimeline * 0.45 + module.wobblePhase) * 0.03;
      const typePulse = module.pulseAmount ? 1 + Math.sin(this.stageBackdropTimeline * module.pulseSpeed + module.wobblePhase) * module.pulseAmount : 1;
      module.container.setScale(module.scale);
      if (module.kind === 'lightShaft') {
        const beamPulse = 1 + Math.sin(this.stageBackdropTimeline * (module.pulseSpeed * 1.25) + module.wobblePhase) * 0.06;
        module.container.scaleY = module.scale * beamPulse;
      }
      module.container.alpha = module.alpha * depthFade * atmosPulse * typePulse;

      if (module.x < -(module.span + module.recycleGap)) {
        furthestX = Math.max(furthestX, module.x);
        module.x = furthestX + module.recycleGap + Phaser.Math.Between(40, 120);
        furthestX = module.x;
        module.baseY = module.homeY;
        module.container.x = module.x;
        module.container.y = module.baseY;
        module.container.rotation = module.baseRotation;
        module.container.setScale(module.scale);
      }
    }
  }

  spawnStageBackdropMoment(cue) {
    const anchorX = cue.spawnX ?? GAME_WIDTH + 140;
    const anchorY = cue.spawnY ?? 0;
    for (const moduleDef of cue.modules) {
      const x = anchorX + (moduleDef.x ?? 0);
      const y = anchorY + (moduleDef.y ?? 0);
      this.spawnStageBackdropModule(moduleDef.kind, x, y, moduleDef);
    }
  }

  spawnStageBackdropModule(kind, x, y, options = {}) {
    const depth = options.depth ?? (kind === 'lightShaft' ? DEPTH.atmosphereFar : kind === 'machineryPass' ? DEPTH.atmosphereMid : DEPTH.backgroundFx);
    const container = this.add.container(x, y).setDepth(depth);
    const module = {
      kind,
      x,
      y,
      homeY: y,
      baseY: y,
      baseRotation: options.baseRotation ?? Phaser.Math.FloatBetween(-0.03, 0.03),
      rotationAmount: options.rotationAmount ?? (kind === 'craneArm' ? 0.012 : 0.008),
      rotationSpeed: options.rotationSpeed ?? (kind === 'craneArm' ? 0.96 : 0.52),
      wobblePhase: Phaser.Math.FloatBetween(0, Math.PI * 2),
      wobbleSpeed: options.wobbleSpeed ?? 0.6,
      wobbleAmount: options.wobbleAmount ?? 0,
      speed: options.speed ?? 18,
      scale: options.scale ?? 1,
      alpha: options.alpha ?? 0.24,
      pulseSpeed: options.pulseSpeed ?? (kind === 'lightShaft' ? 2.2 : kind === 'machineryPass' ? 1.4 : 0),
      pulseAmount: options.pulseAmount ?? (kind === 'lightShaft' ? 0.16 : kind === 'machineryPass' ? 0.06 : 0),
      recycleGap: options.recycleGap ?? 220,
      span: 240,
      container,
    };

    this.buildStageBackdropModule(module, options);
    module.span = Math.ceil(module.span * module.scale);
    container.setScale(module.scale);
    container.setAlpha(module.alpha);
    this.stageBackdropModules.push(module);
    return module;
  }

  buildStageBackdropModule(module, options) {
    switch (module.kind) {
      case 'towerCluster':
        this.buildTowerClusterModule(module, options);
        break;
      case 'lightShaft':
        this.buildLightShaftModule(module, options);
        break;
      case 'machineryPass':
        this.buildMachineryPassModule(module, options);
        break;
      case 'craneArm':
        this.buildCraneArmModule(module, options);
        break;
      case 'railSection':
        this.buildRailSectionModule(module, options);
        break;
      case 'deadPlatformSilhouette':
      default:
        this.buildDeadPlatformSilhouetteModule(module, options);
        break;
    }
  }

  buildTowerClusterModule(module, options) {
    const parts = [];
    const shell = this.add.image(0, 0, 'bgMegaStructureNear')
      .setDisplaySize(options.shellWidth ?? 258, options.shellHeight ?? 210)
      .setTint(0x1b2c3d)
      .setAlpha(0.52);
    parts.push(shell);

    const massShadow = this.add.rectangle(0, 8, options.shellWidth ?? 258, options.shellHeight ?? 198, 0x0d1724, 0.3);
    const edgeGlow = this.add.rectangle(0, -74, options.shellWidth ?? 258, 4, COLORS.cyan, 0.06).setBlendMode(Phaser.BlendModes.ADD);
    parts.push(massShadow, edgeGlow);

    const towerXs = [-96, -38, 18, 78, 132];
    const towerHeights = [150, 176, 166, 142, 118];
    towerXs.forEach((towerX, index) => {
      const tower = this.add.rectangle(towerX, 18, 24, towerHeights[index], index % 2 === 0 ? 0x203547 : 0x2f4a5f, 0.88);
      const braceA = this.add.rectangle(towerX - 2, -18 + index * 2, 28, 4, COLORS.cyan, 0.15);
      const braceB = this.add.rectangle(towerX + 2, 22 - index * 2, 28, 3, COLORS.gold, 0.11);
      parts.push(tower, braceA, braceB);
    });

    const lamp = this.add.circle(124, -98, 5, COLORS.gold, 0.9);
    const lampGlow = this.add.circle(124, -98, 18, COLORS.gold, 0.12).setBlendMode(Phaser.BlendModes.ADD);
    parts.push(lampGlow, lamp);

    module.container.add(parts);
    module.span = options.span ?? 290;
  }

  buildLightShaftModule(module, options) {
    const parts = [];
    const beamColor = options.color ?? Phaser.Utils.Array.GetRandom([COLORS.cyan, COLORS.gold, 0xdfeeff]);
    const beamWidth = options.beamWidth ?? 24;
    const beamHeight = options.beamHeight ?? 310;

    parts.push(
      this.add.ellipse(0, -beamHeight * 0.43, beamWidth * 7.2, 58, beamColor, 0.18).setBlendMode(Phaser.BlendModes.ADD),
      this.add.rectangle(0, -beamHeight * 0.05, beamWidth * 4.2, beamHeight, beamColor, 0.08).setBlendMode(Phaser.BlendModes.ADD),
      this.add.rectangle(0, 0, beamWidth * 1.12, beamHeight * 0.96, beamColor, 0.2).setBlendMode(Phaser.BlendModes.ADD),
      this.add.rectangle(-beamWidth * 0.22, 6, beamWidth * 0.44, beamHeight * 0.84, COLORS.white, 0.11).setBlendMode(Phaser.BlendModes.ADD),
      this.add.ellipse(0, beamHeight * 0.2, beamWidth * 3.4, 42, beamColor, 0.1).setBlendMode(Phaser.BlendModes.ADD),
      this.add.circle(0, -beamHeight * 0.43, 24, beamColor, 0.16).setBlendMode(Phaser.BlendModes.ADD)
    );

    module.container.add(parts);
    module.span = options.span ?? Math.max(120, beamWidth * 5);
  }

  buildMachineryPassModule(module, options) {
    const parts = [];
    const bodyWidth = options.bodyWidth ?? 112;
    const bodyHeight = options.bodyHeight ?? 34;

    parts.push(
      this.add.rectangle(0, 0, bodyWidth, bodyHeight, 0x1f3141, 0.92),
      this.add.rectangle(-bodyWidth * 0.24, -10, bodyWidth * 0.3, 12, 0x31485d, 0.86),
      this.add.rectangle(bodyWidth * 0.18, -8, bodyWidth * 0.2, 8, 0x42586c, 0.7),
      this.add.rectangle(0, bodyHeight * 0.32, bodyWidth * 0.82, 4, 0x0e1722, 0.88),
      this.add.rectangle(bodyWidth * 0.28, bodyHeight * 0.24, bodyWidth * 0.18, 18, 0x2e4558, 0.75),
      this.add.rectangle(-bodyWidth * 0.34, bodyHeight * 0.04, 14, 8, 0x4f6578, 0.7),
      this.add.rectangle(bodyWidth * 0.34, bodyHeight * 0.04, 14, 8, 0x4f6578, 0.7),
      this.add.circle(-bodyWidth * 0.38, 0, 3, COLORS.cyan, 0.88),
      this.add.circle(bodyWidth * 0.38, 0, 3, COLORS.gold, 0.84),
      this.add.rectangle(-bodyWidth * 0.5, -bodyHeight * 0.16, bodyWidth * 0.3, 2, COLORS.cyan, 0.08).setBlendMode(Phaser.BlendModes.ADD)
    );

    module.container.add(parts);
    module.span = options.span ?? 180;
  }

  buildCraneArmModule(module, options) {
    const parts = [];
    const direction = options.direction ?? 1;
    const armLength = options.armLength ?? 280;
    const mastHeight = options.mastHeight ?? 128;
    const mastX = direction > 0 ? -84 : 84;
    const armX = direction > 0 ? 48 : -48;
    const hookX = direction > 0 ? 126 : -126;

    parts.push(
      this.add.rectangle(mastX, 16, 18, mastHeight, 0x284055, 0.92),
      this.add.rectangle(mastX + (direction > 0 ? 10 : -10), -22, 34, 8, 0x324f66, 0.88),
      this.add.rectangle(armX, -40, armLength, 10, 0x324b60, 0.9),
      this.add.rectangle(armX + direction * 74, -48, 52, 5, COLORS.orange, 0.14),
      this.add.rectangle(hookX, -6, 4, 72, 0x6d849b, 0.6),
      this.add.rectangle(hookX, 34, 18, 10, 0x4d6276, 0.8)
    );

    const hangLight = this.add.circle(hookX, 38, 5, COLORS.cyan, 0.7);
    const armGlow = this.add.ellipse(armX, -40, armLength + 64, 22, COLORS.cyan, 0.08).setBlendMode(Phaser.BlendModes.ADD);
    parts.push(armGlow, hangLight);

    module.container.add(parts);
    module.span = Math.max(armLength + 120, 320);
  }

  buildRailSectionModule(module, options) {
    const parts = [];
    const railWidth = options.railWidth ?? 320;
    const postSpacing = options.postSpacing ?? 42;
    const postCount = Math.max(4, Math.floor(railWidth / postSpacing));

    parts.push(
      this.add.rectangle(0, 0, railWidth, 12, 0x2b4357, 0.92),
      this.add.rectangle(0, -10, railWidth - 18, 3, COLORS.cyan, 0.16),
      this.add.rectangle(0, 10, railWidth - 18, 3, COLORS.orange, 0.12)
    );

    for (let i = 0; i < postCount; i += 1) {
      const x = -railWidth / 2 + 18 + i * postSpacing;
      parts.push(
        this.add.rectangle(x, 28, 5, 52, 0x24384a, 0.86),
        this.add.rectangle(x, 4, 16, 3, 0x50667a, 0.44)
      );
    }

    const cable = this.add.rectangle(0, 28, railWidth - 26, 2, 0x42586c, 0.55);
    const cableGlow = this.add.rectangle(0, 28, railWidth - 18, 6, COLORS.cyan, 0.06).setBlendMode(Phaser.BlendModes.ADD);
    parts.push(cableGlow, cable);

    module.container.add(parts);
    module.span = railWidth + 80;
  }

  buildDeadPlatformSilhouetteModule(module, options) {
    const parts = [];
    const slabWidth = options.slabWidth ?? 360;
    const slabHeight = options.slabHeight ?? 170;
    const shell = this.add.image(0, 0, 'bgMegaStructureNear')
      .setDisplaySize(slabWidth, slabHeight)
      .setTint(0x162536)
      .setAlpha(0.7);
    parts.push(shell);

    parts.push(
      this.add.rectangle(-slabWidth * 0.32, -14, slabWidth * 0.58, 18, 0x1d3144, 0.86),
      this.add.rectangle(slabWidth * 0.18, -28, slabWidth * 0.28, 12, 0x30465b, 0.8),
      this.add.rectangle(-slabWidth * 0.08, 26, slabWidth * 0.82, 8, 0x101b29, 0.88),
      this.add.rectangle(slabWidth * 0.32, 4, slabWidth * 0.18, 32, 0x21384c, 0.74)
    );

    for (let i = -2; i <= 2; i += 1) {
      parts.push(this.add.rectangle(i * 32, 6, 16, 110, 0x0d1824, 0.35));
    }

    const rimGlow = this.add.rectangle(0, -slabHeight * 0.18, slabWidth * 0.86, 4, COLORS.gold, 0.08).setBlendMode(Phaser.BlendModes.ADD);
    parts.push(rimGlow);

    module.container.add(parts);
    module.span = slabWidth + 120;
  }

}


const shell = document.getElementById('appShell');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const fullscreenSupported = document.fullscreenEnabled !== false
  && typeof shell?.requestFullscreen === 'function'
  && typeof document.exitFullscreen === 'function';
let fullscreenPending = false;

function updateFullscreenButton() {
  fullscreenBtn.disabled = !fullscreenSupported;
  fullscreenBtn.textContent = !fullscreenSupported ? 'Fullscreen Unavailable'
    : document.fullscreenElement === shell ? 'Exit Full Screen' : 'Full Screen';
}

async function toggleFullscreen() {
  if (!fullscreenSupported || fullscreenPending) return;
  fullscreenPending = true;
  try {
    if (document.fullscreenElement === shell) {
      await document.exitFullscreen();
    } else {
      await shell.requestFullscreen();
    }
  } catch (error) {
    console.warn('Fullscreen toggle failed', error);
  } finally {
    fullscreenPending = false;
    updateFullscreenButton();
  }
}

fullscreenBtn.addEventListener('click', toggleFullscreen);
document.addEventListener('fullscreenchange', updateFullscreenButton);
document.addEventListener('keydown', (event) => {
  if (!fullscreenSupported || event.code !== 'KeyF' || event.defaultPrevented || event.repeat
    || event.isComposing || VoidLancerInput.hasModifiers(event)
    || VoidLancerInput.isInteractiveEvent(event, document)) return;
  event.preventDefault();
  toggleFullscreen();
});
updateFullscreenButton();


new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-root',
  backgroundColor: '#050b16',
  input: { keyboard: false },
  scene: [MockupLevelScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
