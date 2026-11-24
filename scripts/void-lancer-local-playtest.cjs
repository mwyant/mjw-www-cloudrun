#!/usr/bin/env node
// Dependency-free local browser playtest. Chrome's DevTools Protocol sends
// actual keyboard events to the page, without relying on an automation UI's
// browser/window focus.
'use strict';

const { spawn, spawnSync } = require('node:child_process');
const {
  accessSync,
  constants,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFile,
  readFileSync,
  rmSync,
  writeFileSync,
} = require('node:fs');
const http = require('node:http');
const { tmpdir } = require('node:os');
const path = require('node:path');

const PUBLIC_DIR = path.resolve(__dirname, '../public');
const SCREENSHOT_PATH = path.resolve(
  process.env.VOID_LANCER_SCREENSHOT || '/tmp/opencode/void-lancer-sortie-2.png',
);
const WAIT_STEP_MS = 100;
const OBSERVE_ENEMY_FIRE = process.argv.includes('--enemy-fire');

function findChrome() {
  const candidates = [
    process.env.CHROME_BIN,
    'google-chrome',
    'chromium',
    'chromium-browser',
    'google-chrome-stable',
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (candidate.includes('/')) {
      try {
        accessSync(candidate, constants.X_OK);
        return candidate;
      } catch {}
      continue;
    }
    const found = spawnSync('which', [candidate], { encoding: 'utf8' });
    if (found.status === 0 && found.stdout.trim()) return found.stdout.trim();
  }
  throw new Error('Chrome/Chromium not found. Set CHROME_BIN to its executable path.');
}

function contentType(file) {
  return ({
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
  })[path.extname(file).toLowerCase()] || 'application/octet-stream';
}

function startStaticServer() {
  const server = http.createServer((request, response) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    } catch {
      response.writeHead(400).end('Bad request');
      return;
    }
    const requested = path.resolve(PUBLIC_DIR, `.${pathname}`);
    if (requested !== PUBLIC_DIR && !requested.startsWith(`${PUBLIC_DIR}${path.sep}`)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    const file = path.join(requested, 'index.html');
    const target = pathname.endsWith('/') ? file : requested;
    readFile(target, (error, contents) => {
      if (error) {
        response.writeHead(error.code === 'ENOENT' ? 404 : 500).end('Not found');
        return;
      }
      response.writeHead(200, {
        'Cache-Control': 'no-store',
        'Content-Type': contentType(target),
        'X-Content-Type-Options': 'nosniff',
      });
      response.end(contents);
    });
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.removeListener('error', reject);
      resolve({ server, port: server.address().port });
    });
  });
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(check, description, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const result = await check();
    if (result) return result;
    await delay(WAIT_STEP_MS);
  }
  throw new Error(`Timed out waiting for ${description}.`);
}

async function stopChrome(chrome) {
  if (!chrome || chrome.exitCode !== null) return;
  const exited = new Promise((resolve) => chrome.once('exit', resolve));
  chrome.kill('SIGTERM');
  if (await Promise.race([exited.then(() => true), delay(3000).then(() => false)])) return;
  chrome.kill('SIGKILL');
  await Promise.race([exited, delay(1000)]);
}

async function connectPage(port) {
  const targets = await waitFor(async () => {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      return response.ok ? response.json() : null;
    } catch {
      return null;
    }
  }, 'Chrome DevTools page');
  const page = targets.find((target) => target.type === 'page' && target.webSocketDebuggerUrl);
  if (!page) throw new Error('Chrome opened without a debuggable page.');

  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', () => reject(new Error('Could not connect to Chrome DevTools.')), { once: true });
  });

  let nextId = 0;
  const pending = new Map();
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (!message.id) return;
    const command = pending.get(message.id);
    if (!command) return;
    clearTimeout(command.timeout);
    pending.delete(message.id);
    if (message.error) command.reject(new Error(message.error.message));
    else command.resolve(message.result);
  });

  return {
    send(method, params = {}) {
      const id = ++nextId;
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`Chrome DevTools command timed out: ${method}`));
        }, 10000);
        pending.set(id, { resolve, reject, timeout });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    close() {
      for (const command of pending.values()) {
        clearTimeout(command.timeout);
        command.reject(new Error('Chrome DevTools connection closed.'));
      }
      pending.clear();
      socket.close();
    },
  };
}

