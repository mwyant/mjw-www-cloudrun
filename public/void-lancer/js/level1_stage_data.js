window.VoidLancerLevel1StageData = {
  waveTimeline: [
    {
      time: 1.0,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'scout', x: 960, y: 100 },
            { type: 'scout', x: 1030, y: 170 },
            { type: 'scout', x: 1100, y: 240 },
            { type: 'scout', x: 1170, y: 310 },
            { type: 'scout', x: 1240, y: 380 },
          ],
        },
      ],
    },
    {
      time: 7.0,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'zigzag', x: 960, y: 90, options: { phase: 0 } },
            { type: 'zigzag', x: 1040, y: 350, options: { phase: 0.6 } },
            { type: 'zigzag', x: 1120, y: 90, options: { phase: 1.2 } },
            { type: 'zigzag', x: 1200, y: 350, options: { phase: 1.8 } },
            { type: 'zigzag', x: 1280, y: 90, options: { phase: 2.4 } },
            { type: 'zigzag', x: 1360, y: 350, options: { phase: 3.0 } },
          ],
        },
      ],
    },
    {
      time: 15.0,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'turret', x: 960, y: 90, options: { fireCooldown: 0.7 } },
            { type: 'turret', x: 1075, y: 200, options: { fireCooldown: 0.9 } },
            { type: 'turret', x: 1190, y: 310, options: { fireCooldown: 1.1 } },
            { type: 'turret', x: 1305, y: 420, options: { fireCooldown: 1.3 } },
          ],
        },
      ],
    },
    {
      time: 24.0,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'drone', x: 960, y: { mode: 'safeEnemyY' }, options: { speed: 240 } },
            { type: 'drone', x: 1015, y: { mode: 'safeEnemyY' }, options: { speed: 246 } },
            { type: 'drone', x: 1070, y: { mode: 'safeEnemyY' }, options: { speed: 252 } },
            { type: 'drone', x: 1125, y: { mode: 'safeEnemyY' }, options: { speed: 258 } },
            { type: 'drone', x: 1180, y: { mode: 'safeEnemyY' }, options: { speed: 264 } },
            { type: 'drone', x: 1235, y: { mode: 'safeEnemyY' }, options: { speed: 270 } },
            { type: 'drone', x: 1290, y: { mode: 'safeEnemyY' }, options: { speed: 276 } },
          ],
        },
      ],
    },
    {
      time: 31.0,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'scout', x: 960, y: 120 },
            { type: 'scout', x: 1055, y: 210 },
            { type: 'scout', x: 1150, y: 300 },
            { type: 'scout', x: 1245, y: 390 },
          ],
        },
        {
          type: 'spawnPickup',
          x: 1180,
          y: 270,
        },
      ],
    },
    {
      time: 40.0,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'turret', x: 960, y: 80, options: { phase: 0 } },
            { type: 'zigzag', x: 1055, y: 170, options: { phase: 0.5 } },
            { type: 'turret', x: 1150, y: 260, options: { phase: 1.0 } },
            { type: 'zigzag', x: 1245, y: 350, options: { phase: 1.5 } },
            { type: 'turret', x: 1340, y: 440, options: { phase: 2.0 } },
          ],
        },
      ],
    },
    {
      time: 52.0,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'drone', x: 960, y: 80, options: { speed: 220 } },
            { type: 'drone', x: 1025, y: 175, options: { speed: 220 } },
            { type: 'drone', x: 1090, y: 270, options: { speed: 220 } },
            { type: 'drone', x: 1155, y: 365, options: { speed: 220 } },
            { type: 'drone', x: 1220, y: 80, options: { speed: 220 } },
            { type: 'drone', x: 1285, y: 175, options: { speed: 220 } },
            { type: 'drone', x: 1350, y: 270, options: { speed: 220 } },
            { type: 'drone', x: 1415, y: 365, options: { speed: 220 } },
          ],
        },
      ],
    },
    {
      time: 63.0,
      actions: [
        {
          type: 'queueBossArrival',
          announcement: 'Corridor clear. Heavy signal ahead.',
          ttl: 2.2,
          kind: 'warning',
        },
      ],
    },
  ],
  backdropCues: [
    {
      time: 5.2,
      modules: [
        { kind: 'towerCluster', x: 1120, y: 96, speed: 10, scale: 1.16, alpha: 0.42, wobbleAmount: 1.2, wobbleSpeed: 0.64, recycleGap: 240 },
        { kind: 'deadPlatformSilhouette', x: 1410, y: 102, speed: 8, scale: 1.42, alpha: 0.28, wobbleAmount: 0.4, wobbleSpeed: 0.28, recycleGap: 300 },
        { kind: 'lightShaft', x: 1268, y: 52, speed: 8, scale: 1.08, alpha: 0.48, beamWidth: 24, beamHeight: 320, color: 16770778, wobbleAmount: 0.6, wobbleSpeed: 0.46, recycleGap: 170 },
      ],
    },
    {
      time: 22.8,
      modules: [
        { kind: 'deadPlatformSilhouette', x: 1110, y: 104, speed: 7, scale: 1.62, alpha: 0.3, wobbleAmount: 0.35, wobbleSpeed: 0.26, recycleGap: 300 },
        { kind: 'craneArm', x: 1548, y: 120, speed: 8, scale: 1.02, alpha: 0.28, wobbleAmount: 1.6, wobbleSpeed: 0.62, recycleGap: 250 },
        { kind: 'machineryPass', x: 1712, y: 182, speed: 10, scale: 0.92, alpha: 0.22, wobbleAmount: 0.8, wobbleSpeed: 0.54, recycleGap: 220 },
      ],
    },
    {
      time: 42.5,
      modules: [
        { kind: 'towerCluster', x: 1140, y: 92, speed: 9, scale: 1.24, alpha: 0.44, wobbleAmount: 1.2, wobbleSpeed: 0.58, recycleGap: 260 },
        { kind: 'deadPlatformSilhouette', x: 1730, y: 108, speed: 7, scale: 1.58, alpha: 0.3, wobbleAmount: 0.42, wobbleSpeed: 0.3, recycleGap: 300 },
        { kind: 'lightShaft', x: 1570, y: 402, speed: 7, scale: 1.02, alpha: 0.42, beamWidth: 22, beamHeight: 290, color: 16769786, wobbleAmount: 0.55, wobbleSpeed: 0.42, recycleGap: 180 },
      ],
    },
  ],
  environmentTimeline: [
    {
      time: 11.5,
      actions: [
        {
          type: 'spawnPanelCluster',
          panel: {
            x: 1090,
            y: 184,
            speed: 20,
            hp: 3,
            ventInterval: 4.8,
            ventChargeDuration: 0.5,
            ventBurst: 1,
          },
        },
      ],
    },
    {
      time: 37.0,
      actions: [
        {
          type: 'spawnPanelCluster',
          panel: {
            x: 1140,
            y: 324,
            speed: 18,
            hp: 4,
            ventInterval: 4.0,
            ventChargeDuration: 0.45,
            ventBurst: 2,
            bossLinked: true,
          },
        },
      ],
    },
  ],
};
