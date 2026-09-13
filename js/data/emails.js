// E-Mail-Vorlagen. Platzhalter: {firma}, {ansprechpartner}, {ich}, {branche}, {aufhaenger}, {beobachtung}, {termin}, {telefon}
window.ALWINE_EMAILS = [
  {
    id: "erstkontakt",
    kategorie: "Erstkontakt (nur mit Einwilligung oder per Brief/LinkedIn)",
    titel: "Erstanschreiben ohne vorheriges Telefonat",
    betreff: "Kurze Frage zu Ihrer Webseite, {firma}",
    text: `Guten Tag {ansprechpartner},

ich bin auf {firma} gestoßen und mir ist etwas aufgefallen: {beobachtung}

Wir sind Alwine, ein kleines Software- und Web-Studio. Wir bauen für Betriebe wie Ihren Webseiten, die 24/7 laufen und die Sie trotzdem selbst ändern können, kleine Tools, die Verwaltungsarbeit abnehmen, und automatisierte Videos für Social Media.

Meine Frage: Wäre es für Sie interessant, in 15 Minuten zu sehen, wie das bei einem ähnlichen Betrieb aussieht? Wenn ja, antworten Sie einfach mit einem Wochentag, der Ihnen passt.

Wenn nicht, ist das völlig in Ordnung – ein kurzes „Nein danke“ genügt und Sie hören nichts mehr von mir.

Beste Grüße
{ich}
Alwine · {telefon}`
  },
  {
    id: "nach_gespraech",
    kategorie: "Nach Telefonat",
    titel: "Terminbestätigung (sofort nach Zusage)",
    betreff: "Unser Termin am {termin} – Alwine",
    text: `Guten Tag {ansprechpartner},

vielen Dank für das kurze Gespräch eben. Wie besprochen unser Termin:

📅 {termin}, ca. 15 Minuten, per Video oder Telefon

Was wir uns anschauen:
– Ihre aktuelle Situation bei {aufhaenger}
– 2–3 Beispiele, wie wir das bei ähnlichen Betrieben gelöst haben
– ob und wie es für {firma} sinnvoll ist

Falls vorher noch etwas Wichtiges auftaucht, antworten Sie einfach auf diese Mail.

Beste Grüße
{ich}
Alwine · {telefon}`
  },
  {
    id: "nach_mailbox",
    kategorie: "Nach Telefonat",
    titel: "Nach Mailbox / nicht erreicht",
    betreff: "Kurzer Versuch, Sie zu erreichen – {firma}",
    text: `Guten Tag {ansprechpartner},

ich habe gerade versucht, Sie telefonisch zu erreichen – leider ohne Erfolg.

Der Grund meines Anrufs: {beobachtung}

Wir helfen Betrieben aus Ihrer Branche genau dabei – und zwar so, dass Sie sich um nichts kümmern müssen, aber trotzdem alles selbst ändern können.

Ich probiere es morgen nochmal. Falls ein anderer Zeitpunkt besser passt, schreiben Sie mir einfach kurz eine Uhrzeit.

Beste Grüße
{ich}
Alwine · {telefon}`
  },
  {
    id: "infos_gewuenscht",
    kategorie: "Nach Telefonat",
    titel: "„Schicken Sie mir Infos“ – mit Rückruf-Anker",
    betreff: "Wie versprochen: Beispiel für {firma}",
    text: `Guten Tag {ansprechpartner},

wie eben am Telefon besprochen, hier ganz kurz das Wichtigste zu {aufhaenger}:

Was Sie bekommen:
– [Nutzen 1]
– [Nutzen 2]
– Sie können jederzeit selbst Änderungen machen, Hosting und Pflege übernehmen wir

Beispiel: [Beispiel aus der Leistung]

Rahmen: [Paket / Preis „ab …“]

Wie abgesprochen rufe ich Sie am {termin} kurz an, um zu hören, ob das für Sie interessant ist.

Beste Grüße
{ich}
Alwine · {telefon}`
  },
  {
    id: "angebot",
    kategorie: "Nach Termin",
    titel: "Angebot nach Erstgespräch",
    betreff: "Ihr Angebot: {aufhaenger} für {firma}",
    text: `Guten Tag {ansprechpartner},

danke für das gute Gespräch. Zusammengefasst, was ich verstanden habe:

Ihre Situation: [Situation in 1–2 Sätzen]
Ihr Ziel: [Ziel]

Unser Vorschlag:
1. [Schritt 1 – was, bis wann]
2. [Schritt 2]
3. [Schritt 3 – Übergabe, Einweisung]

Preis: [Festpreis] einmalig + [monatlich] für Hosting, Pflege und Änderungen. Keine versteckten Kosten, jederzeit monatlich kündbar.

Start: Sobald Sie „Ja“ sagen, sind wir in [X] Wochen live.

Wenn Sie einverstanden sind, antworten Sie einfach mit „Passt“ – dann schicke ich Ihnen die Auftragsbestätigung.

Beste Grüße
{ich}
Alwine · {telefon}`
  },
  {
    id: "followup1",
    kategorie: "Nachfassen",
    titel: "Nachfassen 1 (3 Tage nach Angebot)",
    betreff: "Re: Ihr Angebot: {aufhaenger} für {firma}",
    text: `Guten Tag {ansprechpartner},

kurze Rückfrage zum Angebot vom [Datum]: Gibt es noch offene Punkte, die ich klären kann?

Falls der Preis oder Umfang nicht passt, sagen Sie es gern offen – dann schauen wir, was sich anpassen lässt.

Beste Grüße
{ich}
Alwine · {telefon}`
  },
  {
    id: "followup2",
    kategorie: "Nachfassen",
    titel: "Nachfassen 2 (7 Tage später, Mehrwert)",
    betreff: "Ein Beispiel, das zu {firma} passt",
    text: `Guten Tag {ansprechpartner},

ich habe hier ein Beispiel, das gut zu Ihrer Situation passt: [Link / kurze Beschreibung].

Damit hat ein ähnlicher Betrieb [konkretes Ergebnis, z. B. „3–4 Anfragen pro Woche über die Webseite“] erreicht.

Sollen wir das Thema nochmal 10 Minuten besprechen? Dienstag oder Donnerstag Vormittag hätte ich Zeit.

Beste Grüße
{ich}
Alwine · {telefon}`
  },
  {
    id: "followup3",
    kategorie: "Nachfassen",
    titel: "Nachfassen 3 (Abschluss-Mail, 14 Tage später)",
    betreff: "Soll ich das Thema schließen?",
    text: `Guten Tag {ansprechpartner},

ich möchte Sie nicht nerven. Deshalb eine ehrliche Frage: Ist das Thema {aufhaenger} für {firma} aktuell einfach nicht dran?

Wenn ja, schließe ich es für dieses Jahr und melde mich nicht weiter. Wenn es nur der Zeitpunkt ist, sagen Sie mir gern, wann ich mich wieder melden soll.

Beste Grüße
{ich}
Alwine · {telefon}`
  },
  {
    id: "termin_erinnerung",
    kategorie: "Nach Termin",
    titel: "Termin-Erinnerung (am Vortag, auch als SMS/WhatsApp)",
    betreff: "Erinnerung: morgen {termin} – Alwine",
    text: `Guten Tag {ansprechpartner}, kurze Erinnerung an unser Gespräch morgen um {termin}. Ich freue mich darauf. Falls etwas dazwischenkommt, geben Sie mir kurz Bescheid. Beste Grüße, {ich} (Alwine)`
  },
  {
    id: "empfehlung",
    kategorie: "Bestandskunden",
    titel: "Empfehlung erfragen (nach erfolgreichem Projekt)",
    betreff: "Kurze Bitte – und ein Dankeschön",
    text: `Guten Tag {ansprechpartner},

schön, dass [Projekt] jetzt läuft. Wenn Sie zufrieden sind, hätte ich eine Bitte: Kennen Sie 1–2 Unternehmer, für die so etwas ebenfalls sinnvoll wäre?

Ein kurzer Name reicht, ich melde mich dann selbst – und erwähne gern, dass die Empfehlung von Ihnen kommt. Als Dankeschön gibt es für Sie [z. B. einen Monat Hosting gratis].

Beste Grüße
{ich}
Alwine · {telefon}`
  }
];
