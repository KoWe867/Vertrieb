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
- [ ] `npm test` grün, `npm start` liefert `/api/ping`
- [ ] Unbekannte `/api/*`-Route → JSON-404 in apiResponse-Form
- [ ] Import eines App-Backups legt alle Leads an, Konten ohne Tokens sichtbar
- [ ] Handy-App und Desktop zeigen dieselben Zahlen aus der API
