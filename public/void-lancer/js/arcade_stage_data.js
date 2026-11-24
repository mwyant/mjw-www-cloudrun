// Arcade sortie stage data (stages 3-11 of the escalation set): nine
// reviewed stage drafts promoted from parallel data passes, held as one
// browser global so the campaign wiring can pick them up later.
//
// Shape follows level2_stage_data.js: a plain object on window, no imports and
// no build step. Two separate pieces:
//
//   stages          - stable id -> stage record. Ids never move; records are
//                     authored in escalation order (01..09).
//   provisionalOrder - the ids in play order for now. Difficulty ordering is a
//                     draft guess, not a measured ranking, so it lives here and
//                     nowhere else: re-sequencing means reordering this array,
//                     never renaming a stage.
//
// Stage contract the runtime consumes: missionDuration is the clear time, and
// waveTimeline entries fire in time order with spawnEnemies / announce actions
// only. Banners are spaced so one ttl expires before the next arrives (the
// queue ticks every banner's ttl together, so overlapping entries would cut
// each other off). Enemies spawn just off the right edge of the 960x540
// playfield and fly in whole.
//
// `briefing` is the stage's own text on the briefing overlay: an Objective
// first and one read the lane is built on, capped at 170 characters so it
// wraps to three lines. The controls line and the clock are supplied by the
// scene, so they do not belong here.
window.VoidLancerArcadeStageData = {
  // Provisional order by title: Split Lane, The Crossing, Gun Line, Relay Run,
  // Crossing Picket, High-Low Battery, Shifting Lanes, Turret Line, Final
  // Proof. Reorder freely once difficulty is playtested - every entry is an
  // id from stages, so the lookup never changes.
  provisionalOrder: [
    'escalation-01',
    'escalation-02',
    'escalation-03',
    'escalation-04-drone-relay',
    'escalation-06-crossing-picket',
    'escalation-05-high-low-battery',
    'escalation-8-shifting-lanes',
    'escalation-7-turret-line',
    'escalation-9-final-proof',
  ],
  stages: {
    // escalation-01 // Split Lane
    'escalation-01': {
      id: 'escalation-01',
      title: 'Split Lane',
      briefing: 'Objective: hold both heights. Scouts run the lanes in alternating pairs - pick a lane, clear it, then breathe before the next run.',
      missionDuration: 30,
      waveTimeline: [
        {
          time: 0.6,
          actions: [
            { type: 'announce', text: 'OBJECTIVE // HOLD THE SPLIT LANE', ttl: 2.6, kind: 'notice' },
          ],
        },
        {
          time: 2,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 995, y: 125 },
                { type: 'scout', x: 1040, y: 410 },
                { type: 'scout', x: 1085, y: 150 },
                { type: 'scout', x: 1130, y: 400 },
              ],
            },
          ],
        },
        {
          time: 5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1005, y: 405 },
                { type: 'scout', x: 1065, y: 130 },
              ],
            },
          ],
        },
        {
          // MK III appears well before the first armored contact. The player
          // has several seconds to reach it and learn its deliberate cadence.
          time: 6.5,
          actions: [
            { type: 'spawnPickup', x: 620, y: 270, weaponLevel: 3 },
          ],
        },
        {
          time: 8.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 995, y: 140 },
                { type: 'scout', x: 1045, y: 400 },
                { type: 'scout', x: 1095, y: 155 },
              ],
            },
          ],
        },
        {
          time: 13,
          actions: [
            { type: 'announce', text: 'SPLIT LANE // PICK A HEIGHT', ttl: 2.4, kind: 'notice' },
          ],
        },
        {
          time: 13.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'turret',
                  x: 1010,
                  y: 275,
                  options: { speed: 84, fireCooldown: 1.4 },
                },
                { type: 'scout', x: 1060, y: 135 },
                { type: 'scout', x: 1115, y: 410 },
                { type: 'scout', x: 1165, y: 160 },
              ],
            },
          ],
        },
        {
          time: 17,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 995, y: 410 },
                { type: 'scout', x: 1055, y: 145 },
              ],
            },
          ],
        },
        {
          time: 19.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1015,
                  y: 165,
                  options: { speed: 218 },
                },
                {
                  type: 'drone',
                  x: 1085,
                  y: 355,
                  options: { speed: 224 },
                },
                { type: 'scout', x: 1145, y: 130 },
                { type: 'interceptor', x: 1220, y: 410, options: { speed: 150 } },
              ],
            },
          ],
        },
        {
          time: 23,
          actions: [
            { type: 'announce', text: 'FINAL WAVE // HOLD BOTH LANES', ttl: 2, kind: 'warning' },
          ],
        },
        {
          time: 23.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1005,
                  y: 160,
                  options: { speed: 218 },
                },
                {
                  type: 'drone',
                  x: 1075,
                  y: 350,
                  options: { speed: 224 },
                },
                { type: 'scout', x: 1145, y: 405 },
                { type: 'scout', x: 1195, y: 130 },
              ],
            },
          ],
        },
        {
          time: 26.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 995, y: 135 },
                { type: 'scout', x: 1055, y: 400 },
                { type: 'scout', x: 1115, y: 150 },
                { type: 'scout', x: 1175, y: 265 },
                { type: 'interceptor', x: 1240, y: 405, options: { speed: 155 } },
              ],
            },
          ],
        },
      ],
    },
    // escalation-02 // The Crossing
    'escalation-02': {
      id: 'escalation-02',
      title: 'The Crossing',
      briefing: 'Objective: read the crossing. Zigzag fighters weave the middle on offset phases - commit to one gap instead of chasing, then breathe.',
      missionDuration: 32,
      waveTimeline: [
        {
          time: 0.6,
          actions: [
            { type: 'announce', text: 'OBJECTIVE // READ THE CROSSING', ttl: 2.6, kind: 'notice' },
          ],
        },
        {
          time: 2,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1000,
                  y: 150,
                  options: { phase: 0, speed: 160 },
                },
                {
                  type: 'zigzag',
                  x: 1065,
                  y: 395,
                  options: { phase: 3.14, speed: 160 },
                },
                {
                  type: 'zigzag',
                  x: 1130,
                  y: 255,
                  options: { phase: 1.6, speed: 160 },
                },
              ],
            },
          ],
        },
        {
          time: 5.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1010,
                  y: 390,
                  options: { phase: 4.7, speed: 160 },
                },
                {
                  type: 'zigzag',
                  x: 1075,
                  y: 155,
                  options: { phase: 1, speed: 160 },
                },
                {
                  type: 'zigzag',
                  x: 1140,
                  y: 300,
                  options: { phase: 2.4, speed: 160 },
                },
              ],
            },
          ],
        },
        {
          time: 9.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1000,
                  y: 145,
                  options: { phase: 0.4, speed: 160 },
                },
                {
                  type: 'zigzag',
                  x: 1065,
                  y: 400,
                  options: { phase: 3.5, speed: 160 },
                },
                {
                  type: 'zigzag',
                  x: 1130,
                  y: 250,
                  options: { phase: 1.9, speed: 160 },
                },
                { type: 'scout', x: 1185, y: 410 },
              ],
            },
          ],
        },
        {
          time: 13,
          actions: [
            { type: 'announce', text: 'CROSSING // COMMIT TO ONE GAP', ttl: 2.4, kind: 'notice' },
          ],
        },
        {
          time: 13.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1000,
                  y: 140,
                  options: { phase: 0.2, speed: 160 },
                },
                {
                  type: 'zigzag',
                  x: 1055,
                  y: 400,
                  options: { phase: 3.3, speed: 160 },
                },
                {
                  type: 'zigzag',
                  x: 1110,
                  y: 255,
                  options: { phase: 1.5, speed: 160 },
                },
                {
                  type: 'zigzag',
                  x: 1165,
                  y: 150,
                  options: { phase: 4.7, speed: 160 },
                },
              ],
            },
          ],
        },
        {
          time: 17.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1005,
                  y: 395,
                  options: { phase: 2.6, speed: 160 },
                },
                {
                  type: 'zigzag',
                  x: 1070,
                  y: 145,
                  options: { phase: 5.7, speed: 160 },
                },
                { type: 'scout', x: 1195, y: 120 },
                { type: 'interceptor', x: 1260, y: 405, options: { speed: 150 } },
              ],
            },
          ],
        },
        {
          // Bring the three-hit emplacement into the crossing while the player
          // still has a full approach window to see its sweeping fire.
          time: 18.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'rotary', x: 1400, y: 290, options: { speed: 80, fireCooldown: 2.1, rotationSpeed: 1.45 } },
              ],
            },
          ],
        },
        {
          time: 21,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1000,
                  y: 150,
                  options: { phase: 0.6, speed: 160 },
                },
                {
                  type: 'zigzag',
                  x: 1065,
                  y: 400,
                  options: { phase: 3.7, speed: 160 },
                },
                {
                  type: 'zigzag',
                  x: 1130,
                  y: 255,
                  options: { phase: 2, speed: 160 },
                },
              ],
            },
          ],
        },
        {
          time: 23,
          actions: [
            { type: 'announce', text: 'FINAL CROSSING // HOLD THE MIDDLE', ttl: 2, kind: 'warning' },
          ],
        },
        {
          time: 23.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1015,
                  y: 175,
                  options: { speed: 220 },
                },
                {
                  type: 'drone',
                  x: 1080,
                  y: 345,
                  options: { speed: 226 },
                },
                { type: 'scout', x: 1145, y: 410 },
                { type: 'scout', x: 1200, y: 130 },
                {
                  type: 'zigzag',
                  x: 1255,
                  y: 265,
                  options: { phase: 1.5, speed: 160 },
                },
              ],
            },
          ],
        },
        {
          time: 28,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1005,
                  y: 150,
                  options: { phase: 0.2, speed: 160 },
                },
                {
                  type: 'zigzag',
                  x: 1075,
                  y: 400,
                  options: { phase: 3.3, speed: 160 },
                },
                {
                  type: 'zigzag',
                  x: 1145,
                  y: 260,
                  options: { phase: 1.5, speed: 160 },
                },
                { type: 'scout', x: 1210, y: 415 },
              ],
            },
          ],
        },
      ],
    },
    // escalation-03 // Gun Line
    'escalation-03': {
      id: 'escalation-03',
      title: 'Gun Line',
      briefing: 'Objective: break the gun line. Turrets arrive one at a time while drones sweep the gap behind them - kill the guns first and keep moving.',
      missionDuration: 34,
      waveTimeline: [
        {
          time: 0.6,
          actions: [
            { type: 'announce', text: 'OBJECTIVE // BREAK THE GUN LINE', ttl: 2.6, kind: 'notice' },
          ],
        },
        {
          time: 2,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 995, y: 140 },
                { type: 'scout', x: 1050, y: 400 },
                { type: 'scout', x: 1105, y: 175 },
                { type: 'scout', x: 1160, y: 395 },
              ],
            },
          ],
        },
        {
          time: 5.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'turret',
                  x: 1010,
                  y: 180,
                  options: { speed: 84, fireCooldown: 1.4 },
                },
                { type: 'scout', x: 1065, y: 395 },
                { type: 'scout', x: 1120, y: 150 },
              ],
            },
          ],
        },
        {
          time: 9.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 995, y: 410 },
                { type: 'scout', x: 1055, y: 155 },
                { type: 'scout', x: 1115, y: 405 },
                {
                  type: 'drone',
                  x: 1175,
                  y: 265,
                  options: { speed: 222 },
                },
              ],
            },
          ],
        },
        {
          time: 13,
          actions: [
            { type: 'announce', text: 'PRIORITY // TURRET FIRST', ttl: 2.4, kind: 'notice' },
          ],
        },
        {
          time: 13.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'turret',
                  x: 1015,
                  y: 340,
                  options: { speed: 88, fireCooldown: 1.6 },
                },
                {
                  type: 'drone',
                  x: 1075,
                  y: 430,
                  options: { speed: 226 },
                },
                { type: 'scout', x: 1130, y: 130 },
                { type: 'scout', x: 1185, y: 395 },
              ],
            },
          ],
        },
        {
          time: 17.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1005,
                  y: 150,
                  options: { speed: 222 },
                },
                {
                  type: 'drone',
                  x: 1075,
                  y: 380,
                  options: { speed: 230 },
                },
                {
                  type: 'zigzag',
                  x: 1145,
                  y: 265,
                  options: { phase: 1.2, speed: 165 },
                },
                { type: 'scout', x: 1210, y: 410 },
                { type: 'interceptor', x: 1270, y: 140, options: { speed: 152 } },
              ],
            },
          ],
        },
        {
          time: 20.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'turret',
                  x: 1020,
                  y: 270,
                  options: { speed: 88, fireCooldown: 1.5 },
                },
                { type: 'scout', x: 1075, y: 415 },
                { type: 'scout', x: 1130, y: 150 },
                { type: 'rotary', x: 1220, y: 350, options: { speed: 48, fireCooldown: 1.9, rotationSpeed: 1.5 } },
              ],
            },
          ],
        },
        {
          time: 24,
          actions: [
            { type: 'announce', text: 'FINAL PUSH // CLEAR THE LINE', ttl: 2, kind: 'warning' },
          ],
        },
        {
          time: 24.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'turret',
                  x: 1025,
                  y: 255,
                  options: { speed: 92, fireCooldown: 1.2 },
                },
                {
                  type: 'drone',
                  x: 1085,
                  y: 120,
                  options: { speed: 232 },
                },
                {
                  type: 'drone',
                  x: 1150,
                  y: 420,
                  options: { speed: 236 },
                },
                { type: 'scout', x: 1160, y: 150 },
                { type: 'scout', x: 1210, y: 270 },
              ],
            },
          ],
        },
        {
          time: 28.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1000, y: 150 },
                { type: 'scout', x: 1065, y: 395 },
                {
                  type: 'zigzag',
                  x: 1135,
                  y: 270,
                  options: { phase: 0.7, speed: 165 },
                },
              ],
            },
          ],
        },
        {
          time: 31.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 995, y: 410 },
                { type: 'scout', x: 1055, y: 165 },
                { type: 'scout', x: 1115, y: 400 },
              ],
            },
          ],
        },
      ],
    },
    // escalation-04-drone-relay // Relay Run
    'escalation-04-drone-relay': {
      id: 'escalation-04-drone-relay',
      title: 'Relay Run',
      briefing: 'Objective: ride the gap. Drone packets cross in staggered bands and every pass leaves one open lane - take it, clear the packet, breathe.',
      missionDuration: 33,
      waveTimeline: [
        {
          time: 0.6,
          actions: [
            { type: 'announce', text: 'OBJECTIVE // KEEP THE RELAY LANE CLEAR', ttl: 2.6, kind: 'notice' },
          ],
        },
        {
          time: 2.4,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 990,
                  y: 116,
                  options: { speed: 236, phase: 0 },
                },
                {
                  type: 'drone',
                  x: 1060,
                  y: 174,
                  options: { speed: 242, phase: 1.6 },
                },
                {
                  type: 'drone',
                  x: 1130,
                  y: 428,
                  options: { speed: 248, phase: 3.1 },
                },
                {
                  type: 'drone',
                  x: 1200,
                  y: 462,
                  options: { speed: 254, phase: 4.7 },
                },
              ],
            },
          ],
        },
        {
          time: 4.4,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1030, y: 264 },
                { type: 'scout', x: 1110, y: 312 },
              ],
            },
          ],
        },
        {
          time: 6.2,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1015, y: 128 },
                { type: 'scout', x: 1095, y: 168 },
              ],
            },
          ],
        },
        {
          time: 7.9,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1000,
                  y: 454,
                  options: { speed: 244, phase: 1.2 },
                },
                {
                  type: 'drone',
                  x: 1070,
                  y: 412,
                  options: { speed: 250, phase: 2.8 },
                },
                {
                  type: 'drone',
                  x: 1140,
                  y: 370,
                  options: { speed: 256, phase: 4.4 },
                },
              ],
            },
          ],
        },
        {
          time: 9.6,
          actions: [
            { type: 'announce', text: 'RELAY SHIFT // RUN THE LOW LANE', ttl: 2.4, kind: 'notice' },
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 995,
                  y: 96,
                  options: { speed: 240, phase: 0.4 },
                },
                {
                  type: 'drone',
                  x: 1065,
                  y: 140,
                  options: { speed: 246, phase: 2 },
                },
                {
                  type: 'drone',
                  x: 1135,
                  y: 184,
                  options: { speed: 252, phase: 3.6 },
                },
                {
                  type: 'drone',
                  x: 1205,
                  y: 228,
                  options: { speed: 258, phase: 5.2 },
                },
              ],
            },
          ],
        },
        {
          time: 11.7,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1035, y: 266 },
                { type: 'scout', x: 1115, y: 312 },
              ],
            },
          ],
        },
        {
          time: 13.6,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1000,
                  y: 456,
                  options: { speed: 238, phase: 1 },
                },
                {
                  type: 'drone',
                  x: 1070,
                  y: 414,
                  options: { speed: 244, phase: 2.6 },
                },
                {
                  type: 'drone',
                  x: 1140,
                  y: 372,
                  options: { speed: 250, phase: 4.2 },
                },
              ],
            },
          ],
        },
        {
          time: 15.7,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1045, y: 120 },
                { type: 'scout', x: 1125, y: 166 },
              ],
            },
          ],
        },
        {
          time: 18,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1035, y: 110 },
                { type: 'scout', x: 1115, y: 452 },
                { type: 'interceptor', x: 1195, y: 280, options: { speed: 158 } },
              ],
            },
          ],
        },
        {
          time: 19.8,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 995,
                  y: 116,
                  options: { speed: 246, phase: 0.4 },
                },
                {
                  type: 'drone',
                  x: 1065,
                  y: 174,
                  options: { speed: 252, phase: 2 },
                },
                {
                  type: 'drone',
                  x: 1135,
                  y: 424,
                  options: { speed: 258, phase: 3.6 },
                },
                {
                  type: 'drone',
                  x: 1205,
                  y: 462,
                  options: { speed: 264, phase: 5.2 },
                },
              ],
            },
          ],
        },
        {
          time: 21.4,
          actions: [
            { type: 'announce', text: 'CROSS TRAFFIC // MIDDLE LANE HOLDS', ttl: 2.4, kind: 'notice' },
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 995,
                  y: 116,
                  options: { speed: 242, phase: 0.2 },
                },
                {
                  type: 'drone',
                  x: 1060,
                  y: 174,
                  options: { speed: 248, phase: 1.8 },
                },
                {
                  type: 'drone',
                  x: 1125,
                  y: 420,
                  options: { speed: 254, phase: 3.4 },
                },
              ],
            },
          ],
        },
        {
          time: 23.8,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1025, y: 120 },
                { type: 'scout', x: 1105, y: 164 },
              ],
            },
          ],
        },
        {
          time: 26.2,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 995,
                  y: 456,
                  options: { speed: 244, phase: 0.8 },
                },
                {
                  type: 'drone',
                  x: 1065,
                  y: 414,
                  options: { speed: 250, phase: 2.4 },
                },
                {
                  type: 'drone',
                  x: 1135,
                  y: 372,
                  options: { speed: 256, phase: 4 },
                },
                { type: 'rotary', x: 1220, y: 270, options: { speed: 54, fireCooldown: 1.8, rotationSpeed: 1.55 } },
              ],
            },
          ],
        },
        {
          time: 28.6,
          actions: [
            { type: 'announce', text: 'FINAL RELAY // HOLD THE LANE', ttl: 2, kind: 'warning' },
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 995,
                  y: 118,
                  options: { speed: 246, phase: 0.6 },
                },
                {
                  type: 'drone',
                  x: 1065,
                  y: 176,
                  options: { speed: 252, phase: 2.2 },
                },
                {
                  type: 'drone',
                  x: 1135,
                  y: 424,
                  options: { speed: 258, phase: 3.8 },
                },
                {
                  type: 'drone',
                  x: 1205,
                  y: 466,
                  options: { speed: 264, phase: 5.4 },
                },
              ],
            },
          ],
        },
        {
          time: 31,
          actions: [
            { type: 'announce', text: 'STATUS // LANE CLEAR', ttl: 1.8, kind: 'notice' },
          ],
        },
      ],
    },
    // escalation-05-high-low-battery // High-Low Battery
    'escalation-05-high-low-battery': {
      id: 'escalation-05-high-low-battery',
      title: 'High-Low Battery',
      briefing: 'Objective: break the battery relay. Guns take the top and bottom tracks in turn while scouts screen the middle - hold the open height.',
      missionDuration: 35,
      waveTimeline: [
        {
          time: 0.6,
          actions: [
            { type: 'announce', text: 'OBJECTIVE // BREAK THE BATTERY RELAY', ttl: 2.6, kind: 'notice' },
          ],
        },
        {
          time: 2,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'turret',
                  x: 1150,
                  y: 96,
                  options: { speed: 84, phase: 0.4, fireCooldown: 0.9 },
                },
              ],
            },
          ],
        },
        {
          time: 4,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1035, y: 418 },
                { type: 'scout', x: 1115, y: 458 },
              ],
            },
          ],
        },
        {
          time: 5.9,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1042, y: 116 },
                { type: 'scout', x: 1122, y: 162 },
              ],
            },
          ],
        },
        {
          time: 7.4,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'turret',
                  x: 1160,
                  y: 446,
                  options: { speed: 84, phase: 2.4, fireCooldown: 1.1 },
                },
              ],
            },
          ],
        },
        {
          time: 8.6,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1040, y: 118 },
                { type: 'scout', x: 1120, y: 164 },
              ],
            },
          ],
        },
        {
          time: 9.6,
          actions: [
            { type: 'announce', text: 'BATTERY SHIFT // BOTTOM TRACKS HOT', ttl: 2.4, kind: 'notice' },
          ],
        },
        {
          time: 11,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'turret',
                  x: 1148,
                  y: 94,
                  options: { speed: 86, phase: 2.1, fireCooldown: 0.95 },
                },
                { type: 'scout', x: 1044, y: 266 },
                { type: 'scout', x: 1124, y: 312 },
              ],
            },
          ],
        },
        {
          time: 12.6,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1045, y: 414 },
                { type: 'scout', x: 1125, y: 456 },
              ],
            },
          ],
        },
        {
          time: 15,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1050, y: 116 },
                { type: 'scout', x: 1130, y: 162 },
                { type: 'interceptor', x: 1210, y: 410, options: { speed: 156 } },
              ],
            },
          ],
        },
        {
          time: 16.6,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'turret',
                  x: 1150,
                  y: 92,
                  options: { speed: 84, phase: 0.9, fireCooldown: 0.8 },
                },
              ],
            },
          ],
        },
        {
          time: 17.4,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1055, y: 414 },
                { type: 'scout', x: 1135, y: 456 },
              ],
            },
          ],
        },
        {
          time: 19,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'turret',
                  x: 1155,
                  y: 444,
                  options: { speed: 88, phase: 3, fireCooldown: 1 },
                },
                { type: 'scout', x: 1054, y: 268 },
                { type: 'scout', x: 1134, y: 314 },
                { type: 'rotary', x: 1240, y: 132, options: { speed: 52, fireCooldown: 1.8, rotationSpeed: 1.55 } },
              ],
            },
          ],
        },
        {
          time: 20.4,
          actions: [
            { type: 'announce', text: 'BATTERY SHIFT // TOP TRACKS HOT', ttl: 2.4, kind: 'notice' },
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1060, y: 120 },
                { type: 'scout', x: 1140, y: 166 },
              ],
            },
          ],
        },
        {
          time: 21.8,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1056, y: 414 },
                { type: 'scout', x: 1136, y: 456 },
              ],
            },
          ],
        },
        {
          time: 23.4,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'turret',
                  x: 1160,
                  y: 442,
                  options: { speed: 84, phase: 1.7, fireCooldown: 1 },
                },
              ],
            },
          ],
        },
        {
          time: 24.8,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'turret',
                  x: 1152,
                  y: 94,
                  options: { speed: 90, phase: 2.6, fireCooldown: 0.85 },
                },
                { type: 'scout', x: 1054, y: 112 },
                { type: 'scout', x: 1134, y: 160 },
              ],
            },
          ],
        },
        {
          time: 26,
          actions: [
            { type: 'announce', text: 'BATTERY SHIFT // BOTH TRACKS HOT', ttl: 2.2, kind: 'warning' },
          ],
        },
        {
          time: 27.6,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1050, y: 110 },
                { type: 'scout', x: 1130, y: 158 },
                { type: 'scout', x: 1210, y: 206 },
              ],
            },
          ],
        },
        {
          time: 29.2,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'turret',
                  x: 1158,
                  y: 446,
                  options: { speed: 88, phase: 1.5, fireCooldown: 0.95 },
                },
                { type: 'scout', x: 1058, y: 412 },
                { type: 'scout', x: 1138, y: 454 },
              ],
            },
          ],
        },
        {
          time: 31,
          actions: [
            { type: 'announce', text: 'FINAL GUN // HOLD THE MIDDLE', ttl: 2, kind: 'warning' },
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1060, y: 116 },
                { type: 'scout', x: 1140, y: 164 },
                { type: 'scout', x: 1220, y: 212 },
              ],
            },
          ],
        },
      ],
    },
    // escalation-06-crossing-picket // Crossing Picket
    'escalation-06-crossing-picket': {
      id: 'escalation-06-crossing-picket',
      title: 'Crossing Picket',
      briefing: 'Objective: break the crossing picket. Scout screens arrive first and zigzag pairs weave behind them - break the screen, then commit.',
      missionDuration: 36,
      waveTimeline: [
        {
          time: 0.6,
          actions: [
            { type: 'announce', text: 'OBJECTIVE // BREAK THE CROSSING PICKET', ttl: 2.6, kind: 'notice' },
          ],
        },
        {
          time: 2.4,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1010, y: 112 },
                { type: 'scout', x: 1085, y: 160 },
                { type: 'scout', x: 1160, y: 414 },
                { type: 'scout', x: 1235, y: 462 },
              ],
            },
          ],
        },
        {
          time: 4.2,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1300,
                  y: 254,
                  options: { phase: 0, speed: 160 },
                },
                {
                  type: 'zigzag',
                  x: 1405,
                  y: 306,
                  options: { phase: 3.14, speed: 160 },
                },
              ],
            },
          ],
        },
        {
          time: 6.6,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1015, y: 110 },
                { type: 'scout', x: 1095, y: 158 },
                { type: 'scout', x: 1175, y: 416 },
              ],
            },
          ],
        },
        {
          time: 8.4,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1290,
                  y: 250,
                  options: { phase: 0.7, speed: 160 },
                },
                {
                  type: 'zigzag',
                  x: 1395,
                  y: 310,
                  options: { phase: 3.9, speed: 160 },
                },
              ],
            },
          ],
        },
        {
          time: 9.6,
          actions: [
            { type: 'announce', text: 'CROSS TRAFFIC // WEAVE THE GAP', ttl: 2.4, kind: 'notice' },
          ],
        },
        {
          time: 10.6,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1020, y: 108 },
                { type: 'scout', x: 1095, y: 156 },
                { type: 'scout', x: 1170, y: 204 },
              ],
            },
          ],
        },
        {
          time: 12.4,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1310,
                  y: 262,
                  options: { phase: 0, speed: 160 },
                },
                {
                  type: 'zigzag',
                  x: 1415,
                  y: 314,
                  options: { phase: 3.14, speed: 160 },
                },
              ],
            },
          ],
        },
        {
          time: 14.6,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1030, y: 112 },
                { type: 'scout', x: 1110, y: 162 },
                { type: 'scout', x: 1190, y: 420 },
                { type: 'scout', x: 1270, y: 466 },
              ],
            },
          ],
        },
        {
          time: 16.4,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1040, y: 110 },
                { type: 'scout', x: 1120, y: 160 },
                { type: 'interceptor', x: 1200, y: 390, options: { speed: 160 } },
              ],
            },
          ],
        },
        {
          time: 18.6,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1305,
                  y: 258,
                  options: { phase: 1.4, speed: 160 },
                },
                {
                  type: 'zigzag',
                  x: 1410,
                  y: 302,
                  options: { phase: 4.6, speed: 160 },
                },
                { type: 'rotary', x: 1450, y: 270, options: { speed: 58, fireCooldown: 1.8, rotationSpeed: 1.6 } },
              ],
            },
          ],
        },
        {
          time: 20.4,
          actions: [
            { type: 'announce', text: 'CROSS TRAFFIC // PICKET CLOSES', ttl: 2.4, kind: 'notice' },
          ],
        },
        {
          time: 21,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1025, y: 356 },
                { type: 'scout', x: 1100, y: 404 },
                { type: 'scout', x: 1175, y: 452 },
              ],
            },
          ],
        },
        {
          time: 22.8,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1320,
                  y: 248,
                  options: { phase: 0, speed: 160 },
                },
                {
                  type: 'zigzag',
                  x: 1425,
                  y: 300,
                  options: { phase: 3.14, speed: 160 },
                },
              ],
            },
          ],
        },
        {
          time: 25,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1035, y: 110 },
                { type: 'scout', x: 1115, y: 158 },
                { type: 'scout', x: 1195, y: 414 },
                { type: 'scout', x: 1275, y: 462 },
              ],
            },
          ],
        },
        {
          time: 26.8,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1315,
                  y: 254,
                  options: { phase: 0.4, speed: 160 },
                },
                {
                  type: 'zigzag',
                  x: 1420,
                  y: 306,
                  options: { phase: 3.5, speed: 160 },
                },
              ],
            },
          ],
        },
        {
          time: 28.8,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1330,
                  y: 252,
                  options: { phase: 0, speed: 160 },
                },
                {
                  type: 'zigzag',
                  x: 1435,
                  y: 304,
                  options: { phase: 3.14, speed: 160 },
                },
              ],
            },
          ],
        },
        {
          time: 30.6,
          actions: [
            { type: 'announce', text: 'FINAL CROSSING // HOLD THE MIDDLE', ttl: 2, kind: 'warning' },
            {
              type: 'spawnEnemies',
              enemies: [
                { type: 'scout', x: 1060, y: 120 },
                { type: 'scout', x: 1140, y: 168 },
                { type: 'scout', x: 1220, y: 414 },
              ],
            },
          ],
        },
        {
          time: 31.4,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1280,
                  y: 256,
                  options: { phase: 0, speed: 160 },
                },
                {
                  type: 'zigzag',
                  x: 1370,
                  y: 308,
                  options: { phase: 3.14, speed: 160 },
                },
              ],
            },
          ],
        },
        {
          time: 33,
          actions: [
            { type: 'announce', text: 'STATUS // PICKET BROKEN', ttl: 1.8, kind: 'notice' },
          ],
        },
      ],
    },
    // escalation-7-turret-line // Turret Line
    'escalation-7-turret-line': {
      id: 'escalation-7-turret-line',
      title: 'Turret Line',
      briefing: 'Objective: clear the turret line. Guns hold their stations while drones drop in staggered packs - break the guns first, then the drops.',
      missionDuration: 36,
      waveTimeline: [
        {
          time: 0.6,
          actions: [
            { type: 'announce', text: 'OBJECTIVE // BREAK THE TURRET LINE', ttl: 3, kind: 'notice' },
          ],
        },
        {
          time: 1,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'turret',
                  x: 1180,
                  y: 160,
                  options: { speed: 75, phase: 0.4, fireCooldown: 0.9 },
                },
                {
                  type: 'turret',
                  x: 1250,
                  y: 300,
                  options: { speed: 75, phase: 2.6, fireCooldown: 1.1 },
                },
              ],
            },
          ],
        },
        {
          time: 2.8,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1140,
                  y: 450,
                  options: { speed: 240, phase: 0.2 },
                },
                {
                  type: 'drone',
                  x: 1320,
                  y: 160,
                  options: { speed: 250, phase: 2.8 },
                },
              ],
            },
          ],
        },
        {
          time: 4.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1130,
                  y: 300,
                  options: { speed: 240, phase: 0.2 },
                },
                {
                  type: 'drone',
                  x: 1310,
                  y: 450,
                  options: { speed: 260, phase: 2.8 },
                },
              ],
            },
          ],
        },
        {
          time: 6.2,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'scout',
                  x: 1160,
                  y: 160,
                  options: { speed: 185 },
                },
                {
                  type: 'scout',
                  x: 1270,
                  y: 300,
                  options: { speed: 185 },
                },
                {
                  type: 'scout',
                  x: 1380,
                  y: 450,
                  options: { speed: 185 },
                },
              ],
            },
          ],
        },
        {
          time: 7.5,
          actions: [
            { type: 'announce', text: 'DRONE DROP // SPLIT VECTOR', ttl: 2.4, kind: 'warning' },
          ],
        },
        {
          time: 8,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'turret',
                  x: 1360,
                  y: 160,
                  options: { speed: 85, phase: 1.2, fireCooldown: 0.8 },
                },
                {
                  type: 'scout',
                  x: 1150,
                  y: 300,
                  options: { speed: 180 },
                },
                {
                  type: 'scout',
                  x: 1250,
                  y: 450,
                  options: { speed: 180 },
                },
              ],
            },
          ],
        },
        {
          time: 9.6,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1150,
                  y: 160,
                  options: { speed: 245, phase: 1 },
                },
                {
                  type: 'drone',
                  x: 1300,
                  y: 300,
                  options: { speed: 245, phase: 3.4 },
                },
                {
                  type: 'drone',
                  x: 1440,
                  y: 450,
                  options: { speed: 245, phase: 5.2 },
                },
              ],
            },
          ],
        },
        {
          time: 11.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1130,
                  y: 160,
                  options: { speed: 245, phase: 1 },
                },
                {
                  type: 'drone',
                  x: 1280,
                  y: 300,
                  options: { speed: 245, phase: 3.4 },
                },
                {
                  type: 'drone',
                  x: 1420,
                  y: 450,
                  options: { speed: 245, phase: 5.2 },
                },
              ],
            },
          ],
        },
        {
          time: 13.4,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1170,
                  y: 160,
                  options: { speed: 185, phase: 0.7 },
                },
                {
                  type: 'zigzag',
                  x: 1330,
                  y: 300,
                  options: { speed: 185, phase: 3.4 },
                },
                {
                  type: 'scout',
                  x: 1250,
                  y: 450,
                  options: { speed: 190 },
                },
              ],
            },
          ],
        },
        {
          time: 15.5,
          actions: [
            { type: 'announce', text: 'PRIORITY FIRE // TURRETS FIRST', ttl: 2.6, kind: 'notice' },
          ],
        },
        {
          time: 16,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'turret',
                  x: 1190,
                  y: 160,
                  options: { speed: 80, phase: 0.9, fireCooldown: 0.7 },
                },
                {
                  type: 'turret',
                  x: 1260,
                  y: 300,
                  options: { speed: 80, phase: 3.1, fireCooldown: 1 },
                },
                {
                  type: 'zigzag',
                  x: 1400,
                  y: 450,
                  options: { speed: 185, phase: 0.8 },
                },
                { type: 'interceptor', x: 1450, y: 85, options: { speed: 166 } },
              ],
            },
          ],
        },
        {
          time: 18,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1160,
                  y: 160,
                  options: { speed: 250, phase: 0.6 },
                },
                {
                  type: 'drone',
                  x: 1310,
                  y: 300,
                  options: { speed: 250, phase: 4.2 },
                },
                {
                  type: 'drone',
                  x: 1450,
                  y: 450,
                  options: { speed: 250, phase: 2.4 },
                },
              ],
            },
          ],
        },
        {
          time: 20.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1140,
                  y: 160,
                  options: { speed: 250, phase: 0.6 },
                },
                {
                  type: 'drone',
                  x: 1300,
                  y: 300,
                  options: { speed: 250, phase: 4.2 },
                },
                { type: 'rotary', x: 1440, y: 420, options: { speed: 66, fireCooldown: 1.5, rotationSpeed: 1.75 } },
              ],
            },
          ],
        },
        {
          time: 22.2,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'scout',
                  x: 1150,
                  y: 450,
                  options: { speed: 190 },
                },
                {
                  type: 'scout',
                  x: 1270,
                  y: 160,
                  options: { speed: 190 },
                },
                {
                  type: 'scout',
                  x: 1390,
                  y: 300,
                  options: { speed: 190 },
                },
                {
                  type: 'zigzag',
                  x: 1330,
                  y: 450,
                  options: { speed: 190, phase: 1.6 },
                },
              ],
            },
          ],
        },
        {
          time: 24,
          actions: [
            { type: 'announce', text: 'LINE TWO // HOLD AND CLEAR', ttl: 2.4, kind: 'warning' },
          ],
        },
        {
          time: 24.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'turret',
                  x: 1380,
                  y: 160,
                  options: { speed: 90, phase: 2, fireCooldown: 0.9 },
                },
                {
                  type: 'scout',
                  x: 1160,
                  y: 300,
                  options: { speed: 190 },
                },
                {
                  type: 'zigzag',
                  x: 1270,
                  y: 450,
                  options: { speed: 180, phase: 5 },
                },
              ],
            },
          ],
        },
        {
          time: 26.4,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1160,
                  y: 160,
                  options: { speed: 250, phase: 1.4 },
                },
                {
                  type: 'drone',
                  x: 1310,
                  y: 300,
                  options: { speed: 250, phase: 3.8 },
                },
                {
                  type: 'drone',
                  x: 1450,
                  y: 450,
                  options: { speed: 250, phase: 5.6 },
                },
              ],
            },
          ],
        },
        {
          time: 28.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1150,
                  y: 160,
                  options: { speed: 255, phase: 1.8 },
                },
                {
                  type: 'drone',
                  x: 1300,
                  y: 300,
                  options: { speed: 255, phase: 3.9 },
                },
                {
                  type: 'drone',
                  x: 1440,
                  y: 450,
                  options: { speed: 255, phase: 0.4 },
                },
              ],
            },
          ],
        },
        {
          time: 30.2,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'scout',
                  x: 1170,
                  y: 160,
                  options: { speed: 195 },
                },
                {
                  type: 'scout',
                  x: 1290,
                  y: 300,
                  options: { speed: 195 },
                },
                {
                  type: 'scout',
                  x: 1410,
                  y: 450,
                  options: { speed: 195 },
                },
                {
                  type: 'zigzag',
                  x: 1350,
                  y: 160,
                  options: { speed: 195, phase: 0.5 },
                },
              ],
            },
          ],
        },
        {
          time: 31,
          actions: [
            { type: 'announce', text: 'FINAL WAVE // HOLD THE LANE', ttl: 2.2, kind: 'warning' },
          ],
        },
        {
          time: 31.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'turret',
                  x: 1140,
                  y: 300,
                  options: { speed: 95, phase: 1.5, fireCooldown: 0.8 },
                },
                {
                  type: 'drone',
                  x: 1280,
                  y: 450,
                  options: { speed: 250, phase: 1.1 },
                },
                {
                  type: 'drone',
                  x: 1400,
                  y: 160,
                  options: { speed: 250, phase: 3.7 },
                },
                {
                  type: 'zigzag',
                  x: 1360,
                  y: 300,
                  options: { speed: 190, phase: 2.2 },
                },
              ],
            },
          ],
        },
        {
          time: 33.4,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1200,
                  y: 450,
                  options: { speed: 250, phase: 0.8 },
                },
                {
                  type: 'drone',
                  x: 1320,
                  y: 160,
                  options: { speed: 255, phase: 3.2 },
                },
                {
                  type: 'scout',
                  x: 1140,
                  y: 300,
                  options: { speed: 200 },
                },
              ],
            },
          ],
        },
      ],
    },
    // escalation-8-shifting-lanes // Shifting Lanes
    'escalation-8-shifting-lanes': {
      id: 'escalation-8-shifting-lanes',
      title: 'Shifting Lanes',
      briefing: 'Objective: ride the shifting lanes. Zigzag layers move the gaps - take the open lane and keep it moving.',
      missionDuration: 38,
      waveTimeline: [
        {
          time: 0.6,
          actions: [
            { type: 'announce', text: 'OBJECTIVE // THREAD THE SHIFTING GAPS', ttl: 3, kind: 'notice' },
          ],
        },
        {
          time: 1.2,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1140,
                  y: 160,
                  options: { speed: 165, phase: 0 },
                },
                {
                  type: 'zigzag',
                  x: 1230,
                  y: 300,
                  options: { speed: 165, phase: 1.6 },
                },
                {
                  type: 'zigzag',
                  x: 1320,
                  y: 450,
                  options: { speed: 165, phase: 3.1 },
                },
                {
                  type: 'zigzag',
                  x: 1410,
                  y: 160,
                  options: { speed: 165, phase: 4.7 },
                },
              ],
            },
          ],
        },
        {
          time: 3.6,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1180,
                  y: 300,
                  options: { speed: 175, phase: 0.8 },
                },
                {
                  type: 'zigzag',
                  x: 1290,
                  y: 450,
                  options: { speed: 175, phase: 2.4 },
                },
                {
                  type: 'zigzag',
                  x: 1400,
                  y: 160,
                  options: { speed: 175, phase: 4.1 },
                },
              ],
            },
          ],
        },
        {
          time: 6.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1360,
                  y: 300,
                  options: { speed: 200, phase: 2.4 },
                },
                {
                  type: 'zigzag',
                  x: 1150,
                  y: 450,
                  options: { speed: 200, phase: 4 },
                },
                {
                  type: 'zigzag',
                  x: 1270,
                  y: 160,
                  options: { speed: 200, phase: 0.8 },
                },
              ],
            },
          ],
        },
        {
          time: 8.8,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1170,
                  y: 300,
                  options: { speed: 185, phase: 1.1 },
                },
                {
                  type: 'zigzag',
                  x: 1310,
                  y: 450,
                  options: { speed: 185, phase: 2.9 },
                },
                {
                  type: 'zigzag',
                  x: 1440,
                  y: 160,
                  options: { speed: 185, phase: 4.6 },
                },
              ],
            },
          ],
        },
        {
          time: 10.5,
          actions: [
            { type: 'announce', text: 'GAPS CLOSING // KEEP MOVING', ttl: 2.4, kind: 'notice' },
          ],
        },
        {
          time: 11,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1400,
                  y: 300,
                  options: { speed: 185, phase: 1.2 },
                },
                {
                  type: 'zigzag',
                  x: 1180,
                  y: 450,
                  options: { speed: 185, phase: 3.6 },
                },
                {
                  type: 'zigzag',
                  x: 1300,
                  y: 160,
                  options: { speed: 185, phase: 5.6 },
                },
              ],
            },
          ],
        },
        {
          time: 13.2,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1160,
                  y: 300,
                  options: { speed: 195, phase: 0.3 },
                },
                {
                  type: 'zigzag',
                  x: 1280,
                  y: 450,
                  options: { speed: 195, phase: 2.2 },
                },
                {
                  type: 'zigzag',
                  x: 1400,
                  y: 160,
                  options: { speed: 195, phase: 3.8 },
                },
              ],
            },
          ],
        },
        {
          time: 15.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1420,
                  y: 300,
                  options: { speed: 215, phase: 3.9 },
                },
                {
                  type: 'zigzag',
                  x: 1160,
                  y: 450,
                  options: { speed: 215, phase: 0.7 },
                },
                {
                  type: 'zigzag',
                  x: 1300,
                  y: 160,
                  options: { speed: 215, phase: 2.9 },
                },
                {
                  type: 'zigzag',
                  x: 1240,
                  y: 300,
                  options: { speed: 215, phase: 5.1 },
                },
                { type: 'interceptor', x: 1450, y: 82, options: { speed: 162 } },
              ],
            },
          ],
        },
        {
          time: 17.2,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1200,
                  y: 450,
                  options: { speed: 205, phase: 1.4 },
                },
                {
                  type: 'zigzag',
                  x: 1350,
                  y: 160,
                  options: { speed: 205, phase: 3.2 },
                },
              ],
            },
          ],
        },
        {
          time: 18,
          actions: [
            { type: 'announce', text: 'SHEAR // RIDE THE OPEN LANE', ttl: 2.4, kind: 'warning' },
          ],
        },
        {
          time: 19,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'scout',
                  x: 1200,
                  y: 300,
                  options: { speed: 190 },
                },
                {
                  type: 'scout',
                  x: 1340,
                  y: 450,
                  options: { speed: 190 },
                },
                {
                  type: 'turret',
                  x: 1420,
                  y: 160,
                  options: { speed: 92, phase: 1.4, fireCooldown: 1 },
                },
                { type: 'rotary', x: 1450, y: 365, options: { speed: 62, fireCooldown: 1.7, rotationSpeed: 1.7 } },
              ],
            },
          ],
        },
        {
          time: 21.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1170,
                  y: 300,
                  options: { speed: 210, phase: 0.6 },
                },
                {
                  type: 'zigzag',
                  x: 1310,
                  y: 450,
                  options: { speed: 210, phase: 2.7 },
                },
                {
                  type: 'zigzag',
                  x: 1440,
                  y: 160,
                  options: { speed: 210, phase: 4.4 },
                },
              ],
            },
          ],
        },
        {
          time: 24,
          actions: [
            { type: 'announce', text: 'TURRET ANCHOR // CLEAR THE LANE', ttl: 2.4, kind: 'notice' },
          ],
        },
        {
          time: 24.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1150,
                  y: 300,
                  options: { speed: 175, phase: 1.5 },
                },
                {
                  type: 'zigzag',
                  x: 1280,
                  y: 450,
                  options: { speed: 175, phase: 3.3 },
                },
                {
                  type: 'zigzag',
                  x: 1400,
                  y: 160,
                  options: { speed: 175, phase: 5.4 },
                },
                {
                  type: 'zigzag',
                  x: 1220,
                  y: 300,
                  options: { speed: 175, phase: 0.9 },
                },
              ],
            },
          ],
        },
        {
          time: 26.8,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1160,
                  y: 450,
                  options: { speed: 200, phase: 1.9 },
                },
                {
                  type: 'zigzag',
                  x: 1300,
                  y: 160,
                  options: { speed: 200, phase: 3.7 },
                },
                {
                  type: 'zigzag',
                  x: 1430,
                  y: 300,
                  options: { speed: 200, phase: 5.5 },
                },
                {
                  type: 'scout',
                  x: 1240,
                  y: 450,
                  options: { speed: 195 },
                },
              ],
            },
          ],
        },
        {
          time: 29,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1360,
                  y: 160,
                  options: { speed: 205, phase: 2.1 },
                },
                {
                  type: 'zigzag',
                  x: 1180,
                  y: 300,
                  options: { speed: 205, phase: 4.5 },
                },
                {
                  type: 'scout',
                  x: 1300,
                  y: 450,
                  options: { speed: 195 },
                },
              ],
            },
          ],
        },
        {
          time: 31.2,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1170,
                  y: 160,
                  options: { speed: 215, phase: 0.4 },
                },
                {
                  type: 'zigzag',
                  x: 1320,
                  y: 300,
                  options: { speed: 215, phase: 2.5 },
                },
                {
                  type: 'zigzag',
                  x: 1450,
                  y: 450,
                  options: { speed: 215, phase: 4.3 },
                },
                {
                  type: 'turret',
                  x: 1260,
                  y: 160,
                  options: { speed: 95, phase: 2.2, fireCooldown: 0.9 },
                },
              ],
            },
          ],
        },
        {
          time: 33,
          actions: [
            { type: 'announce', text: 'FINAL LANE // HOLD THE GAP', ttl: 2.2, kind: 'warning' },
          ],
        },
        {
          time: 33.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1150,
                  y: 300,
                  options: { speed: 170, phase: 0.3 },
                },
                {
                  type: 'zigzag',
                  x: 1320,
                  y: 450,
                  options: { speed: 200, phase: 2.7 },
                },
                {
                  type: 'zigzag',
                  x: 1240,
                  y: 160,
                  options: { speed: 170, phase: 4.9 },
                },
              ],
            },
          ],
        },
        {
          time: 35.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1120,
                  y: 300,
                  options: { speed: 210, phase: 1.2 },
                },
                {
                  type: 'zigzag',
                  x: 1180,
                  y: 450,
                  options: { speed: 210, phase: 3.4 },
                },
              ],
            },
          ],
        },
      ],
    },
    // escalation-9-final-proof // Final Proof
    'escalation-9-final-proof': {
      id: 'escalation-9-final-proof',
      title: 'Final Proof',
      briefing: 'Objective: break the final proof. Mixed contact lands after a short breather - clear the last wave before the run ends.',
      missionDuration: 41,
      waveTimeline: [
        {
          time: 0.6,
          actions: [
            { type: 'announce', text: 'OBJECTIVE // FINAL PROOF RUN', ttl: 3, kind: 'notice' },
          ],
        },
        {
          time: 1.2,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'scout',
                  x: 1150,
                  y: 150,
                  options: { speed: 185 },
                },
                {
                  type: 'scout',
                  x: 1230,
                  y: 295,
                  options: { speed: 185 },
                },
                {
                  type: 'scout',
                  x: 1310,
                  y: 445,
                  options: { speed: 185 },
                },
                {
                  type: 'zigzag',
                  x: 1400,
                  y: 150,
                  options: { speed: 175, phase: 2 },
                },
              ],
            },
          ],
        },
        {
          time: 3.4,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1140,
                  y: 295,
                  options: { speed: 235, phase: 1.1 },
                },
                {
                  type: 'drone',
                  x: 1290,
                  y: 445,
                  options: { speed: 255, phase: 3.6 },
                },
                {
                  type: 'drone',
                  x: 1430,
                  y: 150,
                  options: { speed: 250, phase: 5.2 },
                },
              ],
            },
          ],
        },
        {
          time: 5.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1160,
                  y: 295,
                  options: { speed: 235, phase: 1.1 },
                },
                {
                  type: 'drone',
                  x: 1300,
                  y: 445,
                  options: { speed: 255, phase: 3.6 },
                },
              ],
            },
          ],
        },
        {
          time: 7.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'scout',
                  x: 1130,
                  y: 150,
                  options: { speed: 190 },
                },
                {
                  type: 'scout',
                  x: 1250,
                  y: 295,
                  options: { speed: 190 },
                },
                {
                  type: 'zigzag',
                  x: 1380,
                  y: 445,
                  options: { speed: 180, phase: 0.7 },
                },
              ],
            },
          ],
        },
        {
          time: 9,
          actions: [
            { type: 'announce', text: 'CONTACT // MIXED SCREEN', ttl: 2.6, kind: 'warning' },
          ],
        },
        {
          time: 9.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'turret',
                  x: 1250,
                  y: 150,
                  options: { speed: 80, phase: 0.5, fireCooldown: 0.8 },
                },
                {
                  type: 'turret',
                  x: 1330,
                  y: 295,
                  options: { speed: 80, phase: 2.7, fireCooldown: 1 },
                },
                {
                  type: 'zigzag',
                  x: 1420,
                  y: 445,
                  options: { speed: 185, phase: 1.1 },
                },
              ],
            },
          ],
        },
        {
          time: 11.7,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1150,
                  y: 150,
                  options: { speed: 245, phase: 0.4 },
                },
                {
                  type: 'drone',
                  x: 1300,
                  y: 295,
                  options: { speed: 250, phase: 2.6 },
                },
                {
                  type: 'drone',
                  x: 1440,
                  y: 445,
                  options: { speed: 255, phase: 4.5 },
                },
              ],
            },
          ],
        },
        {
          time: 14,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1140,
                  y: 150,
                  options: { speed: 240, phase: 0.3 },
                },
                {
                  type: 'drone',
                  x: 1280,
                  y: 295,
                  options: { speed: 240, phase: 2.9 },
                },
                {
                  type: 'drone',
                  x: 1420,
                  y: 445,
                  options: { speed: 240, phase: 5 },
                },
              ],
            },
          ],
        },
        {
          time: 16.4,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'scout',
                  x: 1160,
                  y: 150,
                  options: { speed: 195 },
                },
                {
                  type: 'scout',
                  x: 1280,
                  y: 295,
                  options: { speed: 195 },
                },
                {
                  type: 'scout',
                  x: 1400,
                  y: 445,
                  options: { speed: 195 },
                },
                {
                  type: 'zigzag',
                  x: 1330,
                  y: 150,
                  options: { speed: 190, phase: 2.4 },
                },
              ],
            },
          ],
        },
        {
          time: 18.5,
          actions: [
            { type: 'announce', text: 'BREATHER // RELOAD AND RESET', ttl: 3, kind: 'notice' },
          ],
        },
        {
          time: 19,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'scout',
                  x: 1200,
                  y: 295,
                  options: { speed: 130 },
                },
                {
                  type: 'scout',
                  x: 1200,
                  y: 445,
                  options: { speed: 130 },
                },
              ],
            },
          ],
        },
        {
          time: 21.3,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1170,
                  y: 150,
                  options: { speed: 245, phase: 1.5 },
                },
                {
                  type: 'drone',
                  x: 1320,
                  y: 295,
                  options: { speed: 250, phase: 3.8 },
                },
                {
                  type: 'zigzag',
                  x: 1450,
                  y: 445,
                  options: { speed: 185, phase: 0.2 },
                },
                { type: 'interceptor', x: 1450, y: 365, options: { speed: 165 } },
                { type: 'rotary', x: 1470, y: 220, options: { speed: 68, fireCooldown: 1.6, rotationSpeed: 1.8 } },
              ],
            },
          ],
        },
        {
          time: 23,
          actions: [
            { type: 'announce', text: 'MIXED MASTERY // ALL TYPES', ttl: 2.4, kind: 'warning' },
          ],
        },
        {
          time: 23.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'turret',
                  x: 1180,
                  y: 150,
                  options: { speed: 85, phase: 1.9, fireCooldown: 0.9 },
                },
                {
                  type: 'zigzag',
                  x: 1300,
                  y: 295,
                  options: { speed: 180, phase: 0.5 },
                },
                {
                  type: 'zigzag',
                  x: 1300,
                  y: 445,
                  options: { speed: 180, phase: 3.7 },
                },
                {
                  type: 'scout',
                  x: 1400,
                  y: 150,
                  options: { speed: 195 },
                },
                { type: 'interceptor', x: 1450, y: 365, options: { speed: 170 } },
                { type: 'rotary', x: 1470, y: 270, options: { speed: 70, fireCooldown: 1.5, rotationSpeed: 1.85 } },
              ],
            },
          ],
        },
        {
          time: 25.6,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1150,
                  y: 295,
                  options: { speed: 250, phase: 0.7 },
                },
                {
                  type: 'drone',
                  x: 1300,
                  y: 445,
                  options: { speed: 255, phase: 2.4 },
                },
                {
                  type: 'drone',
                  x: 1440,
                  y: 150,
                  options: { speed: 255, phase: 4.8 },
                },
              ],
            },
          ],
        },
        {
          time: 27.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1150,
                  y: 295,
                  options: { speed: 250, phase: 0.8 },
                },
                {
                  type: 'drone',
                  x: 1290,
                  y: 445,
                  options: { speed: 250, phase: 3.2 },
                },
                {
                  type: 'drone',
                  x: 1430,
                  y: 150,
                  options: { speed: 250, phase: 5.4 },
                },
              ],
            },
          ],
        },
        {
          time: 29.6,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'scout',
                  x: 1140,
                  y: 295,
                  options: { speed: 200 },
                },
                {
                  type: 'scout',
                  x: 1270,
                  y: 445,
                  options: { speed: 200 },
                },
                {
                  type: 'scout',
                  x: 1400,
                  y: 150,
                  options: { speed: 200 },
                },
                {
                  type: 'zigzag',
                  x: 1350,
                  y: 295,
                  options: { speed: 190, phase: 1.3 },
                },
              ],
            },
          ],
        },
        {
          time: 31.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'zigzag',
                  x: 1170,
                  y: 445,
                  options: { speed: 180, phase: 1 },
                },
                {
                  type: 'zigzag',
                  x: 1290,
                  y: 150,
                  options: { speed: 180, phase: 2.6 },
                },
                {
                  type: 'zigzag',
                  x: 1410,
                  y: 295,
                  options: { speed: 180, phase: 4.2 },
                },
                {
                  type: 'scout',
                  x: 1230,
                  y: 445,
                  options: { speed: 200 },
                },
              ],
            },
          ],
        },
        {
          time: 33.4,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1160,
                  y: 150,
                  options: { speed: 255, phase: 1.9 },
                },
                {
                  type: 'drone',
                  x: 1310,
                  y: 295,
                  options: { speed: 255, phase: 3.5 },
                },
                {
                  type: 'drone',
                  x: 1450,
                  y: 445,
                  options: { speed: 255, phase: 5.1 },
                },
              ],
            },
          ],
        },
        {
          time: 34.5,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'turret',
                  x: 1250,
                  y: 150,
                  options: { speed: 90, phase: 0.6, fireCooldown: 0.8 },
                },
                {
                  type: 'drone',
                  x: 1140,
                  y: 295,
                  options: { speed: 245, phase: 1.6 },
                },
                {
                  type: 'drone',
                  x: 1330,
                  y: 445,
                  options: { speed: 245, phase: 4 },
                },
              ],
            },
          ],
        },
        {
          time: 35.9,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'scout',
                  x: 1120,
                  y: 150,
                  options: { speed: 200 },
                },
                {
                  type: 'scout',
                  x: 1250,
                  y: 295,
                  options: { speed: 200 },
                },
                {
                  type: 'zigzag',
                  x: 1390,
                  y: 445,
                  options: { speed: 190, phase: 2.8 },
                },
              ],
            },
          ],
        },
        {
          time: 36.6,
          actions: [
            { type: 'announce', text: 'FINAL WAVE // HOLD THE LINE', ttl: 2, kind: 'warning' },
          ],
        },
        {
          time: 37,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1180,
                  y: 150,
                  options: { speed: 245, phase: 0.9 },
                },
                {
                  type: 'zigzag',
                  x: 1280,
                  y: 295,
                  options: { speed: 185, phase: 2.4 },
                },
                {
                  type: 'scout',
                  x: 1360,
                  y: 445,
                  options: { speed: 200 },
                },
              ],
            },
          ],
        },
        {
          time: 38.6,
          actions: [
            {
              type: 'spawnEnemies',
              enemies: [
                {
                  type: 'drone',
                  x: 1100,
                  y: 150,
                  options: { speed: 255, phase: 0.5 },
                },
                {
                  type: 'scout',
                  x: 1150,
                  y: 295,
                  options: { speed: 195 },
                },
                {
                  type: 'zigzag',
                  x: 1160,
                  y: 445,
                  options: { speed: 190, phase: 3.9 },
                },
              ],
            },
          ],
        },
      ],
    },
  },
};
