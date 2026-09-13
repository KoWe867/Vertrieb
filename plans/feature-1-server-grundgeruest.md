# Feature 1 — Server-Grundgerüst — `feature/server`

> Ziel: Ein lokaler Node-Server, der die Browser-Daten übernimmt, damit Mail-Versand, Cron und KI serverseitig laufen können.

## Analyse & Entscheidungen
- Node 22 + Express + better-sqlite3, eine Datei `data/alwine.db` (nicht im Git). Kein Docker, kein Postgres: läuft auf jedem Laptop.
- `apiResponse`-Form vor dem ersten Endpunkt festnageln (siehe backend-conventions).
- Migration: `POST /api/import` nimmt das JSON-Backup der App (⚙︎ → Backup) und schreibt Leads, Konten, Einstellungen. Danach lesen beide Oberflächen von der API; `localStorage` bleibt nur Cache.
- Auth: ein Token in `.env` (`APP_TOKEN`), als Bearer. Reicht für lokal, ist in 5 Minuten durch OAuth ersetzbar.

## Datenmodell
```
leads(id TEXT PK, firma, ansprechpartner, telefon, email, website, branche, markt, sprache, kanal, stadt,
      status, naechster, notizen, quelle UNIQUE, score INT, klasse, lat, lon, erstellt, aktualisiert)
kontakte(id INTEGER PK, lead_id FK, ts, typ, ergebnis, notiz, account_id NULL)
accounts(id TEXT PK, email UNIQUE, name, limit_tag INT, warmup INT, start, status, signature, oauth_json TEXT NULL)
settings(key TEXT PK, value TEXT)
```

## API-Vertrag
| Methode | Route | Auth | Notizen |
|---|---|---|---|
| GET | /api/ping | – | `{ pong: true }` |
| GET/POST | /api/leads, /api/leads/:id (PUT/DELETE) | Bearer | Filter: status, markt, klasse, faellig |
| POST | /api/leads/:id/kontakte | Bearer | loggt Kontakt, setzt Wiedervorlage |
| GET/POST/PUT/DELETE | /api/accounts | Bearer | Serializer entfernt `oauth_json` |
| GET/PUT | /api/settings | Bearer | |
| POST | /api/import | Bearer | Backup-JSON der App |
| GET | /api/report/heute | Bearer | Zahlen für Übersicht |

## Build-Reihenfolge
1. `server/index.js`, `lib/apiResponse.js`, Exception-Handler (JSON für alle Fehler), `/api/ping`.
2. `db/migrations/001_init.sql`, `repositories/`.
3. Leads + Kontakte (Service, Validator, Serializer, Controller, Route).
4. Accounts, Settings, Import, Report.
5. Frontend `desktop/store.js` und `js/app.js`: wenn `/api/ping` antwortet, API nutzen, sonst localStorage.
6. Tests: Supertest gegen In-Memory-SQLite.

## Rechtliches / Limits
Keine Kundendaten ins Repo: `data/*.db` in `.gitignore`.

## ✅ Check vor Abschluss
- [x] `npm test` grün (8 Tests), `npm start` liefert `/api/ping`
- [x] Unbekannte `/api/*`-Route → JSON-404 in apiResponse-Form
- [x] Import eines App-Backups legt alle Leads an, Konten ohne Tokens sichtbar
- [x] Handy-App und Desktop zeigen dieselben Zahlen aus der API (Playwright: Desktop schreibt, Handy-App liest, Anruf-Log landet im Report)

## Umsetzung (Stand)
- `server/`: Express 5, better-sqlite3, zod. Schichten wie in backend-conventions. Statische Dateien des Repos werden mit ausgeliefert, ein Prozess für API + beide Oberflächen.
- `js/sync.js`: beim Start `GET /api/ping`; wenn erreichbar, werden Leads, Konten, Einstellungen in den localStorage gespiegelt (Event `alwine:synced`), jede Speicherung wird nach 700 ms an die API geschickt (Leads/Konten als Replace-Import, Einstellungen per PUT). Ohne Server bleibt alles im Browser.
- Einstellungen → „Browser-Daten auf Server übertragen“ für die Einmal-Migration.
- Auth: ohne `APP_TOKEN` nur localhost, mit Token Bearer-Pflicht.
