# Alwine Vertrieb

Mobiles Akquise-System für Alwine: täglich Firmen anrufen, mit erprobten Skripten sprechen, Ergebnisse festhalten, passende E-Mails senden. Läuft als Web-App direkt auf dem Handy, ohne Installation, ohne Backend.

## Was drin ist

| Bereich | Inhalt |
|---|---|
| **Heute** | Tagesziele (Anrufe, erreicht, Termine, Mails), fällige Rückrufe, Tagesablauf, Regel des Tages |
| **Leads** | Firmenliste mit Status, Suche, Filter, CSV-Import/-Export, Verlauf je Firma |
| **Anrufen** | Anruf-Modus: nächster Lead, Tel-Button, Gesprächsleitfaden in Phasen mit ausgefüllten Platzhaltern, Branchen-Opener, passende Leistungen, Einwandbehandlung, Ergebnis mit einem Tipp, automatische Wiedervorlage |
| **Vorlagen** | Kompletter Gesprächsleitfaden, 10 Einwände mit Antworten, 9 E-Mail-Vorlagen (Terminbestätigung, nach Mailbox, Infos, Angebot, 3× Nachfassen, Erinnerung, Empfehlung), direkt in die Mail-App |
| **Wissen** | Leistungen mit Nutzen/Frage/Beispiel/Preisrahmen, 7 Branchenprofile mit Entscheider und bester Anrufzeit, Kennzahlen, Rechtslage |
| **docs/** | Erprobte Taktiken, komplettes Verkaufsgespräch, Rechtliches, Tages- und Wochenroutine, Lead-Recherche |

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

Platzhalter: `{firma}`, `{ansprechpartner}`, `{ich}`, `{telefon}`, `{branche}`, `{aufhaenger}`, `{opener_branche}`, `{beobachtung}` (1. Zeile der Lead-Notiz), `{termin}`.

## Wichtig: Rechtslage

Telefonakquise bei Firmen ist in Deutschland bei sachlichem Bezug erlaubt. **Werbe-E-Mails ohne Einwilligung sind auch an Firmen unzulässig.** Deshalb ist der Ablauf: erst anrufen, Zustimmung holen, dann mailen. Details in `docs/03-rechtliches.md`.

## Ausbau (später)

- Gemeinsames Backend (z. B. Supabase) statt localStorage, damit mehrere Personen dieselbe Lead-Liste sehen
- Automatische Lead-Recherche aus Google Maps / Branchenbüchern
- Anruf-Statistiken pro Woche und Branche
- Kalender-Anbindung für Termine
