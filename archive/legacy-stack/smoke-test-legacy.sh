#!/usr/bin/env bash
set -euo pipefail

HOST=localhost
DOMAINS=(mikewyantjr.com communitycapacity.org www.communitycapacity.org)
PATHS=(/)
failed=0

log_and_fail() {
  echo "Smoke test FAILED"
  echo "--- caddy logs ---"
  docker compose -f docker-compose.yml logs --no-color --tail 100 caddy || true
  echo "--- nginx-proxy-manager logs ---"
  docker compose -f docker-compose.yml logs --no-color --tail 100 nginx-proxy-manager || true
  exit 2
}

echo "Checking internal Caddy endpoints..."
for domain in "${DOMAINS[@]}"; do
  for path in "${PATHS[@]}"; do
    code=$(docker compose -f docker-compose.yml exec -T caddy curl -s -o /dev/null -w "%{http_code}" -H "Host: ${domain}" "http://localhost${path}" || true)
    echo "  internal ${domain}${path} -> ${code}"
    if [ "${code}" != "200" ]; then
      failed=1
    fi
  done
done

echo "Checking external (NPM proxy) endpoints..."
for domain in "${DOMAINS[@]}"; do
  for path in "${PATHS[@]}"; do
    code=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: ${domain}" "http://${HOST}${path}" || true)
    echo "  proxy ${domain}${path} -> ${code}"
    if [ "${code}" != "200" ]; then
      failed=1
    fi
  done
done

if [ $failed -ne 0 ]; then
  log_and_fail
fi

echo "Smoke test PASSED"
