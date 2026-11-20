const VoidLancerInput = (() => {
  const PLAY_ACTIONS = ['moveUp', 'moveDown', 'moveLeft', 'moveRight', 'fire'];
  const OVERLAY_ACTIONS = ['start'];
  const ACTIONS = [...PLAY_ACTIONS, ...OVERLAY_ACTIONS];
  const DEFAULT_MAPPING = freezeMapping({
    moveUp: ['KeyW', 'ArrowUp'],
    moveDown: ['KeyS', 'ArrowDown'],
    moveLeft: ['KeyA', 'ArrowLeft'],
    moveRight: ['KeyD', 'ArrowRight'],
    fire: ['Space', 'KeyJ', 'KeyK'],
    start: ['Space', 'KeyJ', 'KeyK'],
  });
  const BINDABLE_CODES = new Set([
    ...[...'ABCDEGHIJKLMNOPQRSTUVWXYZ'].map((letter) => `Key${letter}`),
    ...[...'0123456789'].map((digit) => `Digit${digit}`),
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Enter',
  ]);
  const INTERACTIVE = 'a[href], area[href], button, input, select, textarea, label, summary, iframe,'
    + ' audio[controls], video[controls], [tabindex],'
    + ' [role="button"], [role="link"], [role="textbox"], [role="combobox"], [role="slider"],'
    + ' [role="spinbutton"], [role="checkbox"], [role="radio"], [role="switch"], [role="tab"],'
    + ' [role="listbox"], [role="option"], [role="menuitem"], [role="menuitemcheckbox"],'
    + ' [role="menuitemradio"]';

  function freezeMapping(mapping) {
    return Object.freeze(Object.fromEntries(
      ACTIONS.map((action) => [action, Object.freeze([...mapping[action]])]),
    ));
  }

  function validateAndCopy(mapping) {
    if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)
      || Object.keys(mapping).some((action) => !ACTIONS.includes(action))) {
      return { error: 'Expected a mapping with only the six known actions.' };
    }
    const copy = {};
    // A physical key can belong to one play action AND one overlay action.
    for (const actions of [PLAY_ACTIONS, OVERLAY_ACTIONS]) {
      const used = new Set();
      for (const action of actions) {
        const codes = Object.hasOwn(mapping, action) ? mapping[action] : null;
        if (!Array.isArray(codes)) {
          return { error: `Expected an array of physical key codes for ${action}.` };
        }
        copy[action] = [];
        for (const code of codes) {
          if (!BINDABLE_CODES.has(code)) return { error: `Unsupported or reserved key code for ${action}.` };
          if (used.has(code)) return { error: `Duplicate or conflicting key code ${code} for ${action}.` };
          used.add(code);
          copy[action].push(code);
        }
      }
    }
    return { snapshot: freezeMapping(copy) };
  }

  function isInteractiveEvent(event, documentTarget) {
    return documentTarget.designMode === 'on' || event.composedPath().some((node) =>
      node.isContentEditable || node.matches?.(INTERACTIVE));
  }

  function hasModifiers(event) {
    return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
  }

  // Source IDs are independent, so releasing one binding never drops another.
  function createActionState(onStart) {
    const held = new Map(PLAY_ACTIONS.map((action) => [action, new Set()]));
    const clearListeners = new Set();
    return {
      isHeld: (action) => (held.get(action)?.size ?? 0) > 0,
      setHeld(action, source, down) {
        if (down) held.get(action)?.add(source);
        else held.get(action)?.delete(source);
      },
      requestStart: onStart,
      onClear(listener) {
        clearListeners.add(listener);
        return () => clearListeners.delete(listener);
      },
      clear() {
        for (const sources of held.values()) sources.clear();
        for (const listener of clearListeners) listener();
      },
    };
  }

  function attachKeyboard(windowTarget, documentTarget, actions, getContext) {
    let mapping = DEFAULT_MAPPING;
    let attached = true;
    const pressed = new Map();

    function clearKeyboard() {
      for (const { action, source } of pressed.values()) actions.setHeld(action, source, false);
      pressed.clear();
    }

    function clear() {
      clearKeyboard();
      actions.clear();
    }

    function onKeyDown(event) {
      if (hasModifiers(event) || event.isComposing) {
        clearKeyboard();
        return;
      }
      if (event.defaultPrevented || documentTarget.hidden || isInteractiveEvent(event, documentTarget)) return;

      const context = getContext();
      const candidates = context === 'play' ? PLAY_ACTIONS : context === 'overlay' ? OVERLAY_ACTIONS : [];
      const action = candidates.find((candidate) => mapping[candidate].includes(event.code));
      if (!action) return;
      event.preventDefault();
      // A new context or mapping must not turn a physically held key into a start edge.
      if (event.repeat || pressed.has(event.code)) return;

      const source = Symbol(event.code);
      pressed.set(event.code, { action, source });
      if (action === 'start') actions.requestStart();
      else actions.setHeld(action, source, true);
    }

    function onKeyUp(event) {
      const binding = pressed.get(event.code);
      if (!binding) return;
      actions.setHeld(binding.action, binding.source, false);
      pressed.delete(event.code);
    }

    function onFocusIn(event) {
      if (isInteractiveEvent(event, documentTarget)) clearKeyboard();
    }

    function onVisibilityChange() {
      if (documentTarget.hidden) clear();
    }

    documentTarget.addEventListener('keydown', onKeyDown);
    // Release even if focus changed or a control handles/stops the event.
    documentTarget.addEventListener('keyup', onKeyUp, true);
    documentTarget.addEventListener('focusin', onFocusIn, true);
    documentTarget.addEventListener('visibilitychange', onVisibilityChange);
    windowTarget.addEventListener('blur', clear);

    return {
      mapping: Object.freeze({
        getSnapshot: () => mapping,
        replace(next) {
          if (!attached) return { valid: false, error: 'Controls are no longer attached.' };
          const { error, snapshot } = validateAndCopy(next);
          if (error) return { valid: false, error };
          mapping = snapshot;
          clear();
          return { valid: true };
        },
        reset() {
          if (!attached) return;
          mapping = DEFAULT_MAPPING;
          clear();
        },
      }),
      destroy() {
        if (!attached) return;
        attached = false;
        clear();
        documentTarget.removeEventListener('keydown', onKeyDown);
        documentTarget.removeEventListener('keyup', onKeyUp, true);
        documentTarget.removeEventListener('focusin', onFocusIn, true);
        documentTarget.removeEventListener('visibilitychange', onVisibilityChange);
        windowTarget.removeEventListener('blur', clear);
      },
    };
  }

  function attachTouch(playfield, actions, getContext) {
    const pad = playfield.querySelector('#touchPad');
    const fire = playfield.querySelector('#touchFire');
    const start = playfield.querySelector('#touchStart');
    const pointers = new Map();
    const controls = [pad, fire, start];

    function updateFeedback() {
      const held = new Set([...pointers.values()].flatMap((pointer) => pointer.held));
      pad.dataset.directions = [...held].join(' ');
      fire.toggleAttribute('data-firing', held.has('fire'));
    }

    function setHeld(pointer, next) {
      for (const action of pointer.held) {
        if (!next.includes(action)) actions.setHeld(action, pointer.source, false);
      }
      for (const action of next) {
        if (!pointer.held.includes(action)) actions.setHeld(action, pointer.source, true);
      }
      pointer.held = next;
      updateFeedback();
    }

    function aim(event, pointer) {
      const rect = pad.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const next = [];
      if (Math.hypot(x, y) >= 0.13) {
        const diagonal = Math.SQRT2 - 1; // tan(22.5°), the edge of each 45° sector
        if (Math.abs(x) > Math.abs(y) * diagonal) next.push(x < 0 ? 'moveLeft' : 'moveRight');
        if (Math.abs(y) > Math.abs(x) * diagonal) next.push(y < 0 ? 'moveUp' : 'moveDown');
      }
      setHeld(pointer, next);
    }

    function onDown(event) {
      const control = event.currentTarget;
      if (event.button !== 0 || pointers.has(event.pointerId)
        || getContext() !== (control === start ? 'overlay' : 'play')) return;
      event.preventDefault();
      control.setPointerCapture(event.pointerId);
      const pointer = { control, source: Symbol(), held: [] };
      pointers.set(event.pointerId, pointer);
      if (control === pad) aim(event, pointer);
      if (control === fire) setHeld(pointer, ['fire']);
    }

    function onMove(event) {
      const pointer = pointers.get(event.pointerId);
      if (pointer?.control === pad && event.currentTarget === pad && getContext() === 'play') aim(event, pointer);
    }

    function release(id) {
      const pointer = pointers.get(id);
      if (!pointer) return;
      pointers.delete(id);
      setHeld(pointer, []);
      if (pointer.control.hasPointerCapture(id)) pointer.control.releasePointerCapture(id);
    }

    function onEnd(event) {
      const pointer = pointers.get(event.pointerId);
      if (pointer?.control !== event.currentTarget) return;
      release(event.pointerId);
      if (pointer.control === start && event.type === 'pointerup' && getContext() === 'overlay') {
        const { left, right, top, bottom } = start.getBoundingClientRect();
        if (event.clientX >= left && event.clientX <= right && event.clientY >= top && event.clientY <= bottom) {
          actions.requestStart();
        }
      }
    }

    function onStartClick(event) {
      // Pointer activations require a tracked press; keep native keyboard/AT activation.
      if (event.detail === 0 && getContext() === 'overlay') actions.requestStart();
    }

    const unsubscribe = actions.onClear(() => {
      for (const id of pointers.keys()) release(id);
    });
    const listeners = [
      ['pointerdown', onDown], ['pointermove', onMove], ['pointerup', onEnd],
      ['pointercancel', onEnd], ['lostpointercapture', onEnd],
    ];
    for (const control of controls) {
      for (const [type, listener] of listeners) control.addEventListener(type, listener);
    }
    start.addEventListener('click', onStartClick);
    playfield.setAttribute('data-touch-ready', '');

    return {
      setOverlay(label) {
        start.hidden = !label;
        fire.hidden = Boolean(label);
        if (label) start.textContent = label;
        pad.setAttribute('aria-disabled', String(Boolean(label)));
      },
      destroy() {
        unsubscribe();
        for (const id of pointers.keys()) release(id);
        for (const control of controls) {
          for (const [type, listener] of listeners) control.removeEventListener(type, listener);
        }
        start.removeEventListener('click', onStartClick);
        playfield.removeAttribute('data-touch-ready');
      },
    };
  }

  return { createActionState, attachKeyboard, attachTouch, isInteractiveEvent, hasModifiers };
})();
