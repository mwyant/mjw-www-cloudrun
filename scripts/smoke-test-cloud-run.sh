#!/usr/bin/env bash
# mjw-webhost/scripts/smoke-test-cloud-run.sh
# Verifies the Cloud Run service is responding correctly.

set -euo pipefail

SERVICE_NAME="mikewyantjr-www"
REGION="us-east1"

# Get the URL of the service
echo "Fetching Cloud Run URL for $SERVICE_NAME..."
URL=$(gcloud run services describe "$SERVICE_NAME" --platform managed --region "$REGION" --format 'value(status.url)' || true)

if [ -z "$URL" ]; then
  echo "ERROR: Could not fetch URL for $SERVICE_NAME. Is it deployed?"
  exit 1
fi

echo "Testing URL: $URL"

# Test root endpoint
echo "Checking / (expect 200 OK)..."
code=$(curl -s -o /dev/null -w "%{http_code}" "$URL/")
echo "  / -> $code"
if [ "$code" != "200" ]; then
  echo "FAIL: / did not return 200 OK"
  exit 1
fi

# Test healthz endpoint
echo "Checking /healthz (expect 200 OK)..."
code=$(curl -s -o /dev/null -w "%{http_code}" "$URL/healthz")
echo "  /healthz -> $code"
if [ "$code" != "200" ]; then
  echo "FAIL: /healthz did not return 200 OK"
  exit 1
fi

# Test content.md endpoint (if it exists)
echo "Checking for content.md..."
code=$(curl -s -o /dev/null -w "%{http_code}" "$URL/cci/content.md")
echo "  /cci/content.md -> $code"
if [ "$code" == "200" ]; then
  echo "SUCCESS: content.md is reachable at /cci/content.md"
else
  # Check if it was moved to the root?
  code=$(curl -s -o /dev/null -w "%{http_code}" "$URL/content.md")
  echo "  /content.md -> $code"
  if [ "$code" == "200" ]; then
    echo "SUCCESS: content.md is reachable at /content.md"
  else
    echo "WARNING: content.md not found at root or /cci/"
  fi
fi

echo "Smoke test PASSED"
