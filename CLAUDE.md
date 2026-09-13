# Alwine Vertrieb — Projektkonventionen

Vertriebssystem für Alwine (Web, Tools, Code, Design, automatisierte Videos für kleine Betriebe). Zwei Oberflächen auf einem lokalen Server: **Handy-App** (`index.html`, Anrufen unterwegs) und **Desktop-Dashboard** (`desktop/`, linke Leiste, Mail-Center, Lead-Finder). Daten heute im Browser-Speicher, Backend (`server/`) kommt feature-weise laut `plans/`.

Start: `/start` (oder `./start.sh`) → http://localhost:3000/desktop/

## Was das System tut

1. **Leads finden:** 30 deutsche Firmen pro Tag, die noch nicht erfolgreich sind (Neueröffnung, keine oder alte Webseite, wenige Bewertungen, keine Social-Aktivität), KI-bewertet Hot/Warm/Cold. Quelle OpenStreetMap, später Google Places. Ausland (USA/UK/Welt) ebenfalls suchbar.
2. **Anrufen (DE):** Skripte, Einwände, Ergebnis-Logging, Wiedervorlage.
3. **Mail-Center (Ausland, Bestandskontakte):** mehrere Gmail-Konten, hartes Tageslimit je Konto (Standard 300, Warm-up), Vorlagen, Antworten/Bounces zählen.
4. **Abschluss:** Termin, Angebot, Referenz, Empfehlung.

## Skills (`.claude/skills/`)

| Skill | Zweck |
|---|---|
| `vertrieb-workflow` | Der vereinte Tagesablauf, welche Skill wofür, harte Regeln. **Zuerst lesen.** |
| `backend-conventions` | Schichtenarchitektur, apiResponse, Ordner, Agent-Muster, Format der Feature-Pläne |
| `sales-agent-patterns` | Lead-Scoring Hot/Warm/Cold, Pipeline, Follow-up-Sequenzen, Logging |
| `cofounder` | `/cofounder`: Positionierung, Landingpage, Pitch (intern und im Kundentermin) |
| `video-prompts` | Prompt-Vorlagen für Kundenvideos je Branche |

Befehle: `/start` (System hochfahren, Stand zeigen), `/cofounder` (Geschäftsanalyse).

## Architektur-Regeln (PFLICHT, Details in `backend-conventions`)

```
Route → Middleware → Controller → Validator → Service → Repository
                                        ↓
                          Serializer → apiResponse { success, message, data }
```

- Keine Geschäftslogik in Controllern, keine Inline-Validierung, nie rohe DB-Zeilen zurückgeben.
- Alle Texte (Skripte, Mails, Leistungen, Branchen) sind Daten in `js/data/`, kein Code.
- Handy-App und Desktop teilen dieselben Daten (`localStorage`-Schlüssel `alwine.*.v1`, später API).
- Kein Framework, kein Build-Schritt im Frontend. Vanilla JS, eine Datei pro Ansicht.
- Backend: Node 22, Express, SQLite (better-sqlite3), zod. Cron im Prozess.
- KI: Claude API mit Tool-Calling (`server/services/agent/`), Modell-ID nur in `.env`.

## Rechtliche Regeln (nicht verhandelbar)

- **Deutschland:** Firmen anrufen ja (§ 7 Abs. 2 Nr. 1 UWG, sachlicher Bezug). Kalt-E-Mail ohne Einwilligung **nein** (§ 7 Abs. 2 Nr. 2 UWG). „Nicht anrufen“ sofort umsetzen.
- **USA/UK/Welt:** Kalt-E-Mail an Firmen ja, mit Postanschrift und Abmeldemöglichkeit (CAN-SPAM/PECR). Erstmail bittet um Telefonat, Antwort → Anruf.
- Keine Privatpersonen. Keine gekauften Listen. Rufnummer nie unterdrücken.
- Details: `docs/03-rechtliches.md`, `docs/06-international.md`.

## Mail-Limits

Tageslimit je Gmail-Konto ist im Service hart durchgesetzt. Standard 300, Warm-up neuer Konten: Tag 1 = 20, täglich +20. Google-Grenzen: 500/Tag (frei), 2.000/Tag (Workspace). Zustellbarkeit leidet ab ca. 100 Kalt-Mails/Konto/Tag; lieber mehr Konten als mehr Mails je Konto.

## Ordner

```
index.html, css/, js/          Handy-App (PWA)
js/data/                       Skripte, Mails, Leistungen, Branchen, Lead-Quellen (DE + EN)
desktop/                       Desktop-Dashboard (Sidebar, Mail-Center, Lead-Finder, Konten)
server/                        Backend (ab Feature 1, siehe plans/)
scripts/fetch_leads.py         Nächtliche Lead-Suche (GitHub Action)
suchauftraege.json             Suchaufträge für die Automatik
data/leads-auto.json           Ergebnis der Automatik (nur öffentliche Firmendaten)
docs/01–06                     Taktiken, Verkaufsgespräch, Recht, Routine, Recherche, International
plans/feature-N-*.md           Feature-Pläne (Format in backend-conventions)
.claude/skills, .claude/commands
```

## Feature-Reihenfolge

0. Desktop-Shell (fertig): Sidebar, Übersicht, Mail-Center-Ansicht, Konten, Lead-Finder-Ansicht auf localStorage.
1. Server-Grundgerüst: Express, SQLite, apiResponse, Migration der localStorage-Daten.
2. Mail-Center: Gmail-OAuth je Konto, Queue, Tageslimit, Warm-up, Antworten/Bounces lesen.
3. KI-Lead-Finder DE: 30/Tag, Kriterien Neueröffnung/schwache Präsenz, Claude-Scoring, Ketten-Filter.
4. Anruf-Integration: Click-to-Call, Wiedervorlagen, Tagesreport.

## Git

`main` ← `feature/*`. Deutsche Commit-Nachrichten. Keine Secrets, keine echten Zugangsdaten, keine Kundendaten im Repo. `npm test` grün vor jedem Push.

## Bei jeder Änderung

1. Passenden Skill lesen (Tabelle oben).
2. Gibt es einen Plan in `plans/`? Wenn nein, erst Plan schreiben.
3. Bauen, testen (Playwright für UI, Fixtures für Services), Checkliste im Plan abhaken.
4. README und Doku aktualisieren, wenn sich Ablauf oder Regeln ändern.
