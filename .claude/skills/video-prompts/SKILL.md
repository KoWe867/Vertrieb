---
name: video-prompts
description: Prompts für automatisierte Kundenvideos (Seedance 2.0, Kling, Veo, Runway) schreiben. Nutzen, wenn ein Lead oder Kunde Videos für Social Media, Recruiting, Produkte oder Objekte braucht, oder wenn im Verkaufsgespräch ein Video-Beispiel entstehen soll.
---

# Video-Prompts für Alwine-Kundenvideos

Abgeleitet aus der Sammlung „awesome-seedance-2-prompts“ (6.365 Prompts, CC BY 4.0). Die besten Prompts dort folgen immer derselben Struktur. Wir nutzen sie für Kundenvideos: Recruiting-Clips für Handwerker, Speisen für Restaurants, Fahrzeuge für Autohäuser, Objekte für Makler.

## Struktur eines guten Prompts (immer in dieser Reihenfolge)

```
[Style]     Genre, Qualität (4K/8K), Kamera (Sony A7S3, cinema camera), Licht, Stimmung, was NICHT (no text, no watermark)
[Duration]  4–15 Sekunden
[Scene]     Ort, Tageszeit, Hintergrund, Atmosphäre
[Character] Aussehen, Kleidung, Ausdruck – bleibt über alle Shots gleich („consistent face, clothing, no drift“)
[Shots]     Zeitfenster mit Kamera, Aktion, Details:
            [00:00-00:05] Shot 1: … Kamera: … Aktion: … Details: …
            [00:05-00:10] Shot 2: …
            [00:10-00:15] Shot 3: …
[Sound]     Umgebungsgeräusche, Musik, gesprochener Text (kurz, natürliche Pausen)
[Rules]     no text, no subtitles, no watermark, natural lip sync, character identity maintained
```

Regeln aus den Top-Prompts:
- **Ein Produkt, ein Gefühl, drei Shots.** Weite → Detail → Ergebnis.
- **Konkrete Physik** („Wassertropfen auf der Tomate“, „Funken beim Schweißen“) schlägt Adjektive („schön“, „professionell“).
- **Kamera pro Shot benennen** (low angle, macro, slow push-in, overhead).
- **Konsistenz erzwingen**: „same person, same clothing throughout, no deformation“.
- **Kein Text im Video** generieren lassen. Text kommt später als Overlay (Logo, Telefonnummer, Stellenangebot).
- **Ton mitdenken**: Seedance 2.0 erzeugt Audio. Dialog kurz, 200–400 ms Pausen.

## Vorlagen für unsere Branchen

### Handwerk – Recruiting (15 s)
```
[Style] Documentary commercial, 4K, handheld with slight motion, warm morning light, authentic, no text, no watermark.
[Duration] 15 seconds.
[Scene] Modern electrical workshop and a new-build construction site, Germany, early morning.
[Character] Electrician, mid-30s, dark blue work trousers, company t-shirt, calm confident face, consistent throughout.
[00:00-00:05] Shot 1: Slow push-in on hands sorting cables in a neat van, morning sun through the rear doors, dust in light.
[00:05-00:10] Shot 2: Medium shot on site, he installs a wall panel, a younger apprentice hands him a tool, both grin, macro on the screwdriver bit locking in.
[00:10-00:15] Shot 3: Wide shot, both stand in front of the finished panel, he looks at camera, small nod, apprentice wipes hands.
[Sound] Quiet drill, birds, a short line in German: „Bei uns lernst du das richtig.“ natural voice, then soft acoustic guitar.
[Rules] No subtitles, no logos, natural skin, no exaggerated smiles.
```

### Gastronomie – Gericht (10 s)
```
[Style] Cinematic food commercial, extreme macro, Sony cinema camera, natural window light, ASMR, no text.
[Duration] 10 seconds.
[Scene] Open kitchen of a small Italian restaurant, wooden counter, steam.
[00:00-00:04] Shot 1: Macro, fresh basil torn over a plate of pasta, oil glistening, steam rising against backlight.
[00:04-00:07] Shot 2: Slow overhead, parmesan grated, flakes falling in slow motion.
[00:07-00:10] Shot 3: Medium shot, the plate placed on a table by the window, guest's hand lifts a fork.
[Sound] Sizzling pan, quiet plates, soft jazz.
[Rules] No text, no watermark, realistic food physics.
```

### Autohaus – Fahrzeug (12 s)
```
[Style] High-end automotive commercial, 8K, golden hour, glossy reflections, no text.
[Duration] 12 seconds.
[Scene] Empty coastal road, then dealership forecourt at dusk.
[00:00-00:04] Shot 1: Low-angle tracking shot, [Fahrzeug, Farbe] drives past, wheels close, light streaks on paint.
[00:04-00:08] Shot 2: Interior, slow pan over dashboard and stitched seats, hand on steering wheel.
[00:08-00:12] Shot 3: Car parked on the forecourt, headlights switch on, slow drone rise.
[Sound] Engine low, wind, subtle cinematic pad.
[Rules] Keep the exact car model consistent, no fictional badges, no text.
```

### Immobilien – Objekt (15 s)
```
[Style] Real-estate cinematic walkthrough, 4K, soft daylight, steady gimbal, no text.
[Duration] 15 seconds.
[Scene] Renovated 3-room apartment, white walls, oak floor, balcony with city view.
[00:00-00:05] Shot 1: Slow forward gimbal from the entrance into the living room, light flooding in.
[00:05-00:10] Shot 2: Kitchen, hand opens a drawer, macro on the stone counter, then pan to dining table.
[00:10-00:15] Shot 3: Balcony door opens, camera glides out, city skyline, curtain moves in the breeze.
[Sound] Quiet ambience, faint city, soft piano.
[Rules] Consistent layout, no people, no text.
```

## Ablauf im Vertrieb

1. Lead-Notiz lesen: Branche, Beobachtung.
2. Passende Vorlage nehmen, Firma-spezifische Details einsetzen (Farbe, Gericht, Fahrzeug, Objekt).
3. Prompt in das Video-Tool geben, 2 Varianten erzeugen.
4. Bestes Video mit Logo-Overlay als Vorher/Nachher im Termin zeigen.
5. Nach Auftrag: 4 Videos/Monat im Abo (siehe js/data/services.js, „video“).

Vollständige Sammlung: https://github.com/YouMind-OpenLab/awesome-seedance-2-prompts
