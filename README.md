# Alwine Vertrieb

Vertriebssystem für Alwine mit zwei Oberflächen auf einem lokalen Server: **Desktop-Dashboard** (`desktop/`: Sidebar, Übersicht, Leads & Finder, Mail-Center mit mehreren Gmail-Konten, Konten, Profil, Einstellungen) und **Handy-App** (`index.html`: Anrufen und Anschreiben unterwegs). Beide teilen dieselben Daten.

## Start

```
./start.sh            # oder in Claude Code: /start
```
Öffnet http://localhost:3000/desktop/ (Handy-App unter http://localhost:3000/). Kein Build, keine Abhängigkeiten außer Python 3.

## Skills und Pläne (Claude Code)

`.claude/skills/` bündelt die Arbeitsweise: `vertrieb-workflow` (Tagesablauf, zuerst lesen), `backend-conventions` (Architektur, Plan-Format), `sales-agent-patterns` (Lead-Scoring Hot/Warm/Cold), `cofounder` (`/cofounder`, Positionierung und Pitch), `video-prompts` (Kundenvideos). Feature-Pläne in `plans/` (0 Desktop-Shell fertig, 1 Server, 2 Mail-Center Gmail-API, 3 KI-Lead-Finder 30/Tag, 4 Anrufe/Report). Konventionen in `CLAUDE.md`.

## Was drin ist

