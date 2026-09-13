# Feature 3 — KI-Lead-Finder Deutschland — `feature/ki-lead-finder`

> Ziel: Jeden Morgen 30 anrufbare deutsche Firmen, die noch nicht erfolgreich sind (Neueröffnung, schwache Online-Präsenz), mit Score, Klasse und einem Satz Beobachtung.

## Analyse & Entscheidungen
- **Quellen in Stufen:** (1) OSM wie heute (kostenlos, Telefonnummern), (2) Google Places API für Bewertungen, Öffnungsdatum-Indizien und Webseite (ca. 17 €/1.000 Abfragen), (3) Neueröffnungs-Signale: OSM `start_date`/`opening_date`, Google „neu eröffnet“-Badge, Lokalpresse-RSS, Handelsregister-Bekanntmachungen (Suchbegriff + Stadt).
- **Score regelbasiert zuerst** (sales-agent-patterns §1), Claude nur für: Webseiten-Bewertung (mobil? aktuell? Formular?), Ketten-Erkennung, Beobachtungssatz auf Deutsch, passende Leistung. So bleiben Kosten bei < 0,01 € je Lead.
- „Schlechte Audience“ = wenige Bewertungen, keine Webseite/alt, keine Social-Posts, kein Formular. „Neueröffnung“ = < 12 Monate. Beides erhöht den Score; Ketten/Filialen fliegen raus.
- Tagesziel 30 = Hot + Warm. Cron 05:30. Suchaufträge in `suchauftraege.json` bleiben die Steuerung (Städte, Branchen, Radius).
- Pro Lead wird die Webseite einmal abgerufen (Timeout 8 s, nur HTML, kein JS). Kein Crawling über die Startseite hinaus.

## Datenmodell
```
leads + score INT, klasse TEXT, signale JSON ({ neu: bool, website_mobil: bool, formular: bool,
        bewertungen: int, letzter_post: date, stellenanzeige: bool, kette: bool }), qualifiziert_am
lead_runs(id, gestartet, beendet, gefunden, qualifiziert, hot, warm, cold, kosten_tokens, log TEXT)
```

## API-Vertrag
| Methode | Route | Auth | Notizen |
|---|---|---|---|
| POST | /api/leads/finden | Bearer | `{ markt, ort, branche, radius_km, max }` → Kandidaten (nicht gespeichert) |
| POST | /api/leads/qualifizieren | Bearer | `{ lead_ids[] }` → Score/Klasse/Beobachtung |
| POST | /api/leads/tageslauf | Bearer | führt alle Suchaufträge aus, bis 30 Hot+Warm erreicht |
| GET | /api/leads/runs | Bearer | Verlauf der Läufe |

## Build-Reihenfolge
1. `services/leads/LeadFinderService.js`: OSM-Adapter (Port von `lead_sources.js`), Google-Places-Adapter (optional per `.env`).
2. `services/leads/SignalService.js`: Webseiten-Check, Neueröffnungs-Signale, Ketten-Liste (`data/ketten.txt`).
3. `services/leads/QualifyService.js`: regelbasierter Score.
4. `services/agent/tools/`: `fetch_website`, `search_signals`; `QualifyLeadAgent` (Claude, max. 6 Iterationen) für Beobachtung + Leistung.
5. Tageslauf-Job 05:30, Stopp bei 30 Hot+Warm oder nach allen Aufträgen.
6. Desktop: „Heute gefunden“-Liste mit Score, Klasse, Beobachtung, Ein-Klick in Anruf-Modus.

## Rechtliches / Limits
- Nur Firmendaten aus öffentlichen Quellen. Keine Privatpersonen (Einzelunternehmer mit Privatanschrift ohne Geschäftsbezug ausschließen).
- Google-Places-Nutzungsbedingungen: Ergebnisse nicht dauerhaft cachen außer Place-ID; Bewertungen nur für Scoring, nicht anzeigen.
- Nominatim: max. 1 Anfrage/Sekunde, eigener User-Agent.

## ✅ Check vor Abschluss
- [ ] Tageslauf liefert an 3 Testtagen je ≥ 30 Hot+Warm für 6 Suchaufträge
- [ ] Ketten-Filter: Liste aus 50 bekannten Ketten wird zu 100 % ausgeschlossen
- [ ] Claude-Ausfall → Leads bleiben mit regelbasiertem Score, Klasse „unbekannt“ statt Absturz
- [ ] Kosten je Lead < 0,01 € (Token-Zähler in `lead_runs`)
