// Solar Altar Sortie (sortie 3) stage data: a bounded approach lane with the
// Altar Warden waiting at the end of it. Unlike the Graveyard there is no
// mission clock - the lane stops spawning after its last wave, the Warden is
// queued behind that, and clearing the run means breaking the Warden.
//
// Bounded means bounded even if the pilot kills nothing: every wave ships in
// units fast enough to leave the lane on their own, so the last one is gone by
// ~26.5s and the Warden cannot be held up by a hull still drifting down-lane.
// The queue at 25.0s fires as that final wave is leaving.
//
// The lane reads in four beats: objective (0.6s), the ember-core tell (6.0s)
// so the boss pattern is taught before the boss arrives, holding the approach
// (13.0s), then the Warden inbound (25.0s), with the final wave at 18.5s.
// Announcements are spaced so each one finishes before the next arrives (the
// queue ticks every banner's ttl together, so overlapping entries would cut
// each other off). The altar's rings and repair faces are scenery: there is no
// environmentTimeline here.
window.VoidLancerLevel3StageData = {
  waveTimeline: [
    {
      time: 0.6,
      actions: [
        // The objective lands before the first fight so the run has a stated
        // destination, not just a lane.
        { type: 'announce', text: 'OBJECTIVE // BREAK THE ALTAR WARDEN', ttl: 3, kind: 'notice' },
      ],
    },
    {
      time: 1.5,
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
      time: 5.0,
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
      // The tell, taught while the lane is still quiet: read the flare, then
      // commit. Same words the Warden's charge uses on screen.
      time: 6.0,
      actions: [
        { type: 'announce', text: 'EMBER CORE // EVERY BURST IS TELEGRAPHED', ttl: 3, kind: 'notice' },
      ],
    },
    {
      time: 9.5,
      actions: [
        {
          type: 'spawnEnemies',
          enemies: [
            // Default turret speed on purpose: it has to clear the lane by
            // itself before the Warden can arrive.
            { type: 'turret', x: 1150, y: 320, options: { phase: 2.2, fireCooldown: 1.1 } },
            { type: 'scout', x: 1010, y: 168 },
            { type: 'scout', x: 1090, y: 372 },
          ],
        },
      ],
    },
    {
      time: 13.0,
      actions: [
        { type: 'announce', text: 'ALTAR LINE // HOLD THE APPROACH', ttl: 2.6, kind: 'warning' },
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
      // The close: one last resistance, then nothing else spawns. The run is
      // bounded from here - the Warden is the rest of it.
      time: 18.5,
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
      // The Warden only arrives once the lane is clear of that last wave, so
      // the approach and the boss never overlap.
      time: 25.0,
      actions: [
        {
          type: 'queueBossArrival',
          announcement: 'WARDEN INBOUND // BREAK THE CORE',
          ttl: 2.4,
          kind: 'warning',
        },
      ],
    },
  ],
  backdropCues: [
    {
      time: 5.5,
      modules: [
        { kind: 'deadPlatformSilhouette', x: 1160, y: 104, speed: 6, scale: 1.5, alpha: 0.2, wobbleAmount: 0.35, wobbleSpeed: 0.26, recycleGap: 320 },
        { kind: 'lightShaft', x: 1460, y: 58, speed: 6, scale: 1.0, alpha: 0.3, beamWidth: 20, beamHeight: 300, color: 16766554, wobbleAmount: 0.5, wobbleSpeed: 0.4, recycleGap: 190 },
      ],
    },
    {
      time: 16.0,
      modules: [
        { kind: 'machineryPass', x: 1520, y: 430, speed: 5, scale: 0.9, alpha: 0.18, wobbleAmount: 0.6, wobbleSpeed: 0.4, recycleGap: 260 },
        { kind: 'lightShaft', x: 1780, y: 448, speed: 6, scale: 0.9, alpha: 0.22, beamWidth: 16, beamHeight: 280, color: 16766554, wobbleAmount: 0.4, wobbleSpeed: 0.36, recycleGap: 200 },
      ],
    },
  ],
  environmentTimeline: [],
};
