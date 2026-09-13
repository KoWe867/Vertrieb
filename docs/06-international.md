# Internationale Akquise: USA, UK und Rest der Welt

Die App trennt Leads nach Markt. Standard-Einstellung (änderbar unter ⚙︎):

| Markt | Kanal | Sprache | Warum |
|---|---|---|---|
| Deutschland, Österreich, Schweiz | Anrufen | Deutsch | Telefon B2B ist bei sachlichem Bezug erlaubt, Kalt-E-Mail nicht (siehe unten). |
| USA, Kanada, UK, Irland, Australien, Neuseeland, Welt | Anschreiben, dann anrufen | Englisch | Kalt-E-Mail an Firmen ist dort erlaubt (mit Abmeldemöglichkeit). Die Erstmail bittet um ein 10-Minuten-Telefonat. Wer antwortet, wird angerufen; das spart Fremdnummern-Skepsis und Zeitzonen-Raterei. |

**Ablauf Ausland:** Mail 1 (Bitte um Telefonat) → nach 5–7 Tagen Mail 2 (kurzer Bump) → nach 14 Tagen Abschluss-Mail. Bei jeder Antwort in der App „Antwort erhalten → anrufen“ tippen: Der Lead wechselt auf Anrufen, Status Rückruf, englisches Skript. Wer eine Uhrzeit nennt, wird exakt dann angerufen (Zeitzone!).

## Woher die Leads kommen

**OpenStreetMap (OSM)** enthält weltweit Millionen Firmen mit Name, Typ, Adresse, oft Telefon, Webseite und E-Mail. Der Zugriff ist kostenlos und ohne Anmeldung:

- **Nominatim** wandelt „Austin, Texas“ in Koordinaten um.
- **Overpass** liefert alle Firmen eines Typs (z. B. Elektriker, Zahnärzte, Makler) in einem Umkreis.

Die App fragt beides direkt vom Handy aus ab (Tab „Finden“). Das Skript `scripts/fetch_leads.py` macht dasselbe jede Nacht auf GitHub und legt neue Firmen in `data/leads-auto.json` ab.

**Grenzen von OSM:** Die Datenqualität schwankt je Region. In den USA und UK sind Telefonnummern häufig vorhanden, E-Mails selten. Firmen ohne Telefon werden standardmäßig ausgeblendet. Für Ansprechpartner-Namen und E-Mails bleibt ein Blick auf die Webseite nötig (Impressum/About/Contact).

**Bessere, aber kostenpflichtige Quellen** für später: Google Places API (beste Abdeckung, Bewertungen, ca. 17 $ je 1.000 Abfragen), Apollo.io / Hunter.io (Ansprechpartner + E-Mails, ab ca. 50 $/Monat), LinkedIn Sales Navigator.

## Anrufzeiten (deutsche Zeit)

| Region | Dort 9–11 Uhr | Dort 14–16 Uhr | Bester Slot von Deutschland aus |
|---|---|---|---|
| UK, Irland | 10–12 Uhr | 15–17 Uhr | 10–12 und 15–17 Uhr |
| USA Ostküste (New York, Miami) | 15–17 Uhr | 20–22 Uhr | 15–18 Uhr |
| USA Zentral (Texas, Chicago) | 16–18 Uhr | 21–23 Uhr | 16–19 Uhr |
| USA Westküste (Kalifornien) | 18–20 Uhr | 23–1 Uhr | 18–20 Uhr |
| Australien Ostküste | 1–3 Uhr | 6–8 Uhr | 6–8 Uhr morgens |

Die App zeigt im Anruf-Modus eine grobe Ortszeit aus dem Längengrad des Leads. Vor dem ersten Anruf des Tages einmal die echte Zeitzone der Stadt prüfen.

**Tagesplan mit beiden Märkten:** Vormittag Deutschland (Anrufe/Anschreiben) und UK, ab 15 Uhr USA Ostküste, ab 17 Uhr Texas/Mittlerer Westen. Australien am Morgen zwischen 6 und 8 Uhr.

## Telefonie ins Ausland

- Deutsche Mobilfunknummer im Display wirkt in den USA fremd, viele nehmen nicht ab. Lösung: virtuelle lokale Nummer (z. B. über Sipgate, Zadarma, Twilio, Google Voice ist für Deutsche nicht verfügbar). Kosten ab ca. 5 €/Monat plus Cent-Beträge je Minute.
- Alternativ: Anruf über WhatsApp/FaceTime, wenn die Firma dort erreichbar ist.
- Einwand „You're calling from Germany?“ ist im englischen Skript vorbereitet: europäische Qualität, Preis unter lokalen Agenturen, verfügbar am Vormittag der Kunden.

## Rechtliches im Ausland (Kurzfassung, keine Rechtsberatung)

**USA**
- Kaltanrufe an Firmen: erlaubt. Das National Do Not Call Registry gilt für Privatpersonen. Keine automatischen Wählsysteme oder aufgezeichneten Ansagen ohne Einwilligung (TCPA).
- Kalt-E-Mail an Firmen: erlaubt nach CAN-SPAM, wenn: kein irreführender Betreff, echte Absenderadresse, Postanschrift in der Mail, klare Abmeldemöglichkeit, Abmeldungen innerhalb 10 Tagen umgesetzt. Die englische Erstkontakt-Vorlage enthält die nötigen Zeilen.
- Preise in USD nennen, „net“ statt „netto“, keine MwSt. (Sales Tax fällt auf Dienstleistungen meist nicht an, prüfen).

**UK**
- Anrufe an Firmen: erlaubt, außer die Nummer steht im Corporate Telephone Preference Service (CTPS). Vor größeren Kampagnen prüfen.
- E-Mail an Firmenadressen (info@, Kapitalgesellschaften): erlaubt nach PECR, mit Abmeldemöglichkeit. Einzelunternehmer gelten wie Privatpersonen.
- GDPR gilt weiterhin (UK GDPR).

**Australien**
- Anrufe an Firmen: erlaubt, Do Not Call Register gilt hauptsächlich für Privatnummern.
- E-Mail: Spam Act verlangt Einwilligung, für Firmen reicht „inferred consent“ bei veröffentlichten Geschäftsadressen mit Bezug zum Geschäft. Abmeldemöglichkeit Pflicht.

**Kanada**
- CASL ist streng: E-Mail nur mit ausdrücklicher oder impliziter Einwilligung (veröffentlichte Adresse mit Bezug zum Geschäft zählt). Anrufe an Firmen erlaubt.

**Deutschland (zur Erinnerung)**
- Telefon B2B: erlaubt bei sachlichem Bezug.
- E-Mail: ohne Einwilligung unzulässig, auch an Firmen. Die App warnt beim ersten Anschreiben eines deutschen Leads. Alternativen für „Anschreiben“ in DE: Brief, Postkarte, LinkedIn-Nachricht, Kontaktformular der Firma (Grauzone, einzeln und persönlich).

## Preise im Ausland

US-Agenturen verlangen für eine kleine Firmenwebseite meist 3.000–10.000 USD plus 100–300 USD/Monat. Unsere Preise können dort 30–50 % höher liegen als in Deutschland und wirken trotzdem günstig. Immer in Landeswährung und als Festpreis nennen. Zahlung per Stripe oder Wise, Rechnung in Englisch mit „Reverse charge / no VAT“ Hinweis für B2B außerhalb der EU.
