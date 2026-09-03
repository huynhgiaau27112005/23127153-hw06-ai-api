#!/usr/bin/env bash
# HW06 Newman runner — Student 23127153
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

FOLDER=""
REPORT="reports/newman-report.html"
FAIL_ONE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --folder) FOLDER="$2"; shift 2 ;;
    --report) REPORT="$2"; shift 2 ;;
    --fail-one-test) FAIL_ONE=true; shift ;;
    -h|--help)
      echo "Usage: $0 [--folder NAME] [--report PATH] [--fail-one-test]"
      exit 0 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

if [[ ! -d node_modules ]]; then
  echo "Installing dependencies..."
  npm install
fi

mkdir -p "$(dirname "$REPORT")"

ARGS=(
  run postman/23127153_EShop_API.postman_collection.json
  -e postman/eshop-local.postman_environment.json
  -r cli,htmlextra
  --reporter-htmlextra-export "$REPORT"
  --reporter-htmlextra-title "HW06 API Tests — 23127153"
  --reporter-htmlextra-showEnvironmentData
  --reporter-htmlextra-logs
)

if [[ -n "$FOLDER" ]]; then
  ARGS+=(--folder "$FOLDER")
fi

if [[ "$FAIL_ONE" == true ]]; then
  ARGS+=(--bail)
fi

echo "Running: npx newman ${ARGS[*]}"
npx newman "${ARGS[@]}"
