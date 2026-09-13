---
name: sales-agent-patterns
description: Muster für Vertriebs-Agenten: Lead-Qualifizierung (Hot/Warm/Cold), Outbound-Calling-Pipeline, Follow-up-Sequenzen, Logging. Nutzen, wenn Lead-Scoring, KI-Lead-Suche, Nachfass-Automatik oder ein Anruf-Agent gebaut oder angepasst wird.
---

# Vertriebs-Agenten-Muster

Abgeleitet aus „ai-agents-india“ (Vorlagen: Sales Calling Agent, Lead Qualifier, Follow-up Sequences) und angepasst auf Alwine (DE anrufen, Ausland per Mail um Telefonat bitten).

## 1. Lead-Qualifizierung (Hot / Warm / Cold)

Jeder gefundene Lead bekommt einen Score 0–100 und eine Klasse. Kriterium bei Alwine: **noch nicht erfolgreich, aber mit Potenzial** – die wollen wir erfolgreich machen.

| Signal | Punkte | Quelle |
|---|---|---|
| Keine Webseite hinterlegt | +30 | OSM `website` fehlt |
| Webseite vorhanden, aber nicht mobil / veraltet / kein Formular | +20 | manuelle Prüfung oder Fetch |
| Neueröffnung (< 12 Monate) | +25 | OSM `start_date`/`opening_date`, Google „neu eröffnet“, Handelsregister, Lokalpresse |
| Wenige Bewertungen (< 10) trotz Ladengeschäft | +15 | Google Maps (später API) |
| Keine Social-Media-Aktivität (letzter Post > 3 Monate) | +10 | manuell / später API |
| Sucht Personal (Stellenanzeige) | +15 | Indeed, Kleinanzeigen |
| Telefonnummer vorhanden | +10 | OSM `phone` |
| Kette / Filiale / Konzern | −40 | Name enthält bekannte Kette, `brand`-Tag |
| Bereits Kunde oder „Nicht anrufen“ | ausschließen | App-Status |

- **Hot ≥ 60:** heute anrufen, Beobachtung in Notiz.
- **Warm 35–59:** diese Woche, erst Webseite prüfen.
- **Cold < 35:** Füller, nur wenn Tagesziel sonst nicht erreicht.

Tagesziel: **30 qualifizierte Leads (Hot + Warm) pro Tag für Deutschland**, Suche läuft morgens automatisch, Ergebnis landet in der Lead-Liste mit Score und Klasse.

## 2. KI-Anreicherung (Claude API, Tool-Calling)

Muster aus bookpilot `AgentService`: ein Loop mit kleinen Tools, jedes Tool delegiert an echten Code, kein Duplikat der Logik.

```
QualifyLeadAgent.handle(lead):
  1. fetch_website(lead.website)        → HTML-Text, Mobile-Check, letztes Datum, Formular ja/nein
  2. search_signals(lead.firma, stadt)  → Neueröffnung, Bewertungen, Stellenanzeigen (Quellen-Adapter)
  3. Claude: Score + Klasse + 1-Satz-Beobachtung (Deutsch) + Aufhänger-Leistung (website/tools/video/…)
  4. persist: lead.score, lead.klasse, lead.notizen (Beobachtung in Zeile 1)
```
Regeln: Claude erfindet nichts, was die Tools nicht geliefert haben. Max. 6 Iterationen. Kein Tool-Ergebnis → Klasse „unbekannt“, Mensch prüft.

## 3. Outbound-Pipeline

```
Suche (OSM/Google) → Qualifizierung (Score) → Tagesliste (30) → Kanal
   DE: Anruf (Skript js/data/scripts.js) → Ergebnis → Wiedervorlage
   Ausland: Mail 1 (Bitte um Telefonat) → Antwort → Anruf (scripts_en.js)
→ Logging (kontakte[]) → Tagesreport (Anrufe, erreicht, Termine, Mails, Antworten)
```

## 4. Follow-up-Sequenzen

| Kanal | Tag 0 | +2 | +4 | +7 | +9 | +14 | +18 | +24 |
|---|---|---|---|---|---|---|---|---|
| Anruf (DE) | Anruf | Anruf | Anruf | Mail nur mit Zustimmung | Anruf | Anruf | Mehrwert | Anruf + Abschluss-Mail |
| Mail (Ausland) | Mail 1 | – | – | Mail 2 (Bump) | – | Mail 3 (Abschluss) | – | – |

Automatik: Nach 8 Anrufversuchen ohne Kontakt bzw. 3 Mails ohne Antwort wird der Lead geparkt (`kein_interesse`), kann manuell reaktiviert werden.

## 5. Anruf-Agent (später, optional)

Vorlage „Sales Calling Agent“ (VAPI/Twilio + LLM): Bei Alwine **nicht** für Erstanrufe (in DE rechtlich heikel, wirkt unpersönlich). Sinnvoll nur für: Terminerinnerung per SMS/WhatsApp, Rückruf-Terminbestätigung, Transkription eigener Anrufe für Notizen.

## 6. Logging-Pflicht

Jeder Kontakt: `{ts, typ: anruf|email|notiz, ergebnis, notiz}` am Lead. Ohne Log kein zweiter Anruf. Tagesreport abends aus den Logs, nicht aus dem Gefühl.
