# Feature 0 — Desktop-Shell — `feature/desktop-shell`

> Ziel: Auf localhost den Körper des Tools sehen: linke Leiste, Mail-Center in der Mitte, Konten, Lead-Finder, Einstellungen. Alles auf den vorhandenen Browser-Daten, ohne Backend.

## Analyse & Entscheidungen
- Gleicher Ursprung wie die Handy-App (ein Server, Port 3000), damit beide dieselben `localStorage`-Daten sehen. Kein Sync nötig, bis der Server kommt.
- Sidebar mit sechs Bereichen: Übersicht, Leads, Mail-Center, Konten, Persönliche Infos, Einstellungen. Alles Weitere sind Unterbereiche.
- Mail-Center zeigt echte Zahlen aus den Lead-Logs (gesendet je Vorlage/Tag) und die Konten mit Tageslimit. Senden selbst kommt mit Feature 2 (Gmail-API). Bis dahin öffnet „Senden“ die Mail-App und zählt.
- Lead-Finder auf dem Desktop nutzt `js/data/lead_sources.js` (OSM) plus lokalen Score (Hot/Warm/Cold, Ketten-Filter) als Vorstufe zur KI-Bewertung in Feature 3.

## Datenmodell (localStorage, Schlüssel `alwine.*.v1`)
- `leads` (bestehend) + `score`, `klasse` (hot/warm/cold)
- `accounts`: `{ id, email, name, limit, warmup: bool, start: date, status: nicht_verbunden|verbunden, signature }`
- `settings` (bestehend) + `profil: { firma, adresse, ust, telefon, web }`

## API-Vertrag
Keine API in diesem Feature. Alle Lesezugriffe über `desktop/store.js`.

## Build-Reihenfolge
1. `start.sh`: Python-HTTP-Server Port 3000, Browser öffnen.
2. `desktop/index.html` + `style.css`: Sidebar, Kopfzeile, Inhaltsbereich, Dark-Mode.
3. `desktop/store.js`: gemeinsame Lese/Schreib-Helfer für `alwine.*`.
4. Ansichten: Übersicht (KPIs), Leads (Tabelle, Filter, Score), Mail-Center (Statistik, Konten-Verteilung, Vorlagen), Konten (CRUD), Profil, Einstellungen.
5. Lead-Finder-Panel im Leads-Bereich: OSM-Suche + Score + Import.

## Rechtliches / Limits
Anzeige der Kanäle je Markt wie in CLAUDE.md. Tageslimit je Konto nur angezeigt, noch nicht erzwungen (kein Versand).

## ✅ Check vor Abschluss
- [x] `./start.sh` startet, `/desktop/` und `/` laden ohne Konsolenfehler
- [x] Konten anlegen/bearbeiten/löschen, Limit wird im Mail-Center angezeigt
- [x] Übersicht zeigt Anrufe/Mails/Termine des Tages identisch zur Handy-App
- [x] Lead-Finder liefert Score und importiert in dieselbe Lead-Liste
- [x] Playwright-Test grün
