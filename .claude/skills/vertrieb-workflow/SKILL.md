---
name: vertrieb-workflow
description: Der vereinte Tagesworkflow des Alwine-Vertriebssystems: Lead-Suche (30/Tag DE, KI-qualifiziert), Mail-Center (mehrere Gmail-Konten mit Tageslimit), Anrufe, Logging, Report. Nutzen bei /start, bei Fragen „was ist heute zu tun“, und wenn ein Teil des Systems gebaut oder verändert wird, damit alle Skills zusammenpassen.
---

# Alwine Vertriebs-Workflow (vereint alle Skills)

```
05:30  Lead-Suche (automatisch)      sales-agent-patterns §1–2, lead_sources.js, scripts/fetch_leads.py
       → 30 DE-Leads, Kriterium „noch nicht erfolgreich“: Neueröffnung, keine/alte Webseite,
         wenige Bewertungen, keine Social-Aktivität. Score Hot/Warm/Cold. Ketten raus.
08:00  /start → Desktop-Dashboard (localhost)   Übersicht: Tagesziele, Mail-Stats, heutige Leads
08:30  Anrufblock DE (Hot zuerst)     docs/02-verkaufsgespraech.md, js/data/scripts.js, Anruf-Modus
12:30  Mail-Center: Ausland           emails_en.js (Bitte um Telefonat), je Gmail-Konto Tageslimit,
       Antworten → „Antwort erhalten → anrufen“
14:00  Rückrufe + Nachfassen          Wiedervorlagen aus der Lead-Liste
16:30  Termine bestätigen, Angebote   emails.js (Terminbestätigung, Angebot), cofounder-Skill für
                                      Positionierung des Kunden, video-prompts für Beispielvideo
17:00  Tagesreport                    Anrufe, erreicht, Termine, Mails gesendet, Antworten, Bounces
```

## Welche Skill wofür

| Aufgabe | Skill / Datei |
|---|---|
| Neues Backend-Feature, Endpunkt, Plan | `backend-conventions`, `plans/` |
| Lead-Scoring, Suche, Nachfass-Logik | `sales-agent-patterns` |
| Kunden positionieren, Landingpage, Pitch im Termin | `cofounder` (`/cofounder`) |
| Beispielvideo für einen Lead | `video-prompts` |
| Gesprächsführung, Einwände, Mails | `docs/01–06`, `js/data/*.js` |
| Rechtsfragen Telefon/E-Mail DE/USA | `docs/03-rechtliches.md`, `docs/06-international.md` |

## Kennzahlen, die das Dashboard zeigt

- Leads: heute gefunden, davon Hot/Warm/Cold, Tagesziel 30
- Anrufe: Wählversuche, erreicht, Termine (Ziel 40 / 30 % / 1)
- Mails: gesendet je Konto und gesamt, Tageslimit je Konto, Antworten, Bounces, Abmeldungen
- Pipeline: Neu → In Arbeit → Rückruf → Termin → Angebot → Kunde

## Harte Regeln

1. Deutschland: anrufen. Keine Kalt-E-Mail ohne Einwilligung (§ 7 UWG).
2. Ausland: E-Mail mit Bitte um Telefonat, CAN-SPAM-Zeilen (Adresse, Abmeldung), Antwort → Anruf.
3. Tageslimit je Gmail-Konto ist hart (Standard 300, Warm-up startet bei 20 und steigt täglich). Google selbst: 500/Tag frei, 2.000/Tag Workspace. Für Zustellbarkeit sind 50–100 Kalt-Mails je Konto realistisch, darüber droht Spam-Einstufung.
4. Jeder Kontakt wird geloggt. Kein Log, kein zweiter Kontakt.
5. Ketten, Konzerne, Bestandskunden und „Nicht anrufen“ werden nie angeschrieben.
