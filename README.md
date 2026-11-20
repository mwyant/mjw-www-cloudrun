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
remapping, and teardown clear held state; adapters must not replay old holds.

Patterns adapted from [Europa Neo PR #210](https://github.com/shaunburdick/europa-neo/pull/210),
specifically the pinned [`ControlMappingSession` and `matchKeyboardBinding`](https://github.com/shaunburdick/europa-neo/blob/1872a038c640184d98812923fe77c00ea861e438/packages/console/src/input/control-mapping.ts#L402-L504):
runtime ownership, validation before swapping a snapshot, and semantic matching
that does not consume browser shortcuts. Void Lancer uses physical codes,
unmodified presses, and explicit gameplay/overlay contexts rather than the
upstream implementation's logical-key and chord matching.

Run the VM tests with `node --test scripts/void-lancer-*.test.cjs`.

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
