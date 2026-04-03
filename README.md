# mjw-webhost — Cloud Run Migration

This directory contains the source and configuration for migrating `mikewyantjr.com` from a hosted VM to a containerized application running on Google Cloud Run.

## Overview
- **mikewyantjr.com** is served via `caddy:alpine` inside a container.
- **Cloud Run** manages the runtime environment, auto-scaling, and SSL/TLS certificates.
- **Deployment** is automated via GitHub Actions (`.github/workflows/cloud-run.yaml`).
- The **Community Capacity** site remains on the legacy compose stack for now and will be archived later.

## Structure
- `public/`: The static website content (Webflow export).
- `Dockerfile`: Multi-stage build for the static site container.
- `Caddyfile`: Caddy configuration with Cloud Run `${PORT}` support and `/healthz` endpoint.
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
Once running, verify at `http://localhost:8080/` and `http://localhost:8080/healthz`.

## GitHub Actions Deployment
The deployment pipeline triggers on pushes to the `main` branch that modify files in `mjw-webhost/`.
1. **Credentials**: Requires a GitHub secret `GCP_SA_KEY` containing the JSON service account key for a service account in `mikewyantjr-dev` with Cloud Run and Artifact Registry permissions.
2. **Steps**: Authenticate to GCP, build and push to GCR, and deploy to Cloud Run.

## DNS & Custom Domains
After deployment, follow Google Cloud Run domain mapping instructions:
1. `gcloud run domain-mappings create --service mikewyantjr-www --domain mikewyantjr.com --region northamerica-northeast1`
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
