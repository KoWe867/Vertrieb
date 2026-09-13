// Gesprächsleitfaden für Kaltakquise. Platzhalter: {firma}, {ansprechpartner}, {ich}, {branche}, {aufhaenger}
window.ALWINE_SCRIPTS = {
  phasen: [
    {
      id: "vorbereitung", kurz: "Vorbereitung",
      titel: "0. Vor dem Anruf (30 Sekunden)",
      ziel: "Wissen, wen ich anrufe und warum genau diese Firma.",
      text: [
        "Webseite der Firma 20 Sekunden anschauen: Was ist offensichtlich alt / fehlt?",
        "Branche und Aufhänger im Kopf haben: {aufhaenger}",
        "Ziel des Anrufs festlegen: NICHT verkaufen, sondern einen 15-Minuten-Termin bekommen.",
        "Lächeln beim Sprechen, stehen oder aufrecht sitzen – man hört das."
      ]
    },
    {
      id: "zentrale", kurz: "Zentrale",
      titel: "1. Zentrale / Empfang (Gatekeeper)",
      ziel: "Zum Entscheider durchgestellt werden oder Namen + beste Zeit erfahren.",
      text: [
        "„Guten Tag, {ich} von Alwine. Ich bräuchte kurz den Inhaber / die Geschäftsführung – wer ist das bei Ihnen?“",
        "(Namen notieren!) „Danke. Ist {ansprechpartner} gerade im Haus?“",
        "Bei „Worum geht es?“: „Es geht um {aufhaenger} – ist ein kurzes Thema, das ich mit {ansprechpartner} direkt klären möchte.“",
        "Bei „Schicken Sie eine E-Mail“: „Mache ich gern. Damit die auch gelesen wird – an wen direkt, und wann erreiche ich {ansprechpartner} am besten telefonisch?“"
      ],
      tipps: [
        "Freundlich, ruhig, selbstverständlich – als hätten Sie öfter miteinander zu tun.",
        "Nie lügen (kein „er erwartet meinen Anruf“). Das fällt auf und verbrennt die Firma.",
        "Der Empfang ist Verbündeter: Namen merken, beim nächsten Mal mit Namen begrüßen."
      ]
    },
    {
      id: "opener", kurz: "Eröffnung",
      titel: "2. Eröffnung beim Entscheider (max. 20 Sek.)",
      ziel: "Erlaubnis für 30 Sekunden bekommen – das senkt Abwehr sofort.",
      text: [
        "„Guten Tag {ansprechpartner}, {ich} von Alwine. Wir hatten noch keinen Kontakt – ich sage Ihnen in 30 Sekunden, warum ich anrufe, und Sie entscheiden dann, ob es sich lohnt weiterzureden. Okay?“",
        "(Warten auf Ja.)",
        "„{opener_branche}“",
        "Alternative, wenn Sie etwas Konkretes gesehen haben: „Ich habe mir gerade Ihre Webseite angeschaut. Mir ist aufgefallen, dass … [konkrete Beobachtung]. Ist das bei Ihnen bewusst so, oder ist das einfach liegen geblieben?“"
      ],
      tipps: [
        "Die Frage nach Erlaubnis („Okay?“) ist der wichtigste Satz im ganzen Skript.",
        "Nach dem Opener: Mund halten. Der Kunde spricht als Nächster.",
        "Nicht mit „Wie geht es Ihnen?“ anfangen – das ist die Fahne jedes Telefonverkäufers."
      ]
    },
    {
      id: "qualifizierung", kurz: "Fragen",
      titel: "3. Qualifizierung (Fragen stellen, zuhören)",
      ziel: "Herausfinden, ob es ein echtes Problem gibt und ob es wehtut.",
      text: [
        "Situation: „Wie läuft das aktuell bei Ihnen mit [Webseite / Anfragen / Terminen / Videos]?“",
        "Problem: „Was nervt Sie daran am meisten?“ / „Was passiert, wenn das so bleibt?“",
        "Auswirkung: „Was kostet Sie das ungefähr an Zeit oder an Aufträgen pro Monat?“",
        "Nutzen: „Wenn das gelöst wäre – was würde das für Sie ändern?“",
        "Entscheidung: „Wer wäre neben Ihnen noch beteiligt, wenn Sie so etwas umsetzen?“"
      ],
      tipps: [
        "Reihenfolge SPIN: Situation → Problem → Implikation → Nutzen. Nicht mit Lösung reinplatzen.",
        "Faustregel: Kunde redet 70 %, ich 30 %.",
        "Antworten kurz spiegeln: „Also Sie sagen, … – habe ich das richtig verstanden?“"
      ]
    },
    {
      id: "pitch", kurz: "Pitch",
      titel: "4. Kurz-Pitch (nur passend zum genannten Problem)",
      ziel: "Eine Lösung zeigen, nicht den ganzen Katalog.",
      text: [
        "„Genau dafür machen wir Folgendes: [Leistung in einem Satz].“",
        "„Konkret heißt das für Sie: [Nutzen 1], [Nutzen 2].“",
        "„Beispiel: [Beispielkunde / Situation aus der Leistung].“",
        "„Und das Wichtigste: Sie müssen sich um nichts kümmern – wir bauen es, hosten es, und Sie können trotzdem alles selbst ändern.“"
      ],
      tipps: [
        "Nutzen, nicht Features: nicht „responsive und CMS-basiert“, sondern „auf dem Handy lesbar und Sie ändern Preise selbst“.",
        "Ein Beispiel wirkt stärker als drei Argumente.",
        "Preise am Telefon nur als Rahmen nennen („ab …“), Details im Termin."
      ]
    },
    {
      id: "abschluss", kurz: "Termin",
      titel: "5. Abschluss = Termin vereinbaren",
      ziel: "Festen Termin mit Datum + Uhrzeit, Kalendereinladung sofort senden.",
      text: [
        "„Ich schlage vor, wir machen einen 15-Minuten-Videocall, ich zeige Ihnen 2–3 Beispiele und wir schauen, ob es passt. Passt Ihnen eher Dienstag 10 Uhr oder Donnerstag 15 Uhr?“",
        "„Super, dann Donnerstag 15 Uhr. Ich schicke Ihnen gleich eine Einladung an – welche E-Mail-Adresse?“",
        "„Damit ich mich gut vorbereite: Was wäre für Sie das Wichtigste, das wir in dem Gespräch klären sollten?“",
        "„Dann bis Donnerstag, {ansprechpartner}. Vielen Dank für Ihre Zeit.“"
      ],
      tipps: [
        "Alternativfrage (A oder B), nie „Hätten Sie mal Zeit?“.",
        "Bestätigung innerhalb 5 Minuten per E-Mail + Kalender. Ohne Bestätigung sind 40 % weg.",
        "Am Tag vorher kurz per SMS/WhatsApp erinnern."
      ]
    },
    {
      id: "mailbox", kurz: "Mailbox",
      titel: "Mailbox / Anrufbeantworter (max. 20 Sek.)",
      ziel: "Neugier erzeugen, Rückruf ermöglichen – Nachricht nur beim 1. und 3. Versuch.",
      text: [
        "„Guten Tag {ansprechpartner}, {ich} von Alwine, Telefon [Nummer]. Ich rufe an wegen {aufhaenger} bei {firma}. Ich probiere es morgen Vormittag nochmal – oder Sie rufen kurz zurück unter [Nummer]. Nochmal: {ich}, Alwine, [Nummer]. Danke!“"
      ],
      tipps: [
        "Nummer zweimal, langsam.",
        "Kein Pitch auf der Mailbox. Nur Anlass + Rückruf.",
        "Danach kurze E-Mail als Anker (siehe E-Mail-Vorlage „Nach Mailbox“)."
      ]
    }
  ],

  einwaende: [
    {
      einwand: "„Kein Interesse.“",
      antwort: "„Verstehe ich – das höre ich oft, bevor jemand weiß, worum es geht. Darf ich eine einzige Frage stellen, und wenn die Antwort nein ist, lege ich auf: Bekommen Sie aktuell über Ihre Webseite regelmäßig Anfragen?“",
      hinweis: "Nicht argumentieren. Eine Frage, dann Stille."
    },
    {
      einwand: "„Keine Zeit.“",
      antwort: "„Das glaube ich sofort, deshalb halte ich es kurz. Wann ist es besser – heute um 16 Uhr oder morgen früh um 8?“",
      hinweis: "Zeit-Einwand ist fast nie echt. Termin für den Rückruf fixieren, nicht ‚irgendwann‘."
    },
    {
      einwand: "„Schicken Sie mir Infos per E-Mail.“",
      antwort: "„Mache ich gern. Damit ich nicht 20 Seiten schicke, die keiner liest: Was genau wäre für Sie interessant – Webseite, Terminbuchung oder Videos? … Gut, dann schicke ich Ihnen genau dazu ein Beispiel und rufe Freitag kurz an, ob es passt. Okay?“",
      hinweis: "Mail nur mit Rückruf-Termin. Sonst ist es ein höfliches Nein."
    },
    {
      einwand: "„Wir haben schon eine Agentur / einen Webdesigner.“",
      antwort: "„Sehr gut, dann ist das Thema bei Ihnen ja wichtig. Wie zufrieden sind Sie mit Reaktionszeit und Kosten, wenn Sie mal eine Änderung brauchen? … Genau da setzen wir an: Änderungen sind bei uns im Monatspreis drin. Lohnt sich ein 15-Minuten-Vergleich?“",
      hinweis: "Nie den Wettbewerber schlechtreden. Nach Reaktionszeit und Änderungskosten fragen."
    },
    {
      einwand: "„Zu teuer / kein Budget.“",
      antwort: "„Verstehe. Darf ich fragen, womit Sie vergleichen? … Die meisten unserer Kunden zahlen weniger als ein Handy-Vertrag pro Monat – und haben dafür jemanden, der sich kümmert. Aber ob es sich rechnet, können wir nur klären, wenn wir wissen, was Ihnen eine zusätzliche Anfrage pro Woche wert ist. Wie viel wäre das ungefähr?“",
      hinweis: "Preis in Relation setzen (Handyvertrag, ein Auftrag). Nie sofort Rabatt."
    },
    {
      einwand: "„Wir machen das selbst / mein Neffe macht das.“",
      antwort: "„Das ist ja super, dass das jemand macht. Wie oft wird die Seite dann tatsächlich aktualisiert? … Wenn Sie wollen, schauen wir im Termin gemeinsam drauf – oft reicht es, wenn wir nur den Teil übernehmen, der liegen bleibt.“",
      hinweis: "Nicht abwerten. Nach Frequenz/Ergebnis fragen."
    },
    {
      einwand: "„Wir brauchen das nicht, läuft alles über Empfehlung.“",
      antwort: "„Das ist das beste Zeichen für gute Arbeit. Und wenn jemand die Empfehlung bekommt – was tut er als Erstes? Er googelt Sie. Was findet er dann? … Genau darum geht es: dass die Empfehlung nicht auf der Webseite abbricht.“",
      hinweis: "Empfehlungs-Einwand in Chance umdrehen."
    },
    {
      einwand: "„Schlechte Erfahrungen mit Agenturen.“",
      antwort: "„Das höre ich leider oft. Was ist damals konkret schiefgelaufen? … Deshalb arbeiten wir mit Festpreis, Sie sehen jede Woche den Stand und behalten alle Zugänge. Wenn Sie wollen, zeige ich Ihnen im Termin, wie das abläuft.“",
      hinweis: "Zuhören, konkreten Schmerz aufnehmen, Unterschied benennen."
    },
    {
      einwand: "„Ich muss das mit meinem Partner besprechen.“",
      antwort: "„Absolut sinnvoll. Am einfachsten ist, wenn er beim 15-Minuten-Termin gleich dabei ist – dann müssen Sie es nicht weitergeben. Wann passt es Ihnen beiden?“",
      hinweis: "Entscheider in den Termin holen."
    },
    {
      einwand: "„Woher haben Sie meine Nummer?“",
      antwort: "„Von Ihrer Webseite / aus dem Branchenverzeichnis. Ich rufe Unternehmen aus Ihrer Branche an, weil das Thema dort gerade viele betrifft. Wenn Sie keine weiteren Anrufe wünschen, notiere ich das sofort.“",
      hinweis: "Ehrlich antworten, Wunsch respektieren, Lead als 'Nicht anrufen' markieren."
    }
  ],

  goldene_regeln: [
    "Ziel des Anrufs ist der Termin, nicht der Verkauf.",
    "Um Erlaubnis fragen, dann 30 Sekunden, dann Frage stellen.",
    "Kunde redet 70 %. Fragen stellen, zuhören, spiegeln.",
    "Ein Nein ist Information, kein Urteil. Nächster Anruf.",
    "Jeder Anruf wird mit Ergebnis + nächstem Schritt dokumentiert.",
    "Mindestens 6–8 Kontaktversuche pro Firma über 4 Wochen, bevor ein Lead als tot gilt.",
    "Nach jedem Termin innerhalb 5 Minuten Bestätigung senden."
  ]
};
