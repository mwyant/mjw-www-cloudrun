// Graveyard Sortie (sortie 2) stage data: a short lane with an on-station
// Imperial patrol, one tagged turret the worklight alarm can wake, and no
// boss. missionDuration is the clear time; the lane is meant to be crossed,
// not farmed.
window.VoidLancerLevel2StageData = {
  missionDuration: 30,
  waveTimeline: [
    {
      time: 0.0,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            // Tagged patrol on station from the first second: already spawned
            // when the alarm goes off, never spawned by it.
            { type: 'turret', x: 1180, y: 138, options: { speed: 26, phase: 0.4, fireCooldown: 0.9, patrolTag: 'graveyard' } },
          ],
        },
      ],
    },
    {
      time: 0.6,
      actions: [
        { type: 'announce', text: 'ROUTE RECORD // GRAVEYARD LANE', ttl: 3, kind: 'notice' },
      ],
    },
    {
      time: 3.0,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'scout', x: 980, y: 150 },
            { type: 'scout', x: 1060, y: 268 },
            { type: 'scout', x: 1140, y: 386 },
          ],
        },
      ],
    },
    {
      time: 8.5,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'zigzag', x: 980, y: 112, options: { phase: 0 } },
            { type: 'zigzag', x: 1120, y: 402, options: { phase: 1.6 } },
          ],
        },
      ],
    },
    {
      time: 12.0,
      actions: [
        { type: 'announce', text: 'MARKER TRAIL // SALVAGE RUN IN PROGRESS', ttl: 2.6, kind: 'notice' },
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'turret', x: 1150, y: 320, options: { speed: 44, phase: 2.2, fireCooldown: 1.1 } },
          ],
        },
      ],
    },
    {
      time: 16.0,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'drone', x: 980, y: 96, options: { speed: 224 } },
            { type: 'drone', x: 1050, y: 210, options: { speed: 230 } },
            { type: 'drone', x: 1120, y: 330, options: { speed: 236 } },
            { type: 'drone', x: 1190, y: 442, options: { speed: 242 } },
          ],
        },
      ],
    },
    {
      time: 21.0,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'scout', x: 980, y: 128 },
            { type: 'scout', x: 1065, y: 254 },
            { type: 'scout', x: 1150, y: 378 },
            { type: 'zigzag', x: 1235, y: 452, options: { phase: 0.8 } },
          ],
        },
      ],
    },
    {
      time: 25.5,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'drone', x: 1000, y: 176, options: { speed: 236 } },
            { type: 'drone', x: 1090, y: 352, options: { speed: 242 } },
          ],
        },
      ],
    },
  ],
  backdropCues: [
    {
      time: 6.0,
      modules: [
        { kind: 'deadPlatformSilhouette', x: 1160, y: 104, speed: 6, scale: 1.5, alpha: 0.2, wobbleAmount: 0.35, wobbleSpeed: 0.26, recycleGap: 320 },
        { kind: 'lightShaft', x: 1460, y: 58, speed: 6, scale: 1.0, alpha: 0.3, beamWidth: 20, beamHeight: 300, color: 16767392, wobbleAmount: 0.5, wobbleSpeed: 0.4, recycleGap: 190 },
      ],
    },
    {
      time: 18.5,
      modules: [
        { kind: 'craneArm', x: 1520, y: 118, speed: 6, scale: 1.0, alpha: 0.2, wobbleAmount: 1.2, wobbleSpeed: 0.5, recycleGap: 280 },
        { kind: 'machineryPass', x: 1760, y: 430, speed: 5, scale: 0.9, alpha: 0.16, wobbleAmount: 0.6, wobbleSpeed: 0.4, recycleGap: 260 },
      ],
    },
  ],
  environmentTimeline: [],
};
