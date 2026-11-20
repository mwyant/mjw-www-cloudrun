const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');

const js = join(__dirname, '../public/void-lancer/js');

function runtime() {
  class Target extends EventTarget {
    send(type, props) {
      const event = Object.assign(new Event(type, { cancelable: true }), props);
      this.dispatchEvent(event);
      return event.defaultPrevented;
    }
  }
  const window = new Target();
  const document = Object.assign(new Target(), {
    hidden: false,
    getElementById: () => new Target(),
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
  scene.startGame = () => { starts++; scene.state.mode = 'playing'; };
  scene.showOverlay = () => {};
  scene.setupInput();
  const key = (type, code, props) => document.send(type, { code, ...props });
  return {
    window, document, scene, api: window.voidLancerControls,
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
