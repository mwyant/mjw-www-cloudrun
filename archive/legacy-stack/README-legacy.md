mjw-www — deployment notes

## Overview
- Two static sites run inside this compose stack via `caddy:alpine` and fronted by Nginx Proxy Manager (NPM) for SSL.
- Caddy reads `./caddy/Caddyfile` and serves both `mikewyantjr.com` and `communitycapacity.org` (plus `www.` aliases) from `./websites`.
- NPM handles public HTTPS on ports 80/443, and exposes its admin/dashboard on port 81 (mapped via `NPM_ADMIN_PORT`, default 81) so you can reach the UI from elsewhere.
- NPM proxies to the Caddy container on the internal `lamp_network`.

## Sites
1. **mikewyantjr.com**
   - Document root: `./websites/mjw-www/public`
   - Static assets are published straight from the Webflow export.
2. **communitycapacity.org / www.communitycapacity.org**
   - Document root: `./websites/cci-www`
   - Temporary splash page that dynamically loads copy from `content.md` (see below).

## Caddy configuration
- The `caddy:Caddyfile` defines two host blocks (`mikewyantjr.com` and `communitycapacity.org`) pointing at the respective folders under `/var/www/sites` (the host path `./websites` is mounted read-only).
- Both blocks set `X-Frame-Options` and `X-Content-Type-Options` headers and serve `index.html` when no explicit file is requested.
- any future flat-site additions should add another host block and point `root` at the new folder.

## Nginx Proxy Manager
- Proxy host data lives in `./nginx/data/database.sqlite`, and certs live in `./nginx/letsencrypt`.
- When configuring the CCI site in NPM, use the email `mw@communitycapacity.org` for Let's Encrypt notifications.
- After creating a proxy host for `communitycapacity.org`, the cert issuance may need the DNS records to propagate before the `nginx-proxy-manager` health check succeeds.

## Community Capacity Initiative (CCI) site content
- `cci-www/index.html` loads `content.md` whenever the page opens; the markdown is cached in `localStorage` under `cci-content-cache` so the experience continues if the network is flaky.
- Each block in `content.md` starts with a heading like `#Panel.Services.Article1` followed by `Heading:` and/or `Text:` lines, matching the `data-content-key` attributes in the HTML.
- To update the site, edit `content.md` and optionally tweak any CSS/JS assets in `cci-www`.

## Deployment & testing
- Use the existing scripts to manage the stack:
  - `./scripts/restart.sh` (rebuilds services, waits for Caddy health, and reruns the smoke test)
  - `./scripts/start.sh`, `./scripts/stop.sh`, `./scripts/status.sh` for basic lifecycle ops
  - `./scripts/smoke-test.sh` now verifies both `mikewyantjr.com` and `communitycapacity.org` over the internal Caddy endpoint and the public NPM proxy.
- Always inspect `docker compose -f docker-compose.yml logs caddy` after a restart if the new site doesn’t appear or returns errors.

## Backups & rollback
- Config files were backed up before these changes in `./archive/config-backup-<timestamp>/` (Caddyfile, docker-compose, scripts).
- To roll back, restore the snapshot and rerun `./scripts/restart.sh`.

## Recent changes
- 2026-02-06: Multi-site Caddy block added for `communitycapacity.org`, smoke test expanded to cover both hosts, and documentation updated to explain the new CCI splash content loading.

## How to revert
- Revert this commit in git or restore the older config files from `./archive/config-backup-20260206_200119/` and run `./scripts/restart.sh` to return to the previous state.
