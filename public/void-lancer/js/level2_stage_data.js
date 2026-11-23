// Graveyard Sortie (sortie 2) stage data: a short lane with an on-station
// Imperial patrol, one tagged turret the worklight alarm can wake, and no
// boss. missionDuration is the clear time; the lane is meant to be crossed,
// not farmed.
//
// The lane reads in four beats: objective (0.6s), who owns the worklight
// (5.5s), the amber markers the route record follows (12.0s), then a bounded
// exit beat - the last wave at 25.5s, nothing spawns after it, and the route
// record names the destination while the run is still live. Announcements are
// spaced so each one finishes before the next arrives (the queue ticks every
// banner's ttl together, so overlapping entries would cut each other off).
//
// The waves carry the difficulty: the original anchors stay exactly as
// authored, eight earlier pressure beats tighten the baseline, and three more
// standard packets now fill the mid-lane lulls. No existing unit gets tougher.
// Every hull keeps its stock hit points - the ramp is count, cadence and
// overlap, never durability.
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
        // The objective lands before the first fight so the run has a stated
        // destination, not just a timer.
        { type: 'announce', text: 'OBJECTIVE // CROSS THE GRAVEYARD', ttl: 3, kind: 'notice' },
      ],
    },
    {
      // First contact lands while the objective plate is still up, so the
      // lane is already contested before the worklight is named.
      time: 1.5,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'scout', x: 1040, y: 178 },
            { type: 'scout', x: 1136, y: 366 },
          ],
        },
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
      // The outer file catches the opening file from both heights without
      // changing the stock scout durability.
      time: 4.2,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'scout', x: 1008, y: 110 },
            { type: 'scout', x: 1092, y: 270 },
            { type: 'scout', x: 1176, y: 430 },
          ],
        },
      ],
    },
    {
      // Two weaves crossing under the first scout line: the middle band stops
      // being empty between the early beats.
      time: 5.0,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'zigzag', x: 1058, y: 152, options: { phase: 0.6 } },
            { type: 'zigzag', x: 1148, y: 406, options: { phase: 2.4 } },
          ],
        },
      ],
    },
    {
      // Independent mercenary salvager, not the Imperial survivors: the light
      // is theirs, and the boat is scenery, never a target.
      time: 5.5,
      actions: [
        { type: 'announce', text: 'WORKLIGHT // MERCENARY SALVAGER', ttl: 3, kind: 'notice' },
      ],
    },
    {
      // A drone pair crosses while the salvager banner is up: the light beat
      // is never a breather.
      time: 6.8,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'drone', x: 1030, y: 128, options: { speed: 226 } },
            { type: 'drone', x: 1118, y: 266, options: { speed: 232 } },
            { type: 'drone', x: 1206, y: 404, options: { speed: 238 } },
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
      // The lane's first extra gun line: an untagged turret that fires from
      // the moment it arrives, escorted by a scout file.
      time: 10.2,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'turret', x: 1164, y: 430, options: { speed: 58, phase: 1.7, fireCooldown: 1.2 } },
            { type: 'scout', x: 1036, y: 146 },
            { type: 'scout', x: 1120, y: 274 },
            { type: 'scout', x: 1204, y: 400 },
          ],
        },
      ],
    },
    {
      time: 12.0,
      actions: [
        // The amber markers sweep into the lane around here: the copy names
        // where they lead while they are on screen.
        { type: 'announce', text: 'AMBER MARKERS // ONWARD TO THE SOLAR ALTAR', ttl: 2.6, kind: 'notice' },
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'turret', x: 1150, y: 320, options: { speed: 44, phase: 2.2, fireCooldown: 1.1 } },
          ],
        },
      ],
    },
    {
      // Drones stack on the turret's flank: two waves are alive together
      // through the middle of the lane.
      time: 13.8,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'drone', x: 1044, y: 158, options: { speed: 228 } },
            { type: 'drone', x: 1132, y: 336, options: { speed: 236 } },
            { type: 'zigzag', x: 1220, y: 244, options: { phase: 2.9 } },
          ],
        },
      ],
    },
    {
      // Close the middle lull with another ordinary hull packet.
      time: 14.8,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'scout', x: 1040, y: 136 },
            { type: 'zigzag', x: 1128, y: 280, options: { phase: 1.1 } },
            { type: 'scout', x: 1216, y: 414 },
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
      // Second gun of the lane, high and slow: bullet pressure doubles from
      // here without touching the alarm-linked patrol at time 0.
      time: 18.0,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'turret', x: 1176, y: 176, options: { speed: 56, phase: 2.8, fireCooldown: 1.1 } },
            { type: 'scout', x: 1042, y: 300 },
            { type: 'scout', x: 1128, y: 448 },
          ],
        },
      ],
    },
    {
      // The tightest gap in the lane: this wave lands while the 18.0s line is
      // still entering, so three waves overlap around the 20s mark.
      time: 19.8,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'zigzag', x: 1052, y: 176, options: { phase: 0.3 } },
            { type: 'zigzag', x: 1142, y: 398, options: { phase: 1.8 } },
            { type: 'drone', x: 1228, y: 286, options: { speed: 240 } },
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
      // One more standard patrol packet keeps the lane crowded before its
      // original final wave.
      time: 22.2,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'scout', x: 1024, y: 126 },
            { type: 'scout', x: 1112, y: 266 },
            { type: 'scout', x: 1200, y: 406 },
          ],
        },
      ],
    },
    {
      // Last reinforcement before the close, so the final wave lands on a lane
      // that is already crowded rather than an empty one.
      time: 23.2,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'scout', x: 1036, y: 158 },
            { type: 'scout', x: 1122, y: 286 },
            { type: 'scout', x: 1208, y: 414 },
            { type: 'drone', x: 1164, y: 116, options: { speed: 242 } },
          ],
        },
      ],
    },
    {
      // The close: one last resistance, then nothing else spawns. The run is
      // bounded from here - hold the lane and the exit beat is the rest.
      time: 25.5,
      actions: [
        { type: 'announce', text: 'FINAL WAVE // HOLD THE LANE', ttl: 2, kind: 'warning' },
        {
          type: 'spawnEnemies',
          enemies: [
            { type: 'drone', x: 1000, y: 176, options: { speed: 236 } },
            { type: 'drone', x: 1090, y: 352, options: { speed: 242 } },
          ],
        },
      ],
    },
    {
      // Route-record payoff: the lane closes on the destination it opened
      // with, still on screen so the clear does not arrive cold.
      time: 28.0,
      actions: [
        { type: 'announce', text: 'ROUTE RECORD // DESTINATION: SOLAR ALTAR', ttl: 2, kind: 'notice' },
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
