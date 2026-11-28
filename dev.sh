#!/usr/bin/env bash
#
# Start everything the local frontend needs.
#
# Live Server proxies /api to http://127.0.0.1:8080. If the backend is not
# running, every request returns 500 and the UI shows "Something went wrong".
# This script makes sure MongoDB and the backend are up before Live Server
# gets used. It is safe to run repeatedly: an already-running backend is left
# alone.
#
# Usage: ./dev.sh
# VS Code also runs this automatically when the workspace opens (see
# .vscode/tasks.json).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_HEALTH="http://127.0.0.1:8080/api/health"

# VS Code started from the macOS Dock does not always inherit the Homebrew or
# JDK shell PATH. Add the usual locations so `mvn`/`java` are found.
for candidate in /opt/homebrew/bin /usr/local/bin; do
  [ -d "$candidate" ] && PATH="$candidate:$PATH"
done
if [ -z "${JAVA_HOME:-}" ] && [ -x /usr/libexec/java_home ]; then
  JAVA_HOME="$(/usr/libexec/java_home 2>/dev/null || true)"
  export JAVA_HOME
fi
export PATH

if ! command -v mvn >/dev/null 2>&1; then
  echo "Maven (mvn) was not found. Install Maven or open a terminal where 'mvn -v' works." >&2
  exit 1
fi

if curl -fsS --max-time 2 "$API_HEALTH" >/dev/null 2>&1; then
  echo "NabhaLearn backend is already running at http://127.0.0.1:8080"
  exit 0
fi

# Start the local MongoDB if it is not listening. On macOS the project uses the
# Homebrew service; on other systems the user is expected to run mongod.
if ! lsof -iTCP:27017 -sTCP:LISTEN >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    echo "Starting MongoDB (brew services start mongodb-community)..."
    brew services start mongodb-community >/dev/null 2>&1 || true
    for _ in $(seq 1 30); do
      lsof -iTCP:27017 -sTCP:LISTEN >/dev/null 2>&1 && break
      sleep 1
    done
  fi
  if ! lsof -iTCP:27017 -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Warning: MongoDB is not listening on 127.0.0.1:27017." >&2
    echo "Start it (brew services start mongodb-community) or set MONGODB_URI." >&2
  fi
fi

echo "Starting NabhaLearn backend on http://127.0.0.1:8080 ..."
cd "$ROOT/backend"
exec mvn spring-boot:run
