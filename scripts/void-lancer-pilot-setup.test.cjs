const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');

const setupPath = join(__dirname, '../public/void-lancer/js/pilot-setup.js');
const htmlPath = join(__dirname, '../public/void-lancer/index.html');
const source = readFileSync(setupPath, 'utf8');
const html = readFileSync(htmlPath, 'utf8');

function loadSetup() {
  const window = {};
  // No document in the sandbox: the module must light up only when the page
  // markup is actually present.
  runInNewContext(source, { window }, { filename: setupPath });
  return window.voidLancerPilotSetup;
}

const setup = loadSetup();

// The module is evaluated in a fresh VM realm, so its arrays and objects carry
// that realm's prototypes and never deepStrictEqual against host literals.
// Clone the catalog into host values first: the assertions stay byte-for-byte
// the same concrete checks, they just compare within one realm.
const catalog = structuredClone(setup.RANK_CATALOG);

function detailsBlock() {
  const match = html.match(/<details[^>]*id="pilotSetup"[\s\S]*?<\/details>/);
  assert.ok(match, 'index.html must keep the pilot setup disclosure');
  return match[0];
}

function rankSelectMarkup(block) {
  const match = block.match(/<select[^>]*id="pilotRank"[\s\S]*?<\/select>/);
  assert.ok(match, 'the pilot setup must use one rank select');
  return match[0];
}

function parseGroups(markup) {
  const groups = [];
  const groupPattern = /<optgroup label="([^"]*)">([\s\S]*?)<\/optgroup>/g;
  const optionPattern = /<option value="([^"]*)">([^<]*)<\/option>/g;
  for (const group of markup.matchAll(groupPattern)) {
    const options = [...group[2].matchAll(optionPattern)].map((option) => ({
      id: option[1],
      label: option[2],
    }));
    groups.push({ label: group[1], options });
  }
  return groups;
}

function fakeDocument() {
  class FakeElement {
    constructor(id) {
      this.id = id;
      this.value = '';
      this.textContent = '';
      this.htmlWrites = 0;
      this.listeners = new Map();
    }

    addEventListener(type, listener) {
      const list = this.listeners.get(type) || [];
      list.push(listener);
      this.listeners.set(type, list);
    }

    dispatch(type) {
      for (const listener of this.listeners.get(type) || []) listener({ type, target: this });
    }

    set innerHTML(value) {
      this.htmlWrites++;
      this._innerHTML = value;
    }

    get innerHTML() {
      return this._innerHTML || '';
    }
  }

  const ids = ['pilotSetup', 'pilotRank', 'pilotSurname', 'pilotAddress'];
  const elements = Object.fromEntries(ids.map((id) => [id, new FakeElement(id)]));
  return { elements, getElementById: (id) => elements[id] || null };
}

test('the catalog is the two commissioned-officer branches, in rank order', () => {
  assert.ok(Array.isArray(setup.RANK_CATALOG), 'the module still ships the catalog as an array');
  assert.deepEqual(catalog.map((branch) => branch.id), ['navy', 'space-force']);
  const [navy, spaceForce] = catalog;
  assert.equal(navy.label, 'US Navy');
  assert.deepEqual(navy.ranks.map((rank) => rank.label), [
    'Ensign',
    'Lieutenant Junior Grade',
    'Lieutenant',
    'Lieutenant Commander',
    'Commander',
    'Captain',
  ]);
  assert.equal(spaceForce.label, 'US Space Force');
  assert.deepEqual(spaceForce.ranks.map((rank) => rank.label), [
    'Second Lieutenant',
    'First Lieutenant',
    'Captain',
    'Major',
    'Lieutenant Colonel',
    'Colonel',
  ]);
});

test('the page markup mirrors the catalog branch groups and option ids', () => {
  const markup = rankSelectMarkup(detailsBlock());
  assert.deepEqual(
    parseGroups(markup),
    catalog.map((branch) => ({
      label: branch.label,
      options: branch.ranks.map((rank) => ({ id: rank.id, label: rank.label })),
    })),
  );
  const placeholder = markup.match(/<option value="([^"]*)">/);
  assert.ok(placeholder, 'the select keeps an unselected default');
  assert.equal(placeholder[1], '', 'no rank is chosen on load');
  assert.ok(markup.startsWith('<select'), 'the placeholder option precedes the groups');
});

test('both Captain titles stay selectable as distinct branch options', () => {
  const ranks = catalog.flatMap((branch) =>
    branch.ranks.map((rank) => ({ ...rank, branch: branch.id })));
  const captains = ranks.filter((rank) => rank.label === 'Captain');
  assert.deepEqual(captains.map((captain) => captain.id).sort(), [
    'navy-captain',
    'space-force-captain',
  ]);
  const ids = ranks.map((rank) => rank.id);
  assert.equal(new Set(ids).size, ids.length, 'option ids must be unique across branches');
  for (const rank of ranks) {
    assert.ok(rank.id.startsWith(`${rank.branch}-`), `${rank.id} must be branch-scoped`);
  }
  assert.equal(setup.formatAddress('navy-captain', 'Smith'), 'Cleared for launch, Captain Smith.');
  assert.equal(
    setup.formatAddress('space-force-captain', 'Smith'),
    'Cleared for launch, Captain Smith.',
  );
  assert.equal(
    setup.formatAddress('space-force-colonel', 'Smith'),
    'Cleared for launch, Colonel Smith.',
  );
});

