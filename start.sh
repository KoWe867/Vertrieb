#!/usr/bin/env bash
# Startet das Alwine-Vertriebssystem lokal: Desktop-Dashboard + Handy-App auf einem Server.
set -e
cd "$(dirname "$0")"
PORT="${PORT:-3000}"
if command -v lsof >/dev/null && lsof -i ":$PORT" >/dev/null 2>&1; then
  echo "Port $PORT belegt, nehme $((PORT+1))"; PORT=$((PORT+1))
fi
URL="http://localhost:$PORT/desktop/"
echo "Alwine Vertrieb läuft: $URL   (Handy-App: http://localhost:$PORT/)"
( command -v xdg-open >/dev/null && xdg-open "$URL" ) || ( command -v open >/dev/null && open "$URL" ) || true
exec python3 -m http.server "$PORT" --bind 127.0.0.1