async function evaluate(cdp, expression) {
  const result = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || 'Browser evaluation failed.');
  }
  return result.result.value;
}

const KEYS = {
  Space: { key: ' ', code: 'Space', vk: 32 },
  ArrowUp: { key: 'ArrowUp', code: 'ArrowUp', vk: 38 },
  KeyD: { key: 'd', code: 'KeyD', vk: 68 },
};

async function key(cdp, code, down) {
  const { key: keyValue, vk } = KEYS[code];
  await cdp.send('Input.dispatchKeyEvent', {
    type: down ? 'keyDown' : 'keyUp',
    key: keyValue,
    code,
    windowsVirtualKeyCode: vk,
    nativeVirtualKeyCode: vk,
  });
}

async function snapshot(cdp) {
  return evaluate(cdp, `(() => {
    const game = window.__voidLancerTestGame;
    const scene = game?.scene?.scenes?.[0];
    if (!scene?.state) return null;
    const state = scene.state;
    return {
      sortie: scene.sortieIndex,
      stage: scene.campaignEntry?.()?.title || null,
      mode: state.mode,
      timeSeconds: Number(state.time.toFixed(2)),
      player: { x: Math.round(state.player.x), y: Math.round(state.player.y), lives: state.player.lives },
      enemies: state.enemies.map(({ type }) => type),
      bullets: {
        player: state.bullets.filter(({ owner }) => owner === 'player').length,
        enemy: state.bullets.filter(({ owner }) => owner === 'enemy').length,
      },
      alarm: state.graveyard?.detection?.alarm || false,
      announcements: state.announcements.map(({ text }) => text),
    };
  })()`);
}

