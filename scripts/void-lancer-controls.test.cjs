const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');

const js = join(__dirname, '../public/void-lancer/js');

function runtime() {
  class Target extends EventTarget {
    captured = new Set();
    attributes = new Map();
    dataset = {};

    send(type, props) {
      const event = Object.assign(new Event(type, { cancelable: true }), props);
      this.dispatchEvent(event);
      return event.defaultPrevented;
    }

    setPointerCapture(id) { this.captured.add(id); }
    hasPointerCapture(id) { return this.captured.has(id); }
    releasePointerCapture(id) { this.captured.delete(id); }
    getBoundingClientRect() { return { left: 0, right: 100, top: 0, bottom: 100, width: 100, height: 100 }; }
    setAttribute(name, value) { this.attributes.set(name, value); }
    removeAttribute(name) { this.attributes.delete(name); }
    toggleAttribute(name, force) { force ? this.setAttribute(name, '') : this.removeAttribute(name); }
  }
  const playfield = new Target();
  const [pad, fire, start] = [new Target(), new Target(), new Target()];
  const elements = { '#touchPad': pad, '#touchFire': fire, '#touchStart': start };
  playfield.querySelector = (selector) => elements[selector];
  const window = new Target();
  const document = Object.assign(new Target(), {
    hidden: false,
    getElementById: (id) => id === 'playfield' ? playfield : new Target(),
  });
  let Scene;
  const vm = {
    window, document,
    Phaser: {
      Scene: class {},
      Game: class { constructor(config) { [Scene] = config.scene; } },
      Scale: {},
    },
  };
  for (const file of ['controls.js', 'main.js']) {
    const filename = join(js, file);
    runInNewContext(readFileSync(filename, 'utf8'), vm, { filename });
  }
  const scene = new Scene();
  scene.events = new EventEmitter();
  scene.state = { mode: 'intro', score: 0 };
  let starts = 0;
  scene.startGame = () => {
    scene.actionState.clear();
    starts++;
    scene.state.mode = 'playing';
    scene.touchControls.setOverlay(null);
  };
  scene.showOverlay = (_title, _summary, _detail, label) => scene.touchControls.setOverlay(label);
  scene.setupInput();
  scene.showIntro();
  const key = (type, code, props) => document.send(type, { code, ...props });
  return {
    window, document, scene, api: window.voidLancerControls, playfield, pad, fire, start,
    pointer: (target, type, pointerId, clientX = 50, clientY = 50) =>
      target.send(type, { pointerId, clientX, clientY, button: 0, pointerType: 'touch' }),
    starts: () => starts,
    down: (code, props) => key('keydown', code, props),
    up: (code, props) => key('keyup', code, props),
    held: (action) => scene.actionState.isHeld(action),
  };
}

test('defaults use physical codes, and alternative movement keys release independently', () => {
  const r = runtime();
  assert.equal(r.down('KeyW'), false, 'movement is not an overlay action');
  assert.equal(r.down('KeyJ', { key: 'x' }), true);
  assert.equal(r.starts(), 1);
  assert.equal(r.held('fire'), false, 'overlay edge is not held fire');
  r.up('KeyJ');

  for (const [action, codes] of Object.entries(r.api.getSnapshot())) {
    if (!action.startsWith('move')) continue;
    const [letter, arrow] = codes;
    assert.equal(r.down(letter, { key: 'x' }), true);
    assert.equal(r.down(arrow), true);
    assert.equal(r.held(action), true);
    r.up(letter);
    assert.equal(r.held(action), true);
    r.up(arrow);
    assert.equal(r.held(action), false);
  }
  assert.equal(r.down('KeyQ', { key: 'w' }), false);
  for (const code of ['Space', 'KeyJ', 'KeyK']) {
    assert.equal(r.down(code), true);
    assert.equal(r.held('fire'), true);
    r.up(code);
    assert.equal(r.held('fire'), false);
  }
});

test('held fire and repeated keydown do not restart at either end overlay', () => {
  const r = runtime();
  for (const victory of [false, true]) {
    const before = r.starts();
    r.scene.actionState.requestStart(); // same semantic pulse as the canvas button
    r.down('Space');
    assert.equal(r.held('fire'), true);
    r.scene.finishGame(victory);
    assert.equal(r.held('fire'), false);
    r.down('Space', { repeat: true });
    r.down('Space'); // a duplicate down without release still is not a fresh press
    assert.equal(r.starts(), before + 1);
    r.up('Space');
    r.down('Space');
    assert.equal(r.starts(), before + 2);
    assert.equal(r.held('fire'), false);
    r.up('Space');
    r.scene.finishGame(victory);
  }
});

