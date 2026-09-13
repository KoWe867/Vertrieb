---
name: backend-conventions
description: Architektur- und Code-Konventionen für den Alwine-Server (Node/Express, SQLite, Gmail API, Claude-Agent) und das Format der Feature-Pläne in plans/. Nutzen bei jeder Backend-Änderung, neuen Endpunkten, Services oder wenn ein neuer Feature-Plan geschrieben wird.
---

# Backend-Konventionen (übernommen aus bookpilot-backend/CLAUDE.md, angepasst auf Node)

## Architektur (PFLICHT für jedes Feature)

```
Route → Middleware → Controller → Validator (Schema) → Service (Geschäftslogik) → Repository/DB
                                                  ↓
                                   Serializer (Antwort filtern) → apiResponse
```

1. **Keine Geschäftslogik in Controllern.** Controller nehmen Request, rufen genau eine Service-Methode, geben Antwort. Logik in `server/services/` (z. B. `MailService.js`, `LeadFinderService.js`).
2. **Keine Inline-Validierung.** Pro Endpunkt ein Schema in `server/validators/` (zod). Controller bekommt validierte Daten.
3. **Antworten immer über Serializer** in `server/serializers/`. Nie rohe DB-Zeilen zurückgeben (Tokens, Secrets bleiben drin!).
4. **Eine Antwortform:** `server/lib/apiResponse.js` mit genau `sendSuccess(res, data, message = "OK", code = 200)` und `sendError(res, message, code, errors = null)`. Form: `{ success, message, data }` bzw. `{ success: false, message, errors }`. Auch 404/422/500 über diese Form (Exception-Handler), nie HTML.
5. **Middleware für Auth und Limits.** Lokale App: ein Session-Token aus `.env`. Rate-Limits (Mail: Tageslimit je Account) in Middleware bzw. Service, nicht im Controller.
6. **Imports oben.** Kein `require()` mitten im Code.
7. **Konfiguration nur über `.env`** (`.env.example` mit jedem Schlüssel committen, nie echte Werte).

## Ordner

```
server/
├── index.js            // Express-App, Router, Exception-Handler
├── routes/             // nur Route → Controller
├── controllers/        // dünn
├── validators/         // zod-Schemas
├── services/           // ALLE Geschäftslogik
│   ├── mail/           // GmailClient, MailService (Limits, Warm-up, Queue), TemplateService
│   ├── leads/          // LeadFinderService (OSM, Google Places), QualifyService (Score)
│   └── agent/          // AgentService (Claude Tool-Calling), ToolRegistry, tools/
├── serializers/
├── repositories/       // SQLite-Zugriff (better-sqlite3), Migrationen in db/migrations/
├── lib/                // apiResponse, logger, config
└── jobs/               // Cron: Lead-Suche 05:30, Mail-Queue alle 5 Min, Wiedervorlagen
```

## KI-Agent (Muster aus bookpilot `AgentService`)

- `AgentService.handle(input)`: System-Prompt bauen → Loop (max. 6–8 Iterationen) → Claude → `tool_use` → `ToolRegistry.execute(name, input)` → weiter, `text` → fertig.
- Jedes Tool ist eine kleine Klasse mit JSON-Schema und `execute()`, delegiert an einen echten Service (kein Doppelcode).
- Claude erfindet nichts: Jede Zahl, jeder Fakt kommt aus einem Tool-Ergebnis derselben Konversation.
- Token-Zähler je Aufruf speichern (Kostenkontrolle).
- Ausfall der API → definierter Fallback (Lead bleibt „unqualifiziert“, Mail bleibt in Queue), nie Absturz.
- Modell: `claude-sonnet-5` für Routine (Scoring, Betreffzeilen), `claude-opus-5` nur für lange Analysen. Modell-ID in `.env`, nicht im Code.

## Feature-Pläne (`plans/feature-N-name.md`)

Jedes Feature bekommt vor dem Bau einen Plan mit genau diesen Abschnitten:

```
# Feature N — Name — `feature/branch`
> Ziel: ein Satz.
## Analyse & Entscheidungen      (warum so, was wird bewusst nicht gebaut)
## Datenmodell                    (Tabellen/Felder, Indizes)
## API-Vertrag                    (Methode | Route | Auth | Body → Antwort)
## Build-Reihenfolge              (nummeriert, kleine Schritte)
## Rechtliches / Limits           (UWG, CAN-SPAM, Gmail-Limits – wo relevant)
## ✅ Check vor Abschluss         (Checkliste, testbar)
```

## Git

`main` ← `feature/*`. Aussagekräftige Commits auf Deutsch. Keine Secrets, keine Tokens, keine echten Lead-Daten im Repo (`data/leads-auto.json` enthält nur öffentliche Firmendaten).

## Tests

`npm test` muss vor jedem Push grün sein. Services werden ohne Netz getestet (Fixtures für OSM/Gmail/Claude-Antworten).
