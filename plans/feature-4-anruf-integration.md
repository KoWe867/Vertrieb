# Feature 4 — Anruf-Integration und Tagesreport — `feature/anrufe`

> Ziel: Vom Desktop aus anrufen (Click-to-Call), Anrufe automatisch loggen, abends ein Report.

## Analyse & Entscheidungen
- Click-to-Call über `tel:`-Links (Handy) oder eine VoIP-Anbindung (Sipgate/Twilio API) vom Desktop; Aufzeichnung nur mit Einwilligung (in DE beidseitig, § 201 StGB), daher standardmäßig aus.
- Tagesreport per Cron 17:00 an die eigene Adresse: Anrufe, erreicht, Termine, Mails je Konto, Antworten, Bounces, neue Leads, Pipeline-Bewegung.

## Datenmodell
`kontakte` bleibt. Zusätzlich `reports(tag, json)`.

## API-Vertrag
| Methode | Route | Auth |
|---|---|---|
| POST | /api/calls/start | Bearer (VoIP optional) |
| GET | /api/report/:tag | Bearer |

## Build-Reihenfolge
1. Report-Service aus `kontakte`, `mail_events`, `lead_runs`.
2. Desktop-Übersicht liest den Report.
3. Optional VoIP.

## ✅ Check vor Abschluss
- [ ] Report für einen Testtag stimmt mit den Logs überein