test('replacement validates atomically, allows cross-context sharing and copies the snapshot', () => {
  const r = runtime();
  const { api } = r;
  const original = api.getSnapshot();
  r.scene.actionState.requestStart();
  r.down('KeyW');
  for (const next of [
    null, {}, { ...original, jump: [] }, { ...original, fire: 'Space' },
    { ...original, fire: ['Space', 'Space'] }, { ...original, fire: ['KeyW'] },
    { ...original, fire: ['KeyF'] }, { ...original, fire: ['F5'] },
    { ...original, start: ['Tab'] }, { ...original, start: ['Escape'] },
    { ...original, fire: ['w'] }, { ...original, fire: Array(1) },
  ]) {
    const result = api.replace(next);
    assert.equal(result.valid, false);
    assert.ok(result.error);
    assert.equal(api.getSnapshot(), original);
    assert.equal(r.held('moveUp'), true);
  }

  const next = { ...original, moveUp: [], fire: ['KeyW'], start: ['KeyW'] };
  assert.equal(api.replace(next).valid, true);
  next.fire.push('KeyB');
  const snapshot = api.getSnapshot();
  assert.deepEqual([...snapshot.fire], ['KeyW']);
  assert.ok(Object.isFrozen(snapshot) && Object.isFrozen(snapshot.fire));
  assert.equal(r.held('moveUp'), false);
  r.down('KeyW', { repeat: true });
  assert.equal(r.held('fire'), false);
  r.up('KeyW');
  r.down('KeyW');
  assert.equal(r.held('fire'), true);
  r.scene.finishGame(false);
  r.down('KeyW', { repeat: true });
  assert.equal(r.starts(), 1);
  r.up('KeyW');
  assert.equal(r.down('Space'), false);
  assert.equal(r.down('KeyW'), true);
  assert.equal(r.starts(), 2);
  r.down('KeyW', { repeat: true });
  api.reset();
  assert.equal(api.getSnapshot(), original);
  r.down('KeyW', { repeat: true });
  assert.equal(r.held('moveUp'), false);
  r.up('KeyW');
  r.down('KeyW');
  assert.equal(r.held('moveUp'), true);
});

test('shortcuts and interactive targets stay native, and keyup still releases over a control', () => {
  const r = runtime();
  const buttonPath = () => [{}, { matches: (selector) => selector.includes('button') }];
  for (const props of [
    { altKey: true }, { ctrlKey: true }, { metaKey: true }, { shiftKey: true },
    { isComposing: true }, { composedPath: buttonPath },
    { composedPath: () => [{ isContentEditable: true }] },
  ]) {
    assert.equal(r.down('Space', props), false);
  }
  r.document.designMode = 'on';
  assert.equal(r.down('Space'), false);
  r.document.designMode = 'off';
  assert.equal(r.starts(), 0);
  r.scene.actionState.requestStart();
  r.down('KeyD');
  assert.equal(r.up('KeyD', { composedPath: buttonPath }), false);
  assert.equal(r.held('moveRight'), false);
  r.down('Space');
  r.document.send('focusin', { composedPath: buttonPath });
  assert.equal(r.held('fire'), false);
});

test('blur, hidden and teardown neutralize action state without reviving repeats', () => {
  const r = runtime();
  r.scene.actionState.requestStart();
  r.down('KeyK');
  r.window.send('blur');
  assert.equal(r.held('fire'), false);
  r.down('KeyK', { repeat: true });
  assert.equal(r.held('fire'), false);
  r.down('KeyK'); // Recover even if keyup occurred while unfocused.
  assert.equal(r.held('fire'), true);
  r.document.hidden = true;
  r.document.send('visibilitychange');
  assert.equal(r.held('fire'), false);
  assert.equal(r.down('KeyK'), false);
  r.document.hidden = false;
  r.down('KeyK', { repeat: true });
  assert.equal(r.held('fire'), false);
  r.down('KeyK');
  assert.equal(r.held('fire'), true);
  r.scene.events.emit('shutdown');
  assert.equal(r.held('fire'), false);
  assert.equal(r.down('KeyK'), false);
  assert.equal(r.window.voidLancerControls, undefined);
  assert.equal(r.api.replace(r.api.getSnapshot()).valid, false);
  r.scene.setupInput();
  r.down('KeyK');
  assert.equal(r.held('fire'), true);
  r.scene.events.emit('destroy');
  assert.equal(r.held('fire'), false);
  assert.equal(r.down('KeyK'), false);
});

