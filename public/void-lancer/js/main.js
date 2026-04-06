const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const DEPTH = {
  background: 0,
  backgroundFx: 10,
  atmosphereFar: 14,
  atmosphereMid: 18,
  foregroundProps: 20,
  player: 30,
  entities: 40,
  bullets: 50,
  particles: 60,
  hud: 70,
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

const SOUND_STORAGE_KEY = 'voidLancerSoundEnabled';
const MUSIC_TRACK_URL = './assets/music/lyria_rtype_test_loopable.mp3';

function getMusicUrl() {
  const pageDir = new URL(window.location.href);
  const path = pageDir.pathname.endsWith('/') ? pageDir.pathname : pageDir.pathname + '/';
  return new URL(`${path}assets/music/lyria_rtype_test_loopable.mp3`, pageDir.origin).href;
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
  boss: { displaySize: [244, 142], collisionRadius: 58 },
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

function assetUrl(file) {
  const pageDir = new URL(window.location.href);
  const path = pageDir.pathname.endsWith('/') ? pageDir.pathname : pageDir.pathname + '/';
  return new URL(`${path}assets/void_lancer_pack/${file}`, pageDir.origin).href;
}

function assetDataUrl(file) {
  const pageDir = new URL(window.location.href);
  const path = pageDir.pathname.endsWith('/') ? pageDir.pathname : pageDir.pathname + '/';
  return new URL(`${path}assets/data/${file}`, pageDir.origin).href;
}

class MockupLevelScene extends Phaser.Scene {
  constructor() {
    super('MockupLevel');
    this.assetManifest = null;
    this.levelStageData = LEVEL_1_STAGE_DATA;
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
    this.load.json('runtimeAssetManifest', assetDataUrl('runtime_asset_manifest.json'));

    this.load.image('bgPlatformFar', assetUrl('bg_platform_far_1.webp'));
    this.load.image('bgPlatformMid', assetUrl('bg_platform_mid_1.webp'));
    this.load.image('bgPlatformNear', assetUrl('bg_platform_near_1.webp'));
    this.load.image('bgPlatformForeground', assetUrl('bg_platform_foreground_sheet_1.webp'));
    this.load.image('bgDebrisStrip', assetUrl('bg_debris_strip_1.webp'));
    this.load.image('bgMegaStructureNear', assetUrl('bg_megastructure_near_1.webp'));
    this.load.image('playerShip', assetUrl('player_ship_idle_1.webp'));
    this.load.image('playerShipPulse', assetUrl('player_ship_pulse_plus_1.webp'));
    this.load.image('enemyScout', assetUrl('enemy_scout_idle_1.webp'));
    this.load.image('enemyZigzag', assetUrl('enemy_zigzag_idle_1.webp'));
    this.load.image('enemyTurret', assetUrl('enemy_turret_idle_1.webp'));
    this.load.image('enemyDrone', assetUrl('enemy_drone_idle_1.webp'));
    this.load.image('bossShip', assetUrl('boss_siege_carrier_base_1.webp'));
    this.load.image('playerBulletBasic', assetUrl('player_bullet_basic_1.webp'));
    this.load.image('playerBulletPulse', assetUrl('player_bullet_pulse_plus_1.webp'));
    this.load.image('pickupPulse', assetUrl('pickup_pulse_plus_1.webp'));
    this.load.image('uiHudFrame', assetUrl('ui_hud_frame_1.webp'));
    this.load.image('bossBarFrame', assetUrl('ui_boss_bar_frame_1.webp'));
    this.load.image('overlayPanel', assetUrl('ui_overlay_panel_1.webp'));
    this.load.image('titleLogo', assetUrl('ui_title_logo_1.webp'));

    this.load.on('loaderror', (fileObj) => {
      console.error('Asset failed to load:', fileObj.key, fileObj.src);
    });
  }

  create() {
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

    this.uiState.lastScore = 0;
    this.uiState.lastWeaponLevel = this.state.player.weaponLevel;
    this.uiState.lastAnnouncementKey = '';
    this.uiState.lastBossRatio = 1;

    this.playerSprite = this.add.image(this.state.player.x, this.state.player.y, 'playerShip')
      .setDisplaySize(am.player.displaySize[0], am.player.displaySize[1])
      .setFlipX(true)
      .setDepth(DEPTH.player);

    this.setupStageBackdropModules();

    this.syncHud();
    this.hideBossBar();
    this.updateAnnouncementDisplay();
  }

  getLevelStageData() {
    return window.VoidLancerLevel1StageData || LEVEL_1_STAGE_DATA;
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

  showIntro() {
    this.state.mode = 'intro';
    this.showOverlay(
      'Launch Window Open',
      'Escort corridor zero is hot. Survive the opening waves, grab the pulse upgrade, and break the siege carrier at the end of the lane.',
      'Move with arrow keys or WASD. Fire with Space, J, or K. Press the button or fire once to begin.',
      'Start Sortie',
      { tag: 'Mission Briefing', accent: COLORS.cyan, subtitle: 'VOID LANCER // FIRST SORTIE' }
    );
  }

  startGame() {
    this.startMusicPlayback();
    this.resetGame();
    this.state.mode = 'playing';
    this.hideOverlay();
  }

  finishGame(victory) {
    this.state.mode = victory ? 'victory' : 'gameover';
    this.showOverlay(
      victory ? 'Sortie Complete' : 'Mission Failed',
      victory
        ? 'The siege carrier is burning out behind you. First lane secured.'
        : 'The corridor chewed you up. The lane is still hostile.',
      `Score: ${this.state.score}`,
      'Restart Mission',
      {
        tag: victory ? 'Mission Clear' : 'Mission Failed',
        accent: victory ? COLORS.gold : COLORS.red,
        subtitle: victory ? 'Carrier neutralized' : 'Try a cleaner run',
      }
    );
  }

  showOverlay(title, summary, detail, buttonLabel, options = {}) {
    const accent = options.accent ?? COLORS.cyan;
    const subtitle = options.subtitle ?? '';
    const tag = options.tag ?? '';

    this.overlayDim.setVisible(true);
    this.overlayPanel.setVisible(true);
    this.overlayLogo.setVisible(true);
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

  spawnBullet(owner, x, y, vx, vy, radius, damage, tint) {
    const isPlayer = owner === 'player';
    const color = tint ?? (isPlayer ? '#7ae7ff' : '#ff7f8f');
    let sprite;

    if (isPlayer) {
      const isPulse = color === '#ffd65a';
      const glow = this.add.ellipse(0, 0, isPulse ? 34 : 26, isPulse ? 16 : 12, isPulse ? COLORS.gold : COLORS.cyan, 0.28);
      const trail = this.add.rectangle(-8, 0, isPulse ? 12 : 9, isPulse ? 4 : 3, isPulse ? COLORS.gold : COLORS.cyan, 0.45);
      const core = this.add.rectangle(2, 0, isPulse ? 18 : 14, isPulse ? 5 : 4, COLORS.white, 0.96);
      const accent = isPulse ? this.add.rectangle(8, 0, 5, 2, COLORS.gold, 0.95) : null;
      const children = accent ? [glow, trail, core, accent] : [glow, trail, core];
      sprite = this.add.container(x, y, children).setDepth(DEPTH.bullets);
    } else if (color === '#ffd65a') {
      const glow = this.add.ellipse(0, 0, 26, 26, COLORS.gold, 0.3);
      const body = this.add.ellipse(0, 0, 16, 16, COLORS.gold, 0.95);
      const core = this.add.ellipse(0, 0, 7, 7, COLORS.white, 0.95);
      sprite = this.add.container(x, y, [glow, body, core]).setDepth(DEPTH.bullets);
    } else {
      const glow = this.add.ellipse(0, 0, 22, 14, COLORS.red, 0.24);
      const trail = this.add.rectangle(8, 0, 6, 2, 0xff8a9a, 0.45);
      const core = this.add.rectangle(0, 0, 14, 4, COLORS.red, 0.95);
      const hotCore = this.add.rectangle(2, 0, 7, 2, 0xffb0bf, 0.9);
      sprite = this.add.container(x, y, [glow, trail, core, hotCore]).setDepth(DEPTH.bullets);
    }

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
    this.state.announcements.unshift({ text: 'BOSS INBOUND // SIEGE CARRIER DETECTED', ttl: 2.5, kind: 'warning' });
    this.updateAnnouncementDisplay();
      this.playSound('bossWarning', { volume: 0.16 });
    return boss;
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
      this.spawnBullet('enemy', ventOriginX, ventOriginY + offsetY, -250 - i * 18, offsetY * 2.8, 4, 1, '#ffd65a');
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
    this.stageText.setText('01 / 01');
    this.stageTag.setText(this.state.boss ? 'BOSS LANE' : this.state.bossQueued ? 'SIGNAL LOCKED' : 'OPENING LANE');
    this.stageTag.setColor(this.state.boss || this.state.bossQueued ? '#ffd65a' : '#8ea6cd');

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
    this.renderState();
  }

  updatePlayer(dt) {
    const p = this.state.player;
    let dx = 0;
    let dy = 0;

    if (this.cursors.up.isDown || this.keys.up.isDown) dy -= 1;
    if (this.cursors.down.isDown || this.keys.down.isDown) dy += 1;
    if (this.cursors.left.isDown || this.keys.left.isDown) dx -= 1;
    if (this.cursors.right.isDown || this.keys.right.isDown) dx += 1;

    const len = Math.hypot(dx, dy) || 1;
    p.x += (dx / len) * p.speed * dt;
    p.y += (dy / len) * p.speed * dt;
    p.x = this.clamp(p.x, 50, GAME_WIDTH - 100);
    p.y = this.clamp(p.y, 40, GAME_HEIGHT - 40);
    p.cooldown = Math.max(0, p.cooldown - dt);
    p.invuln = Math.max(0, p.invuln - dt);

    const firing = this.keys.fireSpace.isDown || this.keys.fireJ.isDown || this.keys.fireK.isDown;
    if (firing && p.cooldown <= 0) {
      p.cooldown = p.weaponLevel > 1 ? 0.14 : 0.18;
      this.spawnBullet('player', p.x + 24, p.y, 560, 0, 4, 8, '#7ae7ff');
      if (p.weaponLevel > 1) {
        this.spawnBullet('player', p.x + 16, p.y - 10, 520, -90, 3, 6, '#ffd65a');
        this.spawnBullet('player', p.x + 16, p.y + 10, 520, 90, 3, 6, '#ffd65a');
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
        enemy.fireCooldown -= dt;
        if (enemy.fireCooldown <= 0) {
          enemy.fireCooldown = 1.4;
          const dy = this.state.player.y - enemy.y;
          const aim = this.clamp(dy * 1.2, -180, 180);
          this.spawnBullet('enemy', enemy.x - enemy.radius, enemy.y, -280, aim, 5, 1, '#ff7f8f');
          this.playSound('enemyFire', { volume: enemy.type === 'turret' ? 0.14 : 0.12, detune: enemy.type === 'turret' ? 0 : -20 });
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
        this.spawnBullet('enemy', boss.x - 54, boss.y + spread * 180, -330, spread * 150, 6, 1, '#ff697b');
      }
      this.playSound('enemyFire', { volume: boss.phase === 1 ? 0.16 : 0.18, detune: -60 });
    }

    if (boss.burstCooldown <= 0) {
      boss.burstCooldown = boss.phase === 1 ? 3.2 : 2.3;
      for (let i = -2; i <= 2; i += 1) {
        this.spawnBullet('enemy', boss.x - 40, boss.y, -260, i * 90, 5, 1, '#ffd65a');
      }
    }

    if (boss.phase === 2 && boss.summonCooldown <= 0) {
      boss.summonCooldown = 5.5;
      this.spawnEnemy('drone', GAME_WIDTH + 40, boss.y - 60, { speed: 240 });
      this.spawnEnemy('drone', GAME_WIDTH + 110, boss.y + 60, { speed: 240 });
    }

    if (boss.hp <= 0) {
      this.spawnExplosionFx(boss.x, boss.y, 'boss', {
        baseScale: 1.2,
        peakScale: 2.35,
        burstDistance: 96,
        shards: 14,
        smokeCount: 5,
      });
      this.spawnExplosionFx(boss.x - 50, boss.y - 18, 'medium', { baseScale: 0.9, peakScale: 1.35, burstDistance: 56 });
      this.spawnExplosionFx(boss.x + 54, boss.y + 16, 'medium', { baseScale: 0.9, peakScale: 1.35, burstDistance: 56 });
      this.spawnExplosionFx(boss.x, boss.y, 'small', { baseScale: 0.8, peakScale: 1.0, burstDistance: 42, shards: 6 });
      this.cameras.main.flash(180, 255, 228, 160);
      this.playSound('bossExplosion', { volume: 0.32 });
      this.queueHeavyImpactShake(0.012, 180);
      this.state.score += 3000;
      this.syncHud();
      boss.active = false;
      if (boss.sprite) boss.sprite.destroy();
      this.state.boss = null;
      this.hideBossBar();
      this.finishGame(true);
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
          if (this.circleHit(bullet.x, bullet.y, bullet.radius, enemy.x, enemy.y, enemy.radius)) {
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
      this.state.boss.sprite.x = this.state.boss.x;
      this.state.boss.sprite.y = this.state.boss.y;
      const bossFlash = this.state.boss.hitFlash || 0;
      const bossPulse = this.state.boss.corePulse || 0;
      const ratio = Phaser.Math.Clamp(this.state.boss.hp / this.state.boss.maxHp, 0, 1);
      this.bossBarFill.width = 240 * this.uiState.lastBossRatio;
      this.bossBarFill.x = 660;
      this.bossBarGlow.alpha = 0.16 + (1 - ratio) * 0.18 + bossPulse * 0.22;
      if (bossFlash > 0) this.state.boss.sprite.setTint(0xffffff);
      else this.state.boss.sprite.clearTint();
      this.state.boss.sprite.setScale(1 + bossPulse * 0.02);
      this.state.boss.hitFlash = Math.max(0, bossFlash - 0.08);
      this.state.boss.corePulse = Math.max(0, bossPulse - 0.06);
    }
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
    const hudLabelStyle = { fontFamily: 'Arial', fontSize: '11px', color: '#8ea6cd', letterSpacing: '1px' };
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
    this.stageText = this.add.text(606, 34, '01 / 01', { fontFamily: 'Arial', fontSize: '24px', color: '#eef5ff', fontStyle: 'bold' }).setDepth(DEPTH.hud + 2);
    this.stageTag = this.add.text(718, 34, 'OPENING LANE', { fontFamily: 'Arial', fontSize: '14px', color: '#8ea6cd', fontStyle: 'bold' }).setDepth(DEPTH.hud + 2);

    this.bossBarFrame = this.add.image(780, 104, 'bossBarFrame').setDisplaySize(304, 58).setVisible(false).setDepth(DEPTH.hud + 2);
    this.bossBarFill = this.add.rectangle(660, 104, 0, 16, COLORS.red).setOrigin(0, 0.5).setVisible(false).setDepth(DEPTH.hud + 1);
    this.bossBarBack = this.add.rectangle(782, 104, 244, 16, 0x12070d, 0.85).setOrigin(0.5).setVisible(false).setDepth(DEPTH.hud);
    this.bossBarGlow = this.add.rectangle(780, 104, 242, 20, COLORS.gold, 0.0).setVisible(false).setDepth(DEPTH.hud + 1).setBlendMode(Phaser.BlendModes.ADD);
    this.bossBarTitle = this.add.text(640, 84, 'SIEGE CARRIER', { fontFamily: 'Arial', fontSize: '12px', color: '#ffd65a', fontStyle: 'bold', letterSpacing: '1px' })
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
      letterSpacing: '0.5px',
    }).setOrigin(0.5).setVisible(false).setDepth(DEPTH.hud + 3);
    this.announcementText.setStroke('#04101a', 4);
    this.announcementText.setShadow(0, 0, '#000000', 8, true, true);
    this.announcementSubtext = this.add.text(GAME_WIDTH / 2, 136, '', {
      fontFamily: 'Arial',
      fontSize: '11px',
      color: '#8ea6cd',
      letterSpacing: '1.2px',
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
    this.overlayTag = this.add.text(GAME_WIDTH / 2, 92, '', { fontFamily: 'Arial', fontSize: '12px', color: '#7ae7ff', fontStyle: 'bold', letterSpacing: '2px' }).setOrigin(0.5).setVisible(false).setDepth(DEPTH.overlay + 3);
    this.overlaySubtitle = this.add.text(GAME_WIDTH / 2, 194, '', { fontFamily: 'Arial', fontSize: '15px', color: '#8ea6cd', letterSpacing: '1px' }).setOrigin(0.5).setVisible(false).setDepth(DEPTH.overlay + 3);
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
    this.overlayButton.on('pointerup', () => {
      if (this.state.mode === 'intro' || this.state.mode === 'victory' || this.state.mode === 'gameover') {
        this.startGame();
      }
    });
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      fireJ: Phaser.Input.Keyboard.KeyCodes.J,
      fireK: Phaser.Input.Keyboard.KeyCodes.K,
      fireSpace: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    this.input.keyboard.on('keydown', (event) => {
      if (event.code === 'Space' || event.code === 'KeyJ' || event.code === 'KeyK') {
        if (this.state.mode === 'intro' || this.state.mode === 'victory' || this.state.mode === 'gameover') {
          event.preventDefault();
          this.startGame();
        }
      }
    });
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

    for (const def of STAGE_BACKGROUND_MODULE_LAYOUT) {
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

function updateFullscreenButton() {
  fullscreenBtn.textContent = document.fullscreenElement === shell ? 'Exit Full Screen' : 'Full Screen';
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement === shell) {
      await document.exitFullscreen();
    } else {
      await shell.requestFullscreen();
    }
  } catch (error) {
    console.warn('Fullscreen toggle failed', error);
  }
  updateFullscreenButton();
}

fullscreenBtn.addEventListener('click', toggleFullscreen);
document.addEventListener('fullscreenchange', updateFullscreenButton);
document.addEventListener('keydown', (event) => {
  if (event.code === 'KeyF' && !event.repeat) {
    event.preventDefault();
    toggleFullscreen();
  }
});
updateFullscreenButton();


new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-root',
  backgroundColor: '#050b16',
  scene: [MockupLevelScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
