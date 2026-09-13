# Lead-Recherche: Wo die Firmen herkommen

Ziel: jeden Abend 20 neue, qualifizierte Leads in der App. Qualifiziert heißt: Firma, Telefonnummer, Branche, und eine konkrete Beobachtung.

## Quellen (kostenlos)

1. **Google Maps.** Suche „Elektriker [Stadt]“, „Zahnarzt [Stadt]“. Firmen mit wenigen Bewertungen, ohne Webseite oder mit alter Webseite sind die besten Leads. Telefon und Webseite stehen direkt dabei.
2. **Gelbe Seiten / 11880 / Das Örtliche.** Branchenfilter, Region, Telefonnummer.
3. **Handwerkskammer und IHK-Verzeichnisse.** Verlässliche Firmendaten, oft mit Inhabername.
4. **Stellenanzeigen** (Indeed, Kleinanzeigen, Regionalzeitung). Wer sucht Personal, hat Budget und Schmerz. Aufhänger: Recruiting-Videos + Karriereseite.
5. **Neueröffnungen und Gewerbeanmeldungen** (Lokalpresse, Handelsregister-Bekanntmachungen). Neue Firmen brauchen alles.
6. **Bestehende Kunden.** Wer ist deren Lieferant, Nachbar, Kollege im Verband?

## Qualifizierung in 60 Sekunden pro Firma

- Webseite öffnen (Handy!). Fragen: Auf dem Handy lesbar? Anfrageformular? Letzte Aktualisierung? Impressum mit Namen des Inhabers?
- Google-Eintrag: Bewertungen, Fotos, Öffnungszeiten gepflegt?
- Instagram/Facebook: Letzter Post wann?
- Eine Beobachtung in einem Satz notieren, z. B. „Webseite auf Handy nicht lesbar, kein Formular, Inhaber laut Impressum Thomas Müller“. Das wird die 1. Zeile der Notiz und automatisch der Aufhänger in Mails.

## Priorisierung (A/B/C)

- **A:** Offensichtlicher Schmerz (keine oder kaputte Webseite, sucht Personal, viele Bewertungen aber kein Auftritt) + Inhabername bekannt. Zuerst anrufen.
- **B:** Auftritt mittelmäßig, Inhaber unbekannt.
- **C:** Auftritt ordentlich, nur als Füller.

## CSV-Import

Leads in der Tabellen-App des Handys (Numbers, Google Sheets, Excel) sammeln und als CSV exportieren. Spalten wie in `leads-vorlage.csv`:

```
firma;ansprechpartner;telefon;email;website;branche;notizen
```

Branche als Kürzel: `handwerk`, `gastro`, `praxis`, `einzelhandel`, `immobilien`, `dienstleister`, `autohaus`. Dann in der App unter Leads → CSV importieren. Doppelte Firmennamen werden übersprungen.
