# mjw-webhost — Cloud Run Migration

This directory contains the source and configuration for migrating `mikewyantjr.com` from a hosted VM to a containerized application running on Google Cloud Run.

## Overview
- **mikewyantjr.com** is served by Caddy inside a container, pinned to version
  `2.11.9-alpine` and its image digest in the `Dockerfile`.
- **Cloud Run** manages the runtime environment, auto-scaling, and SSL/TLS certificates.
- **Production deployment** is through Cloud Run's connected repository integration, not a GitHub Actions workflow.

## Structure
- `public/`: The static website content (Webflow export).
- `Dockerfile`: Builds the static site container from the repository root.
- `Caddyfile`: Caddy configuration with Cloud Run `${PORT}` support and `/ping` endpoint.
- `.github/workflows/cloud-run.yaml` and `.github/workflows/cloud-run-dev.yaml`: workflow files that are not the production deployment path; their current use is not specified here.
- `archive/legacy-stack/`: Contains the original `docker-compose.yml` and `Caddyfile` for reference.

## Local Development & Testing
From the repository root, build and run the container locally:
```bash
# Build the image
docker build -t mjw-www .

# Run the container (listening on port 8080)
docker run --rm -p 8080:8080 -e PORT=8080 mjw-www
```
The Caddy base image is pinned, and the homepage at `/` is resolved explicitly.
With the container running, verify its response locally:

```bash
bash scripts/smoke-test-cloud-run.sh http://localhost:8080
```

The smoke check confirms that `/` serves the expected homepage title and that
`/ping` returns `OK`. Pass a base URL as the first argument or set
`CLOUD_RUN_URL`; without either, the script looks up the Cloud Run URL with
`gcloud`.

## Void Lancer controls

The scene owns one keyboard mapping for its lifetime. During a running scene,
`window.voidLancerControls` exposes an in-memory API:

```js
const controls = window.voidLancerControls;
const result = controls.replace({
  ...controls.getSnapshot(),
  fire: ['Space', 'KeyZ'],
  start: ['Enter', 'KeyZ'],
});
if (!result.valid) console.warn(result.error);
// controls.reset(); // Restore the defaults.
```

`getSnapshot()` returns a frozen map of frozen binding arrays. `replace()` takes
all six actions: `moveUp`, `moveDown`, `moveLeft`, `moveRight`, `fire`, and `start`
(also used to restart). Empty arrays unbind an action. Invalid updates leave
the mapping and held state unchanged. Successful replacement and reset clear
held input. Nothing persists across reloads or scene teardown.

Bindings are physical `KeyboardEvent.code` strings, not typed characters.
Supported codes are `KeyA`–`KeyZ` except `KeyF` (the page fullscreen shortcut),
`Digit0`–`Digit9`, the four `Arrow…` codes, `Space`, and `Enter`. Modified keys,
IME composition and focused DOM controls are left to the browser. Play actions
cannot share a code with one another; `start` can share codes with play actions
because it only applies on the overlays. The defaults share Space/J/K this way.
The press that starts a run is consumed by the overlay; release and press again
to fire. Held keys and auto-repeat cannot restart after game over.

Inside the scene, `actionState.isHeld(action)` reads continuous actions.
Adapters can pass a stable, adapter-owned source ID to
`setHeld(action, source, down)` and send a fresh `requestStart()` pulse.
The scene accepts that pulse only on an overlay. Blur, hiding the page,
remapping, teardown, and a touch-layout switch (or a resize that takes a
captured control out of the layout) clear held state; adapters must not
replay old holds.

Patterns adapted from [Europa Neo PR #210](https://github.com/shaunburdick/europa-neo/pull/210),
specifically the pinned [`ControlMappingSession` and `matchKeyboardBinding`](https://github.com/shaunburdick/europa-neo/blob/1872a038c640184d98812923fe77c00ea861e438/packages/console/src/input/control-mapping.ts#L402-L504):
runtime ownership, validation before swapping a snapshot, and semantic matching
that does not consume browser shortcuts. Void Lancer uses physical codes,
unmodified presses, and explicit gameplay/overlay contexts rather than the
upstream implementation's logical-key and chord matching.

Run the VM tests with `node --test scripts/void-lancer-*.test.cjs`.

### Phone landscape playtest

In landscape with a coarse pointer and a viewport at most 600 CSS pixels tall,
the cabinet chrome steps aside
and the playfield fills the safe viewport at its largest uncropped 16:9:

- **Move** — a floating stick at the bottom-left opens wherever the thumb
  lands; aim is measured from that press point, so a stationary thumb never
  steers, and the drawn ring is clamped only to stay inside its zone.
- **Fire** — a fixed hold-to-fire button at the bottom-right, on its own
  pointer source so steering and firing stay independent.
- **Start** — a focusable overlay button kept clear of the in-canvas
  Start/Continue/Retry CTA.

Outside those conditions, the arcade cabinet stays, including the original
touch controls on touch devices. Keyboard controls remain available in both
layouts. Switching layouts, or resizing so a captured control leaves the
layout, releases the affected touch input.

For a LAN preview, set `LAN_IP` to this computer's Wi-Fi address and run this
from the worktree root:

```bash
python3 -m http.server 8772 --bind "${LAN_IP:?Set LAN_IP first}" --directory public
```

Then on the phone open `http://<LAN-IP>:8772/void-lancer/`, adding
`?sortie=2` to land on the Graveyard Sortie briefing directly. There is no
build step: to restart the preview, stop the server and run the same command
again.

Targeted test for this work: `node --test scripts/void-lancer-controls.test.cjs`.

The first phone playtest was on a real iPhone, and the floating stick plus
fixed hold-to-fire controls were accepted as they are. Revisiting the Fire
button's placement, size and reach while steering — with browser bars visible
and in both landscape orientations — is GitHub issue #14: a follow-up, not a
blocker, and no redesign is requested; independent steering and firing,
hold-to-fire, and the uncropped playfield stay as they are.

### Graveyard Sortie

Defeat the Siege Carrier and choose **Continue to Graveyard**, or open
`/void-lancer/?sortie=2` to practice the lane directly. Break contact when the
salvager's worklight sweeps over your ship. Sustained contact alerts the Imperial
patrol already in the yard; the workboat itself never fires. The amber salvage
tags are scenery, not pickups or objectives to collect.

The Level 2 runtime WebPs are derived from the Graveyard lane illustration and
transparent salvager cutout in the `imr-pilot` design batch. The 1008×567 lane
image pans within its edges rather than repeating; its center is dimmed behind
gameplay. The salvager keeps its open grapple and cargo gap and uses a separate
hooded lamp aligned to the lookout cone.

## Production Deployment
Production deployment is handled by Cloud Run's connected repository
integration. It is not triggered by GitHub Actions. The workflow files under
`.github/workflows/` are not the production deployment mechanism; their
current use is not specified here.

## DNS & Custom Domains
After deployment, follow Google Cloud Run domain mapping instructions:
1. `gcloud run domain-mappings create --service mikewyantjr-www --domain mikewyantjr.com --region us-east1`
2. Update DNS A-records for `@` (apex) and CNAME for `www` according to Google's provided IPs.

## Health Check
The Caddy configuration provides a `/ping` endpoint that returns `OK` (200).
Use it alongside `/` in smoke checks; this documentation does not assume that
Cloud Run is configured to use `/ping` as a platform health probe.
```bash
curl https://<cloud-run-url>/ping
```

---
**Legacy Stack**:
The old compose-based setup is archived in `archive/legacy-stack/`.
- `docker-compose.yml`
- `Caddyfile`
- `scripts/smoke-test.sh` (legacy)