| Bereich | Inhalt |
|---|---|
| **Heute** | Tagesziele (Anrufe, erreicht, Termine, Mails), fällige Rückrufe, Tagesablauf, Regel des Tages |
| **Leads** | Firmenliste mit Status, Suche, Filter, CSV-Import/-Export, Verlauf je Firma |
| **Finden** | Lead-Finder: Firmen weltweit aus OpenStreetMap nach Markt, Stadt, Branche und Radius suchen, filtern (nur mit Telefon, ohne Webseite), auswählen, importieren. Suchaufträge speichern und mit einem Tipp alle ausführen. |
| **Anschreiben** | E-Mail-Modus für Leads mit Kanal „Anschreiben“: nächster Lead, passende Vorlage nach Kontaktzahl, Mail-App öffnen, Wiedervorlage, nach 3 Mails ohne Antwort automatisch parken. |
| **Anrufen** | Anruf-Modus: nächster Lead, Tel-Button, Gesprächsleitfaden in Phasen mit ausgefüllten Platzhaltern, Branchen-Opener, passende Leistungen, Einwandbehandlung, Ergebnis mit einem Tipp, automatische Wiedervorlage |
| **Vorlagen** | Deutsch und Englisch: kompletter Gesprächsleitfaden, 10 Einwände mit Antworten, 9 E-Mail-Vorlagen (Terminbestätigung, nach Mailbox, Infos, Angebot, 3× Nachfassen, Erinnerung, Empfehlung), direkt in die Mail-App |
| **Wissen** | Leistungen mit Nutzen/Frage/Beispiel/Preisrahmen, 7 Branchenprofile mit Entscheider und bester Anrufzeit, Kennzahlen, Rechtslage |
| **docs/** | Erprobte Taktiken, komplettes Verkaufsgespräch, Rechtliches, Tages- und Wochenroutine, Lead-Recherche |

## Märkte und Kanäle

Jeder Lead hat einen Markt (Deutschland, Österreich, Schweiz, USA, Kanada, UK, Irland, Australien, Neuseeland, Welt). Daraus folgen Sprache der Skripte und Vorlagen (Deutsch/Englisch) und der Kanal:

| Markt | Standard-Kanal | Skripte |
|---|---|---|
| Deutschland, Österreich, Schweiz | Anrufen | Deutsch |
| USA, UK, Kanada, Australien, Welt | Anschreiben (E-Mail mit Bitte um ein Telefonat), bei Antwort anrufen | Englisch |

Beides ist unter ⚙︎ umstellbar und pro Lead überschreibbar. Das entspricht der Rechtslage: In Deutschland ist Telefon B2B erlaubt, Kalt-E-Mail nicht (die App warnt, falls ein deutscher Lead doch auf Anschreiben steht). In den USA und UK ist Kalt-E-Mail an Firmen mit Abmeldemöglichkeit erlaubt; die englische Erstmail bittet um ein kurzes Telefonat, „Antwort erhalten“ schiebt den Lead in den Anruf-Modus. Details in `docs/06-international.md`.

## Automatische Lead-Suche (nachts)

`scripts/fetch_leads.py` liest `suchauftraege.json`, fragt OpenStreetMap ab und schreibt neue Firmen nach `data/leads-auto.json`. Der Workflow `.github/workflows/leads.yml` führt das Mo–Fr um 05:30 Uhr aus und committet das Ergebnis. In der App: Heute → „Automatische Leads laden“ importiert alles Neue.

Suchaufträge anpassen: `suchauftraege.json` bearbeiten (Markt, Ort, Branche, Radius, Maximum je Nacht). Manuell starten: Actions → „Automatische Lead-Suche“ → Run workflow. Lokal testen:

```
python3 scripts/fetch_leads.py
```

## Auf dem Handy nutzen

Die App ist reines HTML/CSS/JS. Zwei Wege:

**1. GitHub Pages (empfohlen, kostenlos):**
Repository → Settings → Pages → Source „Deploy from a branch“, Branch `main`, Ordner `/ (root)`. Nach 1–2 Minuten erreichbar unter `https://<user>.github.io/<repo>/`.
Auf dem Handy öffnen → Teilen → „Zum Home-Bildschirm“. Läuft danach wie eine App, auch offline.

**2. Lokal testen:**
```
python3 -m http.server 8080
```
und `http://localhost:8080` öffnen.

## Erste Schritte

1. Oben rechts ⚙︎: eigenen Namen und Telefonnummer eintragen (werden in Skripte und Mails eingesetzt), Tagesziele setzen.
2. Leads anlegen oder `leads-vorlage.csv` als Muster nehmen und importieren.
3. Auf „Anrufen“ tippen. Die App wählt den nächsten Lead (fällige Rückrufe zuerst).
4. Nach jedem Anruf Ergebnis eintragen. Bei Termin oder Mailbox schlägt die App sofort die passende E-Mail vor.

## Daten

Alle Daten liegen im Browser-Speicher des Handys (localStorage). Backup über ⚙︎ → Backup (JSON) oder Leads → CSV exportieren. Bei mehreren Personen pro Person ein Handy oder regelmäßig CSV zusammenführen; für ein gemeinsames Backend siehe „Ausbau“.

## Skripte anpassen

Alle Texte sind Daten, kein Code:

- `js/data/scripts.js` – Gesprächsphasen, Einwände, goldene Regeln
- `js/data/emails.js` – E-Mail-Vorlagen
- `js/data/services.js` – Leistungen, Nutzen, Preisrahmen
- `js/data/industries.js` – Branchen, Entscheider, beste Zeiten, Opener
- `js/data/scripts_en.js`, `js/data/emails_en.js` – englische Versionen
- `js/data/lead_sources.js` – Märkte, OSM-Tag-Zuordnung je Branche, Suche

Platzhalter: `{firma}`, `{ansprechpartner}`, `{ich}`, `{telefon}`, `{branche}`, `{aufhaenger}`, `{opener_branche}`, `{beobachtung}` (1. Zeile der Lead-Notiz), `{termin}`.

## Wichtig: Rechtslage

Telefonakquise bei Firmen ist in Deutschland bei sachlichem Bezug erlaubt. **Werbe-E-Mails ohne Einwilligung sind auch an Firmen unzulässig.** Deshalb ist der Ablauf: erst anrufen, Zustimmung holen, dann mailen. Details in `docs/03-rechtliches.md`.

## Ausbau (später)

- Gemeinsames Backend (z. B. Supabase) statt localStorage, damit mehrere Personen dieselbe Lead-Liste sehen
- Google Places API als zweite Lead-Quelle (bessere Abdeckung, Bewertungen)
- Ansprechpartner und E-Mails automatisch von Webseiten ziehen
- Anruf-Statistiken pro Woche und Branche
- Kalender-Anbindung für Termine