test('address formatting trims input and keeps real names intact', () => {
  assert.equal(setup.formatAddress('navy-commander', "O'Neill"), "Cleared for launch, Commander O'Neill.");
  assert.equal(
    setup.formatAddress('space-force-lieutenant-colonel', '  van der Berg  '),
    'Cleared for launch, Lieutenant Colonel van der Berg.',
  );
  assert.equal(
    setup.formatAddress('navy-lieutenant-junior-grade', 'Zoë-Marie'),
    'Cleared for launch, Lieutenant Junior Grade Zoë-Marie.',
  );
  assert.equal(setup.normalizeSurname('\t  José  Núñez \n'), 'José Núñez');
  const boundary = 'a'.repeat(setup.MAX_SURNAME_LENGTH);
  assert.equal(setup.formatAddress('navy-ensign', boundary), `Cleared for launch, Ensign ${boundary}.`);
});

test('partial or unusable input never produces a personalized address', () => {
  assert.equal(setup.formatAddress('navy-ensign', ''), null);
  assert.equal(setup.formatAddress('navy-ensign', '    '), null);
  assert.equal(setup.formatAddress('', 'Smith'), null);
  assert.equal(setup.formatAddress(undefined, 'Smith'), null);
  assert.equal(setup.formatAddress('army-captain', 'Smith'), null, 'only the two offered branches resolve');
  assert.equal(
    setup.formatAddress('navy-ensign', 'a'.repeat(setup.MAX_SURNAME_LENGTH + 1)),
    null,
    'over-long input stays generic',
  );
});

test('the setup box updates the greeting as text and keeps it generic when incomplete', () => {
  const doc = fakeDocument();
  assert.ok(setup.init(doc), 'the page controls must be found');
  const { pilotRank, pilotSurname, pilotAddress } = doc.elements;
  assert.equal(pilotAddress.textContent, setup.GENERIC_ADDRESS);

  pilotSurname.value = 'Smith';
  pilotSurname.dispatch('input');
  assert.equal(pilotAddress.textContent, setup.GENERIC_ADDRESS, 'a surname alone stays generic');

  pilotRank.value = 'navy-captain';
  pilotSurname.value = '';
  pilotRank.dispatch('change');
  assert.equal(pilotAddress.textContent, setup.GENERIC_ADDRESS, 'a rank alone stays generic');

  pilotSurname.value = '  Smith  ';
  pilotSurname.dispatch('input');
  assert.equal(pilotAddress.textContent, 'Cleared for launch, Captain Smith.');

  pilotRank.value = '';
  pilotRank.dispatch('change');
  assert.equal(pilotAddress.textContent, setup.GENERIC_ADDRESS, 'clearing a field returns to generic');

  assert.equal(pilotAddress.htmlWrites, 0, 'the greeting is text, never markup');
  assert.equal(setup.init({ getElementById: () => null }), null, 'missing markup is a no-op');
});

test('the setup markup needs nothing to start and never prefills a name', () => {
  const block = detailsBlock();
  assert.ok(!/<form/i.test(block), 'no form, so Enter cannot navigate');
  assert.ok(!/\baction=/i.test(block));
  assert.ok(!/\brequired\b/i.test(block), 'nothing is required to launch');
  const input = block.match(/<input[^>]*id="pilotSurname"[\s\S]*?>/);
  assert.ok(input, 'the surname field is free text');
  assert.ok(!/\bvalue=/i.test(input[0]), 'the surname starts empty');
  const limit = input[0].match(/maxlength="(\d+)"/);
  assert.ok(limit, 'the surname field is length-bounded');
  assert.equal(Number(limit[1]), setup.MAX_SURNAME_LENGTH);
  assert.ok(
    block.indexOf('<span class="pilot-field-label">Surname</span>') < block.indexOf('id="pilotSurname"'),
    'the surname field carries a visible label',
  );
  assert.ok(
    block.indexOf('<span class="pilot-field-label">Rank</span>') < block.indexOf('id="pilotRank"'),
    'the rank field carries a visible label',
  );
  const address = block.match(/<p[^>]*id="pilotAddress"[^>]*>([^<]*)</);
  assert.ok(address, 'the greeting line ships a generic default');
  assert.equal(address[1].trim(), setup.GENERIC_ADDRESS);
});

test('the disclosure sits collapsed between the playfield and the footer', () => {
  const block = detailsBlock();
  assert.ok(!/<details[^>]*\bopen\b/.test(block), 'collapsed until asked for');
  assert.ok(html.indexOf('id="pilotSetup"') > html.indexOf('id="playfield"'), 'after the playfield');
  assert.ok(
    html.indexOf('id="pilotSetup"') < html.indexOf('class="arcade-footer"'),
    'before the footer',
  );
});

test('the setup module keeps input local: no storage, network, or HTML sinks', () => {
  for (const banned of [
    'localStorage',
    'sessionStorage',
    'document.cookie',
    'XMLHttpRequest',
    'sendBeacon',
    'fetch(',
    'innerHTML',
    'insertAdjacentHTML',
    'showOverlay',
    'startGame',
  ]) {
    assert.ok(!source.includes(banned), `pilot-setup.js must not reference ${banned}`);
  }
});
