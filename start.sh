#!/usr/bin/env bash
# Startet das Alwine-Vertriebssystem lokal. Mit installiertem Server (server/node_modules) läuft
# der Node-Server mit API und Datenbank, sonst ein einfacher Dateiserver (nur Browser-Daten).
set -e
cd "$(dirname "$0")"
PORT="${PORT:-3000}"
if command -v lsof >/dev/null && lsof -i ":$PORT" >/dev/null 2>&1; then
  echo "Port $PORT belegt, nehme $((PORT+1))"; PORT=$((PORT+1))
fi
URL="http://localhost:$PORT/desktop/"
( command -v xdg-open >/dev/null && xdg-open "$URL" ) || ( command -v open >/dev/null && open "$URL" ) || true
if [ -d server/node_modules ] && command -v node >/dev/null; then
  echo "Starte Node-Server (API + Datenbank): $URL"
  cd server && PORT="$PORT" exec node index.js
else
  echo "Node-Server nicht installiert (cd server && npm install). Starte Dateiserver ohne API: $URL"
  exec python3 -m http.server "$PORT" --bind 127.0.0.1
fi
