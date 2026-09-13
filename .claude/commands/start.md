Starte das Alwine-Vertriebssystem lokal und zeige mir den aktuellen Stand.

Schritte:
1. Lies `.claude/skills/vertrieb-workflow/SKILL.md` (Tagesablauf) und `CLAUDE.md`.
2. Führe `./start.sh` aus (startet den lokalen Server auf Port 3000 und öffnet http://localhost:3000/desktop/ – das Desktop-Dashboard mit linker Leiste: Übersicht, Leads, Mail-Center, Konten, Persönliche Infos, Einstellungen; die Handy-App liegt unter http://localhost:3000/).
3. Prüfe, ob der Server antwortet (`curl -s http://localhost:3000/desktop/ | head -3`). Wenn der Port belegt ist, nimm 3001 und sag es mir.
4. Zeig mir kurz: welche Feature-Pläne in `plans/` offen sind (Checkliste am Ende jedes Plans), was heute laut Workflow ansteht, und ob `data/leads-auto.json` neue Leads enthält.
5. Frag nicht nach, sondern starte. Wenn ich danach „weiter mit Feature N“ sage, arbeite den Plan `plans/feature-N-*.md` nach den Konventionen in `.claude/skills/backend-conventions/SKILL.md` ab.
