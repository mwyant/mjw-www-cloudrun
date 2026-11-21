// Graveyard Sortie (sortie 2) stage data: a short lane with an on-station
// Imperial patrol, one tagged turret the worklight alarm can wake, and no
// boss. missionDuration is the clear time; the lane is meant to be crossed,
// not farmed.
//
// The lane reads in four beats: objective (0.6s), who owns the worklight
// (5.5s), the amber markers the route record follows (12.0s), then a bounded
// exit beat - the last wave at 25.5s, nothing spawns after it, and the route
// record names the next stop while the run is still live. Announcements are
// spaced so each one finishes before the next arrives (the queue ticks every
// banner's ttl together, so overlapping entries would cut each other off).
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
      // Independent mercenary salvager, not the Imperial survivors: the light
      // is theirs, and the boat is scenery, never a target.
      time: 5.5,
      actions: [
        { type: 'announce', text: 'WORKLIGHT // MERCENARY SALVAGER', ttl: 3, kind: 'notice' },
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
        { type: 'announce', text: 'ROUTE RECORD // NEXT LEG: THE SOLAR ALTAR', ttl: 2, kind: 'notice' },
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
