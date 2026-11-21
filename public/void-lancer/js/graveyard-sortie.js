// Graveyard Sortie: salvager worklight detection math and alarm state.
//
// The scene draws whatever this module reports, so the cone on screen and the
// contact test are the same shape by construction. Nothing here creates game
// objects or plays audio; the scene owns both.
const VoidLancerGraveyard = (() => {
  // Lamp geometry in radians/px, matched by the drawn beam.
  const DEFAULTS = Object.freeze({
    baseAngle: Math.PI,     // the workboat lights down-lane (left).
    sweepAmplitude: 0.5,    // radians either side of the base angle.
    sweepSpeed: 0.85,       // rad/s, a slow readable sweep.
    halfWidth: 0.16,        // half cone angle.
    range: 420,             // cone length in playfield px.
    graceSeconds: 0.8,      // grace beat the lock is held before escalation.
    alarmSeconds: 1.6,      // continuous contact before the alarm latches.
  });

  const SIREN_RISE = 1.9;

  // Safe preview shortcut: ?sortie=2 opens the Graveyard briefing and
  // ?sortie=3 the Solar Altar. Anything else, including a malformed query,
  // stays on the First Sortie.
  function readSortieIndex(search) {
    if (typeof search !== 'string' || search === '') return 1;
    try {
      const flag = new URLSearchParams(search).get('sortie');
      if (flag == null) return 1;
      const value = String(flag).trim().toLowerCase();
      if (value === '3' || value === 'altar' || value === 'solar' || value === 'solar-altar') return 3;
      return value === '2' || value === 'graveyard' ? 2 : 1;
    } catch (error) {
      return 1;
    }
  }

  function createDetection(config = {}) {
    const settings = { ...DEFAULTS, ...config };
    return {
      baseAngle: settings.baseAngle,
      sweepAmplitude: settings.sweepAmplitude,
      sweepSpeed: settings.sweepSpeed,
      halfWidth: settings.halfWidth,
      range: settings.range,
      graceSeconds: settings.graceSeconds,
      alarmSeconds: settings.alarmSeconds,
      originX: 0,
      originY: 0,
      angle: settings.baseAngle,
      sweepPhase: 0,
      holding: false,
      holdAngle: settings.baseAngle,
      contact: false,
      contactSeconds: 0,
      graceExpired: false,
      alarm: false,
    };
  }

  function beamGeometry(state) {
    return {
      originX: state.originX,
      originY: state.originY,
      angle: state.angle,
      halfWidth: state.halfWidth,
      range: state.range,
      holding: state.holding,
      contact: state.contact,
      graceExpired: state.graceExpired,
      alarm: state.alarm,
      contactSeconds: state.contactSeconds,
      graceSeconds: state.graceSeconds,
      alarmSeconds: state.alarmSeconds,
    };
  }

  // Distance from the lamp out to the drawn far edge. The triangle's corners
  // sit at exactly `range`, so the straight cut is at range * cos(halfWidth).
  function beamReach(state) {
    return Math.cos(state.halfWidth) * state.range;
  }

  // The cone in the beam's own space: apex at the lamp, opening along +x, with
  // a straight far edge at beamReach(). The scene draws exactly this triangle,
  // so the sight line and the contact test are one shape.
  function beamLocalTriangle(state) {
    const reach = beamReach(state);
    const spread = Math.sin(state.halfWidth) * state.range;
    return [
      { x: 0, y: 0 },
      { x: reach, y: spread },
      { x: reach, y: -spread },
    ];
  }

  // Contact test in the beam's frame: in front of the lamp, short of the
  // straight far edge, and inside the straight sides. A circular sector would
  // claim the corner wedges the drawn triangle does not cover.
  function inBeam(state, x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
    const dx = x - state.originX;
    const dy = y - state.originY;
    const cos = Math.cos(state.angle);
    const sin = Math.sin(state.angle);
    const forward = dx * cos + dy * sin;
    if (forward < 0 || forward > beamReach(state)) return false;
    const lateral = -dx * sin + dy * cos;
    return Math.abs(lateral) <= forward * Math.tan(state.halfWidth);
  }

  // One frame of the worklight read. Returns only events the scene reacts to:
  // contactStart (beam locks), contactEnd (everything resets) and the single
  // latched alarm. The alarm never spawns anything by itself.
  function updateDetection(state, dt, target) {
    const events = { contactStart: false, contactEnd: false, alarm: false };
    const step = Number.isFinite(dt) && dt > 0 ? dt : 0;

    state.sweepPhase += step * state.sweepSpeed;
    const sweepAngle = state.baseAngle + Math.sin(state.sweepPhase) * state.sweepAmplitude;
    if (!state.holding) state.angle = sweepAngle;

    const contact = inBeam(state, target?.x, target?.y);

    if (contact && !state.contact) {
      state.contact = true;
      state.contactSeconds = 0;
      state.graceExpired = false;
      state.holding = true;
      state.holdAngle = Math.atan2(target.y - state.originY, target.x - state.originX);
      state.angle = state.holdAngle; // lock: the cone stops sweeping.
      events.contactStart = true;
    } else if (!contact && state.contact) {
      state.contact = false;
      state.contactSeconds = 0;
      state.graceExpired = false;
      state.holding = false;
      state.angle = sweepAngle;
      events.contactEnd = true;
    }

    if (contact) {
      state.contactSeconds += step;
      if (!state.graceExpired && state.contactSeconds >= state.graceSeconds) {
        state.graceExpired = true;
      }
      if (!state.alarm && state.contactSeconds >= state.alarmSeconds) {
        state.alarm = true;
        events.alarm = true;
      }
    }

    return events;
  }

  // The siren is the existing bossWarning preset with its frequencies swept
  // upward: same layer types, gains and filters, no new audio asset.
  function sirenPreset(base) {
    const source = base && Array.isArray(base.layers) && base.layers.length
      ? base.layers
      : [{ type: 'sine', startFrequency: 220, gain: 0.2 }];
    const layers = source.map((layer, index) => {
      const startFrequency = Math.max(20, (layer.startFrequency || 220) * (index === 0 ? 1.4 : 1.15));
      return { ...layer, startFrequency, endFrequency: startFrequency * SIREN_RISE };
    });
    return {
      ...base,
      layers,
      duration: base?.duration ?? 0.6,
      attack: base?.attack ?? 0.02,
      release: base?.release ?? 0.2,
      volume: base?.volume ?? 0.2,
    };
  }

  return Object.freeze({
    DEFAULTS,
    readSortieIndex,
    createDetection,
    beamGeometry,
    beamReach,
    beamLocalTriangle,
    inBeam,
    updateDetection,
    sirenPreset,
  });
})();
