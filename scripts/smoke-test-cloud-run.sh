#!/usr/bin/env bash
# mjw-webhost/scripts/smoke-test-cloud-run.sh
# Verifies that the site homepage and health endpoint respond correctly.

set -euo pipefail

SERVICE_NAME="mikewyantjr-www"
REGION="us-east1"

URL="${1:-${CLOUD_RUN_URL:-}}"

if [ -z "$URL" ]; then
  echo "Fetching Cloud Run URL for $SERVICE_NAME..."
  URL=$(gcloud run services describe "$SERVICE_NAME" --platform managed --region "$REGION" --format 'value(status.url)' || true)
  if [ -z "$URL" ]; then
    echo "ERROR: Could not fetch URL for $SERVICE_NAME. Pass a base URL or check gcloud access."
    exit 1
  fi
fi

URL="${URL%/}"
echo "Testing URL: $URL"

# Verify the root serves the expected homepage, not just any successful response.
echo "Checking / (expect the Mike Wyant Jr. homepage)..."
if ! homepage=$(curl --fail --silent --show-error "$URL/"); then
  echo "FAIL: / did not return a successful response"
  exit 1
fi
if [[ "$homepage" != *'<title>Mike Wyant Jr. | Sci-Fi & Fantasy Author</title>'* ]]; then
  echo "FAIL: / did not contain the expected homepage title"
  exit 1
fi
echo "  / -> expected homepage"

echo "Checking /ping (expect OK)..."
if ! ping=$(curl --fail --silent --show-error "$URL/ping"); then
  echo "FAIL: /ping did not return a successful response"
  exit 1
fi
if [ "$ping" != "OK" ]; then
  echo "FAIL: /ping did not return OK"
  exit 1
fi
echo "  /ping -> OK"

echo "Smoke test PASSED"
