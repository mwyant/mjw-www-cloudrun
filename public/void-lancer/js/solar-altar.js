// Solar Altar Sortie: Altar Warden hull tuning and ember-core attack math.
//
// The scene draws whatever this module reports, so the telegraph ring on
// screen and the burst that leaves the core are the same read by construction:
// chargeRatio() is the flare, burstAngles() are the lanes the ring opens. No
// timing here spawns game objects or plays audio; the scene owns both.
//
// The pattern is the proposal from the Warden brief, kept deliberately small:
// a visible charge with no bullets, then one evenly spaced radial ring. Phase 2
// shortens the charge, widens the ring and opens it on the half-step, so the
// gaps the pilot learned in phase 1 are no longer where the lane is safe.
const VoidLancerSolarAltar = (() => {
  const DEFAULTS = Object.freeze({
    hp: 420,
    displaySize: 176,        // hull diameter on the 960x540 playfield.
    collisionRadius: 72,
    restSeconds: 1.9,        // quiet beat after a ring before the core charges.
    chargeSeconds: 1.35,     // the flare: nothing leaves the core in here.
    burstCount: 10,          // phase 1 ring.
    bulletSpeed: 205,        // ring travel in playfield px/s.
    startAngle: 0,           // ring opens evenly; only the phase 2 offset moves.
    phase2At: 0.5,           // hp ratio where the core overdrives.
    phase2RestSeconds: 1.35,
    phase2ChargeSeconds: 0.95,
    phase2BurstCount: 14,
  });

  function restSecondsFor(state) {
    return state.phase === 2 ? state.phase2RestSeconds : state.restSeconds;
  }

  function chargeSecondsFor(state) {
    return state.phase === 2 ? state.phase2ChargeSeconds : state.chargeSeconds;
  }

  function burstCountFor(state) {
    return state.phase === 2 ? state.phase2BurstCount : state.burstCount;
  }

  function createAttack(config = {}) {
    const settings = { ...DEFAULTS, ...config };
    return {
      restSeconds: settings.restSeconds,
      chargeSeconds: settings.chargeSeconds,
      burstCount: settings.burstCount,
      bulletSpeed: settings.bulletSpeed,
      startAngle: settings.startAngle,
      phase2At: settings.phase2At,
      phase2RestSeconds: settings.phase2RestSeconds,
      phase2ChargeSeconds: settings.phase2ChargeSeconds,
      phase2BurstCount: settings.phase2BurstCount,
      phase: 1,
      mode: 'rest',           // 'rest' -> 'charging' -> burst -> 'rest'
      timer: settings.restSeconds,
      charge: 0,
    };
  }

  function phaseForRatio(state, ratio) {
    return ratio < state.phase2At ? 2 : 1;
  }

  function setPhase(state, phase) {
    state.phase = phase === 2 ? 2 : 1;
  }

  // 0 while the core is quiet, rising to 1 across the charge. This one number
  // drives the core flare, the seam glow and the expanding telegraph ring, so
  // the tell cannot drift from the timing the burst uses.
  function chargeRatio(state) {
    if (!state || state.mode !== 'charging') return 0;
    const span = chargeSecondsFor(state) || 1;
    return Math.max(0, Math.min(1, state.charge / span));
  }

  // One evenly spaced ring. Phase 2 adds a bullet and shifts the whole ring by
  // half a step, which moves every gap at once.
  function burstAngles(state) {
    const count = burstCountFor(state);
    const offset = state.phase === 2 ? Math.PI / count : 0;
    const angles = [];
    for (let i = 0; i < count; i += 1) {
      angles.push(state.startAngle + offset + (Math.PI * 2 * i) / count);
    }
    return angles;
  }

  // One frame of the ember core. Returns only events the scene reacts to: the
  // single chargeStart (telegraph begins) and the burst that ends it. A burst
  // never fires on the frame the charge starts, and never before the flare has
  // run its full length.
  function updateAttack(state, dt) {
    const events = { chargeStart: false, burst: null };
    const step = Number.isFinite(dt) && dt > 0 ? dt : 0;

    if (state.mode === 'rest') {
      state.timer -= step;
      if (state.timer <= 0) {
        state.mode = 'charging';
        state.charge = 0;
        events.chargeStart = true;
      }
      return events;
    }

    state.charge += step;
    if (state.charge >= chargeSecondsFor(state)) {
      state.mode = 'rest';
      state.charge = 0;
      state.timer = restSecondsFor(state);
      events.burst = { angles: burstAngles(state), speed: state.bulletSpeed };
    }
    return events;
  }

  return Object.freeze({
    DEFAULTS,
    createAttack,
    phaseForRatio,
    setPhase,
    restSecondsFor,
    chargeSecondsFor,
    burstCountFor,
    chargeRatio,
    burstAngles,
    updateAttack,
  });
})();