async function run() {
  const chromePath = findChrome();
  const { server, port: sitePort } = await startStaticServer();
  const profileDir = mkdtempSync(path.join(tmpdir(), 'void-lancer-local-playtest-'));
  let chrome;
  let cdp;
  let chromeStderr = '';
  try {
    chrome = spawn(chromePath, [
      '--headless=new',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-background-networking',
      '--disable-extensions',
      '--disable-sync',
      '--mute-audio',
      '--no-first-run',
      '--no-default-browser-check',
      '--force-device-scale-factor=1',
      '--window-size=960,540',
      '--remote-debugging-port=0',
      `--user-data-dir=${profileDir}`,
      'about:blank',
    ], { stdio: ['ignore', 'ignore', 'pipe'] });
    chrome.stderr.setEncoding('utf8');
    chrome.stderr.on('data', (chunk) => {
      chromeStderr = `${chromeStderr}${chunk}`.slice(-8000);
    });

    const activePortFile = path.join(profileDir, 'DevToolsActivePort');
    const activePort = await waitFor(() => {
      if (!existsSync(activePortFile)) return null;
      const value = Number(readFileSync(activePortFile, 'utf8').split(/\r?\n/)[0]);
      return Number.isInteger(value) && value > 0 ? value : null;
    }, 'Chrome DevTools startup');
    cdp = await connectPage(activePort);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `Object.defineProperty(window, 'Phaser', {
        configurable: true,
        set(value) {
          Object.defineProperty(window, 'Phaser', { value, writable: true, configurable: true });
          ${OBSERVE_ENEMY_FIRE ? 'value.AUTO = value.CANVAS;' : ''}
          const Game = value.Game;
          value.Game = new Proxy(Game, {
            construct(target, args, newTarget) {
              const game = Reflect.construct(target, args, newTarget);
              window.__voidLancerTestGame = game;
              return game;
            },
          });
        },
      });`,
    });
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 960,
      height: 540,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await cdp.send('Page.navigate', {
      url: `http://127.0.0.1:${sitePort}/void-lancer/?sortie=2`,
    });
    let briefing;
    try {
      briefing = await waitFor(async () => {
        const state = await snapshot(cdp);
        return state?.sortie === 2 && state.mode === 'intro' ? state : null;
      }, 'the Graveyard Sortie 2 briefing');
    } catch (error) {
      const diagnostic = await evaluate(cdp, `({
        title: document.title,
        readyState: document.readyState,
        phaser: typeof window.Phaser,
        testGame: Boolean(window.__voidLancerTestGame),
        scenes: window.__voidLancerTestGame?.scene?.scenes?.length ?? null,
        canvas: document.querySelectorAll('canvas').length,
        errors: [...document.querySelectorAll('body')].map((node) => node.innerText.slice(0, 500))
      })`);
      throw new Error(`${error.message} Browser: ${JSON.stringify(diagnostic)}`);
    }

    // Space starts the briefing; release it before pressing it again to fire.
    await key(cdp, 'Space', true);
    await delay(80);
    await key(cdp, 'Space', false);
    await waitFor(async () => (await snapshot(cdp))?.mode === 'playing', 'Sortie 2 gameplay');
    const startingPlayer = (await snapshot(cdp)).player;

    // Hold real browser input while the game loop runs: move up/right and fire,
    // then continue firing until both the patrol and a projectile are live.
    await key(cdp, 'Space', true);
    await key(cdp, 'ArrowUp', true);
    await key(cdp, 'KeyD', true);
    await delay(800);
    await key(cdp, 'ArrowUp', false);
    await key(cdp, 'KeyD', false);
    let latestState;
    let activity;
    try {
      activity = await waitFor(async () => {
        const state = await snapshot(cdp);
        latestState = state;
        return state?.mode === 'playing' && state.enemies.length > 0 && state.bullets.player > 0
          ? state
          : null;
      }, 'a live enemy and fired player projectile', 6000);
    } catch (error) {
      throw new Error(`${error.message} Last gameplay state: ${JSON.stringify(latestState)}`);
    }
    await key(cdp, 'Space', false);
    await delay(150);
    const gameplay = await snapshot(cdp);

    if (gameplay?.mode !== 'playing' || gameplay.sortie !== 2) {
      throw new Error(`Unexpected game scene after input: ${JSON.stringify(gameplay)}`);
    }
    if (activity.enemies.length === 0) {
      throw new Error(`No live enemy was observed: ${JSON.stringify(gameplay)}`);
    }
    if (activity.bullets.player === 0) {
      throw new Error(`Firing produced no live player projectile: ${JSON.stringify(activity)}`);
    }
    if (gameplay.player.x === startingPlayer.x && gameplay.player.y === startingPlayer.y) {
      throw new Error('Movement keys did not move the player ship.');
    }
    let enemyFire;
    if (OBSERVE_ENEMY_FIRE) {
      try {
        enemyFire = await waitFor(async () => {
          const state = await snapshot(cdp);
          latestState = state;
          return state?.mode === 'playing' && state.bullets.enemy > 0 ? state : null;
        }, 'an enemy projectile in live Sortie 2 gameplay', 30000);
      } catch (error) {
        throw new Error(`${error.message} Last gameplay state: ${JSON.stringify(latestState)}`);
      }
    }

    const screenshot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    });
    mkdirSync(path.dirname(SCREENSHOT_PATH), { recursive: true });
    writeFileSync(SCREENSHOT_PATH, Buffer.from(screenshot.data, 'base64'));
    process.stdout.write(`${JSON.stringify({
      result: 'PASS',
      route: '/void-lancer/?sortie=2',
      browser: chromePath,
      renderer: OBSERVE_ENEMY_FIRE ? 'canvas' : 'default',
      briefing,
      startPlayer: startingPlayer,
      activity,
      gameplay,
      ...(OBSERVE_ENEMY_FIRE ? { enemyFire } : {}),
      movementObserved: gameplay.player,
      screenshot: SCREENSHOT_PATH,
    }, null, 2)}\n`);
  } catch (error) {
    const diagnostics = chromeStderr.trim();
    if (diagnostics) error.message += `\nChrome stderr:\n${diagnostics}`;
    throw error;
  } finally {
    cdp?.close();
    await stopChrome(chrome);
    server.close();
    try {
      rmSync(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    } catch (error) {
      process.stderr.write(`Could not remove temporary Chrome profile ${profileDir}: ${error.message}\n`);
    }
  }
}

run().catch((error) => {
  process.stderr.write(`Void Lancer local playtest FAILED: ${error.stack || error}\n`);
  process.exitCode = 1;
});