test('the action state accepts independent sources without knowing their device', () => {
  const { scene, held } = runtime();
  const state = scene.actionState;
  const first = Symbol();
  const second = Symbol();
  state.setHeld('fire', first, true);
  state.setHeld('fire', second, true);
  state.setHeld('fire', first, false);
  assert.equal(held('fire'), true);
  state.clear();
  assert.equal(held('fire'), false);
});

test('pad diagonals, sliding and hold-to-fire compose across pointers and keyboard sources', () => {
  const r = runtime();
  const { pointer, pad, fire, held } = r;
  r.down('Space');
  r.up('Space');
  assert.equal(pointer(pad, 'pointerdown', 1, 95, 5), true);
  assert.equal(pointer(fire, 'pointerdown', 2), true);
  assert.ok(held('moveUp') && held('moveRight') && held('fire'));
  assert.ok(pad.hasPointerCapture(1) && fire.hasPointerCapture(2));
  r.down('ArrowRight');
  pointer(pad, 'pointermove', 1, -10, 150);
  assert.equal(held('moveUp'), false);
  assert.ok(held('moveDown') && held('moveLeft') && held('moveRight') && held('fire'));
  pointer(pad, 'pointermove', 1);
  assert.equal(held('moveDown'), false);
  assert.equal(held('moveLeft'), false);
  r.up('ArrowRight');
  assert.equal(held('moveRight'), false);
  pointer(fire, 'pointerdown', 3);
  pointer(fire, 'pointerup', 2);
  assert.equal(held('fire'), true);
  pointer(fire, 'lostpointercapture', 3);
  assert.equal(held('fire'), false);
  pointer(pad, 'pointermove', 1, 5, 5);
  pointer(pad, 'pointercancel', 1);
  assert.equal(held('moveUp'), false);
  assert.equal(pad.hasPointerCapture(1), false);
});

test('blur, hidden, successful remap, reset and teardown clear captured pointers without replay', () => {
  const r = runtime();
  const { pointer, pad, fire, held, api, scene } = r;
  r.down('Space');
  r.up('Space');
  for (const clear of [
    () => r.window.send('blur'),
    () => { r.document.hidden = true; r.document.send('visibilitychange'); r.document.hidden = false; },
    () => assert.equal(api.replace(api.getSnapshot()).valid, true),
    () => api.reset(),
    () => scene.events.emit('shutdown'),
  ]) {
    pointer(pad, 'pointerdown', 1, 95, 5);
    pointer(fire, 'pointerdown', 2);
    assert.equal(api.replace({}).valid, false);
    assert.ok(held('moveUp') && held('fire'));
    clear();
    assert.equal(held('moveUp'), false);
    assert.equal(held('fire'), false);
    assert.equal(pad.hasPointerCapture(1) || fire.hasPointerCapture(2), false);
    pointer(pad, 'pointermove', 1, 95, 5);
    pointer(fire, 'pointerup', 2);
    assert.equal(held('moveUp') || held('fire'), false);
  }
  assert.equal(r.playfield.attributes.has('data-touch-ready'), false);
  assert.equal(pointer(fire, 'pointerdown', 4), false);
});

test('Start/Restart require fresh activation and never replay a held fire or pad pointer', () => {
  const r = runtime();
  const { pointer, pad, fire, start, held, scene } = r;
  assert.equal(start.textContent, 'Start Sortie');
  assert.equal(fire.hidden, true);
  pointer(start, 'pointerdown', 1);
  pointer(start, 'pointerup', 1, 200, 50);
  assert.equal(r.starts(), 0, 'releasing outside the button does not start');
  pointer(start, 'pointerdown', 2);
  r.window.send('blur');
  pointer(start, 'pointerup', 2);
  start.send('click', { detail: 1 });
  assert.equal(r.starts(), 0, 'a canceled press does not start on release or click');
  pointer(start, 'pointerdown', 3);
  pointer(start, 'pointerup', 3);
  assert.equal(r.starts(), 1);
  assert.equal(start.hidden, true);
  assert.equal(fire.hidden, false);
  pointer(pad, 'pointerdown', 4, 10, 50);
  pointer(fire, 'pointerdown', 5);
  assert.ok(held('moveLeft') && held('fire'));
  scene.finishGame(false);
  assert.equal(start.textContent, 'Restart Mission');
  assert.equal(held('moveLeft') || held('fire'), false);
  pointer(fire, 'pointerup', 5);
  assert.equal(r.starts(), 1);
  start.send('click', { detail: 0 }); // keyboard or assistive technology
  assert.equal(r.starts(), 2);
  pointer(pad, 'pointermove', 4, 10, 50);
  assert.equal(held('moveLeft') || held('fire'), false);
});
