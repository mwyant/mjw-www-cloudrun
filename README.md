# mjw-webhost — Cloud Run Migration

This directory contains the source and configuration for migrating `mikewyantjr.com` from a hosted VM to a containerized application running on Google Cloud Run.

## Overview
- **mikewyantjr.com** is served via `caddy:alpine` inside a container.
- **Cloud Run** manages the runtime environment, auto-scaling, and SSL/TLS certificates.
- **Deployment** is automated via GitHub Actions (`.github/workflows/cloud-run.yaml`).

## Structure
- `public/`: The static website content (Webflow export).
- `Dockerfile`: Multi-stage build for the static site container.
- `Caddyfile`: Caddy configuration with Cloud Run `${PORT}` support and `/ping` endpoint.
- `.github/workflows/cloud-run.yaml`: CI/CD pipeline for building and deploying.
- `archive/legacy-stack/`: Contains the original `docker-compose.yml` and `Caddyfile` for reference.

## Local Development & Testing
To build and run the container locally:
```bash
# Build the image
docker build -t mjw-www ./mjw-webhost

# Run the container (listening on port 8080)
docker run -p 8080:8080 -e PORT=8080 mjw-www
```
Once running, verify at `http://localhost:8080/` and `http://localhost:8080/ping`.

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

## GitHub Actions Deployment
The deployment pipeline triggers on pushes to the `main` branch that modify files in `mjw-webhost/`.
1. **Credentials**: Requires a GitHub secret `GCP_SA_KEY` containing the JSON service account key for a service account in `mikewyantjr-dev` with Cloud Run and Artifact Registry permissions.
2. **Steps**: Authenticate to GCP, build and push to Artifact Registry, and deploy to Cloud Run.

## DNS & Custom Domains
After deployment, follow Google Cloud Run domain mapping instructions:
1. `gcloud run domain-mappings create --service mikewyantjr-www --domain mikewyantjr.com --region us-east1`
2. Update DNS A-records for `@` (apex) and CNAME for `www` according to Google's provided IPs.

## Health Check
The container exposes a `/ping` endpoint that returns `OK` (200). Cloud Run uses this to verify the container is ready.
```bash
curl https://<cloud-run-url>/ping
```

---
**Legacy Stack**:
The old compose-based setup is archived in `archive/legacy-stack/`.
- `docker-compose.yml`
- `Caddyfile`
- `scripts/smoke-test.sh` (legacy)
